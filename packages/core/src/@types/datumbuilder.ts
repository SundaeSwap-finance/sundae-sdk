import { AssetAmount } from "../classes/AssetAmount.class";
import { IAsset } from "./utilities";

/**
 * The unique identifier of a pool, defined as a string.
 */
export type Ident = string;

/**
 * The structure for a UTXO.
 */
export type UTXO = {
  hash: string;
  index: number;
};

/**
 * The hash string of a Datum.
 */
export type DatumHash = string;

/**
 * A hex-encoded public key hash of an address.
 */
export type PubKeyHash = string;

/**
 * The boolean type of a pool's coin, where 0 = CoinA and 1 = CoinB.
 */
export enum PoolCoin {
  A = 0,
  B = 1,
}

/**
 * Defines the destination address of a swap along with an optional datum hash to attach.
 */
export type DestinationAddress = {
  address: string;
  datumHash?: string;
};

/**
 * The optional alternate address that can cancel the Escrow order. This is
 * needed because a {@link DestinationAddress} can be a Script Address. This
 * is useful to chain swaps with other protocols if desired, while still allowing
 * a consistently authorized alternate to cancel the Escrow.
 */
export type CancelerAddress = string;

/**
 * An Escrow address defines the destination address and an optional PubKeyHash
 */
export type OrderAddresses = {
  DestinationAddress: DestinationAddress;
  AlternateAddress?: CancelerAddress;
};

/**
 * The swap direction of a {@link IAsset} coin pair, and a minimum receivable amount
 * which acts as the limit price of a swap.
 */
export type Swap = {
  SuppliedCoin: PoolCoin;
  MinimumReceivable?: AssetAmount;
};

/**
 * A withdraw defines the amount of LP tokens a holder wishes to burn in exchange
 * for their provided assets.
 */
export type Withdraw = AssetAmount;

/**
 * A single asset deposit where 50% of the provided Coin is swapped at the provided minimum
 * receivable amount to satisfy a pool's CoinA/CoinB requirements.
 */
export type DepositSingle = {
  ZapDirection: PoolCoin;
  CoinAmount: AssetAmount;
};

/**
 * The CoinA and CoinB asset pair of a pool at the desired ratio. If the ratio
 * shifts after the order is placed but before it is scooped, the LP tokens along with
 * the remaining asset gets sent to the {@link DestinationAddress}
 */
export type DepositMixed = {
  CoinAAmount: AssetAmount;
  CoinBAmount: AssetAmount;
};

/**
 * Base arguments for every datum constructor.
 */
export interface Arguments {
  /** The unique pool identifier. */
  ident: string;
  /** The fee paid to scoopers. Defaults to 2.5 ADA which is the minimum. */
  scooperFee?: bigint;
  /** The addresses that are allowed to cancel the Order. */
  orderAddresses: OrderAddresses;
}

/**
 * Arguments for a swap.
 */
export interface SwapArguments extends Arguments {
  swap: Swap;
  /** The asset supplied (this is required to accurately determine the swap direction). */
  fundedAsset: IAsset;
}

/**
 * Arguments for a withdraw.
 */
export interface WithdrawArguments extends Arguments {
  /** The LP tokens to send to the pool. */
  suppliedLPAsset: IAsset;
}

/**
 * Arguments for depositing a pair of assets into a pool.
 */
export interface DepositArguments extends Arguments {
  deposit: DepositMixed;
}

/**
 * Arguments for zapping an asset into a pool.
 */
export interface ZapArguments extends Arguments {
  zap: DepositSingle;
}

/**
 * The returned results of a {@link "DatumBuilder"} method.
 */
export interface DatumResult<T = any> {
  /** The hex-encoded CBOR string of the datum */
  cbor: string;
  /** The datum type of the library used to build it. */
  datum: T;
}
