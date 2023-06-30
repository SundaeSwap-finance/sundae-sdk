import { AssetAmount } from "@sundaeswap/asset";
import { OrderAddresses, PoolCoin, UTXO } from "./datumbuilder";
import { IPoolData } from "./queryprovider";
import { IAsset } from "./utilities";

/**
 * The common arguments for any valid order.
 */
export interface OrderConfigArgs {
  pool: IPoolData;
  orderAddresses: OrderAddresses;
}

/**
 * The arguments configuration for building a valid Swap.
 */
export interface SwapConfigArgs extends OrderConfigArgs {
  suppliedAsset: IAsset;
  minReceivable?: AssetAmount;
  slippage?: number | false;
}

/**
 * The arguments configuration for building a valid Deposit.
 */
export interface DepositConfigArgs extends OrderConfigArgs {
  suppliedAssets: [IAsset, IAsset];
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
  suppliedAsset: IAsset;
  zapDirection: PoolCoin;
}

/**
 * The arguments configuration for building a valid Withdraw.
 */
export interface WithdrawConfigArgs extends OrderConfigArgs {
  suppliedLPAsset: IAsset;
}

/** A map of pools with their associated weight. */
export type DelegationProgramPools = Map<string, bigint>;
/** A map of programs with their associated {@link DelegationProgramPools} map. */
export type DelegationPrograms = Map<string, DelegationProgramPools>;

/**
 * The configuration object for a FreezerConfig instance.
 */
export interface FreezerConfigArgs {
  delegation?: DelegationPrograms;
  existingPositions?: UTXO[];
  lockedValues: AssetAmount<{ assetId: string; decimals: number }>[];
  ownerAddress: string;
}
