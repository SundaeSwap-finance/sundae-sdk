import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { IStrategyConfigArgs, TOrderAddresses } from "../@types/index.js";
import { Config } from "../Abstracts/Config.abstract.class.js";

/**
 * The main config class for building valid arguments for listing a strategy order.
 */
export class StrategyConfig extends Config<IStrategyConfigArgs> {
  suppliedAssets?: AssetAmount<IAssetAmountMetadata>[];
  orderAddresses?: TOrderAddresses;

  constructor(args?: IStrategyConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  /**
   * Set the {@link Core.TOrderAddresses} for a listed strategy's datum.
   * @param {TOrderAddresses} orderAddresses - The addresses for the order.
   * @returns {OrderConfig} The current instance of the class.
   */
  setOrderAddresses(orderAddresses: TOrderAddresses): StrategyConfig {
    this.orderAddresses = orderAddresses;
    return this;
  }

  setSuppliedAssets(assets: AssetAmount<IAssetAmountMetadata>[]) {
    this.suppliedAssets = assets;
    return this;
  }

  buildArgs(): IStrategyConfigArgs {
    this.validate();

    return {
      orderAddresses: this.orderAddresses as TOrderAddresses,
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
