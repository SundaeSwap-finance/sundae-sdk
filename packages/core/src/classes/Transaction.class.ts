import { ITxBuilderComplete } from "../@types";
import { TxBuilder } from "./Abstracts/TxBuilder.abstract.class";

/**
 * A helper class to store a Transaction instance.
 */
export class Transaction<Tx = any> {
  txComplete?: ITxBuilderComplete;

  constructor(public builder: TxBuilder, public tx: Tx) {}

  /**
   * Set the Transaction.
   */
  set(tx: Tx): Transaction<Tx> {
    this.tx = tx;
    return this;
  }

  /**
   * Get the Transaction.
   */
  get(): Tx {
    return this.tx;
  }
}
