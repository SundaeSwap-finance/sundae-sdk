import { SharedPoolMath } from "./index.js";
import { Fraction, type TFractionLike } from "@sundaeswap/fraction";

/**
 * Validates that a given sum invariant (D) satisfies the liquidity invariant equation
 * for the Stableswaps curve. This function checks if D is within the valid range by
 * evaluating the invariant function at D and D+1.
 *
 * The liquidity invariant ensures that the curve equation is satisfied:
 * 4A * 4xy * D + D^3 - (4xy * 4A * (x + y) + 4xy * D) should be <= 0 at D and > 0 at D+1
 *
 * @param {bigint} assetA - The reserve amount of asset A (already scaled by RESERVE_PRECISION).
 * @param {bigint} assetB - The reserve amount of asset B (already scaled by RESERVE_PRECISION).
 * @param {bigint} linearAmplification - The amplification coefficient for the pool.
 * @param {bigint} newSumInvariant - The proposed sum invariant (D) to validate.
 * @returns {boolean} True if the sum invariant satisfies the liquidity invariant equation, false otherwise.
 */
export function liquidityInvariant(
  assetA: bigint,
  assetB: bigint,
  linearAmplification: bigint,
  newSumInvariant: bigint,
) {
  // 4 * A * 4 * (x*y) * D + D^3 - (4(x*y) * (4A(x + y) + D))
  // 4A * 4xy * D + D^3 - (4xy * 4a * (x + y) + 4xy * D)
  // 16Axy * D + D^3 - (16Axy * (x + y) + 4xy * D)
  const four_a = 4n * linearAmplification;
  const four_x_y = 4n * assetA * assetB;
  const d_plus_one = newSumInvariant + 1n;
  const d_cubed = newSumInvariant * newSumInvariant * newSumInvariant;
  const d_plus_one_cubed = d_plus_one * d_plus_one * d_plus_one;
  const x_plus_y = assetA + assetB;
  const sixteen_a_x_y = four_a * four_x_y;
  const sixteen_a_x_y_x_plus_y = sixteen_a_x_y * x_plus_y;
  const f1 =
    sixteen_a_x_y * newSumInvariant +
    d_cubed -
    (sixteen_a_x_y_x_plus_y + four_x_y * newSumInvariant);
  const f2 =
    sixteen_a_x_y * d_plus_one +
    d_plus_one_cubed -
    (sixteen_a_x_y_x_plus_y + four_x_y * d_plus_one);
  return f1 <= 0n && f2 > 0n;
}

/**
 * Precision factor for the amplification coefficient calculations.
 * Used to scale the amplification factor for more precise arithmetic operations.
 */
export const A_PRECISION: bigint = 200n;

/**
 * Precision factor for reserve calculations in the Stableswaps curve.
 * Reserves are multiplied by this value to maintain precision during calculations.
 * This allows for accurate fractional calculations with integer arithmetic.
 */
export const RESERVE_PRECISION: bigint = 1_000_000_000_000n;

/**
 * Precision factor for fee calculations, representing basis points.
 * A value of 10,000 means fees are calculated with 0.01% precision (1 basis point).
 */
export const FEE_PRECISION: bigint = 10_000n;

/**
 * Calculates the sum invariant (D) for a Stableswaps pool using Newton's method.
 * The sum invariant represents the total value in the pool and is used to determine
 * the fair exchange rate between assets.
 *
 * This function iteratively solves for D in the Stableswaps invariant equation:
 * Ann * sum + D_p * 2 = Ann * D + D_p * 3
 * where D_p = D^3 / (4 * x * y) and Ann = A * n^n (with n=2)
 *
 * The iteration continues until convergence (difference <= 1) or fails after 255 iterations.
 *
 * @param {bigint} a - The amplification coefficient for the pool (will be scaled by A_PRECISION).
 * @param {bigint} x - The reserve amount of the first asset (will be scaled by RESERVE_PRECISION).
 * @param {bigint} y - The reserve amount of the second asset (will be scaled by RESERVE_PRECISION).
 * @returns {bigint} The calculated sum invariant (D) scaled by RESERVE_PRECISION.
 * @throws {Error} If the amplification coefficient is not positive.
 * @throws {Error} If convergence fails after 255 iterations.
 */
