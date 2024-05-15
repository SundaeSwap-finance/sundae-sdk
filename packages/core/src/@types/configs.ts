import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { EPoolCoin, TOrderAddresses, TUTXO } from "./datumbuilder.js";
import { IPoolData } from "./queryprovider.js";
import { ITxBuilderReferralFee } from "./txbuilders.js";

/**
 * The base config that all configs extend.
 */
export interface IBaseConfig {
  referralFee?: ITxBuilderReferralFee;
}

/**
 * The common arguments for any valid order.
 */
export interface IOrderConfigArgs extends IBaseConfig {
  pool: IPoolData;
  orderAddresses: TOrderAddresses;
}

/**
 * An enum to represent a Swap order type.
 */
export enum ESwapType {
  MARKET = "MARKET",
  LIMIT = "LIMIT",
}

/**
 * An interface that represents a market order
 * swap with required slippage.
 */
export interface IMarketSwap {
  type: ESwapType.MARKET;
  slippage: number;
}

/**
 * An interface that represents a limit order
 * swap with required minimum receivable.
 */
export interface ILimitSwap {
  type: ESwapType.LIMIT;
  minReceivable: AssetAmount<IAssetAmountMetadata>;
}

/**
 * A union type to represent all possible swap types.
 */
export type TSwapType = IMarketSwap | ILimitSwap;

/**
 * The arguments configuration for building a valid Swap.
 */
export interface ISwapConfigArgs extends IOrderConfigArgs {
  suppliedAsset: AssetAmount<IAssetAmountMetadata>;
  swapType: TSwapType;
}

/**
 * The arguments configuration for building a valid Deposit.
 */
export interface IDepositConfigArgs extends IOrderConfigArgs {
  suppliedAssets: [
    AssetAmount<IAssetAmountMetadata>,
    AssetAmount<IAssetAmountMetadata>
  ];
}

/**
 * The arguments configuration for building a valid cancellation transaction.
 */
export interface ICancelConfigArgs extends IBaseConfig {
  ownerAddress: string;
  utxo: TUTXO;
}

/**
 * The arguments configuration for building a valid Deposit.
 */
export interface IZapConfigArgs extends IOrderConfigArgs {
  suppliedAsset: AssetAmount<IAssetAmountMetadata>;
  zapDirection: EPoolCoin;
  swapSlippage?: number;
}

/**
 * The arguments configuration for building a valid Withdraw.
 */
export interface IWithdrawConfigArgs extends IOrderConfigArgs {
  suppliedLPAsset: AssetAmount<IAssetAmountMetadata>;
}

/**
 * Interface describing the method arguments for creating a pool
 * in the V3 Pool Contract.
 */
export interface IMintV3PoolConfigArgs extends IBaseConfig {
  assetA: AssetAmount<IAssetAmountMetadata>;
  assetB: AssetAmount<IAssetAmountMetadata>;
  fee: bigint;
  ownerAddress: string;
  // Defaults to immediately.
  marketOpen?: bigint;
}
