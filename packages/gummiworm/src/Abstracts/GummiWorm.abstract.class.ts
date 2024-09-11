import type { DatumBuilder, IComposedTx, SundaeSDK } from "@sundaeswap/core";
import type { Datum, Tx, TxComplete } from "lucid-cardano";

import { IDepositArgs } from "../@types/configs.js";

/**
 * Represents the abstract class that should be extended to implement
 * the functionality of GummiWorm transaction features. This class provides
 * the structure for depositing and withdrawing operations.
 */
export abstract class GummiWorm {
  abstract datumBuilder: DatumBuilder;
  abstract sdk: SundaeSDK;

  abstract deposit(
    args: IDepositArgs,
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>;
}