export function getSumInvariant(a: bigint, x: bigint, y: bigint): bigint {
  if (a <= 0n) {
    throw new Error("Amplification coefficient must be positive.");
  }
  x = x * RESERVE_PRECISION;
  y = y * RESERVE_PRECISION;
  a = a * A_PRECISION;
  const sum: bigint = x + y;
  if (sum === 0n) {
    return 0n;
  }

  let d = sum;
  const ann = a * 2n;
  for (let i = 0; i < 255; i++) {
    const d_p = (d * d * d) / (4n * x * y);
    const d_prev = d;

    d =
      (((ann * sum) / 100n + d_p * 2n) * d) /
      (((ann - 100n) * d) / 100n + 3n * d_p);

    if (d > d_prev) {
      if (d - d_prev <= 1) {
        if (liquidityInvariant(x, y, a / A_PRECISION, d)) {
          return d;
        } else {
          return d - 1n;
        }
      }
    } else {
      if (d_prev - d <= 1) {
        if (liquidityInvariant(x, y, a / A_PRECISION, d)) {
          return d;
        } else {
          return d - 1n;
        }
      }
    }
  }
  throw new Error("Failed to converge on D value after 255 iterations.");
}

/**
 * Calculates the new Y reserve value given a new X reserve value and the sum invariant.
 * This function uses Newton's method to iteratively solve for Y in the Stableswaps equation
 * while maintaining the pool's invariant (D).
 *
 * The function solves: Y^2 + (sum + (D * A_PRECISION) / (2 * Ann) - D) * Y - c = 0
 * where c is derived from D and the pool parameters.
 *
 * This is used during swaps to determine the output reserve after an input is added.
 *
 * @param {bigint} newX - The new reserve amount for asset X (will be scaled by RESERVE_PRECISION internally).
 * @param {bigint} aRaw - The raw amplification coefficient for the pool (will be scaled by A_PRECISION).
 * @param {bigint} sumInvariant - The pool's sum invariant (D), already scaled.
 * @returns {bigint} The calculated Y reserve value scaled by RESERVE_PRECISION.
 * @throws {Error} If convergence fails after 255 iterations.
 */
export function getNewY(
  newX: bigint,
  aRaw: bigint,
  sumInvariant: bigint,
): bigint {
  newX = newX * RESERVE_PRECISION;
  const sum = newX;
  let yPrev: bigint;
  let c = sumInvariant;
  const ann = aRaw * A_PRECISION * 2n;

  c = (c * sumInvariant) / (newX * 2n);
  c = (c * sumInvariant * A_PRECISION) / 2n;
  c = c / (ann * 2n);
  const b = sum + (sumInvariant * A_PRECISION) / 2n / ann;
  let y = sumInvariant;
  for (let i = 0; i < 255; i++) {
    yPrev = y;
    y = (y * y + c) / (y * 2n + b - sumInvariant);
    if (y > yPrev) {
      if (y - yPrev <= 1n) {
        if (liquidityInvariant(newX, y, aRaw, sumInvariant)) {
          return y;
        } else {
          return y + 1n;
        }
      }
    } else {
      if (yPrev - y <= 1n) {
        if (liquidityInvariant(newX, y, aRaw, sumInvariant)) {
          return y;
        } else {
          return y + 1n;
        }
      }
    }
  }
  throw new Error("failed to converge on y value after 255 iterations.");
}

/**
 * Calculates the initial LP token amount for the first liquidity provision to a pool.
 * This is used when bootstrapping a new pool with initial reserves of assets A and B.
 *
 * The LP tokens minted are derived from the sum invariant (D) divided by the reserve precision,
 * effectively representing the pool's total value at inception.
 *
 * @param {bigint} a - The initial amount of token A being deposited.
 * @param {bigint} b - The initial amount of token B being deposited.
 * @param {bigint} laf - The linear amplification factor for the pool.
 * @returns {bigint} The amount of LP tokens to mint for the first liquidity provision.
 */
export const getFirstLp = (a: bigint, b: bigint, laf: bigint) =>
  getSumInvariant(laf, a, b) / RESERVE_PRECISION;

/**
 * Calculates the liquidity parameters for adding liquidity to a Stableswaps pool.
 * This function supports mixed deposits where both assets can be deposited in any proportion.
 *
 * The calculation is based on the change in the sum invariant (D) before and after the deposit.
 * LP tokens are minted proportionally to the increase in D relative to the old D value.
 *
 * TODO: Investigate way to optimize actual deposited amounts
 *
 * @param {bigint} a - The amount of token A to deposit.
 * @param {bigint} b - The amount of token B to deposit.
 * @param {bigint} aReserve - The current reserve of token A in the pool.
 * @param {bigint} bReserve - The current reserve of token B in the pool.
 * @param {bigint} totalLp - The total LP tokens for the pool before the deposit.
 * @param {bigint} laf - The linear amplification factor of the pool.
 * @throws {Error} If the pool doesn't have enough liquidity (both reserves are zero).
 * @throws {Error} If both deposit amounts are zero.
 * @returns {Object} An object containing:
 *   - nextTotalLp: The total LP tokens for the pool after the deposit.
 *   - generatedLp: The amount of LP tokens generated by the deposit.
 *   - shareAfterDeposit: The depositor's share of the pool after the deposit (as a Fraction).
 *   - aChange: Always 0n for Stableswaps (no refund needed).
 *   - bChange: Always 0n for Stableswaps (no refund needed).
 *   - actualDepositedA: The actual amount of A deposited (always equal to input a).
 *   - actualDepositedB: The actual amount of B deposited (always equal to input b).
 */
