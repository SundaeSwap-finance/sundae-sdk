import type { AssetAmount } from "@sundaeswap/asset";
import { ITxBuilderReferralFee } from "@sundaeswap/core";
import type {
  MintingPolicy,
  OutRef,
  SpendingValidator,
  UTxO,
} from "lucid-cardano";

export interface IBaseArgs {
  currentTime?: number;
  referralFee?: ITxBuilderReferralFee;
  scripts: {
    policy: MintingPolicy | OutRef;
    validator: SpendingValidator | OutRef;
  };
  utxos?: UTxO[];
}

export interface IDepositArgs extends IBaseArgs {
  assetAmount: AssetAmount;
}

export interface IUpdateArgs extends IDepositArgs {
  assetAmount: AssetAmount;
}

export interface IWithdrawArgs extends IBaseArgs {
  deadline: number;
  penaltyAddress: string;
}
