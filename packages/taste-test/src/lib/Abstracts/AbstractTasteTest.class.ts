import type { IComposedTx } from "@sundaeswap/core";

import { Core, TxBuilder } from "@blaze-cardano/sdk";
import type {
  IDepositArgs,
  ITasteTestFees,
  IUpdateArgs,
  IWithdrawArgs,
} from "../../@types/index.js";

/**
 * Represents the abstract class that should be extended to implement
 * the functionality of the Taste Test features. This class provides
 * the structure for depositing, updating, and withdrawing operations.
 *
 * @property {Lucid} lucid - An instance of the Lucid class, representing the core functionality handler.
 */
export abstract class AbstractTasteTest {
  /**
   * Initiates a deposit transaction. The specific implementation of this method
   * should handle the business logic associated with making a deposit, including
   * validations, transaction building, and error handling.
   *
   * @param {IDepositArgs} args - The arguments required for the deposit operation,
   * including the amount, user credentials, and other transaction details.
   * @returns {Promise<IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>>} - Returns a promise that resolves with an
   * IComposedTx instance, representing the constructed transaction for the deposit.
   */
  abstract deposit(
    args: IDepositArgs,
  ): Promise<
    IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>
  >;

  /**
   * Initiates an update transaction. This method is responsible for handling
   * the business logic necessary to update an existing record or transaction.
   * This could include changing the amount, modifying references, or other updates.
   *
   * @param {IUpdateArgs} args - The arguments required for the update operation.
   * This includes any fields that are updatable within the transaction and may
   * include credentials for authorization.
   * @returns {Promise<IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>>} - Returns a promise that resolves with an
   * IComposedTx instance, representing the constructed transaction for the update.
   */
  abstract update(
    args: IUpdateArgs,
  ): Promise<
    IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>
  >;

  /**
   * Initiates a withdrawal transaction. This method should handle the logic
   * associated with withdrawing funds, including validations, constructing the
   * withdrawal transaction, and handling errors appropriately.
   *
   * @param {IWithdrawArgs} args - The arguments required for the withdrawal operation,
   * including the amount to withdraw, user credentials, and other necessary details.
   * @returns {Promise<IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>>} - Returns a promise that resolves with an
   * IComposedTx instance, representing the constructed transaction for the withdrawal.
   */
  abstract withdraw(
    args: IWithdrawArgs,
  ): Promise<
    IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>
  >;
}
