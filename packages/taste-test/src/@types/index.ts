import type { AssetAmount } from "@sundaeswap/asset";
import { ITxBuilderReferralFee } from "@sundaeswap/core";
import type {
  MintingPolicy,
  OutRef,
  SpendingValidator,
  UTxO,
} from "lucid-cardano";

/**
 * The type of Taste Test, where "basic" is a non-pool Taste Test, and "liquidity"
 * is ends the taste test with pool creation.
 */
export type TTasteTestType = "basic" | "liquidity";

/**
 * Common arguments for the deposit and update methods of the TasteTest class instance.
 */
export interface IBaseArgs {
  currentTime?: number;
  referralFee?: ITxBuilderReferralFee;
  scripts: {
    policy: MintingPolicy | OutRef;
    validator: SpendingValidator | OutRef;
  };
  tasteTestType?: TTasteTestType;
  utxos?: UTxO[];
}

/**
 * Arguments for the deposit method of the TasteTest class instance.
 */
export interface IDepositArgs extends IBaseArgs {
  assetAmount: AssetAmount;
  updateFallback?: boolean;
}

/**
 * Arguments for the update method of the TasteTest class instance.
 */
export interface IUpdateArgs extends IDepositArgs {
  assetAmount: AssetAmount;
}

/**
 * Arguments for the deposit withdraw of the TasteTest class instance.
 */
export interface IWithdrawArgs extends IBaseArgs {
  deadline: number;
  penaltyAddress: string;
}
