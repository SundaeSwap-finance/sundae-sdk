import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { IPoolData, IStrategyConfigArgs, TOrderAddresses } from "../@types/index.js";
import { Config } from "../Abstracts/Config.abstract.class.js";
import { OrderConfig } from "../Abstracts/OrderConfig.abstract.class.js";

/**
 * The main config class for building valid arguments for listing a strategy order.
 */
export class StrategyConfig extends OrderConfig<IStrategyConfigArgs> {
  suppliedAssets?: AssetAmount<IAssetAmountMetadata>[];

  ownerPublicKey?: string;

  constructor(args?: IStrategyConfigArgs) {
    super();

    args && this.setFromObject(args);
  }


  setSuppliedAssets(assets: AssetAmount<IAssetAmountMetadata>[]) {
    this.suppliedAssets = assets;
    return this;
  }

  setOwnerPublicKey(publicKey: string) {
    this.ownerPublicKey = publicKey;
    return this;
  }

  buildArgs(): IStrategyConfigArgs {
    this.validate();

    return {
      pool: this.pool as IPoolData,
      orderAddresses: this.orderAddresses as TOrderAddresses,
      ownerPublicKey: this.ownerPublicKey as string,
      suppliedAssets: this
        .suppliedAssets as AssetAmount<IAssetAmountMetadata>[],
      referralFee: this.referralFee,
    };
  }

  setFromObject({
    orderAddresses,
    suppliedAssets,
    referralFee,
  }: IStrategyConfigArgs): void {
    this.setOrderAddresses(orderAddresses);
    this.setSuppliedAssets(suppliedAssets);
    referralFee && this.setReferralFee(referralFee);
  }

  validate(): never | void {
    super.validate();

    if (!this.suppliedAssets) {
      throw new Error(
        "You did not provided funding for this listed strategy! Make sure you supply the necessary assets with .setSuppliedAssets()"
      );
    }
  }
}
