import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { IStrategyConfigArgs } from "src/@types";
import { OrderConfig } from "../Abstracts/OrderConfig.abstract.class.js";

export class StrategyConfig extends OrderConfig<IStrategyConfigArgs> {
  suppliedAsset?: AssetAmount<IAssetAmountMetadata>;
  authSigner?: string;
  authScript?: string;

  constructor(args?: IStrategyConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  setSuppliedAsset(asset: AssetAmount<IAssetAmountMetadata>) {
    this.suppliedAsset = asset;
    return this;
  }

  setAuthSigner(signer: string) {
    this.authSigner = signer;
    return this;
  }

  setAuthScript(script: string) {
    this.authScript = script;
    return this;
  }

  buildArgs(): IStrategyConfigArgs {
    this.validate();

    return {
      orderAddresses: this.orderAddresses!,
      pool: this.pool!,
      referralFee: this.referralFee,
      suppliedAsset: this.suppliedAsset!,
      authSigner: this.authSigner,
      authScript: this.authScript,
    };
  }

  setFromObject({
    orderAddresses,
    pool,
    suppliedAsset,
    authSigner,
    authScript,
  }: IStrategyConfigArgs): void {
    this.setOrderAddresses(orderAddresses);
    this.setPool(pool);
    this.setSuppliedAsset(suppliedAsset);
    authSigner && this.setAuthSigner(authSigner);
    authScript && this.setAuthScript(authScript);
  }

  validate(): void {
    super.validate();

    if (!this.suppliedAsset) {
      throw new Error(
        "You haven't funded this strategy! Fund in with .setSuppliedAsset()",
      );
    }

    if (!this.authSigner && !this.authScript) {
      throw new Error(
        "You need to authorize someone to execute the strategy, by calling .setAuthSigner() or .setAuthScript()",
      );
    }
    if (this.authSigner && this.authScript) {
      throw new Error(
        "You may authorize with either a signer or a script, but not both.",
      );
    }
  }
}
