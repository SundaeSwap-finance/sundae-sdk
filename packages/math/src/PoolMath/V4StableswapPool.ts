import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { Fraction, type TFractionLike } from "@sundaeswap/fraction";

import { SharedPoolMath } from "./index.js";

/**
 * THE V4 STABLESWAP INVARIANT MODULE — NOT THE V3 "STABLESWAPS" CONTRACT.
 *
 * Two different things in this SDK carry the word "stableswap". Keep them
 * apart:
 *
 * - `StableSwapsPool` / `EContractVersion.Stableswaps` is the **v3** stableswap
 *   contract. It is a whole contract version with its own datum builder and
 *   transaction builder. It stores `D` in the pool datum and has no per-asset
 *   rates.
 * - `V4StableswapPool` / `EPoolCurve.V4Stableswap` (this file) is a **v4
 *   invariant module**. It is one curve among several a v4 pool can bind, next
 *   to constant product, constant sum and concentrated liquidity. It stores no
 *   `D` and carries per-asset integer `rates`.
 *
 * The amplification `A` is the ONE thing they share: the same parameter on the
 * same scale, carried by the same `linearAmplificationFactor` field, with each
 * implementation applying its own internal scaling. Everything else is
 * different — do not pass one's reserves, rates or `D` to the other.
 *
 * The curve, on rated and scaled reserves `x = r_a·rate_a·P` and
 * `y = r_b·rate_b·P` with `P = calc_precision = 10^12` and `A` the linear
 * amplification:
 *
 *   4A(x + y) + D = 4AD + D³ / (4xy)
 *
 * `D` is the largest integer that satisfies it. Neither `D` nor a swap output
 * can be computed on-chain, because both need Newton's method. The scooper
 * computes them and the module checks that each supplied integer is the unique
 * one that solves the invariant. This file is the off-chain twin of
 * `lib/modules/ss_math.ak` and `lib/modules/ss_check.ak` in the sundae-v4
 * repository — those are the source of truth; keep this in lockstep with them.
 */

/** `ss_math.calc_precision`: the scale applied to reserves before they enter the invariant. */
export const CALC_PRECISION = 1_000_000_000_000n;

/** Newton iteration cap, matching the reference implementation. */
const NEWTON_MAX_ITERATIONS = 255;

/** Bound on the fix-up walk of the reverse swap. The closed form lands within a few units. */
const CORRECTION_MAX_STEPS = 256;

/**
 * Holds the calculated outcome of a v4 stableswap swap. Mirrors
 * {@link ConstantProductPool.TSwapOutcome} so it flows through the same generic
 * swap-outcome consumers.
 *
 * `lpFee` is denominated in the **output** asset, not the input asset. The
 * stableswap fee is taken off the gross output (`fee = ceil(gross · feeRate)`),
 * unlike constant product and constant sum which take the fee off the input.
 * The v3 `StableSwapsPool` does the same.
 */
export type TSwapOutcome = {
  input: bigint;
  output: bigint;
  lpFee: AssetAmount<IAssetAmountMetadata>;
  nextInputReserve: bigint;
  nextOutputReserve: bigint;
  priceImpact: Fraction;
};

// ─── Integer helpers ────────────────────────────────────────────────────────

/** Plutus `divideInteger`: floor toward −∞. */
const floorDiv = (a: bigint, b: bigint): bigint => {
  const q = a / b;
  const r = a % b;
  return r !== 0n && r < 0n !== b < 0n ? q - 1n : q;
};

/** ceil(a / b) with the same sign convention as {@link floorDiv}. */
const ceilDiv = (a: bigint, b: bigint): bigint => -floorDiv(-a, b);

const asFeeParts = (fee: TFractionLike): [bigint, bigint] => {
  const f = Fraction.asFraction(fee);
  if (f.lt(Fraction.ZERO) || f.gte(Fraction.ONE))
    throw new Error("fee must be in [0, 1)");
  return [BigInt(f.numerator), BigInt(f.denominator)];
};

// ─── Invariant polynomials (`ss_math.ak`) ───────────────────────────────────

/**
 * `f(D)` from the on-chain `liquidity_invariant`. It is ≤ 0 when `D` is at or
 * below the curve. All arguments are rated and scaled.
 */
