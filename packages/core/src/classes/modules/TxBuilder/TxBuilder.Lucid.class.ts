import type {
  Lucid as LucidType,
  Tx as TxType,
  WalletApi as WalletApiType,
  Provider as ProviderType,
  Network as NetworkType,
  Data as DataType,
  Constr as ConstrType,
} from "lucid-cardano";
import {
  IBuildSwapArgs,
  TLucidArgs,
  ITxBuilderLoaderOptions,
  TSupportedNetworks,
  TTxBuilderComplete,
  TSwapAsset,
} from "../../../types";
import { TLucidDatum } from "../../../types/datums";
import { IPoolDataAsset } from "../Provider/Provider.abstract.class";
import { TxBuilder } from "./TxBuilder.abstract";

export class TxBuilderLucid extends TxBuilder {
  protected lib?: LucidType;
  protected currentTx?: TxType;
  protected currentDatum?: TLucidDatum;

  private constructor(public options: TLucidArgs) {
    super();
    this.options = options;
  }

  static new(args: ITxBuilderLoaderOptions["lucid"]): TxBuilderLucid {
    switch (args?.provider) {
      case "blockfrost":
        if (!args?.blockfrost) {
          throw new Error(
            "When using Blockfrost as a Lucid provider, you must supply a `blockfrost` parameter to your config!"
          );
        }
    }

    return new TxBuilderLucid(args as TLucidArgs);
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
      submit: signedTx.submit,
      cbor: CtxBuffer.from(signedTx.txSigned.to_bytes()).toString("hex"),
    };
  }

  async buildSwap({
    poolData: { assetA, assetB, ident },
    receiverAddress,
    givenAsset,
    minReceivable = 1n,
    additionalCanceler,
  }: IBuildSwapArgs): Promise<TxBuilderLucid> {
    const lucid = await this.getLib();
    this.currentTx = lucid.newTx();

    const { paymentCredential, stakeCredential } =
      lucid.utils.getAddressDetails(receiverAddress);

    if (!paymentCredential) {
      throw new Error();
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

    if (givenAsset.name === "") {
      payment.lovelace = SCOOPER_FEE + RIDER_FEE + givenAsset.amount;
    } else {
      payment.lovelace = SCOOPER_FEE + RIDER_FEE;
      payment[givenAsset.name.replace(".", "")] = givenAsset.amount;
    }

    console.log(data, payment);

    // this.currentDatum = data;
    this.currentTx = this.currentTx.payToContract(
      ESCROW_ADDRESS,
      Data.to(data),
      payment
    );

    return this;
  }

  protected async buildDatumDestination(
    paymentCred: string,
    stakeCred?: string,
    datum?: DataType
  ): Promise<DataType> {
    const { Constr, Data } = await import("lucid-cardano");
    const hash = Data.to(datum);
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
    minReceivable: bigint
  ): Promise<DataType> {
    const { Constr } = await import("lucid-cardano");
    return new Constr(0, [
      new Constr(super.getSwapDirection(givenAsset, [assetA, assetB]), []),
      givenAsset.amount,
      minReceivable ? new Constr(0, [minReceivable]) : new Constr(1, []),
    ]);
  }

  protected async createCurrentTx(): Promise<TxType> {
    const lucid = await this.getLib();
    this.currentTx = lucid.newTx();
    return this.currentTx;
  }
}
