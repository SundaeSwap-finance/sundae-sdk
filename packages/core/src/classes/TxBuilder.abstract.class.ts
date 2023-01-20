import {
  IBuildSwapArgs,
  IQueryProviderClass,
  ITxBuilderComplete,
  ITxBuilderOptions,
} from "../@types";
import { Utils } from "./Utils.class";

/**
 * The main class by which TxBuilder classes are extended.
 *
 * @template Options The options that your TxBuilder will take upon instantiating.
 * @template Wallet The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid and initialized at some point within the class.
 * @template Tx The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.
 *
 * @group Exported TxBuilders
 */
export abstract class TxBuilder<Options = any, Wallet = any, Tx = any> {
  query: IQueryProviderClass;
  options: Options & ITxBuilderOptions;
  wallet?: Wallet;
  tx?: Tx;
  txArgs?: IBuildSwapArgs;
  txComplete?: ITxBuilderComplete;

  constructor(
    queryProvider: IQueryProviderClass,
    options: Options & ITxBuilderOptions
  ) {
    this.query = queryProvider;
    this.options = options;
  }

  /**
   * Creates a new Tx type instance from the supplied transaction library.
   */
  protected abstract newTx(): Promise<Tx>;

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
  complete() {
    if (!this.txArgs || !this.txComplete) {
      throw new Error("You have not built a transaction!");
    }

    TxBuilder.validateSwapArguments(this.txArgs, this.options);
    return this.txComplete;
  }

  /**
   * Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.
   * @returns
   */
  protected getParams() {
    return Utils.getParams(this.options.network);
  }

  /**
   * Validates a swap as having valid values. This **does not** ensure
   * that your datum is well structured, only that your config arguments have valid values.
   * @param args
   * @param options
   * @param datumHash
   */
  static async validateSwapArguments(
    args: IBuildSwapArgs,
    options: ITxBuilderOptions
  ) {
    const address = args.orderAddresses.DestinationAddress.address;
    const datumHash = args.orderAddresses.DestinationAddress.datumHash;
    const canceler = args.orderAddresses.AlternateAddress;

    const { getAddressDetails } = await import("lucid-cardano");

    // Validate destination address.
    const { networkId: addressNetworkId } = getAddressDetails(address);
    if (addressNetworkId !== 1 && options.network === "mainnet") {
      throw new Error(
        `Invalid address: ${address}. The given address is not a Mainnet Network address.`
      );
    } else if (addressNetworkId !== 0) {
      throw new Error(`Invalid address: ${address}.`);
    }

    // Validate destination address.
    if (canceler) {
      const { networkId: cancelerAddressId } = getAddressDetails(canceler);
      if (cancelerAddressId !== 1 && options.network === "mainnet") {
        throw new Error(
          `Invalid address: ${address}. The given address is not a Mainnet Network address.`
        );
      } else if (cancelerAddressId !== 0) {
        throw new Error(`Invalid address: ${address}.`);
      }
    }

    // Ensure that the address can be serialized.
    const { C } = await import("lucid-cardano");
    const realAddress = C.Address.from_bech32(address);

    // Ensure the datumHash is valid HEX if the address is a script.
    const isScript = (realAddress.to_bytes()[0] & 0b00010000) !== 0;

    if (isScript) {
      if (datumHash) {
        try {
          C.DataHash.from_hex(datumHash);
        } catch (e) {
          throw new Error(
            `The datumHash provided was not a valid hex string. Original error: ${JSON.stringify(
              {
                datumHash,
                originalErrorMessage: (e as Error).message,
              }
            )}`
          );
        }
      } else {
        throw new Error(
          `The DestinationAddress is a Script Address, a Datum hash was not supplied. This will brick your funds! Supply a valid DatumHash with your DestinationAddress to proceed.`
        );
      }
    }
  }
}
