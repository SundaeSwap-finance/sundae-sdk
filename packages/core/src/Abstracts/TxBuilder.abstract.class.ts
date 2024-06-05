import { IComposedTx } from "../@types/txbuilders.js";
import { TSupportedNetworks } from "../@types/utilities.js";
import { DatumBuilder } from "./DatumBuilder.abstract.class.js";
import { QueryProvider } from "./QueryProvider.abstract.class.js";

/**
 * The main class by which TxBuilder classes are extended.
 *
 * @template Options The options that your TxBuilder will take upon instantiating.
 * @template Wallet The type of transaction building library that you plan to use. For example, if using Lucid, this would be of type Lucid and initialized at some point within the class.
 * @template Tx The transaction interface type that will be returned from Lib when building a new transaction. For example, in Lucid this is of type Tx.
 *
 * @group Exported TxBuilders
 */
export abstract class TxBuilder {
  abstract queryProvider: QueryProvider;
  abstract datumBuilder: DatumBuilder;
  abstract network: TSupportedNetworks;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static PARAMS: Record<TSupportedNetworks, Record<string, any>>;

  /**
   * Should create a new transaction instance from the supplied transaction library.
   */
  abstract newTxInstance(): unknown;

  abstract swap(args: unknown): Promise<IComposedTx>;
  abstract orderRouteSwap(args: unknown): Promise<IComposedTx>;
  abstract deposit(args: unknown): Promise<IComposedTx>;
  abstract withdraw(args: unknown): Promise<IComposedTx>;
  abstract update(args: unknown): Promise<IComposedTx>;
  abstract cancel(args: unknown): Promise<IComposedTx>;
  abstract zap(args: unknown): Promise<IComposedTx>;
}
