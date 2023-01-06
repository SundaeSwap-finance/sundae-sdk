import { IBuildSwapArgs } from "../types";
import type {
  IPoolQuery,
  Provider,
} from "./modules/Provider/Provider.abstract.class";
import type { TxBuilder } from "./modules/TxBuilder/TxBuilder.abstract";
import { SwapConfig } from "./utilities/SwapConfig.class";

export class SundaeSDK {
  constructor(private builder: TxBuilder) {
    this.builder = builder;
  }

  query(): Provider {
    return this.builder.provider;
  }

  async swap({
    poolQuery,
    suppliedAsset,
    receiverAddress,
    additionalCanceler,
    minReceivable,
  }: Omit<IBuildSwapArgs, "pool"> & {
    poolQuery: IPoolQuery;
  }) {
    const pool = await this.query().findPoolData(poolQuery);

    const config = new SwapConfig()
      .setPool(pool)
      .setFunding(suppliedAsset)
      .setReceiverAddress(receiverAddress)
      .build();

    const tx = await this.builder.buildSwap(config);
    return {
      submit: tx.submit.bind(tx),
      toString: () => tx.cbor,
    };
  }

  async marketBuy(config: SwapConfig, submit?: boolean) {}
}
