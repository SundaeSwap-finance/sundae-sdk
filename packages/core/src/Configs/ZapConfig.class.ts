import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  EPoolCoin,
  IPoolData,
  IZapConfigArgs,
  TOrderAddresses,
} from "../@types/index.js";
import { OrderConfig } from "../Abstracts/OrderConfig.abstract.class.js";

/**
 * The main config class for building valid arguments for a Zap.
 */
export class ZapConfig extends OrderConfig<IZapConfigArgs> {
  suppliedAsset?: AssetAmount<IAssetAmountMetadata>;
  zapDirection?: EPoolCoin;
  swapSlippage?: number;

  constructor(args?: IZapConfigArgs) {
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

  setZapDirection(direction: EPoolCoin) {
    this.zapDirection = direction;
    return this;
  }

  buildArgs() {
    this.validate();

    return {
      orderAddresses: this.orderAddresses as TOrderAddresses,
      pool: this.pool as IPoolData,
      suppliedAsset: this.suppliedAsset as AssetAmount<IAssetAmountMetadata>,
      zapDirection: this.zapDirection as EPoolCoin,
      swapSlippage: (this.swapSlippage ?? 0) as number,
      referralFee: this.referralFee,
    };
  }

  setFromObject({
    orderAddresses,
    pool,
    suppliedAsset,
    zapDirection,
    swapSlippage,
    referralFee,
  }: IZapConfigArgs): void {
    this.setOrderAddresses(orderAddresses);
    this.setPool(pool);
    this.setSuppliedAsset(suppliedAsset);
    this.setZapDirection(zapDirection);
    this.setSwapSlippage(swapSlippage ?? 0);
    referralFee && this.setReferralFee(referralFee);
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
