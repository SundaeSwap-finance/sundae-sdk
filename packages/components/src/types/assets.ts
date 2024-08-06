import type { IAssetAmountMetadata } from "@sundaeswap/asset";

export interface IAssetMetadata extends IAssetAmountMetadata {
  ticker?: string;
  logo?: string;
}
