import { EContractVersion } from "../@types/enums.js";
import { IComposedTx } from "../@types/txbuilders.js";
import { TSupportedNetworks } from "../@types/utilities.js";
import { DatumBuilderAbstract } from "./DatumBuilder.abstract.class.js";
import { QueryProvider } from "./QueryProvider.abstract.class.js";

/**
 * The main class by which TxBuilder classes are extended.
 *
 * @group Exported TxBuilders
 */
export abstract class TxBuilderAbstractV3 {
  abstract queryProvider: QueryProvider;
  abstract datumBuilder: DatumBuilderAbstract;
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
  abstract strategy(args: unknown): Promise<IComposedTx>;
  abstract update(args: unknown): Promise<IComposedTx>;
  abstract cancel(args: unknown): Promise<IComposedTx>;
  abstract zap(args: unknown): Promise<IComposedTx>;
  abstract mintPool(args: unknown): Promise<IComposedTx>;
}
