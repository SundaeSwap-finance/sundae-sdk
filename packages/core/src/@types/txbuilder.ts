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
 * The main interface by which TxBuilder classes are implemented.
 *
 * @template Options The options that your TxBuilder will take upon instantiating.
 * @template Lib The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid.
 * @template Data The data type that you will build your Datums with. For example, if using Lucid, this would be of type Data.
 * @template Tx The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.
 *
 * @group Extension Builders
 */
export interface ITxBuilderClass<
  Options = Object,
  Lib = unknown,
  Data = unknown,
  Tx = unknown
> {
  provider: IProviderClass;
  options: Options;
  lib?: Lib;
  currentTx?: Tx;
  currentDatum?: Data;

  /**
   * The main function to build a swap Transaction.
   *
   * @param args The built SwapArguments from a {@link SwapConfig} instance.
   * @returns {ITxBuilderComplete}
   */
  buildSwap: (args: IBuildSwapArgs) => Promise<ITxBuilderComplete>;

  buildDatumDestination: (
    paymentCred: string,
    stakeCred?: string,
    datum?: Data
  ) => Promise<Data>;

  buildDatumCancelSignatory: (address?: string) => Promise<Data>;

  buildSwapDatum: (
    givenAsset: IAsset,
    assetA: IPoolDataAsset,
    assetB: IPoolDataAsset,
    minimumReceivable: AssetAmount
  ) => Promise<Data>;

  asyncGetLib: () => Promise<Lib>;
}

/**
 * The raw swap arguments used by {@link ITxBuilderClass.buildSwap}.
 */
export interface IBuildSwapArgs {
  pool: IPoolData;
  suppliedAsset: IAsset;
  receiverAddress: string;
  additionalCanceler?: string;
  minReceivable?: AssetAmount;
}
