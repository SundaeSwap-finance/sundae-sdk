import type { BrowserWallet as MeshType } from "@meshsdk/core";
import type { Lucid as LucidType } from "lucid-cardano";
import { TTxBuilderLoader } from "src/types";

export class TxBuilder {
  public builder: LucidType | MeshType;

  constructor(instance: LucidType | MeshType) {
    this.builder = instance;
  }

  public static async new(loader: TTxBuilderLoader) {
    const instance = await loader();
    return new TxBuilder(instance);
  }
}
