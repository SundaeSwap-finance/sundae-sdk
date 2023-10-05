import type { AssetAmount } from "@sundaeswap/asset";
import type { UTxO } from "lucid-cardano";

export type CborHex = "string";

export interface IDepositArgs {
  utxos: UTxO[];
  scripts: {
    policy: CborHex;
    validator: CborHex;
  };
  refScripts?: {
    policy: UTxO;
    validator: UTxO;
  };
  assetAmount: AssetAmount;
  currentTime?: number;
}
