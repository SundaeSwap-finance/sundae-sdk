import type { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

/**
 * The unique identifier of a pool, defined as a string.
 */
export type TIdent = string;

/**
 * The structure for a UTXO.
 */
export type TUTXO = {
  hash: string;
  index: number;
};

/**
 * A hex-encoded public key hash of an address.
 */
export type TPubKeyHash = string;

/**
 * The boolean type of a pool's coin, where 0 = CoinA and 1 = CoinB.
 */
export enum EPoolCoin {
  A = 0,
  B = 1,
}

/**
 * The Datum type to be passed along with an address.
 */
export enum EDatumType {
  HASH = "HASH",
  INLINE = "INLINE",
  NONE = "NONE",
}

/**
 * The DatumNone type is used to describe a null datum.
 */
export type TDatumNone = {
  type: EDatumType.NONE;
};

/**
 * The DatumHash type is use to describe a datum hash.
 */
export type TDatumHash = {
  type: EDatumType.HASH;
  value: string;
};

/**
 * The DatumInline type is used to describe an inline datum.
 */
export type TDatumInline = {
  type: EDatumType.INLINE;
  value: string;
};

/**
 * The DatumResult for a DatumBuilder method.
 */
export type TDatumResult<Schema = unknown> = {
  hash: string;
  inline: string;
  schema: Schema;
};

/**
 * A union to define all possible datum types.
 */
export type TDatum = TDatumNone | TDatumHash | TDatumInline;

/**
 * Defines the destination address of a swap along with an optional datum hash to attach.
 */
export type TDestinationAddress = {
  address: string;
  datum: TDatum;
};

/**
 * The optional alternate address that can cancel the Escrow order. This is
 * needed because a {@link TDestinationAddress} can be a Script Address. This
 * is useful to chain swaps with other protocols if desired, while still allowing
 * a consistently authorized alternate to cancel the Escrow.
 */
export type TCancelerAddress = string;

/**
 * An Escrow address defines the destination address and an optional PubKeyHash
 */
export type TOrderAddresses = {
  DestinationAddress: TDestinationAddress;
  AlternateAddress?: TCancelerAddress;
};

/**
 * The swap direction of a coin pair, and a minimum receivable amount
 * which acts as the limit price of a swap.
 */
export type TSwap = {
  SuppliedCoin: EPoolCoin;
  MinimumReceivable?: AssetAmount;
};

/**
 * A withdraw defines the amount of LP tokens a holder wishes to burn in exchange
 * for their provided assets.
 */
export type TWithdraw = AssetAmount;

/**
 * A single asset deposit where 50% of the provided Coin is swapped at the provided minimum
 * receivable amount to satisfy a pool's CoinA/CoinB requirements.
 */
export type TDepositSingle = {
  ZapDirection: EPoolCoin;
  CoinAmount: AssetAmount;
};

/**
 * The CoinA and CoinB asset pair of a pool at the desired ratio. If the ratio
 * shifts after the order is placed but before it is scooped, the LP tokens along with
 * the remaining asset gets sent to the {@link TDestinationAddress}
 */
export type TDepositMixed = {
  CoinAAmount: AssetAmount;
  CoinBAmount: AssetAmount;
};

/**
 * Base arguments for every datum constructor.
 */
export interface IArguments {
  /** The unique pool identifier. */
  ident: string;
  /** The addresses that are allowed to cancel the Order. */
  orderAddresses: TOrderAddresses;
  /** The fee paid to scoopers. */
  scooperFee: bigint;
}

/**
 * Arguments for a swap.
 */
export interface ISwapArguments extends IArguments {
  swap: TSwap;
  /** The asset supplied (this is required to accurately determine the swap direction). */
  fundedAsset: AssetAmount<IAssetAmountMetadata>;
}

/**
 * Arguments for a withdraw.
 */
export interface IWithdrawArguments extends IArguments {
  /** The LP tokens to send to the pool. */
  suppliedLPAsset: AssetAmount<IAssetAmountMetadata>;
}

/**
 * Arguments for depositing a pair of assets into a pool.
 */
export interface IDepositArguments extends IArguments {
  deposit: TDepositMixed;
}

/**
 * Arguments for zapping an asset into a pool.
 */
export interface IZapArguments extends IArguments {
  zap: TDepositSingle;
}
