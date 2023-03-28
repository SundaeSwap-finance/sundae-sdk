import {
  IQueryProviderClass,
  ITxBuilderTx,
  ITxBuilderBaseOptions,
  IZapArgs,
  SwapConfigArgs,
  DepositConfigArgs,
  WithdrawConfigArgs,
  CancelConfigArgs,
} from "../../@types";
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
   * The main function to build a swap Transaction.
   *
   * @param args The built SwapArguments from a {@link Core.SwapConfig} instance.
   * @returns {ITxBuilderTx}
   */
  abstract buildSwapTx(args: SwapConfigArgs): Promise<ITxBuilderTx>;

  /**
   * The main function to build a deposit Transaction.
   *
   * @param args The built DepositArguments from a {@link Core.DepositConfig} instance.
   */
  abstract buildDepositTx(args: DepositConfigArgs): Promise<ITxBuilderTx>;

  /**
   * The main function to build a withdraw Transaction.
   *
   * @param args The built WithdrawArguments from a {@link Core.WithdrawConfig} instance.
   */
  abstract buildWithdrawTx(args: WithdrawConfigArgs): Promise<ITxBuilderTx>;

  /**
   * The main function to build a cancellation Transaction.
   *
   * @param args The built CancelArguments from a {@link Core.CancelConfig} instance.
   */
  abstract buildCancelTx(args: CancelConfigArgs): Promise<ITxBuilderTx>;

  /**
   * The currently functioning way to process a chained Zap Transaction.
   *
   * @param args The built ZapArguments from a {@link Core.ZapConfig} instance.
   */
  abstract buildChainedZapTx(args: IZapArgs): Promise<ITxBuilderTx>;

  /**
   * The main function to build an atomic zap Transaction.
   *
   * @param args The built ZapArguments from a {@link Core.ZapConfig} instance.
   */
  abstract buildAtomicZapTx(args: IZapArgs): Promise<ITxBuilderTx>;

  /**
   * Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.
   * @returns
   */
  protected getParams() {
    return Utils.getParams(this.options.network);
  }
}
