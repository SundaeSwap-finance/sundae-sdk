import { ESupportedTxBuilders, TTxBuilderLoader } from "../../../types.js";
import { TxBuilderAbstract } from "./TxBuilder.abstract.class.js";
import { TxBuilderLucid } from "./TxBuilder.Lucid.class.js";
import { TxBuilderMesh } from "./TxBuilder.Mesh.class.js";

export class TxBuilder {
  builder: TxBuilderAbstract;

  constructor(builder: TxBuilderAbstract) {
    this.builder = builder;
  }

  public static async new(loader: TTxBuilderLoader) {
    let builder: TxBuilderAbstract;
    switch (loader.type) {
      case ESupportedTxBuilders.Mesh:
        builder = await TxBuilderMesh.new(loader);
        break;
      default:
      case ESupportedTxBuilders.Lucid:
        builder = await TxBuilderLucid.new(loader);
    }

    return new TxBuilder(builder);
  }
}
