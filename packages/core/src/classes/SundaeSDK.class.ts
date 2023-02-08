import type {
  BuildDepositConfigArgs,
  BuildSwapConfigArgs,
  BuildWithdrawConfigArgs,
  BuildZapConfigArgs,
  IQueryProviderClass,
  SDKZapArgs,
} from "../@types";
import { AssetAmount } from "./AssetAmount.class";
import { SwapConfig } from "./Configs/SwapConfig.class";
import { TxBuilder } from "./Abstracts/TxBuilder.abstract.class";
import { Utils } from "./Utils.class";
import { Config } from "./Abstracts/Config.abstract.class";
import { DepositConfig } from "./Configs/DepositConfig.class";
import { Withdrawals } from "lucid-cardano/types/src/core/wasm_modules/cardano_multiplatform_lib_web/cardano_multiplatform_lib";
import { WithdrawConfig } from "./Configs/WithdrawConfig.class";
import { ZapConfig } from "./Configs/ZapConfig.class";

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
  async swap(config: BuildSwapConfigArgs, slippage?: number) {
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
  async limitSwap(config: BuildSwapConfigArgs, limitPrice: AssetAmount) {
    const swap = new SwapConfig(config);
    swap.setMinReceivable(limitPrice);
    return await this.builder.buildSwapTx(swap.buildArgs());
  }

  /**
   * Create a Withdraw transaction for a pool by supplying the LP tokens.
   * @param config
   * @returns
   */
  async withdraw(config: BuildWithdrawConfigArgs) {
    const withdraw = new WithdrawConfig(config);
    return await this.builder.buildWithdrawTx(withdraw.buildArgs());
  }

  /**
   * Create a Deposit transaction for a pool by supplying two assets.
   * @param config
   * @returns
   */
  async deposit(config: BuildDepositConfigArgs) {
    const deposit = new DepositConfig(config);
    return await this.builder.buildDepositTx(deposit.buildArgs());
  }

  /**
   * Create a Deposit transaction for a pool by supplying two assets.
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
    return await this.builder.buildZapTx(zap.buildArgs());
  }
}
