import { TSupportedNetworks, TSupportedWallets } from ".";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

/**
 * The primary top-level API surface for dealing with built TxBuilder transactions.
 */
export interface ITxBuilder<T = unknown, K = unknown> {
  tx: T;
  datum: K;
  fees: ITxBuilderFees;
  build: () => Promise<ITxBuilderSign>;
}

export interface ITxBuilderSign {
  /** The CBOR encoded hex string of the transaction. Useful if you want to do something with it instead of submitting to the wallet. */
  cbor: string;
  /** Requests a signature from the user and rebuilds the transaction with the witness set. */
  sign: () => Promise<ITxBuilderSubmit>;
}

export interface ITxBuilderSubmit {
  /** The CBOR encoded hex string of the transaction. Useful if you want to do something with it instead of submitting to the wallet. */
  cbor: string;
  /** Submits the CBOR encoded transaction to the connected wallet returns a hex encoded transaction hash. */
  submit: () => Promise<string>;
}

/**
 * The referral fee object if set.
 */
export interface ITxBuilderReferralFee {
  destination: string;
  payment: AssetAmount<IAssetAmountMetadata>;
  /** The label that prefixes the fee amount in the metadata. */
  feeLabel?: string;
}

/**
 * The full list of calculated fees for a transaction built by a TxBuilder instance.
 */
export interface ITxBuilderFees {
  cardanoTxFee?: AssetAmount<IAssetAmountMetadata>;
  deposit: AssetAmount<IAssetAmountMetadata>;
  scooperFee: AssetAmount<IAssetAmountMetadata>;
  liquidity?: AssetAmount<IAssetAmountMetadata>;
  referral?: AssetAmount<IAssetAmountMetadata>;
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
