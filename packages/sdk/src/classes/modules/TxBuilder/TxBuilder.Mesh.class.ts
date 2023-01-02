import type { BrowserWallet } from "@meshsdk/core";
import { TTxBuilderLoader } from "../../../types";
import { TxBuilderAbstract } from "./TxBuilder.abstract.class.js";

export class TxBuilderMesh implements TxBuilderAbstract {
  public builder;

  constructor(loader: BrowserWallet) {
    this.builder = loader;
  }

  public static async new({ loader }: TTxBuilderLoader) {
    const instance = await loader();
    return new TxBuilderMesh(instance as BrowserWallet);
  }
}
