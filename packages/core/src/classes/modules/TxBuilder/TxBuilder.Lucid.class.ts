import type {
  Lucid as LucidType,
  Tx as TxType,
  WalletApi as WalletApiType,
  Provider as ProviderType,
  Network as NetworkType,
  Data as DataType,
} from "lucid-cardano";

import {
  IBuildSwapArgs,
  TLucidArgs,
  ITxBuilderLoaderOptions,
  TSupportedNetworks,
  TTxBuilderComplete,
  TSwapAsset,
} from "../../../types";
import { AssetAmount } from "../../../classes/utilities/AssetAmount.class";
import { IPoolDataAsset, Provider } from "../Provider/Provider.abstract.class";
import { TxBuilder } from "./TxBuilder.abstract";
import { ProviderSundaeSwap } from "../Provider/Provider.SundaeSwap";

export class TxBuilderLucid extends TxBuilder {
  protected lib?: LucidType;
  protected currentTx?: TxType;
  protected currentDatum?: DataType;

  private constructor(public options: TLucidArgs, public provider: Provider) {
    super();
    this.options = options;
    this.provider = provider;
  }

  static new(
    args: ITxBuilderLoaderOptions["lucid"],
    provider?: Provider
  ): TxBuilderLucid {
    switch (args?.provider) {
      case "blockfrost":
        if (!args?.blockfrost) {
          throw new Error(
            "When using Blockfrost as a Lucid provider, you must supply a `blockfrost` parameter to your config!"
          );
        }
    }

    return new TxBuilderLucid(
      args as TLucidArgs,
      provider ?? new ProviderSundaeSwap(args?.network ?? "preview")
    );
  }

  async getLib(): Promise<LucidType> {
    if (!this.lib) {
      const { Blockfrost, Lucid } = await import("lucid-cardano");
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
        this.conformNetwork(this.options.network)
      );
      const instanceWithWallet = instance.selectWallet(walletApi);
      this.lib = instanceWithWallet;
    }

    return this.lib;
  }

  private conformNetwork(network: TSupportedNetworks): NetworkType {
    switch (network) {
      case "mainnet":
        return "Mainnet";
      case "preview":
        return "Preview";
    }
  }

  async complete(): Promise<TTxBuilderComplete> {
    if (!this.currentTx) {
      throw new Error("There is no current Tx to complete!");
    }

    const finishedTx = await this.currentTx.complete();
    const signedTx = await finishedTx.sign().complete();

    const CtxBuffer =
      typeof window !== "undefined"
        ? await import("buffer").then(({ Buffer }) => Buffer)
        : Buffer;

    return {
      submit: async () => await signedTx.submit(),
      cbor: CtxBuffer.from(signedTx.txSigned.to_bytes()).toString("hex"),
    };
  }

  async buildSwap({
    ident,
    assetA,
    assetB,
    receiverAddress,
    givenAsset,
    minReceivable = new AssetAmount(1n),
    additionalCanceler,
  }: IBuildSwapArgs): Promise<TTxBuilderComplete> {
    const lucid = await this.getLib();
    this.currentTx = lucid.newTx();

    const { paymentCredential, stakeCredential } =
      lucid.utils.getAddressDetails(receiverAddress);

    if (!paymentCredential) {
      throw new Error("Invalid receiver address provided.");
    }

    const { Constr, Data } = await import("lucid-cardano");
    const { SCOOPER_FEE, RIDER_FEE, ESCROW_ADDRESS } = super.getParams();

    const canceler = await this.buildDatumCancelSignatory(additionalCanceler);
    const swap = await this.buildSwapDatum(
      givenAsset,
      assetA,
      assetB,
      minReceivable
    );
    const destination = await this.buildDatumDestination(
      paymentCredential.hash,
      stakeCredential?.hash
    );

    const data = new Constr(0, [
      ident,
      new Constr(0, [destination, canceler]),
      SCOOPER_FEE,
      swap,
    ]);

    const payment: Record<string, bigint> = {};

    if (givenAsset.assetID === "") {
      payment.lovelace =
        SCOOPER_FEE +
        RIDER_FEE +
        givenAsset.amount.getRawAmount(assetA.decimals);
    } else {
      payment.lovelace = SCOOPER_FEE + RIDER_FEE;
      payment[givenAsset.assetID.replace(".", "")] =
        givenAsset.amount.getRawAmount(assetA.decimals);
    }

    this.currentDatum = data;
    this.currentTx = this.currentTx.payToContract(
      ESCROW_ADDRESS,
      Data.to(data),
      payment
    );

    return await this.complete();
  }

  protected async buildDatumDestination(
    paymentCred: string,
    stakeCred?: string,
    datum?: DataType
  ): Promise<DataType> {
    const { Constr, Data } = await import("lucid-cardano");
    const hash = datum && Data.to(datum);
    return new Constr(0, [
      new Constr(0, [
        new Constr(0, [paymentCred]),
        stakeCred
          ? new Constr(0, [new Constr(0, [new Constr(0, [stakeCred])])])
          : new Constr(1, []),
      ]),
      hash ? new Constr(0, [hash]) : new Constr(1, []),
    ]);
  }

  protected async buildDatumCancelSignatory(
    address?: string
  ): Promise<DataType> {
    const { Constr } = await import("lucid-cardano");
    if (!address) {
      return new Constr(1, []);
    }

    const lucid = await this.getLib();
    const addrDetails = lucid.utils.getAddressDetails(address);
    const hash = addrDetails?.paymentCredential ?? addrDetails?.stakeCredential;

    if (typeof hash !== "string") {
      throw new Error("Invalid address.");
    }

    return new Constr(0, [hash]);
  }

  protected async buildSwapDatum(
    givenAsset: TSwapAsset,
    assetA: IPoolDataAsset,
    assetB: IPoolDataAsset,
    minReceivable: AssetAmount
  ): Promise<DataType> {
    const { Constr } = await import("lucid-cardano");
    return new Constr(0, [
      new Constr(super.getSwapDirection(givenAsset, [assetA, assetB]), []),
      givenAsset.amount.getRawAmount(assetA.decimals),
      minReceivable
        ? new Constr(0, [minReceivable.getRawAmount(assetB.decimals)])
        : new Constr(1, []),
    ]);
  }

  protected async createCurrentTx(): Promise<TxType> {
    const lucid = await this.getLib();
    this.currentTx = lucid.newTx();
    return this.currentTx;
  }
}
