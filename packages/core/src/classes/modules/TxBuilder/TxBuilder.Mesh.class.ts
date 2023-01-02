import type { BrowserWallet } from "@meshsdk/core";
import { SundaeSDK } from "../../SundaeSDK.class";
import { TxBuilderAbstract } from "./TxBuilder.abstract.class";

export class TxBuilderMesh extends TxBuilderAbstract {
  public builder;

  constructor(loader: BrowserWallet) {
    super();
    this.builder = loader;
  }

  public static async new(sdk: SundaeSDK): Promise<TxBuilderMesh> {
    const instance = await sdk.txBuilderLoader.loader();
    return new TxBuilderMesh(instance as BrowserWallet);
  }

  public async swapFrom() {
    return "";
  }
}
