import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import type { Lucid } from "lucid-cardano";

import { ISwapConfigArgs } from "./configs.js";

/**
 * The full list of calculated fees for a transaction built by a TxBuilder instance.
 */
export interface ITxBuilderFees {
  cardanoTxFee?: AssetAmount<IAssetAmountMetadata>;
  deposit: AssetAmount<IAssetAmountMetadata>;
  liquidity?: AssetAmount<IAssetAmountMetadata>;
  referral?: AssetAmount<IAssetAmountMetadata>;
  scooperFee: AssetAmount<IAssetAmountMetadata>;
}

export interface ITxBuilderSubmit {
  /** The CBOR encoded hex string of the transaction. Useful if you want to do something with it instead of submitting to the wallet. */
  cbor: string;
  /** Submits the CBOR encoded transaction to the connected wallet returns a hex encoded transaction hash. */
  submit: () => Promise<string>;
}

export interface ITxBuilderSign<BuiltTransaction> {
  /** The CBOR encoded hex string of the transaction. Useful if you want to do something with it instead of submitting to the wallet. */
  cbor: string;
  /** Requests a signature from the user and rebuilds the transaction with the witness set. */
  sign: () => Promise<ITxBuilderSubmit>;
  builtTx: BuiltTransaction;
}

/**
 * The primary top-level API surface for dealing with built TxBuilder transactions.
 */
export interface IComposedTx<
  Transaction = unknown,
  BuiltTransaction = unknown,
  Datum = string | undefined,
  Fees = Record<string, AssetAmount<IAssetAmountMetadata>>
> {
  tx: Transaction;
  datum: Datum;
  fees: ITxBuilderFees & Fees;
  build: () => Promise<ITxBuilderSign<BuiltTransaction>>;
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
 * Holds the acceptable provider types.
 */
export enum ETxBuilderType {
  LUCID = "lucid",
}

/**
 * The interface to describe a Lucid builder type.
 */
export interface ILucidBuilder {
  type: ETxBuilderType.LUCID;
  lucid: Lucid;
}

/**
 * The union type to hold all possible builder types.
 */
export type TWalletBuilder = ILucidBuilder;

/**
 * The contract version to be used when building transactions
 * of any time that interact with SundaeSwap contracts.
 */
export enum EContractVersion {
  V1 = "V1",
  V3 = "V3",
}

/**
 * Special arguments for an Order-Route Swap. A combination of
 * two swap arguments, but simplified for ease-of-use.
 */
export interface IOrderRouteSwapArgs {
  ownerAddress: string;
  swapA: Omit<ISwapConfigArgs, "orderAddresses" | "ownerAddress">;
  swapB: Omit<
    ISwapConfigArgs,
    "suppliedAsset" | "orderAddresses" | "ownerAddress"
  >;
}
