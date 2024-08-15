import type { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import type { IComposedTx, ITxBuilderReferralFee } from "@sundaeswap/core";
import type {
  MintingPolicy,
  OutRef,
  SpendingValidator,
  UTXO,
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
 * An enum that describes different script types.
 */
export enum EScriptType {
  VALIDATOR = "VALIDATOR",
  POLICY = "POLICY",
  OUTREF = "OUTREF",
}

/**
 * A type to describe the validator script.
 */
export type TSpendingValidatorScript = {
  type: EScriptType.VALIDATOR;
  value: SpendingValidator;
};

/**
 * A type to describe the minting policy script.
 */
export type TMintingPolicyScript = {
  type: EScriptType.POLICY;
  value: MintingPolicy;
};

/**
 * A type to describe the out ref UTXO. We use this to
 * the scripts as reference inputs.
 */
export type TOutRef = {
  type: EScriptType.OUTREF;
  value: {
    hash: string;
    outRef: OutRef;
  };
};

/**
 * The default type for scripts.
 */
export type TScriptType =
  | TSpendingValidatorScript
  | TMintingPolicyScript
  | TOutRef;

/**
 * Common arguments for the deposit and update methods of the TasteTest class instance.
 */
export interface IBaseArgs {
  time?: number;
  deadline?: number;
  referralFee?: ITxBuilderReferralFee;
  validatorAddress: string;
  scripts: {
    policy: TScriptType;
    validator: TScriptType;
  };
  tasteTestType?: TTasteTestType;
  utxos?: UTXO[];
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
  penaltyAddress: string;
  deadline: number;
}

/**
 * Arguments for the reward claim of the TasteTest class instance.
 */
export interface IClaimArgs extends IBaseArgs {
  burnFoldToken?: boolean;
  rewardFoldPolicyId: string;
}
