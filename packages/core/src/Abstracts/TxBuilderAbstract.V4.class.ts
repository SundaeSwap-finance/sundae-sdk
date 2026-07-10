import { EContractVersion, IComposedTx } from "../@types/txbuilders.js";
import { TSupportedNetworks } from "../@types/utilities.js";
import { DatumBuilderAbstract } from "./DatumBuilder.abstract.class.js";
import { QueryProvider } from "./QueryProvider.abstract.class.js";

/**
 * Abstract base for sundae-v4 transaction builders.
 *
 * Mirrors `TxBuilderAbstractV3`'s surface so callers that dispatch on
 * contract version can keep their existing pattern (`swap`, `deposit`,
 * `withdraw`, `cancel`, `mintPool`), but adds v4-native methods — `basic()`
 * and `strategy()`. `swap()` carries the swap-order constraint set, and
 * `strategy()` the strategy-order set; `basic()` is the shared primitive for
 * `deposit` / `withdraw` / `claim` orders (constructor-tagged `BasicFields`),
 * of which `deposit` and `withdraw` are convenience wrappers.
 *
 * @group Exported TxBuilders
 */
export abstract class TxBuilderAbstractV4 {
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
  abstract basic(args: unknown): Promise<IComposedTx>;
  abstract strategy(args: unknown): Promise<IComposedTx>;
  abstract deposit(args: unknown): Promise<IComposedTx>;
  abstract withdraw(args: unknown): Promise<IComposedTx>;
  abstract cancel(args: unknown): Promise<IComposedTx>;
  abstract update(args: unknown): Promise<IComposedTx>;
  abstract mintPool(args: unknown): Promise<IComposedTx>;
}
