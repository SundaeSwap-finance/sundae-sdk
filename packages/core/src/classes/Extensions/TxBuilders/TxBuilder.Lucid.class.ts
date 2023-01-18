import type {
  Lucid as LucidType,
  Tx as TxType,
  WalletApi as WalletApiType,
  Provider as ProviderType,
  Network as NetworkType,
  Data as DataType,
} from "lucid-cardano";

import { getAssetSwapDirection, getParams } from "../../../lib/utils";
import { AssetAmount } from "../../AssetAmount.class";
import {
  IPoolDataAsset,
  IProviderClass,
  TSupportedNetworks,
  IBuildSwapArgs,
  IAsset,
  ITxBuilderOptions,
  EscrowAddress,
  Swap,
} from "../../../@types";
import { ADA_ASSET_ID } from "../../../lib/constants";
import { TxBuilder } from "../../TxBuilder.abstract.class";

/**
 * Options interface for the {@link TxBuilderLucid} class.
 *
 * @group Extensions
 */
export interface ITxBuilderLucidOptions extends ITxBuilderOptions {
  /** The provider type used by Lucid. Currently only supports Blockfrost. */
  provider: "blockfrost";
  /** The chosen provider options object to pass to Lucid. */
  blockfrost?: {
    url: string;
    apiKey: string;
  };
}

/**
 * Building a TxBuilder is fairly simple, but depends on the library that the underlying tooling uses. In this case,
 * you would build this TxBuilder like this:
 *
 * @example
 * ```ts
 * const builder = new TxBuilderLucid(
 *  {
 *    provider: "blockfrost";
 *    blockfrost: {
 *      url: <base_api_url>,
 *      apiKey: <base_api_key>,
 *    }
 *  },
 *  new ProviderSundaeSwap("preview")
 * );
 * ```
 *
 * @group Extensions
 */
export class TxBuilderLucid extends TxBuilder<
  ITxBuilderLucidOptions,
  LucidType,
  DataType,
  TxType