export const invariantF = (
  x: bigint,
  y: bigint,
  amp: bigint,
  d: bigint,
): bigint => {
  const sixteenAxy = 16n * amp * x * y;
  return sixteenAxy * d + d * d * d - (sixteenAxy * (x + y) + 4n * x * y * d);
};

/**
 * `g(y)` from the on-chain `exchange_invariant`. It is ≥ 0 when the pool keeps
 * enough of the taken asset. `g` is symmetric in `x` and `y`, which is what
 * lets {@link getSwapInput} reuse the same solver in the other direction.
 */
export const invariantG = (
  x: bigint,
  y: bigint,
  amp: bigint,
  d: bigint,
): bigint => {
  const fourXy = 4n * x * y;
  return fourXy * (4n * amp * (x + y) + d) - fourXy * 4n * amp * d - d * d * d;
};

// ─── D ──────────────────────────────────────────────────────────────────────

/** The ±1 fix-up that turns a Newton result into the exact largest `D`. */
const fixD = (x: bigint, y: bigint, amp: bigint, d0: bigint): bigint => {
  let d = d0;
  while (invariantF(x, y, amp, d) > 0n) d -= 1n;
  while (invariantF(x, y, amp, d + 1n) <= 0n) d += 1n;
  return d;
};

/**
 * The sum invariant `D` of a two-asset v4 stableswap pool: the largest integer
 * that satisfies the curve on the rated, scaled reserves. Newton from
 * `D = x + y`, then a ±1 fix-up.
 *
 * `D` carries the `rate · CALC_PRECISION` scale — it is not a token amount.
 *
 * @param amp The pool's `linear_amplification` (`A`), the raw stored integer.
 * @param aReserve The pool's reserve of asset A, in token units.
 * @param bReserve The pool's reserve of asset B, in token units.
 * @param rateA The pool's rate for asset A (from the stableswap config).
 * @param rateB The pool's rate for asset B.
 */
export const getD = (
  amp: bigint,
  aReserve: bigint,
  bReserve: bigint,
  rateA = 1n,
  rateB = 1n,
): bigint => {
  if (amp <= 0n) throw new Error("amplification must be positive");
  if (aReserve < 0n || bReserve < 0n)
    throw new Error("reserves must be non-negative");
  if (rateA <= 0n || rateB <= 0n) throw new Error("rates must be positive");

  const xs = aReserve * rateA * CALC_PRECISION;
  const ys = bReserve * rateB * CALC_PRECISION;
  const sum = xs + ys;
  // An empty pool has no invariant to solve; `D` is zero by definition.
  if (sum === 0n) return 0n;
  // Exactly one empty reserve is a different case, and it has no answer: the
  // Newton step divides by `4·xs·ys`, which is zero here. The chain never
  // reaches this state — Create requires both reserves positive, and the
  // exchange invariant leaves at least one unit on the output side — but this
  // is a client library, so it reports the bad input instead of faulting on a
  // native division by zero.
  if (xs === 0n || ys === 0n) {
    throw new Error(
      "getD: a stableswap pool cannot hold exactly one empty reserve; D is undefined there",
    );
  }

  const ann = 4n * amp;
  let d = sum;
  for (let i = 0; i < NEWTON_MAX_ITERATIONS; i++) {
    const dP = floorDiv(d * d * d, 4n * xs * ys);
    const dNext = floorDiv((ann * sum + 2n * dP) * d, (ann - 1n) * d + 3n * dP);
    const diff = dNext > d ? dNext - d : d - dNext;
    d = dNext;
    if (diff <= 1n) return fixD(xs, ys, amp, d);
  }
  throw new Error("getD: reached the Newton iteration cap");
};

// ─── The exchange solver ────────────────────────────────────────────────────

/**
 * The smallest scaled `y` with `g(xs, y) ≥ 0` at the pre-swap `d`. Newton on
 * `y`, then a walk to the exact integer. Both swap directions use this: `g` is
 * symmetric, so solving for the counterparty reserve answers "what must the
 * other side hold" whichever side is given.
 */
