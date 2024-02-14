import type { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import type { IComposedTx, ITxBuilderReferralFee } from "@sundaeswap/core";
import type {
  MintingPolicy,
  OutRef,
  SpendingValidator,
  UTxO,
} from "lucid-cardano";

/**
 * The type of Taste Test, where "Direct" is a non-pool Taste Test, and "Liquidity"
 * is ends the taste test with pool creation.
 */
export type TTasteTestType = "Direct" | "Liquidity";

/**
 * Object containing the extended fees.
 */
export interface ITasteTestFees {
  foldFee: AssetAmount<IAssetAmountMetadata>;
  penaltyFee: AssetAmount<IAssetAmountMetadata>;
}

/**
 * Helper type to export the fees object associated with the TasteTest class.
 */
export type TTasteTestFees = IComposedTx<
  unknown,
  unknown,
  ITasteTestFees
>["fees"];

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
