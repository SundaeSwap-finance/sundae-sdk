import { IPoolData, OrderAddresses } from "src/@types";

export abstract class OrderConfig {
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
}
