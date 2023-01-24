import {
  IAsset,
  IDepositArgs,
  ISwapArgs,
  IQueryProviderClass,
  ITxBuilderComplete,
  ITxBuilderBaseOptions,
} from "../../@types";
import { Transaction } from "../Transaction.class";
import { Utils } from "../Utils.class";

/**
 * The main class by which TxBuilder classes are extended.
 *
 * @template Options The options that your TxBuilder will take upon instantiating.
 * @template Wallet The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid and initialized at some point within the class.
 * @template Tx The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.
 *
 * @group Exported TxBuilders
 */
export abstract class TxBuilder<
  Options = any,
  Wallet = any,
  Tx = any,
  QueryProvider = IQueryProviderClass
> {
  query: QueryProvider;
  options: Options & ITxBuilderBaseOptions;
  wallet?: Wallet;

  constructor(
    queryProvider: QueryProvider,
    options: Options & ITxBuilderBaseOptions
  ) {
    this.query = queryProvider;
    this.options = options;
  }

  /**
   * Should create a new {@link Transaction} instance from the supplied transaction library.
   */
  protected abstract newTxInstance(): Promise<Transaction<Tx>>;

  /**
   * The main function to build a swap Transaction.
   *
   * @param args The built SwapArguments from a {@link SwapConfig} instance.
   * @returns {ITxBuilderComplete}
   */
  abstract buildSwapTx(args: ISwapArgs): Promise<ITxBuilderComplete>;

  /**
   * The main function to build a deposit Transaction.
   *
   * @param args The built DepositArguments from a {@link DepositConfig} instance.
   */
  abstract buildDepositTx(args: IDepositArgs): Promise<ITxBuilderComplete>;

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
    args: ISwapArgs,
    options: ITxBuilderBaseOptions
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