export const calculateLiquidity = (
  a: bigint,
  b: bigint,
  aReserve: bigint,
  bReserve: bigint,
  totalLp: bigint,
  laf: bigint,
) => {
  if (aReserve === 0n && bReserve === 0n) {
    throw new Error("Not enough pool liquidity");
  }

  if (a === 0n && b === 0n) {
    throw new Error("Cannot use a deposit asset amount of 0");
  }

  const oldSumInvariant = getSumInvariant(laf, aReserve, bReserve);

  const newSumInvariant = getSumInvariant(laf, aReserve + a, bReserve + b);

  const newLpTokens =
    ((newSumInvariant - oldSumInvariant) * totalLp) / oldSumInvariant;

  const newTotalLpTokens = totalLp + newLpTokens;

  return {
    nextTotalLp: newTotalLpTokens,
    generatedLp: newLpTokens,
    shareAfterDeposit: SharedPoolMath.getShare(newLpTokens, newTotalLpTokens),
    aChange: 0n,
    bChange: 0n,
    actualDepositedA: a,
    actualDepositedB: b,
  };
};

/**
 * Calculates the token amounts that a given LP token amount represents when withdrawing
 * from a Stableswaps pool. The withdrawal is proportional to the LP tokens being redeemed
 * relative to the total LP supply.
 *
 * This uses a simple linear proportion: amount = (lp * reserve) / totalLp for each asset.
 *
 * @param {bigint} lp - The amount of LP tokens being redeemed.
 * @param {bigint} aReserve - The pool's current reserve amount of token A.
 * @param {bigint} bReserve - The pool's current reserve amount of token B.
 * @param {bigint} totalLp - The pool's total minted LP tokens currently in circulation.
 * @returns {SharedPoolMath.TPair} A tuple [a, b] containing the amounts of tokens A and B to withdraw.
 */
export const getTokensForLp = (
  lp: bigint,
  aReserve: bigint,
  bReserve: bigint,
  totalLp: bigint,
): SharedPoolMath.TPair => [
  new Fraction(lp * aReserve, totalLp).quotient,
  new Fraction(lp * bReserve, totalLp).quotient,
];

/**
 * Represents the complete outcome of a swap operation in a Stableswaps pool.
 * Contains all relevant information about the swap including amounts, fees, updated reserves,
 * and price impact.
 */
export type TSwapOutcome = {
  /** The amount of input tokens being swapped */
  input: bigint;
  /** The amount of output tokens received (after all fees) */
  output: bigint;
  /** The portion of fees that goes to liquidity providers */
  outputLpFee: bigint;
  /** The portion of fees that goes to the protocol */
  outputProtocolFee: bigint;
  /** The input asset reserve amount after the swap */
  nextInputReserve: bigint;
  /** The output asset reserve amount after the swap (excluding protocol fees) */
  nextOutputReserve: bigint;
  /** The pool's sum invariant (D) after the swap */
  nextSumInvariant: bigint;
  /** The price impact of the swap as a fraction (difference between ideal and actual price) */
  priceImpact: Fraction;
};

/**
 * Calculates the output amount and all swap parameters for a given input amount in a Stableswaps pool.
 * This function determines how many output tokens will be received for a given input, accounting for
 * the Stableswaps curve, LP fees, and protocol fees.
 *
 * The calculation process:
 * 1. Validates inputs and fees
 * 2. Calculates the current sum invariant (D)
 * 3. Determines the new Y value after adding input to X
 * 4. Calculates raw output and applies fees (LP + protocol)
 * 5. Computes price impact by comparing ideal vs actual execution price
 *
 * @param {bigint} input - The amount of input tokens to swap.
 * @param {bigint} inputReserve - The current reserve amount of the input token in the pool.
 * @param {bigint} outputReserve - The current reserve amount of the output token in the pool.
 * @param {TFractionLike} fee - The liquidity provider fee as a fraction (e.g., 0.003 for 0.3%).
 * @param {TFractionLike} protocolFee - The protocol fee as a fraction.
 * @param {bigint} laf - The linear amplification factor of the pool.
 * @param {boolean} [roundOutputUp] - Optional flag to round output up instead of down (default: false).
 * @returns {TSwapOutcome} The complete swap outcome including output, fees, reserves, and price impact.
 * @throws {Error} If input or reserves are not positive.
 * @throws {Error} If fee is not in the range [0, 1).
 * @throws {Error} If protocol fee is not in the range [0, 1).
 * @throws {Error} If combined fee is greater than or equal to 1.
 */
