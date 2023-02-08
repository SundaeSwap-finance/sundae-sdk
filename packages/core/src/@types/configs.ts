import { OrderAddresses, PoolCoin } from "./datumbuilder";
import { IPoolData } from "./queryprovider";
import { IAsset } from "./utilities";

/**
 * The arguments configuration for building a valid Swap.
 */
export interface BuildSwapConfigArgs {
  pool: IPoolData;
  orderAddresses: OrderAddresses;
  suppliedAsset: IAsset;
  slippage?: number | false;
}

/**
 * The arguments configuration for building a valid Deposit.
 */
export interface BuildDepositConfigArgs {
  pool: IPoolData;
  orderAddresses: OrderAddresses;
  suppliedAssets: [IAsset, IAsset];
}

/**
 * The arguments configuration for building a valid Deposit.
 */
export interface BuildZapConfigArgs {
  pool: IPoolData;
  orderAddresses: OrderAddresses;
  suppliedAsset: IAsset;
  zapDirection: PoolCoin;
}

/**
 * The arguments configuration for building a valid Withdraw.
 */
export interface BuildWithdrawConfigArgs {
  pool: IPoolData;
  orderAddresses: OrderAddresses;
  suppliedLPAsset: IAsset;
}
