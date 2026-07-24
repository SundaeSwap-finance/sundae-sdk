import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { Fraction, type TFractionLike } from "@sundaeswap/fraction";
import { SharedPoolMath } from "./index.js";

/**
 * Holds the calculated outcome of a constant-sum swap. Mirrors
 * {@link ConstantProductPool.TSwapOutcome} so both can flow through the same
 * generic swap-outcome consumers.
 */
export type TSwapOutcome = {
  input: bigint;
  output: bigint;
  lpFee: AssetAmount<IAssetAmountMetadata>;
  nextInputReserve: bigint;
  nextOutputReserve: bigint;
  priceImpact: Fraction;
};

/**
 * Calculate the swap outcome for a constant-sum (fixed-price) pool — the
 * invariant used by Sundae v4 stable/pegged pools. Unlike constant product,
 * the exchange rate is fixed by the pool's per-asset `prices`: the input is
 * converted to "value" at `priceIn`, the fee is taken off that value, and the
 * remainder is converted to the output asset at `priceOut`. The result is
 * capped at the output reserve (you can't take more than the pool holds).
 *
 * Matches the scooper's `cs_swap_result`:
 *   output = floor((input·priceIn − floor(input·priceIn·fee)) / priceOut)
 *
 * @param inputMetadata Metadata for the supplied (input) asset — used for the fee AssetAmount.
 * @param input The amount of the input asset being swapped.
 * @param inputReserve The pool's reserve of the input asset.
 * @param outputReserve The pool's reserve of the output asset.
 * @param priceIn The pool's price for the input asset (from the constant-sum config).
 * @param priceOut The pool's price for the output asset.
 * @param fee The liquidity-provider fee (plus protocol fee) as a fraction.
 * @param roundOutputUp When true, round the output up instead of flooring.
 * @returns The swap details in the shared {@link TSwapOutcome} shape.
 */
export const getSwapOutput = (
  inputMetadata: IAssetAmountMetadata,
  input: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  priceIn: bigint,
  priceOut: bigint,
  fee: TFractionLike,
  roundOutputUp?: boolean,
): TSwapOutcome => {
  if (input <= 0n || inputReserve <= 0n || outputReserve <= 0n)
    throw new Error("Input and reserves must be positive");
  if (priceIn <= 0n || priceOut <= 0n)
    throw new Error("Prices must be positive");

  const feeFraction = Fraction.asFraction(fee);
  if (feeFraction.lt(Fraction.ZERO) || feeFraction.gt(Fraction.ONE))
    throw new Error("fee must be between 0 and 1");

  const inputValue = input * priceIn;
  const feeValue = new Fraction(
    inputValue * BigInt(feeFraction.numerator),
    BigInt(feeFraction.denominator),
  ).quotient;
  const outputValue = inputValue - feeValue;

  let output = roundOutputUp
    ? (outputValue + priceOut - 1n) / priceOut
    : outputValue / priceOut;

  // Can't take more than the pool holds.
  if (output > outputReserve) {
    output = outputReserve;
  }

  // LP fee expressed in input-asset units (value scales linearly with input,
  // so the input-denominated fee is input·feeRate) — matching ConstantProductPool.
  const inputLpFee = new Fraction(
    input * BigInt(feeFraction.numerator),
    BigInt(feeFraction.denominator),
  ).quotient;

  const nextInputReserve = inputReserve + input;
  const nextOutputReserve = outputReserve - output;

  // Price impact vs the pool's par price (priceOut/priceIn input-per-output);
  // ~0 for a constant-sum pool aside from the fee. See ConstantProductPool.
  let priceImpact = Fraction.ZERO;
  if (output > 0n) {
    const amountInLessFee = input - inputLpFee;
    const idealPrice = new Fraction(priceOut, priceIn);
    const actualPrice = new Fraction(amountInLessFee, output);
    priceImpact = Fraction.ONE.subtract(idealPrice.divide(actualPrice));
  }

  return {
    input,
    output,
    lpFee: new AssetAmount(inputLpFee, inputMetadata),
    nextInputReserve,
    nextOutputReserve,
    priceImpact,
  };
};

/**
 * Calculate the minimal input required to receive a given output from a
 * constant-sum pool — the exact inverse of {@link getSwapOutput}.
 *
 * The forward math floors the fee off the input value, which makes the
 * post-fee value `ceil(input·priceIn·(1−fee))`; inverting that ceiling gives
 * the smallest input whose forward swap yields at least `output`.
 *
 * Unlike constant product there is no asymptote, so an output equal to the
 * full output reserve is attainable (the pool can be drained at par).
 *
 * @param inputMetadata Metadata for the supplied (input) asset — used for the fee AssetAmount.
 * @param output The desired amount of the output asset.
 * @param inputReserve The pool's reserve of the input asset.
 * @param outputReserve The pool's reserve of the output asset.
 * @param priceIn The pool's price for the input asset (from the constant-sum config).
 * @param priceOut The pool's price for the output asset.
 * @param fee The liquidity-provider fee (plus protocol fee) as a fraction.
 * @returns The swap details in the shared {@link TSwapOutcome} shape.
 */
