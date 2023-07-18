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

  constructor(args?: ZapConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  setSuppliedAsset(asset: AssetAmount) {
    this.suppliedAsset = asset;
    return this;
  }

  setZapDirection(direction: PoolCoin) {
    this.zapDirection = direction;
    return this;
  }

  buildArgs(): ZapConfigArgs {
    this.validate();

    return {
      orderAddresses: this.orderAddresses as OrderAddresses,
      pool: this.pool as IPoolData,
      suppliedAsset: this.suppliedAsset as AssetAmount<IAssetAmountMetadata>,
      zapDirection: this.zapDirection as PoolCoin,
    };
  }

  setFromObject({
    orderAddresses,
    pool,
    suppliedAsset,
    zapDirection,
  }: ZapConfigArgs): void {
    this.setOrderAddresses(orderAddresses);
    this.setPool(pool);
    this.setSuppliedAsset(suppliedAsset);
    this.setZapDirection(zapDirection);
  }

  validate(): never | void {
    super.validate();

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
