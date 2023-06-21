import {
  IQueryProviderClass,
  ITxBuilderTx,
  ITxBuilderBaseOptions,
} from "../../@types";
import { CancelConfig } from "../Configs/CancelConfig.class";
import { DepositConfig } from "../Configs/DepositConfig.class";
import { LockConfig } from "../Configs/LockConfig.class";
import { SwapConfig } from "../Configs/SwapConfig.class";
import { WithdrawConfig } from "../Configs/WithdrawConfig.class";
import { ZapConfig } from "../Configs/ZapConfig.class";
import { Transaction } from "../Transaction.class";
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
  query: QueryProvider;
  options: Options & ITxBuilderBaseOptions;
  wallet?: Wallet;

  constructor(
    queryProvider: QueryProvider,
    options: Options & ITxBuilderBaseOptions
  ) {
    this.query = queryProvider;
    this.options = options;
  }

  /**
   * Should create a new {@link Transaction} instance from the supplied transaction library.
   */
  abstract newTxInstance(): Promise<Transaction<Tx>>;

  /**
   * The main function to build a locking Transaction.
   *
   * @param config A {@link LockConfig} instance.
   * @returns {ITxBuilderTx}
   */
  abstract buildLockTx(config: LockConfig): Promise<ITxBuilderTx>;

  /**
   * The main function to build a swap Transaction.
   *
   * @param config A {@link SwapConfig} instance.
   * @returns {ITxBuilderTx}
   */
  abstract buildSwapTx(config: SwapConfig): Promise<ITxBuilderTx>;

  /**
   * The main function to build a deposit Transaction.
   *
   * @param config A {@link DepositConfig} instance.
   */
  abstract buildDepositTx(config: DepositConfig): Promise<ITxBuilderTx>;

  /**
   * The main function to build a withdraw Transaction.
   *
   * @param config A {@link WithdrawConfig} instance.
   */
  abstract buildWithdrawTx(config: WithdrawConfig): Promise<ITxBuilderTx>;

  /**
   * The main function to build a cancellation Transaction.
   *
   * @param config A {@link CancelConfig} instance.
   */
  abstract buildCancelTx(config: CancelConfig): Promise<ITxBuilderTx>;

  /**
   * The main function to update an open swap.
   *
   * @param config An object of both a {@link CancelConfig} and {@link SwapConfig} instance.
   */
  abstract buildUpdateSwapTx(config: {
    cancelConfig: CancelConfig;
    swapConfig: SwapConfig;
  }): Promise<ITxBuilderTx>;

  /**
   * The currently functioning way to process a chained Zap Transaction.
   *
   * @param config A {@link ZapConfig} instance.
   */
  abstract buildChainedZapTx(config: ZapConfig): Promise<ITxBuilderTx>;

  /**
   * The main function to build an atomic zap Transaction.
   *
   * @param config A {@link ZapConfig} instance.
   */
  abstract buildAtomicZapTx(config: ZapConfig): Promise<ITxBuilderTx>;

  /**
   * Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.
   * @returns
   */
  protected getParams() {
    return Utils.getParams(this.options.network);
  }
}