export const getSwapInput = (
  inputMetadata: IAssetAmountMetadata,
  output: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  priceIn: bigint,
  priceOut: bigint,
  fee: TFractionLike,
): TSwapOutcome => {
  if (output <= 0n || inputReserve <= 0n || outputReserve <= 0n)
    throw new Error("Output and reserves must be positive");
  if (priceIn <= 0n || priceOut <= 0n)
    throw new Error("Prices must be positive");
  if (output > outputReserve)
    throw new Error("Output must not exceed the output reserve");

  const feeFraction = Fraction.asFraction(fee);
  if (feeFraction.lt(Fraction.ZERO) || feeFraction.gte(Fraction.ONE))
    throw new Error("fee must be [0,1)");

  const feeNum = BigInt(feeFraction.numerator);
  const feeDen = BigInt(feeFraction.denominator);
  const feeDiff = feeDen - feeNum;

  // Forward: outputValue = ceil(input·priceIn·feeDiff/feeDen), and the swap
  // yields ≥ output iff outputValue ≥ output·priceOut. ceil(x/d) ≥ T for
  // integer x iff x ≥ d·(T−1)+1, so the minimal input is the ceiling of
  // (feeDen·(output·priceOut − 1) + 1) / (feeDiff·priceIn).
  const targetValue = output * priceOut;
  const numerator = feeDen * (targetValue - 1n) + 1n;
  const denominator = feeDiff * priceIn;
  const input = (numerator + denominator - 1n) / denominator;

  const inputLpFee = new Fraction(input * feeNum, feeDen).quotient;
  const nextInputReserve = inputReserve + input;
  const nextOutputReserve = outputReserve - output;

  // Same par-price impact definition as getSwapOutput.
  const amountInLessFee = input - inputLpFee;
  const idealPrice = new Fraction(priceOut, priceIn);
  const actualPrice = new Fraction(amountInLessFee, output);
  const priceImpact = Fraction.ONE.subtract(idealPrice.divide(actualPrice));

  return {
    input,
    output,
    lpFee: new AssetAmount(inputLpFee, inputMetadata),
    nextInputReserve,
    nextOutputReserve,
    priceImpact,
  };
};

/**
 * Calculate the deposit parameters for a 2-asset constant-sum pool via the
 * TARGET-PINNED rule the deployed validator enforces (see
 * {@link calculatePinnedDeposit}): the mint is capped by the scarcest offered
 * asset, both assets must be offered, and anything above the pinned deltas is
 * refunded via aChange/bChange.
 *
 * @param {bigint} a - The amount of token A to deposit.
 * @param {bigint} b - The amount of token B to deposit.
 * @param {bigint} aReserve - The current reserve of token A in the pool.
 * @param {bigint} bReserve - The current reserve of token B in the pool.
 * @param {bigint} totalLp - The total lp tokens for the pool before the deposit.
 * @param {bigint} priceA - The pool's price for token A (from the constant-sum config).
 * @param {bigint} priceB - The pool's price for token B.
 * @throws {Error} If the pool has no value or minted lp.
 * @throws {Error} If both deposit amounts are zero, or either is negative.
 * @throws {Error} If either price is non-positive.
 */
