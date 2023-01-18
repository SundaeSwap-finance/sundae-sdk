import {
  TSupportedNetworks,
  TSupportedWallets,
  IPoolDataAsset,
  IProviderClass,
  IPoolData,
  IAsset,
} from ".";
import { AssetAmount } from "../classes/AssetAmount.class";

/**
 * The returned interface once a transaction is successfully built.
 */
export interface ITxBuilderComplete {
  /** The CBOR encoded hex string of the transcation. Useful if you want to do something with it instead of submitting to the wallet. */
  cbor: string;
  /** Submits the CBOR encoded transaction to the connected wallet returns a hex encoded transaction hash. */
  submit: () => Promise<string>;
}

/**
 * The most minimal requirements for a TxBuilder options interface. When building a custom TxBuilder, you **must**
 * extend from this interface to ensure the wallet and network are compatible.
 */
export interface ITxBuilderOptions {
  /** A CIP-30 compatible wallet. */
  wallet: TSupportedWallets;
  /** A supported Cardano network. */
  network: TSupportedNetworks;
}

/**
 * The unique identifier of a pool, defined as a string.
 */
export type Ident = string;

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
export type Coin = 0 | 1;

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
export type EscrowAddress = {
  DestinationAddress: DestinationAddress;
  AlternateAddress?: CancelerAddress;
};

/**
 * The swap direction of a {@link IAsset} coin pair, and a minimum receivable amount
 * which acts as the limit price of a swap.
 */
export type Swap = {
  CoinDirection: Coin;
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
  ZapDirection: Coin;
  MinimumReceivable: AssetAmount;
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
 * The raw swap arguments used by {@link TxBuilder.buildSwapTx}.
 */
export interface IBuildSwapArgs<Data = any> {
  pool: IPoolData;
  suppliedAsset: IAsset;
  escrowAddress: EscrowAddress;
  minReceivable: AssetAmount;
}
