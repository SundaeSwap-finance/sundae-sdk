import type {
  CancelConfigArgs,
  DepositConfigArgs,
  SwapConfigArgs,
  WithdrawConfigArgs,
  ZapConfigArgs,
  IQueryProviderClass,
  SDKZapArgs,
} from "../@types";
import { AssetAmount } from "./AssetAmount.class";
import { SwapConfig } from "./Configs/SwapConfig.class";
import { TxBuilder } from "./Abstracts/TxBuilder.abstract.class";
import { Utils } from "./Utils.class";
import { DepositConfig } from "./Configs/DepositConfig.class";
import { WithdrawConfig } from "./Configs/WithdrawConfig.class";
import { ZapConfig } from "./Configs/ZapConfig.class";
import { CancelConfig } from "./Configs/CancelConfig.class";

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
  constructor(public builder: TxBuilder) {
    this.builder = builder;
  }

  /**
   * Utility method to retrieve the builder instance with types.
   *
   * @returns
   */
  build<T = any>(): TxBuilder<any, T, any, IQueryProviderClass> {
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
   *  const config: BuildSwapConfigArgs = {
   *  pool: {
   *    /** Pool data you got from somewhere else. *\/
   *  },
   *  suppliedAsset: {
   *    assetId: "POLICY_ID.ASSET_NAME",
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
   *    assetId: "POLICY_ID.ASSET_NAME",
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
  async swap(config: Omit<SwapConfigArgs, "minReceivable">, slippage?: number) {
    const swap = new SwapConfig(config);
    swap.setMinReceivable(
      Utils.getMinReceivableFromSlippage(
        config.pool,
        config.suppliedAsset,
        slippage ?? 0.1
      )
    );
    swap.validate();
    return await this.builder.buildSwapTx(swap.buildArgs());
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
   *    assetId: "POLICY_ID.ASSET_NAME",
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
  async limitSwap(config: SwapConfigArgs, limitPrice: AssetAmount) {
    const swap = new SwapConfig(config);
    swap.setMinReceivable(limitPrice);
    return await this.builder.buildSwapTx(config);
  }

  /**
   * Create a new transaction that cancels and spends the assets with a new swap config.
   * @param cancelConfigArgs
   * @param swapConfigArgs
   * @returns
   */
  async updateSwap(
    cancelConfigArgs: CancelConfigArgs,
    swapConfigArgs: SwapConfigArgs
  ) {
    if (swapConfigArgs?.slippage) {
      swapConfigArgs.minReceivable = Utils.getMinReceivableFromSlippage(
        swapConfigArgs.pool,
        swapConfigArgs.suppliedAsset,
        swapConfigArgs.slippage
      );
    }

    return await this.builder.buildUpdateSwapTx({
      cancelConfigArgs,
      swapConfigArgs,
    });
  }

  /**
   * Create a Withdraw transaction for a pool by supplying the LP tokens.
   * @param config
   * @returns
   */
  async withdraw(config: WithdrawConfigArgs) {
    const withdraw = new WithdrawConfig(config);
    return await this.builder.buildWithdrawTx(withdraw.buildArgs());
  }

  /**
   * Create a Deposit transaction for a pool by supplying two assets.
   * @param config
   * @returns
   */
  async deposit(config: DepositConfigArgs) {
    const deposit = new DepositConfig(config);
    return await this.builder.buildDepositTx(deposit.buildArgs());
  }

  /**
   * Create a cancel transaction for an open escrow order.
   * @param config
   * @returns
   */
  async cancel(config: CancelConfigArgs) {
    const cancellation = new CancelConfig(config);
    return await this.builder.buildCancelTx(cancellation.buildArgs());
  }

  /**
   * Builds a custom zap utilizing a chained order (first a swap, then a deposit).
   * @param config
   * @returns
   */
  async zap(config: Omit<ZapConfigArgs, "zapDirection">) {
    const zapDirection = Utils.getAssetSwapDirection(config.suppliedAsset, [
      config.pool.assetA,
      config.pool.assetB,
    ]);

    const zap = new ZapConfig({
      ...config,
      zapDirection,
    });

    return await this.builder.buildChainedZapTx(zap.buildArgs());
  }

  /**
   * Create a Deposit transaction for a pool by supplying a single asset.
   * @param config
   * @returns
   */
  async unstable_zap(config: SDKZapArgs) {
    const zapDirection = Utils.getAssetSwapDirection(config.suppliedAsset, [
      config.pool.assetA,
      config.pool.assetB,
    ]);
    console.log(zapDirection);
    const zap = new ZapConfig({
      ...config,
      zapDirection,
    });
    return await this.builder.buildAtomicZapTx(zap.buildArgs());
  }
}