> {
  lib?: LucidType;
  tx?: TxType;

  /**
   * @param options The main option for instantiating the class.
   * @param provider An instance of a {@link IProviderClass} class.
   */
  constructor(
    public options: ITxBuilderLucidOptions,
    public provider: IProviderClass
  ) {
    super(provider, options);
    switch (this.options?.provider) {
      case "blockfrost":
        if (!this.options?.blockfrost) {
          throw new Error(
            "When using Blockfrost as a Lucid provider, you must supply a `blockfrost` parameter to your config!"
          );
        }
    }

    // Lazy load library.
    this.asyncGetLib();
  }

  async asyncGetLib() {
    if (!this.lib) {
      const { Blockfrost, Lucid } = await import(
        /* webpackPrefetch: true */
        /* webpackMode: "lazy" */
        "lucid-cardano"
      );
      const { provider, blockfrost } = this.options;
      let ThisProvider: ProviderType;
      switch (provider) {
        default:
        case "blockfrost":
          if (!blockfrost) {
            throw new Error(
              "Must provide a Blockfrost object when choosing it as a Provider for Lucid."
            );
          }

          ThisProvider = new Blockfrost(blockfrost.url, blockfrost.apiKey);
      }

      const walletApi: WalletApiType = (await window.cardano[
        this.options.wallet
      ].enable()) as WalletApiType;

      const instance = await Lucid.new(
        ThisProvider,
        this._conformNetwork(this.options.network)
      );
      const instanceWithWallet = instance.selectWallet(walletApi);
      this.lib = instanceWithWallet;
    }

    return this.lib;
  }

  async newTx(): Promise<TxType> {
    const lucid = await this.asyncGetLib();
    const tx = lucid.newTx();
    return tx;
  }

  async buildSwapTx(args: IBuildSwapArgs) {
    const tx = await this.newTx();
    const {
      pool: { ident, assetA, assetB },
      escrowAddress: { DestinationAddress, AlternateAddress },
      suppliedAsset,
      minReceivable,
    } = args;

    const { Constr, Data } = await import("lucid-cardano");
    const { SCOOPER_FEE, RIDER_FEE, ESCROW_ADDRESS } = getParams(
      this.options.network
    );

    const escrowAddress = await this.buildEscrowAddressDatum({
      DestinationAddress,
      AlternateAddress,
    });

    const swap = await this.buildSwapDatum(
      suppliedAsset,
      assetA,
      assetB,
      minReceivable
    );

    const data = new Constr(0, [ident, escrowAddress, SCOOPER_FEE, swap]);

    const payment: Record<string, bigint> = {};

    if (suppliedAsset.assetID === ADA_ASSET_ID) {
      payment.lovelace =
        SCOOPER_FEE + RIDER_FEE + suppliedAsset.amount.getRawAmount(0);
    } else {
      payment.lovelace = SCOOPER_FEE + RIDER_FEE;
      payment[suppliedAsset.assetID.replace(".", "")] =
        suppliedAsset.amount.getRawAmount(0);
    }

    tx.payToContract(ESCROW_ADDRESS, Data.to(data), payment);
    const finishedTx = await tx.complete();
    const signedTx = await finishedTx.sign().complete();

    const CtxBuffer =
      typeof window !== "undefined"
        ? await import("buffer").then(({ Buffer }) => Buffer)
        : Buffer;

    this.txArgs = args;
    this.txComplete = {
      submit: async () => await signedTx.submit(),
      cbor: CtxBuffer.from(signedTx.txSigned.to_bytes()).toString("hex"),
    };

    return this;
  }

  /**
   * Builds the datum for the {@link EscrowAddress} interface using a data
   * constructor class from the Lucid library.
   *
   * @param address
   * @returns
   */
  async buildEscrowAddressDatum(address: EscrowAddress) {
    const lucid = await this.asyncGetLib();
    const { DestinationAddress, AlternateAddress } = address;
    const { Constr } = await import("lucid-cardano");
    const datumHash =
      DestinationAddress?.datum &&
      lucid.utils.datumToHash(DestinationAddress.datum);
    const destination = await this._getAddressHashes(
      DestinationAddress.address
    );

    const destinationDatum = new Constr(0, [
      new Constr(0, [
        new Constr(0, [destination.paymentCredentials]),
        destination?.stakeCredentials
          ? new Constr(0, [
              new Constr(0, [new Constr(0, [destination?.stakeCredentials])]),
            ])
          : new Constr(1, []),
      ]),
      datumHash ? new Constr(0, [datumHash]) : new Constr(1, []),
    ]);

    const alternate =
      AlternateAddress && (await this._getAddressHashes(AlternateAddress));
    const alternateDatum = new Constr(
      alternate ? 0 : 1,
      alternate ? [alternate.paymentCredentials] : []
    );

    return new Constr(0, [destinationDatum, alternateDatum]);
  }

  /**
   * Builds the datum for the Swap action using a data
   * constructor class from the Lucid library.
   *
   * @param address
   * @returns
   */
  async buildEscrowSwapDatum(suppliedAsset: AssetAmount, swap: Swap) {
    const { Constr } = await import("lucid-cardano");

    return new Constr(0, [
      new Constr(swap.CoinDirection, []),
      suppliedAsset.getRawAmount(0),
      swap.MinimumReceivable
        ? new Constr(0, [swap.MinimumReceivable.getRawAmount(0)])
        : new Constr(1, []),
    ]);
  }

  /**
   * Builds the main datum for a Swap transaction so that scoopers
   * can execute their batches in the Escrow script address.
   *
   * @param address
   * @returns
   */
  async buildSwapDatum(
    givenAsset: IAsset,
    assetA: IPoolDataAsset,
    assetB: IPoolDataAsset,
    minReceivable: AssetAmount
  ): Promise<DataType> {
    const { Constr } = await import("lucid-cardano");
    return new Constr(0, [
      new Constr(getAssetSwapDirection(givenAsset, [assetA, assetB]), []),
      givenAsset.amount.getRawAmount(0),
      minReceivable
        ? new Constr(0, [minReceivable.getRawAmount(0)])
        : new Constr(1, []),
    ]);
  }

  private async _getAddressHashes(address: string): Promise<{
    paymentCredentials: string;
    stakeCredentials?: string;
  }> {
    const lucid = await this.asyncGetLib();
    const details = lucid.utils.getAddressDetails(address);

    if (!details.paymentCredential) {
      throw new Error(
        "Invalid address. Make sure you are using a Bech32 encoded address."
      );
    }

    return {
      paymentCredentials: details.paymentCredential.hash,
      stakeCredentials: details.stakeCredential?.hash,
    };
  }

  private _conformNetwork(network: TSupportedNetworks): NetworkType {
    switch (network) {
      case "mainnet":
        return "Mainnet";
      case "preview":
        return "Preview";
    }
  }
}
