import type { AssetAmount } from "@sundaeswap/asset";
import type {
  IBaseConfig,
  ITxBuilderReferralFee,
  TUTXO,
} from "@sundaeswap/core";

/**
 * Arguments for locking assets into the YF v2 contract.
 */
export interface ILockArguments<Program> {
  delegation: Program;
  referralFee?: ITxBuilderReferralFee;
}

/**
 * The configuration object for a FreezerConfig instance.
 */
export interface ILockConfigArgs<Program> extends IBaseConfig {
  programs?: Program | null;
  existingPositions?: TUTXO[];
  lockedValues?: AssetAmount[] | null;
  ownerAddress: string;
}