const solveCounterparty = (amp: bigint, d: bigint, xs: bigint): bigint => {
  if (xs <= 0n)
    throw new Error("solveCounterparty: the given side must be positive");
  const ann = 4n * amp;
  // n = 2: c = D³ / (4·x·Ann), b = x + D / Ann. Evaluated in the same order as
  // the Aiken source so the intermediate floors match.
  const c = floorDiv(floorDiv(d * d, 2n * xs) * d, 2n * ann);
  const b = xs + floorDiv(d, ann);
  let y = d;
  let converged = false;
  for (let i = 0; i < NEWTON_MAX_ITERATIONS; i++) {
    const yNext = floorDiv(y * y + c, 2n * y + b - d);
    const diff = yNext > y ? yNext - y : y - yNext;
    y = yNext;
    if (diff <= 1n) {
      converged = true;
      break;
    }
  }
  if (!converged)
    throw new Error("solveCounterparty: reached the Newton iteration cap");
  while (invariantG(xs, y, amp, d) < 0n) y += 1n;
  while (invariantG(xs, y - 1n, amp, d) >= 0n) y -= 1n;
  return y;
};

/**
 * The raw swap output: the scaled, pre-fee amount the curve releases when the
 * given reserve becomes `inAfter` and the taken reserve starts at `outBefore`,
 * at the pre-swap `d`.
 *
 * The result carries the `rate · CALC_PRECISION` scale. Divide by
 * `rateOut · CALC_PRECISION` to get the gross output in token units.
 *
 * @param amp The pool's `linear_amplification` (`A`), the raw stored integer.
 * @param d The pre-swap sum invariant, from {@link getD}.
 * @param inAfter The given asset's reserve after the input arrives, in token units.
 * @param outBefore The taken asset's reserve before the swap, in token units.
 * @param rateIn The pool's rate for the given asset.
 * @param rateOut The pool's rate for the taken asset.
 */
export const getRawSwap = (
  amp: bigint,
  d: bigint,
  inAfter: bigint,
  outBefore: bigint,
  rateIn = 1n,
  rateOut = 1n,
): bigint => {
  if (amp <= 0n) throw new Error("amplification must be positive");
  if (d <= 0n) throw new Error("the sum invariant must be positive");
  if (inAfter <= 0n || outBefore <= 0n)
    throw new Error("reserves must be positive");
  if (rateIn <= 0n || rateOut <= 0n) throw new Error("rates must be positive");
  const xs = inAfter * rateIn * CALC_PRECISION;
  return outBefore * rateOut * CALC_PRECISION - solveCounterparty(amp, d, xs);
};

// ─── Marginal price ─────────────────────────────────────────────────────────

/**
 * The marginal price of the curve at the current reserves, as input units per
 * output unit. Differentiating the invariant at fixed `D` gives
 *
 *   −dy/dx = (16A·x²y² + D³·y) / (16A·x²y² + D³·x)
 *
 * in scaled value units, which converts to token units through the rates. At a
 * balanced pool (`x = y`) it reduces to `rateOut / rateIn`, the par price.
 */
const marginalInputPerOutput = (
  amp: bigint,
  xs: bigint,
  ys: bigint,
  d: bigint,
  rateIn: bigint,
  rateOut: bigint,
): Fraction => {
  const common = 16n * amp * xs * xs * ys * ys;
  const cube = d * d * d;
  return new Fraction(
    rateOut * (common + cube * xs),
    rateIn * (common + cube * ys),
  );
};

/**
 * The pool's marginal price as raw units of asset A per raw unit of asset B.
 * Use it where a constant-product pool would use the reserve ratio: for a
 * stableswap pool the reserve ratio is not the price, because the curve holds
 * the price near par across a wide band of ratios.
 *
 * The result is in raw (undecimalized) units. Adjust for the two assets'
 * decimals before display.
 */
export const getPrice = (
  amp: bigint,
  aReserve: bigint,
  bReserve: bigint,
  rateA = 1n,
  rateB = 1n,
): Fraction => {
  if (aReserve <= 0n || bReserve <= 0n)
    throw new Error("reserves must be positive");
  const d = getD(amp, aReserve, bReserve, rateA, rateB);
  const xs = aReserve * rateA * CALC_PRECISION;
  const ys = bReserve * rateB * CALC_PRECISION;
  // A per B: asset B is the output side of the derivative.
  return marginalInputPerOutput(amp, xs, ys, d, rateA, rateB);
};

// ─── Swap output ────────────────────────────────────────────────────────────

