import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  ZapConfigArgs,
  IPoolData,
  OrderAddresses,
  PoolCoin,
} from "../../@types";
import { OrderConfig } from "../Abstracts/OrderConfig.abstract.class";

/**
 * The main config class for building valid arguments for a Zap.
 */
export class ZapConfig extends OrderConfig<ZapConfigArgs> {
  suppliedAsset?: AssetAmount<IAssetAmountMetadata>;
  zapDirection?: PoolCoin;
  swapSlippage?: number;

  constructor(args?: ZapConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  setSwapSlippage(amount: number) {
    this.swapSlippage = amount;
    return this;
  }

  setSuppliedAsset(asset: AssetAmount) {
    this.suppliedAsset = asset;
    return this;
  }

  setZapDirection(direction: PoolCoin) {
    this.zapDirection = direction;
    return this;
  }

  buildArgs() {
    this.validate();

    return {
      orderAddresses: this.orderAddresses as OrderAddresses,
      pool: this.pool as IPoolData,
      suppliedAsset: this.suppliedAsset as AssetAmount<IAssetAmountMetadata>,
      zapDirection: this.zapDirection as PoolCoin,
      swapSlippage: (this.swapSlippage ?? 0) as number,
    };
  }

  setFromObject({
    orderAddresses,
    pool,
    suppliedAsset,
    zapDirection,
    swapSlippage,
  }: ZapConfigArgs): void {
    this.setOrderAddresses(orderAddresses);
    this.setPool(pool);
    this.setSuppliedAsset(suppliedAsset);
    this.setZapDirection(zapDirection);
    this.setSwapSlippage(swapSlippage ?? 0);
  }

  validate(): never | void {
    super.validate();

    if (this.swapSlippage && (this.swapSlippage > 1 || this.swapSlippage < 0)) {
      throw new Error(
        "You provided an invalid number for the desired swap slippage. Please choose a float number between 0 and 1."
      );
    }

    if (!this.suppliedAsset) {
      throw new Error(
        "You did not provided funding for this deposit! Make sure you supply both sides of the pool with .setSuppliedAssets()"
      );
    }

    if (typeof this.zapDirection === "undefined") {
      throw new Error(
        "You did not provide a Zap Direction for this deposit! Make sure you supply the Zap Direction with .setZapDirection()"
      );
    }
  }
}
