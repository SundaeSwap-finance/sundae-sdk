import {
  EscrowAddress,
  IAsset,
  IBuildSwapArgs,
  IPoolDataAsset,
  IProviderClass,
  ITxBuilderComplete,
  ITxBuilderOptions,
  Swap,
} from "../@types";
import { AssetAmount } from "./AssetAmount.class";

/**
 * The main class by which TxBuilder classes are extended.
 *
 * @template Options The options that your TxBuilder will take upon instantiating.
 * @template Lib The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid.
 * @template Data The data type that you will build your Datums with. For example, if using Lucid, this would be of type Data.
 * @template Tx The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.
 *
 * @group Exported TxBuilders
 */
export abstract class TxBuilder<
  Options = any,
  Lib = any,
  Data = any,
  Tx = any
> {
  provider: IProviderClass;
  options: Options & ITxBuilderOptions;
  lib?: Lib;
  tx?: Tx;
  txArgs?: IBuildSwapArgs;
  txComplete?: ITxBuilderComplete;

  constructor(provider: IProviderClass, options: Options & ITxBuilderOptions) {
    this.provider = provider;
    this.options = options;
  }

  /**
   * Creates a new Tx type instance from the supplied transaction library.
   */
  protected abstract newTx(): Promise<Tx>;

  /**
   * Asynchronously loads the Transaction building Library so-as to avoid loading
   * heavy dependencies in a blocking manner.
   * @returns
   */
  protected abstract asyncGetLib(): Promise<Lib>;

  /**
   * The main function to build a swap Transaction.
   *
   * @param args The built SwapArguments from a {@link SwapConfig} instance.
   * @returns {ITxBuilderComplete}
   */
  abstract buildSwapTx(args: IBuildSwapArgs): Promise<TxBuilder>;

  /**
   * Completes the transaction building and includes validation of the arguments.
   * @returns
   */
  async complete() {
    if (!this.txArgs || !this.txComplete) {
      throw new Error("You have not built a transaction!");
    }

    TxBuilder.validateSwapArguments(this.txArgs, this.options);
    return this.txComplete;
  }

  /**
   * Should build the full datum for a Swap transaction.
   * @param givenAsset
   * @param assetA
   * @param assetB
   * @param minimumReceivable
   */
  protected abstract buildSwapDatum(
    givenAsset: IAsset,
    assetA: IPoolDataAsset,
    assetB: IPoolDataAsset,
    minimumReceivable: AssetAmount
  ): Promise<Data>;

  /**
   * Should build the datum for an {@link EscrowAddress}
   * @param address
   */
  protected abstract buildEscrowAddressDatum(
    address: EscrowAddress
  ): Promise<Data>;

  /**
   * Should build the datum for the swap direction of an {@link EscrowAddress}
   * @param suppliedAsset
   * @param swap
   */
  protected abstract buildEscrowSwapDatum(
    suppliedAsset: AssetAmount,
    swap: Swap
  ): Promise<Data>;

  /**
   * Validates the {@link IBuildSwapArgs} as having valid values. This **does not** ensure
   * that your datum is well structured, only that your config arguments have valid values.
   * @param args
   * @param options
   * @param datumHash
   */
  static async validateSwapArguments(
    args: IBuildSwapArgs,
    options: ITxBuilderOptions,
    datumHash?: string
  ) {
    const address = args.escrowAddress.DestinationAddress.address;
    const canceler = args.escrowAddress.AlternateAddress;
    const datum = args.escrowAddress.DestinationAddress.datum;

    const { getAddressDetails } = await import("lucid-cardano");
    const { networkId } = getAddressDetails(address);
    if (networkId === 0 && options.network === "mainnet") {
      throw new Error(
        `Invalid address: ${address}. The given address is a Preview Network address, but the network provided for your SDK is: ${options.network}`
      );
    }

    if (networkId === 1 && options.network === "preview") {
      throw new Error(
        `Invalid address: ${address}. The given address is a Mainnet Network address, but the network provided for your SDK is: ${options.network}`
      );
    }

    // Ensure that the address can be serialized.
    const { C } = await import("lucid-cardano");
    const realAddress = C.Address.from_bech32(address);

    // Ensure the datumHash is valid HEX if the address is a script.
    const isScript =
      realAddress.to_bytes()[0] && realAddress.to_bytes()[0] === 0b00010000;

    if (isScript) {
      if (datumHash) {
        C.DataHash.from_hex(datumHash);
      } else {
        throw new Error(
          `The DestinationAddress is a Script Address, but the DatumHash supplied is invalid: ${datumHash}.`
        );
      }
    }
  }
}
