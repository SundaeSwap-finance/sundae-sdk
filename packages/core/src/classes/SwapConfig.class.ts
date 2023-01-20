import { IBuildSwapArgs, IPoolData, IAsset, OrderAddresses } from "../@types";
import { AssetAmount } from "./AssetAmount.class";

/**
 * The `SwapConfig` class helps to properly format your swap arguments for use within {@link TxBuilder.buildSwapTx | TxBuilder.buildSwapTx}.
 *
 * @example
 *
 * ```ts
 * const config = new SwapConfig()
 *   .setPool( /** ...pool data... *\/)
 *   .setSuppliedAsset({
 *     assetID: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
 *     amount: new AssetAmount(20n, 6),
 *   })
 *   .setOrderAddresses({
 *      DestinationAddress: {
 *        address: "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32"
 *      }
 *   });
 *
 * const { submit, cbor } = await SDK.swap(config);
 * ```
 *
 * @see {@link SundaeSDK.swap}
 */
export class SwapConfig {
  private pool?: IPoolData;
  private orderAddresses?: OrderAddresses;
  private suppliedAsset?: IAsset;
  private minReceivable: AssetAmount = new AssetAmount(1n);

  constructor() {}

  /**
   * Set the supplied asset for the swap.
   *
   * @param asset The provided asset and amount from a connected wallet.
   * @returns
   */
  setSuppliedAsset(asset: IAsset) {
    this.suppliedAsset = asset;
    return this;
  }

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

  /**
   * Set a minimum receivable asset amount for the swap. This is akin to setting a limit order.
   *
   * @param amount
   * @returns
   */
  setMinReceivable(amount: AssetAmount) {
    this.minReceivable = amount;
    return this;
  }

  getSuppliedAsset() {
    return this.suppliedAsset;
  }

  getPool() {
    return this.pool;
  }

  getMinReceivable() {
    return this.minReceivable;
  }

  getOrderAddresses() {
    return this.orderAddresses;
  }

  /**
   * Used for building a swap where you already know the pool data.
   * Useful for when building Transactions directly from the builder instance.
   *
   * @see {@link TxBuilder.buildSwapTx}
   *
   * @returns
   */
  buildSwapArgs(): IBuildSwapArgs {
    if (!this.pool) {
      throw new Error("The pool property is not defined. Set with .setPool()");
    }

    if (!this.suppliedAsset) {
      throw new Error(
        "The suppliedAsset property is not defined. Set with .setSuppliedAsset()"
      );
    }

    if (!this.orderAddresses) {
      throw new Error(
        "The orderAddresses property is not defined. Set with .setOrderAddresses()"
      );
    }

    return {
      pool: this.pool,
      suppliedAsset: this.suppliedAsset,
      orderAddresses: this.orderAddresses,
      minReceivable: this.minReceivable,
    };
  }
}
