import type {
  IBuildSwapArgs,
  IPoolQuery,
  IProviderClass,
  ISwapArgs,
  ITxBuilderClass,
  SundaeSDKClass,
} from "../types";
import { SwapConfig } from "./utilities/SwapConfig.class";

export class SundaeSDK implements SundaeSDKClass {
  constructor(private builder: ITxBuilderClass) {
    this.builder = builder;
  }

  query(): IProviderClass {
    return this.builder.provider;
  }

  async swap({
    poolQuery,
    suppliedAsset,
    receiverAddress,
    additionalCanceler,
    minReceivable,
  }: ISwapArgs) {
    const pool = await this.query().findPoolData(poolQuery);

    const config = new SwapConfig()
      .setPool(pool)
      .setFunding(suppliedAsset)
      .setReceiverAddress(receiverAddress)
      .build();

    const tx = await this.builder.buildSwap(config);
    return tx;
  }
}
