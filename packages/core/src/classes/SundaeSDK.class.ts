import type {
  BuildDepositConfigArgs,
  BuildSwapConfigArgs,
  DepositArguments,
  IPoolData,
  IQueryProviderClass,
  ISwapArgs,
} from "../@types";
import { AssetAmount } from "./AssetAmount.class";
import { SwapConfig } from "./Configs/SwapConfig.class";
import type { TxBuilder } from "./Abstracts/TxBuilder.abstract.class";
import { Utils } from "./Utils.class";
import { Config } from "./Abstracts/Config.abstract.class";
import { DepositConfig } from "./Configs/DepositConfig.class";

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
  query(): IQueryProviderClass {
    return this.builder.query;
  }

  /**
   * The main entry point for building a swap transaction with the least amount
   * of configuration required. By default, all calls to this method are treated
   * as market orders with a generous 10% slippage tolerance by default.
   *
   * @example
   *
   * ### Building a Swap
   * ```ts
   *  const pool = await SDK.query().findPoolData(poolQuery);
   *  const config: BuildSwapConfigArgs = {
   *  pool: {
   *    /** ...pool data... *\/
   *  },
   *  suppliedAsset: {
   *    assetID: "POLICY_ID.ASSET_NAME",
   *    amount: new AssetAmount(20n, 6)
   *  },
   *  receiverAddress: "addr1..."
   * };
   *
   * const { submit, cbor } = await SDK.swap(config);
   * ```
   *
   * ### Building a Swap With a Pool Query
   * ```ts
   * const pool = await SDK.query().findPoolData(poolQuery);
   * const config: BuildSwapConfigArgs = {
   *  pool,
   *  suppliedAsset: {
   *    assetID: "POLICY_ID.ASSET_NAME",
   *    amount: new AssetAmount(20n, 6)
   *  },
   *  receiverAddress: "addr1..."
   * };
   *
   * const { submit, cbor } = await SDK.swap(
   *  config,
   *  0.03 // Tighter slippage of 3%
   * );
   * ```
   *
   * @see {@link IQueryProviderClass.findPoolData | IProviderClass.findPoolData}
   * @see {@link TxBuilder.buildSwapTx | TxBuilder.buildSwapTx}
   * @see {@link SwapConfig}
   *
   * @param args
   * @param slippage Set your slippage tolerance. Defaults to 10%.
   * @returns
   */
  async swap(config: BuildSwapConfigArgs, slippage?: number) {
    const swap = new SwapConfig(config);
    swap.setMinReceivable(
      Utils.getMinReceivableFromSlippage(
        config.pool,
        config.suppliedAsset,
        slippage ?? 0.1
      )
    );
    this._validateConfig(swap);
    await this.builder.buildSwapTx(swap.buildArgs());
    return this.builder.complete();
  }

  /**
   * Creates a swap with a minimum receivable limit price. The price should be the minimum
   * amount at which you want the order to execute. For example:
   *
   * @example
   * ```ts
   * // Your desired limit price of the opposing pool asset
   * const limitPrice = new AssetAmount(1500000n, 6);
   *
   * // Normal swap arguments
   * const pool = await SDK.query().findPoolData(poolQuery);
   * const config: BuildSwapConfigArgs = {
   *  pool,
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
   * @param swap A built {@link SwapConfig} instance.
   * @param limitPrice
   * @returns
   */
  async limitSwap(config: BuildSwapConfigArgs, limitPrice: AssetAmount) {
    const swap = new SwapConfig(config);
    swap.setMinReceivable(limitPrice);

    this._validateConfig(swap);
    await this.builder.buildSwapTx(swap.buildArgs());
    return this.builder.complete();
  }

  /**
   * Create a Deposit transaction for a pool by supplying two assets.
   * @param config
   * @returns
   */
  async deposit(config: BuildDepositConfigArgs) {
    const deposit = new DepositConfig(config);

    this._validateConfig(deposit);
    await this.builder.buildDepositTx(deposit.buildArgs());
    return this.builder.complete();
  }

  private _validateConfig(config: Config): void | never {
    config.validate();
  }
}
