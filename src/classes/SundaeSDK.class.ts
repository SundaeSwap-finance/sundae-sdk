import type { Lucid, Provider, WalletApi } from "lucid-cardano";
import { Constr, Data } from "lucid-cardano";

import { params } from "../lib/params";
import { ERROR_CODES } from "../lib/errors";
import { getAssetIDs, toLovelace } from "../lib/utils";
import { TSupportedNetworks, IParams, IGetSwapArgs } from "../types";

export class SundaeSDK {
  // Instances.
  public lucid?: Lucid;

  // States.
  public api: WalletApi;
  public swapping: boolean = false;
  public network: TSupportedNetworks;
  public params: IParams;
  public provider?: Provider;

  constructor(
    api: WalletApi,
    provider?: Provider,
    network?: TSupportedNetworks
  ) {
    this.api = api;
    this.provider = provider;
    this.network = network ?? "Mainnet";
    this.params = params[this.network];
  }

  public async getLucid(): Promise<Lucid> {
    if (!this.lucid) {
      this.lucid = await import("lucid-cardano").then(async ({ Lucid }) => {
        return await Lucid.new(this.provider, this.network);
      });
      this.lucid.selectWallet(this.api);
    }

    return this.lucid;
  }

  public setWalletApi(api: WalletApi) {
    this.api = api;
    this.lucid?.selectWallet(api);
  }

  public async swap({
    poolIdent,
    asset,
    walletHash,
    swapFromAsset = true,
    minimumReceivableAsset = 1n,
  }: IGetSwapArgs): Promise<string> {
    this.ensureNotSwapping();
    const assetIDs = getAssetIDs(asset);

    this.swapping = true;
    const data = new Constr(0, [
      poolIdent,
      new Constr(0, [
        new Constr(0, [
          new Constr(0, [new Constr(0, [walletHash]), new Constr(1, [])]),
          new Constr(1, []),
        ]),
        new Constr(1, []),
      ]),
      "0n",
      new Constr(0, [
        new Constr(swapFromAsset ? 0 : 1, []),
        `${toLovelace(asset.amount, asset.metadata.decimals)}n`,
        new Constr(0, [minimumReceivableAsset]),
      ]),
    ]);

    const lucid = await this.getLucid();

    try {
      const tx = lucid.newTx();
      const payment: Record<string, bigint> = {};

      if (assetIDs.name === "" && swapFromAsset) {
        payment.lovelace =
          this.params.SCOOPER_FEE +
          BigInt(toLovelace(asset.amount, asset.metadata.decimals));
      } else {
        payment.lovelace = this.params.SCOOPER_FEE;
        payment[assetIDs.concatenated] = BigInt(
          toLovelace(asset.amount, asset.metadata.decimals)
        );
      }

      tx.payToContract(this.params.ESCROW_ADDRESS, Data.to(data), payment);

      const finishedTx = await tx.complete();
      const signedTx = await finishedTx.sign().complete();
      const txHash = await signedTx.submit();
      this.swapping = false;
      return txHash;
    } catch (e) {
      this.swapping = false;
      throw e;
    }
  }

  private ensureNotSwapping() {
    if (this.swapping) {
      console.warn(ERROR_CODES[1]);
      throw new Error(ERROR_CODES[1].message);
    }
  }
}
