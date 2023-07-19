import { TSupportedNetworks, TSupportedWallets } from ".";
import { AssetAmount } from "@sundaeswap/asset";

/**
 * The primary top-level API surface for dealing with built TxBuilder transactions.
 */
export interface ITxBuilderTx<T = unknown, K = unknown> {
  tx: T;
  fees: ITxBuilderFees;
  datum: K;
  sign: () => Promise<ITxBuilderComplete>;
  build: () => Promise<ITxBuilderComplete>;
}

/**
 * The returned interface once a transaction is successfully built.
 */
export interface ITxBuilderComplete {
  /** The CBOR encoded hex string of the transaction. Useful if you want to do something with it instead of submitting to the wallet. */
  cbor: string;
  /** Submits the CBOR encoded transaction to the connected wallet returns a hex encoded transaction hash. */
  submit: () => Promise<string>;
}

/**
 * The full list of calculated fees for a transaction built by a TxBuilder instance.
 */
export interface ITxBuilderFees {
  cardanoTxFee: AssetAmount;
  deposit: AssetAmount;
  scooperFee: AssetAmount;
  liquidity?: AssetAmount;
  referral?: AssetAmount;
}

/**
 * The most minimal requirements for a TxBuilder options interface. When building a custom TxBuilder, you **must**
 * extend from this interface to ensure the wallet and network are compatible.
 */
export interface ITxBuilderBaseOptions {
  /** A CIP-30 compatible wallet. */
  wallet: TSupportedWallets;
  /** A supported Cardano network. */
  network: TSupportedNetworks;
  /** The minimum amount of ADA required for a locking position. */
  minLockAda?: bigint;
  /** Whether to allow debugging console logs. */
  debug?: boolean;
}
