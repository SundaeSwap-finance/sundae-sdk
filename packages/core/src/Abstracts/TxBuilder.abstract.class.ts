import { TSupportedNetworks } from "../@types/utilities.js";
import { DatumBuilder } from "./DatumBuilder.abstract.class.js";

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
  abstract datumBuilder: DatumBuilder;
  abstract network: TSupportedNetworks;
  static MAX_SCOOPER_FEE: bigint;

  /**
   * Should create a new transaction instance from the supplied transaction library.
   */
  abstract newTxInstance(): unknown;

  abstract swap(args: unknown): Promise<unknown>;
  abstract deposit(args: unknown): Promise<unknown>;
  abstract withdraw(args: unknown): Promise<unknown>;
  abstract update(args: unknown): Promise<unknown>;
  abstract cancel(args: unknown): Promise<unknown>;
  abstract zap(args: unknown): Promise<unknown>;
}
