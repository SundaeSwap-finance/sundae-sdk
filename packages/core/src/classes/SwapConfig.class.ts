import {
  IBuildSwapArgs,
  IPoolData,
  IAsset,
  EscrowAddress,
  TSupportedNetworks,
} from "../@types";
import { AssetAmount } from "./AssetAmount.class";

/**
 * The `SwapConfig` class helps to properly format your swap arguments for use within {@link ITxBuilderClass.buildSwap | ITxBuilderClass.buildSwap}.
 *
 * @example
 *
 * ```ts
 * const config = new SwapConfig()
 *   .setPool( /** ...pool data... *\/)
 *   .setFunding({
 *     assetID: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
 *     amount: new AssetAmount(20n, 6),
 *   })
 *   .setReceiverAddress(
 *     "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32"
 *   );
 *
 * const { submit, cbor } = await SDK.swap(config);
 * ```
 *
 * @see {@link SundaeSDK.swap}
 */
export class SwapConfig {
  private pool?: IPoolData;
  private escrowAddress?: EscrowAddress;
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
   * Builds the {@link EscrowAddress} for a swap's required datum.
   * @param escrowAddress
   * @returns
   */
  setEscrowAddress(escrowAddress: EscrowAddress) {
    this.escrowAddress = escrowAddress;
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

  getEscrowAddress() {
    return this.escrowAddress;
  }

  /**
   * Used for building a swap where you already know the pool data.
   * Useful for when building Transactions directly from the builder instance.
   *
   * @see {@link ITxBuilderClass.buildSwap}
   *
   * @returns
   */
  buildSwapArgs<T = any>(): IBuildSwapArgs<T> {
    if (!this.pool) {
      throw new Error("The pool is not defined.");
    }

    if (!this.suppliedAsset) {
      throw new Error("The suppliedAsset is not defined.");
    }

    if (!this.escrowAddress) {
      throw new Error("The escrowAddress is not defined.");
    }

    return {
      pool: this.pool,
      suppliedAsset: this.suppliedAsset,
      escrowAddress: this.escrowAddress,
      minReceivable: this.minReceivable,
    };
  }
}