/**
 * Calculate the swap outcome for a v4 stableswap pool.
 *
 * The sequence the chain enforces (`ss_check.ak`, tag 3):
 *
 * 1. `D` is derived from the pre-swap reserves at the pool's rates.
 * 2. `raw` is the smallest scaled output that solves the exchange invariant at
 *    that `D`, with the input already added to the given reserve.
 * 3. `gross = floor(raw / (rateOut · CALC_PRECISION))` is the output in token units.
 * 4. `fee = ceil(gross · feeRate)` stays in the pool.
 * 5. The trader receives `gross − fee`.
 *
 * @param outputMetadata Metadata for the **taken** asset. The fee is denominated in it.
 * @param input The amount of the given asset being swapped.
 * @param inputReserve The pool's reserve of the given asset.
 * @param outputReserve The pool's reserve of the taken asset.
 * @param rateIn The pool's rate for the given asset (from the stableswap config).
 * @param rateOut The pool's rate for the taken asset.
 * @param amp The pool's `linear_amplification` (`A`), the raw stored integer.
 * @param fee The swap fee rate, applied to the gross output.
 * @returns The swap details in the shared {@link TSwapOutcome} shape.
 */
export const getSwapOutput = (
  outputMetadata: IAssetAmountMetadata,
  input: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  rateIn: bigint,
  rateOut: bigint,
  amp: bigint,
  fee: TFractionLike,
): TSwapOutcome => {
  if (input <= 0n || inputReserve <= 0n || outputReserve <= 0n)
    throw new Error("Input and reserves must be positive");
  if (rateIn <= 0n || rateOut <= 0n) throw new Error("Rates must be positive");
  if (amp <= 0n) throw new Error("Amplification must be positive");
  const [feeNum, feeDen] = asFeeParts(fee);

  const d = getD(amp, inputReserve, outputReserve, rateIn, rateOut);
  const raw = getRawSwap(
    amp,
    d,
    inputReserve + input,
    outputReserve,
    rateIn,
    rateOut,
  );
  const gross = floorDiv(raw, rateOut * CALC_PRECISION);
  const lpFee = ceilDiv(gross * feeNum, feeDen);
  const output = gross - lpFee;
  if (output <= 0n)
    throw new Error("Swap yields no output after the fee; raise the input");

  const nextInputReserve = inputReserve + input;
  const nextOutputReserve = outputReserve - output;

  // Price impact against the pool's marginal price before the swap, the same
  // definition concentrated liquidity uses. Constant sum measures against its
  // par price instead, because a constant-sum pool has no other price. A
  // stableswap pool does: its marginal price moves with the reserve ratio, so
  // measuring against par would report the pool's standing imbalance as this
  // trade's impact. The fee is excluded so the number is curve slippage only.
  const xs = inputReserve * rateIn * CALC_PRECISION;
  const ys = outputReserve * rateOut * CALC_PRECISION;
  const idealPrice = marginalInputPerOutput(amp, xs, ys, d, rateIn, rateOut);
  const actualPrice = new Fraction(input, gross);
  const priceImpact = Fraction.ONE.subtract(idealPrice.divide(actualPrice));

  return {
    input,
    output,
    lpFee: new AssetAmount(lpFee, outputMetadata),
    nextInputReserve,
    nextOutputReserve,
    priceImpact,
  };
};

// ─── Swap input (the reverse) ───────────────────────────────────────────────

/**
 * Calculate the minimal input that buys a given output — the inverse of
 * {@link getSwapOutput}.
 *
 * The steps:
 *
 * 1. Invert the fee: the smallest gross output that nets `output` after
 *    `ceil(gross · feeRate)` is `ceil(output · feeDen / (feeDen − feeNum))`.
 * 2. Turn that gross into the scaled reserve the pool may keep of the taken
 *    asset.
 * 3. Solve the exchange invariant in the other direction for the given
 *    reserve that supports it. `g` is symmetric, so this is the same solver.
 * 4. Convert to token units and walk down to the minimum, which absorbs the
 *    integer rounding of step 3.
 *
 * @param outputMetadata Metadata for the **taken** asset. The fee is denominated in it.
 * @param output The wanted amount of the taken asset.
 * @param inputReserve The pool's reserve of the given asset.
 * @param outputReserve The pool's reserve of the taken asset.
 * @param rateIn The pool's rate for the given asset (from the stableswap config).
 * @param rateOut The pool's rate for the taken asset.
 * @param amp The pool's `linear_amplification` (`A`), the raw stored integer.
 * @param fee The swap fee rate, applied to the gross output.
 * @returns The swap details in the shared {@link TSwapOutcome} shape.
 */
