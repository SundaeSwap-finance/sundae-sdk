import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { Fraction, type TFractionLike } from "@sundaeswap/fraction";

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
