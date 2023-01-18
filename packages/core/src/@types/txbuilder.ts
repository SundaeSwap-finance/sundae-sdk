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
export type DestinationAddress<Data = any> = {
  address: string;
  datum?: Data | undefined;
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
 * The main class by which TxBuilder classes are extended.
 *
 * @template Options The options that your TxBuilder will take upon instantiating.
 * @template Lib The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid.
 * @template Data The data type that you will build your Datums with. For example, if using Lucid, this would be of type Data.
 * @template Tx The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.
 *
 * @group Extension Builders
 */
export abstract class ITxBuilder<
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

/**
 * The raw swap arguments used by {@link ITxBuilderClass.buildSwapTx}.
 */
export interface IBuildSwapArgs<Data = any> {
  pool: IPoolData;
  suppliedAsset: IAsset;
  escrowAddress: EscrowAddress;
  minReceivable: AssetAmount;
}
