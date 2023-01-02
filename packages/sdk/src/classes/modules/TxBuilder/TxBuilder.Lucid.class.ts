import type { Lucid } from "lucid-cardano";
import { TTxBuilderLoader } from "../../../types";
import { TxBuilderAbstract } from "./TxBuilder.abstract.class.js";

export class TxBuilderLucid implements TxBuilderAbstract {
  public builder;

  constructor(loader: Lucid) {
    this.builder = loader;
  }

  public static async new({ loader }: TTxBuilderLoader) {
    const instance = await loader();
    return new TxBuilderLucid(instance as Lucid);
  }
}
