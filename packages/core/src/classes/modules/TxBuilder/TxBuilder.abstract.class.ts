import { TSupportedTxBuilderLibs } from "../../../types";
import { SundaeSDK } from "../../SundaeSDK.class";

export abstract class TxBuilderAbstract {
  public static async new(_sdk: SundaeSDK): Promise<any> {}
  abstract builder: TSupportedTxBuilderLibs;
  abstract swapFrom(): Promise<string>;
  // abstract swapTo(): Promise<string>;
  // abstract harvest(): Promise<string>;
  // abstract withdraw(): Promise<string>;
  // abstract deposit(): Promise<string>;
}
