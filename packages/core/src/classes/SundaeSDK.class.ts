import { IProviderClass, ISDKSwapArgs } from "../@types";
import { AssetAmount } from "./AssetAmount.class";
import { SwapConfig } from "./SwapConfig.class";
import { TxBuilder } from "./TxBuilder.abstract.class";

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
  constructor(private builder: TxBuilder) {
    this.builder = builder;
  }

  /**
   * Utility method to retrieve the builder instance.
   *
   * @returns
   */
  build(): TxBuilder {
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
   * The main entry point for building a swap transaction with the least amount
   * of configuration required. By default, all calls to this method are treated
   * as market orders and will be executed as soon as a Scooper processes it.
   *
   * For more control, look at
   *
   * @example
   *
   * ### Building a Swap
   * ```ts
   * const { submit, cbor } = await SDK.swap(
   *  pool: {
   *    /** ...pool data... *\/
   *  },
   *  suppliedAsset: {
   *    assetID: "POLICY_ID.ASSET_NAME",
   *    amount: new AssetAmount(20n, 6)
   *  },
   *  receiverAddress: "addr1..."
   * )
   * ```
   *
   * ### Building a Swap With a Pool Query
   * ```ts
   * const { submit, cbor } = await SDK.swap(
   *  poolQuery: {
   *    pair: ["assetAID", "assetBID"],
   *    fee: "0.03"
   *  },
   *  suppliedAsset: {
   *    assetID: "POLICY_ID.ASSET_NAME",
   *    amount: new AssetAmount(20n, 6)
   *  },
   *  receiverAddress: "addr1..."
   * )
   * ```
   *
   * @see {@link IProviderClass.findPoolData | IProviderClass.findPoolData}
   * @see {@link TxBuilder.buildSwapTx | TxBuilder.buildSwapTx}
   * @see {@link SwapConfig}
   *
   * @param swapConfig
   * @returns
   */
  async swap(args: ISDKSwapArgs) {
    const config = await this.buildBasicSwapConfig(args);
    await this.builder.buildSwapTx(config.buildSwapArgs());
    return this.builder.complete();
  }

  /**
   * Creates a swap with a minimum receivable limit price. The price should be the amount
   * at which you want the order to execute. For example:
   *
   * @example
   * ```ts
   * const limitPrice = new AssetAmount(1500000n, 6);
   * const { submit, cbor } = await SDK.limitSwap(
   *  poolQuery: {
   *    pair: ["assetAID", "assetBID"],
   *    fee: "0.03"
   *  },
   *  suppliedAsset: {
   *    assetID: "POLICY_ID.ASSET_NAME",
   *    amount: new AssetAmount(20n, 6)
   *  },
   *  receiverAddress: "addr1..."
   * )
   * ```
   *
   * @param args
   * @param limitPrice
   * @returns
   */
  async limitSwap(args: ISDKSwapArgs, limitPrice: AssetAmount) {
    const config = await this.buildBasicSwapConfig(args);
    config.setMinReceivable(limitPrice);
    const tx = await this.builder.buildSwapTx(config.buildSwapArgs());
    return tx;
  }

  private async buildBasicSwapConfig({
    pool,
    poolQuery,
    escrowAddress,
    suppliedAsset,
  }: ISDKSwapArgs) {
    const config = new SwapConfig();

    if (pool) {
      config.setPool(pool);
    } else if (poolQuery) {
      const poolData = await this.query().findPoolData(poolQuery);
      if (!poolData) {
        throw new Error(
          "Could not find a matching pool with the query: " +
            JSON.stringify(poolQuery)
        );
      }

      config.setPool(poolData);
    } else {
      throw new Error(
        "You must provide a valid pool or poolQuery to build a swap transaction against."
      );
    }

    if (escrowAddress) {
      config.setEscrowAddress(escrowAddress);
    }

    if (suppliedAsset) {
      config.setSuppliedAsset(suppliedAsset);
    }

    return config;
  }
}
