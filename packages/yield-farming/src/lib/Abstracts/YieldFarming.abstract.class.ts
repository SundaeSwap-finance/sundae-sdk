import type { DatumBuilder, IComposedTx } from "@sundaeswap/core";

import { ILockConfigArgs } from "../../@types/configs.js";

/**
 * Represents the abstract class that should be extended to implement
 * the functionality of the Yield Farming features. This class provides
 * the structure for depositing, updating, and withdrawing operations.
 */
export abstract class YieldFarming<Tx, TxComplete, Datum = string> {
  abstract datumBuilder: DatumBuilder;

  abstract lock(
    args: ILockConfigArgs
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>;
  abstract unlock(
    args: Omit<ILockConfigArgs, "lockedValues">
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>;
}
