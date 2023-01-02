import {
  ESupportedTxBuilders,
  ESupportedWallets,
  TTxBuilderInstances,
} from "../../../types";
import { SundaeSDK } from "../../SundaeSDK.class";
import { TxBuilderLucid } from "./TxBuilder.Lucid.class";
import { TxBuilderMesh } from "./TxBuilder.Mesh.class";

export class TxBuilder {
  instance: TTxBuilderInstances;
  wallet: ESupportedWallets;

  constructor(instance: TTxBuilderInstances, wallet: ESupportedWallets) {
    this.instance = instance;
    this.wallet = wallet;
  }

  public static async new(sdk: SundaeSDK) {
    let instance: TTxBuilderInstances;
    switch (sdk.txBuilderLoader.type) {
      case ESupportedTxBuilders.Mesh:
        instance = await TxBuilderMesh.new(sdk);
        break;
      default:
      case ESupportedTxBuilders.Lucid:
        instance = await TxBuilderLucid.new(sdk);
    }

    return new TxBuilder(instance, sdk.wallet);
  }
}
