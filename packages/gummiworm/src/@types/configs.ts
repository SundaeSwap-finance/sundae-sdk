import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

export interface IDepositArgs {
  assets: AssetAmount<IAssetAmountMetadata>[];
  address?: string;
}
