import { IPoolData, IProviderClass, ISDKSwapArgs } from "../@types";
import { AssetAmount } from "./AssetAmount.class";
import { SwapConfig } from "./SwapConfig.class";
import { TxBuilder } from "./TxBuilder.abstract.class";
import { Utils } from "./Utils.class";

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
   * as market orders with a generous 10% slippage tolerance by default.
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
    const config = await this._buildBasicSwapConfig(args);
    await this.builder.buildSwapTx(config.buildSwapArgs());
    return this.builder.complete();
  }

  /**
   * Creates a swap with a minimum receivable limit price. The price should be the amount
   * at which you want the order to execute. For example:
   *
   * @example
   * ```ts
   * // Your desired limit price of the opposing pool asset
   * const limitPrice = new AssetAmount(1500000n, 6);
   *
   * // Normal swap arguments
   * const swapArgs: ISDKSwapArgs = {
   *  poolQuery: {
   *    pair: ["assetAID", "assetBID"],
   *    fee: "0.03"
   *  },
   *  suppliedAsset: {
   *    assetID: "POLICY_ID.ASSET_NAME",
   *    amount: new AssetAmount(20n, 6)
   *  },
   *  receiverAddress: "addr1..."
   * }
   *
   * // Build Tx
   * const { submit, cbor } = await SDK.limitSwap(
   *  swapArgs,
   *  limitPrice
   * )
   * ```
   *
   * @param args
   * @param limitPrice
   * @returns
   */
  async limitSwap(args: ISDKSwapArgs, limitPrice: AssetAmount) {
    const config = await this._buildBasicSwapConfig(args, false);
    config.setMinReceivable(limitPrice);
    await this.builder.buildSwapTx(config.buildSwapArgs());
    return this.builder.complete();
  }

  /**
   * Builds a basic Swap config from {@link ISDKSwapArgs}.
   *
   * @param args
   * @param slippage Calculate a minimum receivable amount of the opposing asset pair based on the provided value. If set to false, calculation will be ignored.
   * @returns
   */
  private async _buildBasicSwapConfig(
    args: ISDKSwapArgs,
    slippage?: number | false
  ) {
    const { pool, poolQuery, escrowAddress, suppliedAsset } = args;
    const config = new SwapConfig();
    let resolvedPool: IPoolData;

    if (pool) {
      resolvedPool = pool;
    } else if (poolQuery) {
      const poolData = await this.query().findPoolData(poolQuery);
      if (!poolData) {
        throw new Error(
          "Could not find a matching pool with the query: " +
            JSON.stringify(poolQuery)
        );
      }
      resolvedPool = poolData;
    } else {
      throw new Error(
        "You must provide a valid pool or poolQuery to build a swap transaction against."
      );
    }

    config.setPool(resolvedPool);

    if (false !== slippage) {
      config.setMinReceivable(
        Utils.getMinReceivableFromSlippage(
          resolvedPool,
          suppliedAsset,
          slippage ?? 0.1
        )
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
