import {
  IDepositArgs,
  ISwapArgs,
  IQueryProviderClass,
  ITxBuilderComplete,
  ITxBuilderBaseOptions,
  IWithdrawArgs,
  IZapArgs,
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
  protected abstract newTxInstance(): Promise<Transaction<Tx>>;

  /**
   * The main function to build a swap Transaction.
   *
   * @param args The built SwapArguments from a {@link SwapConfig} instance.
   * @returns {ITxBuilderComplete}
   */
  abstract buildSwapTx(args: ISwapArgs): Promise<ITxBuilderComplete>;

  /**
   * The main function to build a deposit Transaction.
   *
   * @param args The built {@link DepositArguments} from a {@link DepositConfig} instance.
   */
  abstract buildDepositTx(args: IDepositArgs): Promise<ITxBuilderComplete>;

  /**
   * The main function to build a withdraw Transaction.
   *
   * @param args The build {@link WithdrawArguments} from a {@link WithdrawConfig} instance.
   */
  abstract buildWithdrawTx(args: IWithdrawArgs): Promise<ITxBuilderComplete>;

  /**
   * The main function to build a zap Transaction.
   *
   * @param args The build {@link ZapArguments} from a {@link ZapConfig} instance.
   */
  abstract buildZapTx(args: IZapArgs): Promise<ITxBuilderComplete>;

  /**
   * Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.
   * @returns
   */
  protected getParams() {
    return Utils.getParams(this.options.network);
  }
}
