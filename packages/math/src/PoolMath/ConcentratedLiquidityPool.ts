import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { Fraction, type TFractionLike } from "@sundaeswap/fraction";

import * as ConstantProductPool from "./ConstantProductPool.js";

/**
 * Holds the calculated outcome of a concentrated-liquidity swap. Mirrors
 * {@link ConstantProductPool.TSwapOutcome} so it flows through the same generic
 * swap-outcome consumers.
 */
export type TSwapOutcome = {
  input: bigint;
  output: bigint;
  lpFee: AssetAmount<IAssetAmountMetadata>;
  nextInputReserve: bigint;
  nextOutputReserve: bigint;
  priceImpact: Fraction;
};

/** A sqrt-price bound from the CL config, as an exact rational `[num, den]`. */
export type TSqrtPrice = [bigint, bigint];

/**
 * Concentrated liquidity is Sundae v4's single-range invariant. Unlike Uniswap
 * v3 there are no per-position ranges or ticks: the whole pool shares ONE
 * immutable price range `[sqrtPriceA, sqrtPriceB]` (a < b) set at creation, and
 * LP is a single fungible token. Swaps run on *virtual* reserves that fold the
 * pool's liquidity `L` (its total LP supply) into each side:
 *
 *   VA = a·spbNum + L·spbDen
 *   VB = b·spaDen + L·spaNum
 *
 * where `a`/`b` are the raw assetA/assetB reserves. This is a direct port of the
 * scooper's `cl_swap_result` (scooper-v2/src/sundaev4/swap_math.rs) and the
 * on-chain `cl_check_swap` (sundae-v4/lib/modules/cl_check.ak) — those are the
 * source of truth; keep this in lockstep with them.
 */

const asFeeParts = (fee: TFractionLike): [bigint, bigint] => {
  const f = Fraction.asFraction(fee);
  if (f.lt(Fraction.ZERO) || f.gte(Fraction.ONE))
    throw new Error("fee must be in [0, 1)");
  return [BigInt(f.numerator), BigInt(f.denominator)];
};

/**
 * The raw forward swap: given a pre-fee input `dx`, return the output amount.
 * A→B and B→A use different virtual-reserve scalings (see `cl_check_swap`).
 * All quantities are non-negative so integer division floors, matching chain.
 */
const rawSwapOutput = (
  dx: bigint,
  aReserve: bigint,
  bReserve: bigint,
  totalLp: bigint,
  spaNum: bigint,
  spaDen: bigint,
  spbNum: bigint,
  spbDen: bigint,
  feeNum: bigint,
  feeDen: bigint,
  isAInput: boolean,
): bigint => {
  const fee = (dx * feeNum) / feeDen;
  const dxEff = dx - fee;
  const va0 = aReserve * spbNum + totalLp * spbDen;
  const vb0 = bReserve * spaDen + totalLp * spaNum;
  if (isAInput) {
    const dvaEff = dxEff * spbNum;
    const denom = (va0 + dvaEff) * spaDen;
    if (denom <= 0n) return 0n;
    return (vb0 * dvaEff) / denom;
  }
  const dvbEff = dxEff * spaNum;
  const denom = (vb0 + dvbEff) * spbNum;
  if (denom <= 0n) return 0n;
  return (va0 * dvbEff) / denom;
};

/**
 * Calculate the swap outcome for a concentrated-liquidity pool.
 *
 * @param inputMetadata Metadata for the supplied (input) asset — used for the fee AssetAmount.
 * @param input The pre-fee amount of the input asset being swapped.
 * @param aReserve The pool's raw reserve of asset A.
 * @param bReserve The pool's raw reserve of asset B.
 * @param totalLp The pool's total LP supply (the virtual liquidity `L`).
 * @param sqrtPriceA The lower sqrt-price bound `[num, den]` from the CL config.
 * @param sqrtPriceB The upper sqrt-price bound `[num, den]` from the CL config.
 * @param fee The liquidity-provider fee (plus protocol fee) as a fraction.
 * @param isAInput True when asset A is the supplied asset (A→B swap).
 * @returns The swap details in the shared {@link TSwapOutcome} shape.
 */
