import { IPoolData, OrderAddresses } from "../../@types";

export abstract class Config<Args = {}> {
  pool?: IPoolData;
  orderAddresses?: OrderAddresses;

  constructor() {}

  /**
   * Builds the {@link OrderAddresses} for a swap's required datum.
   * @param orderAddresses
   * @returns
   */
  setOrderAddresses(orderAddresses: OrderAddresses) {
    this.orderAddresses = orderAddresses;
    return this;
  }

  /**
   * Set the pool data directly for the swap you use.
   *
   * @param pool
   * @returns
   */
  setPool(pool: IPoolData) {
    this.pool = pool;
    return this;
  }

  abstract setFromObject(obj: {}): void;

  abstract buildArgs(args: Args): Args;

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
