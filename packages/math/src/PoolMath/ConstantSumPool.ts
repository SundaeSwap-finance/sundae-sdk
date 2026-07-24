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
 * Calculate the Add (Mixed-Deposit) Liquidity parameters for a constant-sum
 * pool. Deposits are valued at the pool's fixed per-asset prices, so any mix
 * of the two assets is accepted with no refunds — matching the v4 contract's
 * `compute_deposit_n`:
 *
 *   generatedLp = (a·priceA + b·priceB) · totalLp / (aReserve·priceA + bReserve·priceB)
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
  const { generatedLp, nextTotalLp, shareAfterDeposit } = calculateDepositN(
    [a, b],
    [aReserve, bReserve],
    [priceA, priceB],
    totalLp,
  );

  return {
    nextTotalLp,
    generatedLp,
    shareAfterDeposit,
    aChange: 0n,
    bChange: 0n,
    actualDepositedA: a,
    actualDepositedB: b,
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
