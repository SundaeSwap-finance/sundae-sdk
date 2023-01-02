import type { Lucid } from "lucid-cardano";
import { SundaeSDK } from "../../SundaeSDK.class";
import { TxBuilderAbstract } from "./TxBuilder.abstract.class";

export class TxBuilderLucid extends TxBuilderAbstract {
  public builder;

  constructor(loader: Lucid) {
    super();
    this.builder = loader;
  }

  public static async new(sdk: SundaeSDK): Promise<TxBuilderLucid> {
    const instance = await sdk.txBuilderLoader.loader();
    return new TxBuilderLucid(instance as Lucid);
  }

  public async swapFrom() {
    return "";
  }
}
