import type { AssetAmount } from "@sundaeswap/asset";
import { ITxBuilderReferralFee } from "@sundaeswap/core";
import type {
  MintingPolicy,
  OutRef,
  SpendingValidator,
  UTxO,
} from "lucid-cardano";

export interface IDepositArgs {
  assetAmount: AssetAmount;
  currentTime?: number;
  referralFee?: ITxBuilderReferralFee;
  scripts: {
    policy: MintingPolicy | OutRef;
    validator: SpendingValidator | OutRef;
  };
  utxos?: UTxO[];
}

export interface IWithdrawArgs {
  currentTime?: number;
  deadline: number;
  penaltyAddress: string;
  referralFee?: ITxBuilderReferralFee;
  scripts: {
    policy: MintingPolicy | OutRef;
    validator: SpendingValidator | OutRef;
  };
  utxos?: UTxO[];
}
