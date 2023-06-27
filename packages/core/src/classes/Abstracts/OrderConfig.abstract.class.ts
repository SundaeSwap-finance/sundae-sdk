import { IPoolData, OrderAddresses } from "../../@types";
import { Config } from "./Config.abstract.class";

/**
 * The OrderConfig class extends Config and represents the configuration for an order.
 * It includes settings such as the pool and order addresses.
 *
 * @template Args The type of the arguments object, defaulting to an empty object.
 */
export abstract class OrderConfig<Args = {}> extends Config<Args> {
  /**
   * The data for the pool involved in the order.
   */
  pool?: IPoolData;

  /**
   * The addresses for the order.
   */
  orderAddresses?: OrderAddresses;

  constructor() {
    super();
  }

  /**
   * Set the {@link OrderAddresses} for a swap's required datum.
   * @param {OrderAddresses} orderAddresses - The addresses for the order.
   * @returns {OrderConfig} The current instance of the class.
   */
  setOrderAddresses(orderAddresses: OrderAddresses) {
    this.orderAddresses = orderAddresses;
    return this;
  }

  /**
   * Set the pool data directly for the swap you use.
   *
   * @param {IPoolData} pool - The data for the pool involved in the order.
   * @returns {OrderConfig} The current instance of the class.
   */
  setPool(pool: IPoolData) {
    this.pool = pool;
    return this;
  }

  /**
   * Validates the current configuration.
   * If the pool or the order addresses are not set, it throws an error.
   * @throws {Error} If the pool or the order addresses are not set.
   */
  validate(): void | never {
    if (!this.pool) {
      throw new Error(
        "You haven't set a pool in your Config. Set a pool with .setPool()"
      );
    }

    if (!this.orderAddresses) {
      throw new Error(
        "You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()"
      );
    }
  }
}