export const getSwapOutput = (
  inputMetadata: IAssetAmountMetadata,
  input: bigint,
  aReserve: bigint,
  bReserve: bigint,
  totalLp: bigint,
  sqrtPriceA: TSqrtPrice,
  sqrtPriceB: TSqrtPrice,
  fee: TFractionLike,
  isAInput: boolean,
): TSwapOutcome => {
  if (input <= 0n || aReserve <= 0n || bReserve <= 0n || totalLp <= 0n)
    throw new Error("Input, reserves and liquidity must be positive");
  const [spaNum, spaDen] = sqrtPriceA;
  const [spbNum, spbDen] = sqrtPriceB;
  if (spaNum <= 0n || spaDen <= 0n || spbNum <= 0n || spbDen <= 0n)
    throw new Error("sqrt prices must be positive");
  const [feeNum, feeDen] = asFeeParts(fee);

  const inputReserve = isAInput ? aReserve : bReserve;
  const outputReserve = isAInput ? bReserve : aReserve;

  let output = rawSwapOutput(
    input,
    aReserve,
    bReserve,
    totalLp,
    spaNum,
    spaDen,
    spbNum,
    spbDen,
    feeNum,
    feeDen,
    isAInput,
  );
  // Can't take more than the pool actually holds (virtual reserves can
  // otherwise let the formula exceed the real reserve near the boundary).
  if (output > outputReserve) output = outputReserve;

  const inputLpFee = (input * feeNum) / feeDen;
  const nextInputReserve = inputReserve + input;
  const nextOutputReserve = outputReserve - output;

  // Price impact vs the marginal (dx→0) rate. Marginal output-per-effective-
  // input is vb0·spbNum/(va0·spaDen) for A→B (symmetric for B→A), so the ideal
  // input-per-output is its reciprocal. Display-only.
  const va0 = aReserve * spbNum + totalLp * spbDen;
  const vb0 = bReserve * spaDen + totalLp * spaNum;
  let priceImpact = Fraction.ZERO;
  if (output > 0n) {
    const idealPrice = isAInput
      ? new Fraction(va0 * spaDen, vb0 * spbNum)
      : new Fraction(vb0 * spbNum, va0 * spaDen);
    const actualPrice = new Fraction(input - inputLpFee, output);
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
 * Calculate the minimal input required to receive a given output — the inverse
 * of {@link getSwapOutput}. The forward swap is linear-fractional in the
 * effective input, so it inverts in closed form; a short correction loop
 * absorbs the fee floor and integer rounding so the result is the exact minimal
 * input whose forward swap yields at least `output`.
 */
export const getSwapInput = (
  inputMetadata: IAssetAmountMetadata,
  output: bigint,
  aReserve: bigint,
  bReserve: bigint,
  totalLp: bigint,
  sqrtPriceA: TSqrtPrice,
  sqrtPriceB: TSqrtPrice,
  fee: TFractionLike,
  isAInput: boolean,
): TSwapOutcome => {
  if (output <= 0n || aReserve <= 0n || bReserve <= 0n || totalLp <= 0n)
    throw new Error("Output, reserves and liquidity must be positive");
  const [spaNum, spaDen] = sqrtPriceA;
  const [spbNum, spbDen] = sqrtPriceB;
  if (spaNum <= 0n || spaDen <= 0n || spbNum <= 0n || spbDen <= 0n)
    throw new Error("sqrt prices must be positive");
  const outputReserve = isAInput ? bReserve : aReserve;
  if (output > outputReserve)
    throw new Error("Output must not exceed the output reserve");

  const [feeNum, feeDen] = asFeeParts(fee);
  const feeDiff = feeDen - feeNum;

  const va0 = aReserve * spbNum + totalLp * spbDen;
  const vb0 = bReserve * spaDen + totalLp * spaNum;

  const ceilDiv = (n: bigint, d: bigint) => (n + d - 1n) / d;

  // Closed-form minimal effective input, then gross up for the fee floor.
  let effMin: bigint;
  if (isAInput) {
    // dvaEff ≥ output·spaDen·va0 / (vb0 − output·spaDen)
    const denom = vb0 - output * spaDen;
    if (denom <= 0n)
      throw new Error("Output not reachable within the pool's range");
    const dvaEffMin = ceilDiv(output * spaDen * va0, denom);
    effMin = ceilDiv(dvaEffMin, spbNum);
  } else {
    const denom = va0 - output * spbNum;
    if (denom <= 0n)
      throw new Error("Output not reachable within the pool's range");
    const dvbEffMin = ceilDiv(output * spbNum * vb0, denom);
    effMin = ceilDiv(dvbEffMin, spaNum);
  }
  let input = feeDiff > 0n ? ceilDiv(effMin * feeDen, feeDiff) : effMin;

  // Correct for floor interactions: nudge up until the forward swap clears the
  // target, then trim any over-shoot. Bounded — a couple of iterations at most.
  const fwd = (dx: bigint) =>
    rawSwapOutput(
      dx,
      aReserve,
      bReserve,
      totalLp,
      spaNum,
      spaDen,
      spbNum,
      spbDen,
      feeNum,
      feeDen,
      isAInput,
    );
  let guard = 0;
  while (fwd(input) < output && guard++ < 64) input += 1n;
  while (input > 1n && fwd(input - 1n) >= output) input -= 1n;

  const inputLpFee = (input * feeNum) / feeDen;
  const inputReserve = isAInput ? aReserve : bReserve;
  const nextInputReserve = inputReserve + input;
  const nextOutputReserve = outputReserve - output;

  let priceImpact = Fraction.ZERO;
  if (output > 0n) {
    const idealPrice = isAInput
      ? new Fraction(va0 * spaDen, vb0 * spbNum)
      : new Fraction(vb0 * spbNum, va0 * spaDen);
    const actualPrice = new Fraction(input - inputLpFee, output);
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
 * Deposit LP estimate for a concentrated-liquidity pool. CL deposits reuse the
 * constant-product *proportional* pinning: minting by the scarcest offered
 * asset and ceil-pinning the reserve deltas gives, per asset,
 * `a1·L0 ≥ a0·L1` and `b1·L0 ≥ b0·L1` — and those two bounds multiply to
 * exactly the on-chain CL non-swap invariant `va1·vb1·L0² ≥ va0·vb0·L1²`
 * (`cl_check.ak`). So the proportional deposit is always chain-valid; excess of
 * either asset is refunded via aChange/bChange. This mirrors the scooper's
 * `resolve_cl_deposit` (which likewise reuses the CP pinning).
 */
export const calculateLiquidity = (
  a: bigint,
  b: bigint,
  aReserve: bigint,
  bReserve: bigint,
  totalLp: bigint,
) => ConstantProductPool.calculateLiquidity(a, b, aReserve, bReserve, totalLp);
