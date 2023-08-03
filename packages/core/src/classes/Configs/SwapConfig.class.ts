import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import {
  SwapConfigArgs,
  IPoolData,
  OrderAddresses,
  ITxBuilderReferralFee,
} from "../../@types";
import { OrderConfig } from "../Abstracts/OrderConfig.abstract.class";
import { Utils } from "../Utils.class";

/**
 * The `SwapConfig` class helps to properly format your swap arguments for use within {@link TxBuilder.buildSwapTx | TxBuilder.buildSwapTx}.
 *
 * @example
 *
 * ```ts
 * const config = new SwapConfig()
 *   .setPool( /** ...pool data... *\/)
 *   .setSuppliedAsset({
 *     assetId: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
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
export class SwapConfig extends OrderConfig<SwapConfigArgs> {
  referralFee?: ITxBuilderReferralFee | undefined;
  suppliedAsset?: AssetAmount<IAssetAmountMetadata>;
  minReceivable?: AssetAmount<IAssetAmountMetadata>;

  constructor(args?: SwapConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  /**
   * Set the supplied asset for the swap.
   *
   * @param asset The provided asset and amount from a connected wallet.
   * @returns
   */
  setSuppliedAsset(asset: AssetAmount<IAssetAmountMetadata>) {
    this.suppliedAsset = asset;
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

  /**
   * Used for building a swap where you already know the pool data.
   * Useful for when building Transactions directly from the builder instance.
   *
   * @see {@link Core.TxBuilder.buildSwapTx}
   *
   * @returns
   */
  buildArgs(): SwapConfigArgs {
    this.validate();
    return {
      pool: this.pool as IPoolData,
      suppliedAsset: this.suppliedAsset as AssetAmount<IAssetAmountMetadata>,
      orderAddresses: this.orderAddresses as OrderAddresses,
      minReceivable: this.minReceivable as AssetAmount<IAssetAmountMetadata>,
      referralFee: this.referralFee,
    };
  }

  /**
   * Helper function to build valid swap arguments from a JSON object.
   */
  setFromObject({
    pool,
    orderAddresses,
    suppliedAsset,
    slippage,
    referralFee,
  }: SwapConfigArgs) {
    this.setPool(pool);
    this.setOrderAddresses(orderAddresses);
    this.setSuppliedAsset(suppliedAsset);
    referralFee && this.setReferralFee(referralFee);

    if (false !== slippage) {
      this.setMinReceivable(
        Utils.getMinReceivableFromSlippage(pool, suppliedAsset, slippage ?? 0.1)
      );
    }
  }

  validate(): void {
    super.validate();

    if (!this.suppliedAsset) {
      throw new Error(
        "You haven't funded this swap on your SwapConfig! Fund the swap with .setSuppliedAsset()"
      );
    }

    if (!this.minReceivable) {
      throw new Error(
        "You haven't set a minimum receivable amount on your SwapConfig!"
      );
    }
  }
}
