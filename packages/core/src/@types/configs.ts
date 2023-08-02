import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { OrderAddresses, PoolCoin, UTXO } from "./datumbuilder";
import { IPoolData } from "./queryprovider";

/**
 * The base config that all configs extend.
 */
export interface BaseConfig {
  skipReferral?: boolean;
}

/**
 * The common arguments for any valid order.
 */
export interface OrderConfigArgs extends BaseConfig {
  pool: IPoolData;
  orderAddresses: OrderAddresses;
}

/**
 * The arguments configuration for building a valid Swap.
 */
export interface SwapConfigArgs extends OrderConfigArgs {
  suppliedAsset: AssetAmount<IAssetAmountMetadata>;
  minReceivable?: AssetAmount<IAssetAmountMetadata>;
  slippage?: number | false;
}

/**
 * The arguments configuration for building a valid Deposit.
 */
export interface DepositConfigArgs extends OrderConfigArgs {
  suppliedAssets: [
    AssetAmount<IAssetAmountMetadata>,
    AssetAmount<IAssetAmountMetadata>
  ];
}

/**
 * The arguments configuration for building a valid cancellation transaction.
 */
export interface CancelConfigArgs {
  utxo: UTXO;
  datum: string;
  datumHash: string;
  address: string;
}

/**
 * The arguments configuration for building a valid Deposit.
 */
export interface ZapConfigArgs extends OrderConfigArgs {
  suppliedAsset: AssetAmount<IAssetAmountMetadata>;
  zapDirection: PoolCoin;
  swapSlippage?: number;
}

/**
 * The arguments configuration for building a valid Withdraw.
 */
export interface WithdrawConfigArgs extends OrderConfigArgs {
  suppliedLPAsset: AssetAmount<IAssetAmountMetadata>;
}

/** A map of pools with their associated weight. */
export type DelegationProgramPools = Map<string, bigint>;
/** A map of programs with their associated {@link DelegationProgramPools} map. */
export type DelegationPrograms = Map<string, DelegationProgramPools>;

/**
 * The configuration object for a FreezerConfig instance.
 */
export interface FreezerConfigArgs extends BaseConfig {
  delegation?: DelegationPrograms;
  existingPositions?: UTXO[];
  lockedValues: AssetAmount<{ assetId: string; decimals: number }>[];
  ownerAddress: string;
}
