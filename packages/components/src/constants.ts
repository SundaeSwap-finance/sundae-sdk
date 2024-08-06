import { AssetAmount } from "@sundaeswap/asset";
import { ADA_METADATA } from "@sundaeswap/core";

import { IAssetMetadata } from "./types/assets.js";

/**
 * The minimum ADA amount that _must_ remain in the wallet after any transaction which equals 10 ADA (for now).
 * This value consists of:
 * 2 ADA Deposit
 * 2.5 ADA Scooper Fee
 * 0.5 ADA Transaction Fee
 * 5 ADA used as minADA
 */
export const MIN_ADA_WALLET_BALANCE = new AssetAmount<IAssetMetadata>(
  10000000,
  ADA_METADATA
);

export const SCOOPER_FEE = new AssetAmount<IAssetMetadata>(
  2500000,
  ADA_METADATA
); // 2.5 ADA
export const SCOOPER_FEE_V3 = new AssetAmount<IAssetMetadata>(
  1000000,
  ADA_METADATA
); // 1 ADA
export const SCOOPER_FEE_V3_WITH_DISCOUNT = new AssetAmount<IAssetMetadata>(
  500000,
  ADA_METADATA
); // 0.5 ADA
export const DEPOSIT = new AssetAmount<IAssetMetadata>(2000000, ADA_METADATA); // 2 ADA
export const ADA_TX_FEE = new AssetAmount<IAssetMetadata>(200000, ADA_METADATA); // 0.2 ADA
