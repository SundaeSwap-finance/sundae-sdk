import {
  IQueryProviderClass,
  ITxBuilder,
  ITxBuilderBaseOptions,
} from "../../@types";
import { CancelConfig } from "../Configs/CancelConfig.class";
import { DepositConfig } from "../Configs/DepositConfig.class";
import { FreezerConfig } from "../Configs/FreezerConfig.class";
import { SwapConfig } from "../Configs/SwapConfig.class";
import { WithdrawConfig } from "../Configs/WithdrawConfig.class";
import { ZapConfig } from "../Configs/ZapConfig.class";
import { Utils } from "../Utils.class";

/**
 * The main class by which TxBuilder classes are extended.
 *
 * @template Options The options that your TxBuilder will take upon instantiating.
 * @template Wallet The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid and initialized at some point within the class.
 * @template Tx The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.
 *
 * @group Exported TxBuilders
 */
export abstract class TxBuilder<
  Options = any,
  Wallet = any,
  Tx = any,
  QueryProvider = IQueryProviderClass
> {
  wallet?: Wallet;

  constructor(
    public queryProvider: QueryProvider,
    public options: Options & ITxBuilderBaseOptions
  ) {
    this.queryProvider = queryProvider;
    this.options = {
      minLockAda: 5000000n,
      debug: false,
      ...options,
    };
  }

  /**
   * Should create a new transaction instance from the supplied transaction library.
   */
  abstract newTxInstance(): Promise<Tx>;

  /**
   * The main function to build a freezer Transaction.
   *
   * @param config A {@link FreezerConfig} instance.
   * @returns {ITxBuilder}
   */
  abstract buildFreezerTx(config: FreezerConfig): Promise<ITxBuilder>;

  /**
   * The main function to build a swap Transaction.
   *
   * @param config A {@link SwapConfig} instance.
   * @returns {ITxBuilder}
   */
  abstract buildSwapTx(config: SwapConfig): Promise<ITxBuilder>;

  /**
   * The main function to build a deposit Transaction.
   *
   * @param config A {@link DepositConfig} instance.
   */
  abstract buildDepositTx(config: DepositConfig): Promise<ITxBuilder>;

  /**
   * The main function to build a withdraw Transaction.
   *
   * @param config A {@link WithdrawConfig} instance.
   */
  abstract buildWithdrawTx(config: WithdrawConfig): Promise<ITxBuilder>;

  /**
   * The main function to build a cancellation Transaction.
   *
   * @param config A {@link CancelConfig} instance.
   */
  abstract buildCancelTx(config: CancelConfig): Promise<ITxBuilder>;

  /**
   * The main function to update an open swap.
   *
   * @param config An object of both a {@link CancelConfig} and {@link SwapConfig} instance.
   */
  abstract buildUpdateSwapTx(config: {
    cancelConfig: CancelConfig;
    swapConfig: SwapConfig;
  }): Promise<ITxBuilder>;

  /**
   * The currently functioning way to process a chained Zap Transaction.
   *
   * @param config A {@link ZapConfig} instance.
   */
  abstract buildChainedZapTx(config: ZapConfig): Promise<ITxBuilder>;

  /**
   * The main function to build an atomic zap Transaction.
   *
   * @param config A {@link ZapConfig} instance.
   */
  abstract buildAtomicZapTx(config: ZapConfig): Promise<ITxBuilder>;

  /**
   * Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.
   * @returns
   */
  protected getParams() {
    return Utils.getParams(this.options.network);
  }
}
