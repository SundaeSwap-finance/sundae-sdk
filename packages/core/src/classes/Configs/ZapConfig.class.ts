import {
  BuildZapConfigArgs,
  IAsset,
  IPoolData,
  IZapArgs,
  OrderAddresses,
  PoolCoin,
} from "../../@types";
import { Config } from "../Abstracts/Config.abstract.class";

/**
 * The main config class for building valid arguments for a Zap.
 */
export class ZapConfig extends Config<IZapArgs> {
  suppliedAsset?: IAsset;
  zapDirection?: PoolCoin;

  constructor(args?: BuildZapConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  setSuppliedAsset(asset: IAsset) {
    this.suppliedAsset = asset;
    return this;
  }

  setZapDirection(direction: PoolCoin) {
    this.zapDirection = direction;
    return this;
  }

  buildArgs(): IZapArgs {
    this.validate();

    return {
      orderAddresses: this.orderAddresses as OrderAddresses,
      pool: this.pool as IPoolData,
      suppliedAsset: this.suppliedAsset as IAsset,
      zapDirection: this.zapDirection as PoolCoin,
    };
  }

  setFromObject({
    orderAddresses,
    pool,
    suppliedAsset,
    zapDirection,
  }: BuildZapConfigArgs): void {
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