export const getSwapInput = (
  outputMetadata: IAssetAmountMetadata,
  output: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  rateIn: bigint,
  rateOut: bigint,
  amp: bigint,
  fee: TFractionLike,
): TSwapOutcome => {
  if (output <= 0n || inputReserve <= 0n || outputReserve <= 0n)
    throw new Error("Output and reserves must be positive");
  if (rateIn <= 0n || rateOut <= 0n) throw new Error("Rates must be positive");
  if (amp <= 0n) throw new Error("Amplification must be positive");
  if (output >= outputReserve)
    throw new Error("Output must be below the output reserve");
  const [feeNum, feeDen] = asFeeParts(fee);

  // 1. Smallest gross whose post-fee remainder reaches `output`.
  //    gross − ceil(gross·n/d) = floor(gross·(d−n)/d), which is ≥ output
  //    exactly when gross ≥ ceil(output·d / (d−n)).
  const grossMin = ceilDiv(output * feeDen, feeDen - feeNum);
  if (grossMin >= outputReserve)
    throw new Error(
      "Output is not reachable: the fee pushes it past the reserve",
    );

  const d = getD(amp, inputReserve, outputReserve, rateIn, rateOut);
  const scaleIn = rateIn * CALC_PRECISION;
  const scaleOut = rateOut * CALC_PRECISION;

  // 2. The most the pool may keep of the taken asset and still pay `grossMin`.
  const yTarget = (outputReserve - grossMin) * scaleOut;
  if (yTarget <= 0n)
    throw new Error("Output is not reachable within the pool's reserves");

  // 3. + 4. The scaled given reserve that supports it, then token units.
  const xNeeded = solveCounterparty(amp, d, yTarget);
  const xBefore = inputReserve * scaleIn;
  let input = ceilDiv(xNeeded - xBefore, scaleIn);
  if (input < 1n) input = 1n;

  const grossOf = (dx: bigint): bigint =>
    floorDiv(
      getRawSwap(amp, d, inputReserve + dx, outputReserve, rateIn, rateOut),
      scaleOut,
    );

  let steps = 0;
  while (grossOf(input) < grossMin) {
    input += 1n;
    if (++steps > CORRECTION_MAX_STEPS)
      throw new Error("getSwapInput: the correction walk did not converge");
  }
  while (input > 1n && grossOf(input - 1n) >= grossMin) {
    input -= 1n;
    if (++steps > CORRECTION_MAX_STEPS)
      throw new Error("getSwapInput: the correction walk did not converge");
  }

  const gross = grossOf(input);
  const lpFee = ceilDiv(gross * feeNum, feeDen);

  const nextInputReserve = inputReserve + input;
  const nextOutputReserve = outputReserve - output;

  const xs = xBefore;
  const ys = outputReserve * scaleOut;
  const idealPrice = marginalInputPerOutput(amp, xs, ys, d, rateIn, rateOut);
  const actualPrice = new Fraction(input, gross);
  const priceImpact = Fraction.ONE.subtract(idealPrice.divide(actualPrice));

  return {
    input,
    output,
    lpFee: new AssetAmount(lpFee, outputMetadata),
    nextInputReserve,
    nextOutputReserve,
    priceImpact,
  };
};

// ─── Deposits ───────────────────────────────────────────────────────────────

/**
 * The deposit target a holder of `offered` can cover, and everything pinned to
 * it. This is the target-pinned rule the v4 module enforces (`ss_check.ak`,
 * tag 6), and it is the same shape constant sum uses, stated on `D` instead of
 * on the value sum `V`:
 *
 * - the fill declares a `D` delta `t`;
 * - every reserve moves by `ceil(r_i · t / D_before)`;
 * - `total_lp` becomes `floor(lp_before · (D_before + t) / D_before)`.
 *
 * The largest `t` a holder can cover is capped by the scarcest offered asset,
 * `t = min_i floor(offered_i · D_before / r_i)`. Anything above the pinned
 * deltas is refunded. Every pool asset must be offered, or `t` is zero and the
 * deposit can never fill.
 *
 * The rates do not enter the deltas: a proportional move is proportional in
 * any units. They enter only through `D`.
 */