export const calculateLiquidity = (
  a: bigint,
  b: bigint,
  aReserve: bigint,
  bReserve: bigint,
  totalLp: bigint,
  priceA: bigint,
  priceB: bigint,
) => {
  // Target-pinned (what the deployed validator accepts): mint by the
  // scarcest offered asset; anything above the pinned deltas is refunded
  // (aChange/bChange).
  const { deltas, generatedLp, nextTotalLp, shareAfterDeposit } =
    calculatePinnedDeposit(
      [a, b],
      [aReserve, bReserve],
      [priceA, priceB],
      totalLp,
    );

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
 * The N-asset form of {@link calculateLiquidity}, mirroring the v4 contract's
 * `compute_deposit_n` exactly: a deposit of any mix of the pool's assets is
 * valued at the fixed prices against the value of ALL reserves —
 *
 *   generatedLp = Σ(amount_i·price_i) · totalLp / Σ(reserve_i·price_i)
 *
 * The three arrays must be aligned to the pool's canonical asset order (the
 * API's `assets`/`quantities`/`prices`). Estimating an N-asset pool's deposit
 * from just two of its reserves overstates the minted LP — the denominator is
 * the whole pool's value — which is exactly the mistake this exists to
 * prevent.
 */
/**
 * The target-pinned deposit — what the deployed CS validator (cs_check tag 6)
 * actually accepts, and what the scooper builds. Asymmetric deposits are
 * disallowed on-chain: the fill declares a value delta `t` and every asset's
 * contribution is ceil-pinned to `ceil(r_i·t/V_b)`, with total LP
 * floor-pinned to `floor(lp_b·(V_b+t)/V_b)`. Given what the user offers, the
 * largest fillable t is capped by the SCARCEST asset —
 * `t = min_i floor(offered_i·V_b/r_i)` — and anything above the pinned
 * deltas is returned as surplus. Every pool asset must be offered (> 0) or
 * t is zero and the deposit can never fill.
 *
 * Contrast with `calculateDepositN`, which is the plain value formula:
 * it matches the pin only for exactly proportional offers and OVERSTATES the
 * mint otherwise — using it for `minReceived` makes non-proportional orders
 * unfillable.
 */
export const calculatePinnedDeposit = (
  offered: bigint[],
  reserves: bigint[],
  prices: bigint[],
  totalLp: bigint,
): {
  targetDeltaV: bigint;
  deltas: bigint[];
  generatedLp: bigint;
  nextTotalLp: bigint;
  shareAfterDeposit: Fraction;
} => {
  if (offered.length !== reserves.length || reserves.length !== prices.length)
    throw new Error("offered, reserves and prices must be aligned");
  if (prices.some((p) => p <= 0n)) throw new Error("Prices must be positive");
  if (totalLp <= 0n) throw new Error("Not enough pool liquidity");

  let vB = 0n;
  for (let i = 0; i < reserves.length; i++) {
    vB += reserves[i] * prices[i];
  }
  if (vB <= 0n) throw new Error("Pool value is zero");

  let t: bigint | undefined;
  for (let i = 0; i < offered.length; i++) {
    if (reserves[i] === 0n) continue;
    const cap = (offered[i] * vB) / reserves[i];
    t = t === undefined || cap < t ? cap : t;
  }
  if (t === undefined || t <= 0n) {
    throw new Error(
      "A constant-sum deposit must offer every pool asset in proportion (asymmetric deposits are disallowed on-chain)",
    );
  }

  const deltas = reserves.map((r) => (r * t! + vB - 1n) / vB); // ceil
  const nextTotalLp = (totalLp * (vB + t)) / vB; // floor
  const generatedLp = nextTotalLp - totalLp;
  if (generatedLp <= 0n) throw new Error("Deposit mints zero LP");

  return {
    targetDeltaV: t,
    deltas,
    generatedLp,
    nextTotalLp,
    shareAfterDeposit: SharedPoolMath.getShare(generatedLp, nextTotalLp),
  };
};

/**
 * The per-asset amounts a pinned deposit needs when the user anchors on one
 * asset's amount: t from the anchor (`floor(anchor·V_b/r_anchor)`), every
 * delta ceil-pinned to it. Drives proportional auto-fill in deposit forms.
 */
export const pinnedDepositFromAnchor = (
  anchorIndex: number,
  anchorAmount: bigint,
  reserves: bigint[],
  prices: bigint[],
): bigint[] => {
  if (reserves.length !== prices.length)
    throw new Error("reserves and prices must be aligned");
  if (
    anchorIndex < 0 ||
    anchorIndex >= reserves.length ||
    reserves[anchorIndex] <= 0n
  )
    throw new Error("anchor asset has no reserve");
  if (anchorAmount <= 0n) return reserves.map(() => 0n);

  let vB = 0n;
  for (let i = 0; i < reserves.length; i++) {
    vB += reserves[i] * prices[i];
  }
  if (vB <= 0n) throw new Error("Pool value is zero");

  const t = (anchorAmount * vB) / reserves[anchorIndex];
  return reserves.map((r, i) =>
    i === anchorIndex ? anchorAmount : (r * t + vB - 1n) / vB,
  );
};

export const calculateDepositN = (
  amounts: bigint[],
  reserves: bigint[],
  prices: bigint[],
  totalLp: bigint,
) => {
  if (amounts.length !== reserves.length || reserves.length !== prices.length)
    throw new Error("amounts, reserves and prices must be aligned");
  if (prices.some((p) => p <= 0n)) throw new Error("Prices must be positive");
  if (amounts.some((a) => a < 0n) || amounts.every((a) => a === 0n))
    throw new Error("Cannot use a deposit asset amount of 0");

  let totalValue = 0n;
  let depositValue = 0n;
  for (let i = 0; i < amounts.length; i++) {
    totalValue += reserves[i] * prices[i];
    depositValue += amounts[i] * prices[i];
  }
  if (totalValue <= 0n || totalLp <= 0n)
    throw new Error("Not enough pool liquidity");

  const generatedLp = (depositValue * totalLp) / totalValue;
  const nextTotalLp = totalLp + generatedLp;

  return {
    nextTotalLp,
    generatedLp,
    shareAfterDeposit: SharedPoolMath.getShare(generatedLp, nextTotalLp),
  };
};