export const getSwapOutput = (
  input: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  fee: TFractionLike,
  protocolFee: TFractionLike,
  laf: bigint,
  roundOutputUp?: boolean,
): TSwapOutcome => {
  if (input <= 0 || inputReserve <= 0 || outputReserve <= 0)
    throw new Error("Input and reserves must be positive");

  fee = Fraction.asFraction(fee);
  if (fee.lt(Fraction.ZERO) || fee.gte(Fraction.ONE))
    throw new Error("fee must be between 0 and 1");

  protocolFee = Fraction.asFraction(protocolFee);
  if (protocolFee.lt(Fraction.ZERO) || protocolFee.gte(Fraction.ONE))
    throw new Error("protocolFee must be between 0 and 1");

  const combinedFee = fee.add(protocolFee);
  if (combinedFee.gte(Fraction.ONE))
    throw new Error("Combined fee must be less than 1");
  const sumInvariant = getSumInvariant(laf, inputReserve, outputReserve);
  const nextInputReserve = inputReserve + input;
  const newY = getNewY(nextInputReserve, laf, sumInvariant);

  const deltaYPrec = outputReserve * RESERVE_PRECISION - newY;
  const deltaY = new Fraction(deltaYPrec, RESERVE_PRECISION);
  const totalFee = combinedFee
    .multiply(FEE_PRECISION)
    .multiply(deltaY.quotient)
    .add(Fraction.asFraction(FEE_PRECISION - 1n))
    .divide(FEE_PRECISION).quotient;
  const totalProtocolFee = protocolFee
    .multiply(totalFee)
    .divide(combinedFee).quotient;
  const totalLpFee = totalFee - totalProtocolFee;
  const output = deltaY.subtract(totalFee);
  const safeOutput = roundOutputUp
    ? (output.numerator + output.denominator - 1n) / output.denominator
    : output.quotient;
  const nextOutputReserve = outputReserve - safeOutput - totalProtocolFee;

  // PRICEIMPACT: "priceImpact" is slightly misleadingly named in the industry as a whole
  // just by it's name, it would imply that it's the percentage difference between
  // the current price and the price after the swap, but it's actually the percentage
  // difference between the real price of your swap, and the price implied by the current
  // reserves; We got this wrong in v1, but this aligns it with the industry standard
  // Source: https://dailydefi.org/articles/price-impact-and-how-to-calculate/
  const idealPrice = getPrice(inputReserve, outputReserve, laf);
  const actualPrice = new Fraction(input, safeOutput);
  const priceImpact = Fraction.ONE.subtract(idealPrice.divide(actualPrice));
  return {
    input,
    output: safeOutput,
    outputLpFee: totalLpFee,
    outputProtocolFee: totalProtocolFee,
    nextInputReserve,
    nextOutputReserve,
    nextSumInvariant: getSumInvariant(laf, nextInputReserve, nextOutputReserve),
    priceImpact,
  };
};

/**
 * Calculates the current price (exchange rate) of asset A in terms of asset B for a Stableswaps pool.
 * The price is derived from the Stableswaps curve equation and takes into account the amplification factor.
 *
 * The calculation uses the formula:
 * price = (xpA + (dR * aReserve) / bReserve) / (xpA + dR)
 * where xpA = (Ann * aReserve) / A_PRECISION and dR is derived from the sum invariant
 *
 * @param {bigint} aReserve - The current reserve amount of asset A in the pool.
 * @param {bigint} bReserve - The current reserve amount of asset B in the pool.
 * @param {bigint} laf - The linear amplification factor of the pool.
 * @returns {Fraction} The price of asset A in terms of asset B as a Fraction.
 */