export const calculatePinnedDeposit = (
  offered: bigint[],
  reserves: bigint[],
  totalLp: bigint,
  d: bigint,
): {
  targetDeltaD: bigint;
  deltas: bigint[];
  generatedLp: bigint;
  nextTotalLp: bigint;
  shareAfterDeposit: Fraction;
} => {
  if (offered.length !== reserves.length)
    throw new Error("offered and reserves must be aligned");
  if (totalLp <= 0n) throw new Error("Not enough pool liquidity");
  if (d <= 0n) throw new Error("Pool sum invariant is zero");
  if (offered.some((o) => o < 0n))
    throw new Error("Deposit amounts must be non-negative");

  let t: bigint | undefined;
  for (let i = 0; i < offered.length; i++) {
    if (reserves[i] <= 0n) continue;
    const cap = floorDiv(offered[i] * d, reserves[i]);
    t = t === undefined || cap < t ? cap : t;
  }
  if (t === undefined || t <= 0n)
    throw new Error(
      "A stableswap deposit must offer every pool asset in proportion (asymmetric deposits are disallowed on-chain)",
    );

  const deltas = reserves.map((r) => ceilDiv(r * t, d));
  const nextTotalLp = floorDiv(totalLp * (d + t), d);
  const generatedLp = nextTotalLp - totalLp;
  if (generatedLp <= 0n) throw new Error("Deposit mints zero LP");

  return {
    targetDeltaD: t,
    deltas,
    generatedLp,
    nextTotalLp,
    shareAfterDeposit: SharedPoolMath.getShare(generatedLp, nextTotalLp),
  };
};

/**
 * Calculate the deposit parameters for a two-asset v4 stableswap pool through
 * the target-pinned rule (see {@link calculatePinnedDeposit}). Surplus above
 * the pinned deltas comes back as `aChange` / `bChange`, the way the scoop
 * refunds it on-chain.
 *
 * @param a The amount of token A to deposit.
 * @param b The amount of token B to deposit.
 * @param aReserve The pool's reserve of token A.
 * @param bReserve The pool's reserve of token B.
 * @param totalLp The pool's total LP supply before the deposit.
 * @param rateA The pool's rate for token A (from the stableswap config).
 * @param rateB The pool's rate for token B.
 * @param amp The pool's `linear_amplification` (`A`), the raw stored integer.
 */
export const calculateLiquidity = (
  a: bigint,
  b: bigint,
  aReserve: bigint,
  bReserve: bigint,
  totalLp: bigint,
  rateA: bigint,
  rateB: bigint,
  amp: bigint,
) => {
  if (aReserve <= 0n || bReserve <= 0n)
    throw new Error("Not enough pool liquidity");
  const d = getD(amp, aReserve, bReserve, rateA, rateB);
  const { deltas, generatedLp, nextTotalLp, shareAfterDeposit } =
    calculatePinnedDeposit([a, b], [aReserve, bReserve], totalLp, d);

  return {
    nextTotalLp,
    generatedLp,
    shareAfterDeposit,
    aChange: a - deltas[0],
    bChange: b - deltas[1],
    actualDepositedA: deltas[0],
    actualDepositedB: deltas[1],
  };
};

/**
 * The per-asset amounts a pinned deposit needs when the user anchors on one
 * asset's amount: `t` from the anchor (`floor(anchor · D / r_anchor)`), every
 * other delta ceil-pinned to it. Drives proportional auto-fill in deposit
 * forms.
 */
export const pinnedDepositFromAnchor = (
  anchorIndex: number,
  anchorAmount: bigint,
  reserves: bigint[],
  d: bigint,
): bigint[] => {
  if (anchorIndex < 0 || anchorIndex >= reserves.length)
    throw new Error("anchor index is out of range");
  if (reserves[anchorIndex] <= 0n)
    throw new Error("anchor asset has no reserve");
  if (d <= 0n) throw new Error("Pool sum invariant is zero");
  if (anchorAmount <= 0n) return reserves.map(() => 0n);

  const t = floorDiv(anchorAmount * d, reserves[anchorIndex]);
  return reserves.map((r, i) =>
    i === anchorIndex ? anchorAmount : ceilDiv(r * t, d),
  );
};
