import {
  EscrowAddress,
  IAsset,
  IBuildSwapArgs,
  IPoolDataAsset,
  IProviderClass,
  ITxBuilderComplete,
  ITxBuilderOptions,
  Swap,
} from "../../@types";
import { AssetAmount } from "../AssetAmount.class";

/**
 * The main class by which TxBuilder classes are extended.
 *
 * @template Options The options that your TxBuilder will take upon instantiating.
 * @template Lib The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid.
 * @template Data The data type that you will build your Datums with. For example, if using Lucid, this would be of type Data.
 * @template Tx The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.
 *
 * @group Extension Builders
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

  constructor(provider: IProviderClass, options: Options & ITxBuilderOptions) {
    this.provider = provider;
    this.options = options;
  }

  /**
   * Creates a new Tx type instance from the supplied transaction library.
   */
  abstract newTx(): Promise<Tx>;

  /**
   * Asynchronously loads the Transaction building Library so-as to avoid loading
   * heavy dependencies in a blocking manner.
   * @returns
   */
  abstract asyncGetLib(): Promise<Lib>;

  /**
   * The main function to build a swap Transaction.
   *
   * @param args The built SwapArguments from a {@link SwapConfig} instance.
   * @returns {ITxBuilderComplete}
   */
  abstract buildSwapTx(args: IBuildSwapArgs): Promise<ITxBuilderComplete>;

  abstract buildSwapDatum(
    givenAsset: IAsset,
    assetA: IPoolDataAsset,
    assetB: IPoolDataAsset,
    minimumReceivable: AssetAmount
  ): Promise<Data>;

  abstract buildEscrowAddressDatum(address: EscrowAddress): Promise<Data>;
  abstract buildEscrowSwapDatum(
    suppliedAsset: AssetAmount,
    swap: Swap
  ): Promise<Data>;

  protected async validateSwapArguments(
    args: IBuildSwapArgs,
    datumHash?: string
  ) {
    const address = args.escrowAddress.DestinationAddress.address;
    const canceler = args.escrowAddress.AlternateAddress;
    const datum = args.escrowAddress.DestinationAddress.datum;

    const { getAddressDetails } = await import("lucid-cardano");
    const { networkId } = getAddressDetails(address);
    if (networkId === 0 && this.options.network === "mainnet") {
      throw new Error(
        `Invalid address: ${address}. The given address is a Preview Network address, but the network provided for your SDK is: ${this.options.network}`
      );
    }

    if (networkId === 1 && this.options.network === "preview") {
      throw new Error(
        `Invalid address: ${address}. The given address is a Mainnet Network address, but the network provided for your SDK is: ${this.options.network}`
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
