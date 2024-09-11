import { TOrderAddressesArgs } from "../@types/index.js";
import { Config } from "./Config.abstract.class.js";

/**
 * The OrderConfig class extends Config and represents the configuration for an order.
 * It includes settings such as the pool and order addresses.
 *
 * @template Args The type of the arguments object, defaulting to an empty object.
 */
export abstract class LiquidityConfig<Args = object> extends Config<Args> {
  /**
   * The addresses for the order.
   */
  orderAddresses?: TOrderAddressesArgs;

  /**
   * Set the addresses for a swap's required datum.
   * @param {TOrderAddressesArgs} orderAddresses - The addresses for the order.
   * @returns {OrderConfig} The current instance of the class.
   */
  setOrderAddresses(orderAddresses: TOrderAddressesArgs) {
    this.orderAddresses = orderAddresses;
    return this;
  }

  /**
   * Validates the current configuration.
   * If the pool or the order addresses are not set, it throws an error.
   * @throws {Error} If the pool or the order addresses are not set.
   */
  validate(): void | never {
    super.validate();

    if (!this.orderAddresses) {
      throw new Error(
        "You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()",
      );
    }
  }
}
