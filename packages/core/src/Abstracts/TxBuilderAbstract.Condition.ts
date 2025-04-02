import { EContractVersion, IComposedTx } from "../@types/txbuilders.js";
import { TSupportedNetworks } from "../@types/utilities.js";
import { DatumBuilderAbstractCondition } from "./DatumBuilderCondition.abstract.class.js";
import { QueryProvider } from "./QueryProvider.abstract.class.js";

/**
 * The main class by which TxBuilder classes are extended.
 *
 * @group Exported TxBuilders
 */
export abstract class TxBuilderAbstractCondition {
  abstract queryProvider: QueryProvider;
  abstract datumBuilder: DatumBuilderAbstractCondition;
  abstract network: TSupportedNetworks;
  abstract contractVersion: EContractVersion;
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
  abstract mintPool(args: unknown): Promise<IComposedTx>;
}
