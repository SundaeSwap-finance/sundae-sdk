import { AssetAmount } from "@sundaeswap/asset";
import { Fraction } from "@sundaeswap/fraction";

/**
 * The direction of a ratio (A per B or B per A)
 */
export type TRatioDirection = "A_PER_B" | "B_PER_A";

/**
 * Asset used in a ratio calculation
 */
export interface IRatioCalculationAsset {
  assetId: string;
  quantity: bigint;
  decimals: number;
}

/**
 * The result of a ratio calculation on a pool
 */
export interface IRatioCalculationResult {
  calculatedAmount: AssetAmount;
  ratioAsFraction: Fraction;
  display: string;
  isDivisible: boolean;
  belowMinimumRatio: boolean;
}

/**
 * The amounts for a token pair
 */
export type TPair = [bigint, bigint];

/**
 * Get the share ratio as Fraction
 * @param lp
 * @param totalLp
 * @returns
 */
export const getShare = (lp: bigint, totalLp: bigint) =>
  new Fraction(lp, totalLp);
