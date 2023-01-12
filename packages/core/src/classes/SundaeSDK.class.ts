import { IProviderClass, ISwapArgs, ITxBuilderClass } from "../@types";
import { SwapConfig } from "./SwapConfig.class";

/**
 * A description for the SundaeSDK class.
 *
 * ```ts
 * const sdk = new SundaeSDK(
 *  new ProviderSundaeSwap()
 * );
 * ```
 */
export class SundaeSDK {
  /**
   * You'll need to provide a TxBuilder class to the main SDK, which is used to build Transactions and submit them.
   *
   * @param builder - An instance of TxBuilder.
   */
  constructor(private builder: ITxBuilderClass) {
    this.builder = builder;
  }

  /**
   * Utility method to retrieve the builder instance.
   *
   * @returns
   */
  build(): ITxBuilderClass {
    return this.builder;
  }

  /**
   * Utility method to retrieve the provider instance.
   *
   * @returns
   */
  query(): IProviderClass {
    return this.builder.provider;
  }

  /**
   * Easy abstraction for building a swap when you don't know the pool data.
   * Calls {@link ITxBuilderClass.buildSwap} under the hood after querying a
   * matching pool.
   *
   * @param swapConfig
   * @returns
   */
  async swap(swapConfig: SwapConfig) {
    const { poolQuery, suppliedAsset, receiverAddress } =
      swapConfig.buildSwap();
    const pool = await this.query().findPoolData(poolQuery);

    const config = new SwapConfig()
      .setPool(pool)
      .setFunding(suppliedAsset)
      .setReceiverAddress(receiverAddress)
      .buildRawSwap();

    const tx = await this.builder.buildSwap(config);
    return tx;
  }
}
