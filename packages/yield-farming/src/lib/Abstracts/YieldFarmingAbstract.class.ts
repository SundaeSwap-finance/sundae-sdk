import type { Core, TxBuilder } from "@blaze-cardano/sdk";
import type { DatumBuilder, IComposedTx } from "@sundaeswap/core";

/**
 * Represents the abstract class that should be extended to implement
 * the functionality of the Yield Farming features. This class provides
 * the structure for depositing, updating, and withdrawing operations.
 */
export abstract class YieldFarmingAbstract {
  abstract datumBuilder: DatumBuilder;

  abstract lock(
    args: unknown,
  ): Promise<IComposedTx<TxBuilder, Core.Transaction, string | undefined>>;
  abstract unlock(
    args: unknown,
  ): Promise<IComposedTx<TxBuilder, Core.Transaction, string | undefined>>;
}