export function getPrice(
  aReserve: bigint,
  bReserve: bigint,
  laf: bigint,
): Fraction {
  // dx_0 / dx_1 only, however can have any number of coins in pool
  const ann = laf * 2n * A_PRECISION;
  const sumInvariant =
    getSumInvariant(laf, aReserve, bReserve) / RESERVE_PRECISION;
  // D / n^n with n = 2
  let dR = sumInvariant / 4n;
  dR = (dR * sumInvariant) / aReserve;
  dR = (dR * sumInvariant) / bReserve;
  const xpA = (ann * aReserve) / A_PRECISION;
  const p = new Fraction(xpA + (dR * aReserve) / bReserve, xpA + dR);
  return p;
}

/**
 * Calculates the required input amount and all swap parameters for a desired output amount in a Stableswaps pool.
 * This is the reverse operation of getSwapOutput - given how much you want to receive, it determines
 * how much you need to provide as input, accounting for fees and the Stableswaps curve.
 *
 * The calculation process:
 * 1. Validates inputs, fees, and output constraints
 * 2. Calculates raw output needed before fees
 * 3. Determines the new X value to achieve the desired Y reduction
 * 4. Calculates required input and separates LP and protocol fees
 * 5. Computes price impact by comparing ideal vs actual execution price
 *
 * @param {bigint} output - The desired amount of output tokens to receive.
 * @param {bigint} inputReserve - The current reserve amount of the input token in the pool.
 * @param {bigint} outputReserve - The current reserve amount of the output token in the pool.
 * @param {TFractionLike} fee - The liquidity provider fee as a fraction (e.g., 0.003 for 0.3%).
 * @param {TFractionLike} protocolFee - The protocol fee as a fraction.
 * @param {bigint} laf - The linear amplification factor of the pool.
 * @returns {TSwapOutcome} The complete swap outcome including required input, fees, reserves, and price impact.
 * @throws {Error} If output or reserves are not positive.
 * @throws {Error} If output is greater than or equal to the output reserve.
 * @throws {Error} If fee is not in the range [0, 1).
 * @throws {Error} If protocol fee is not in the range [0, 1).
 * @throws {Error} If combined fee is greater than or equal to 1.
 */
export const getSwapInput = (
  output: bigint,
  inputReserve: bigint,
  outputReserve: bigint,
  fee: TFractionLike,
  protocolFee: TFractionLike,
  laf: bigint,
): TSwapOutcome => {
  if (output <= 0 || inputReserve <= 0 || outputReserve <= 0)
    throw new Error("Output and reserves must be positive");

  if (output >= outputReserve)
    throw new Error("Output must be less than output reserve");

  fee = Fraction.asFraction(fee);
  if (fee.lt(Fraction.ZERO) || fee.gte(Fraction.ONE))
    throw new Error("fee must be [0,1)");

  protocolFee = Fraction.asFraction(protocolFee);
  if (protocolFee.lt(Fraction.ZERO) || protocolFee.gte(Fraction.ONE))
    throw new Error("protocolFee must be between 0 and 1");

  const combinedFee = fee.add(protocolFee);
  if (combinedFee.gte(Fraction.ONE))
    throw new Error("Combined fee must be less than 1");

  // output = rawOutput * (1-fee)
  // rawOutput = output / (1-fee)
  const rawOutputF = Fraction.asFraction(output).divide(
    Fraction.ONE.sub(combinedFee),
  );
  const rawOutput =
    (rawOutputF.numerator + rawOutputF.denominator - 1n) /
    rawOutputF.denominator;
  const sumInvariant = getSumInvariant(laf, inputReserve, outputReserve);
  const newX = getNewY(outputReserve - rawOutput, laf, sumInvariant);
  const input =
    (newX - inputReserve * RESERVE_PRECISION + RESERVE_PRECISION - 1n) /
    RESERVE_PRECISION;

  const totalFee =
    (combinedFee.multiply(FEE_PRECISION).quotient * rawOutput +
      FEE_PRECISION -
      1n) /
    FEE_PRECISION;
  const totalProtocolFee = protocolFee
    .multiply(totalFee)
    .divide(combinedFee).quotient;

  const totalLpFee = totalFee - totalProtocolFee;

  const nextInputReserve = inputReserve + input;
  const nextOutputReserve = outputReserve - output - totalProtocolFee;

  // See PRICEIMPACT
  const idealPrice = getPrice(inputReserve, outputReserve, laf);
  const actualPrice = new Fraction(input, output);
  const priceImpact = Fraction.ONE.subtract(idealPrice.divide(actualPrice));

  const nextSumInvariant = getSumInvariant(
    laf,
    nextInputReserve,
    nextOutputReserve,
  );

  return {
    input,
    output,
    outputLpFee: totalLpFee,
    outputProtocolFee: totalProtocolFee,
    nextInputReserve,
    nextOutputReserve,
    priceImpact,
    nextSumInvariant,
  };
};
