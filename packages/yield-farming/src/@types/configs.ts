import type { AssetAmount } from "@sundaeswap/asset";
import type {
  IBaseConfig,
  ITxBuilderReferralFee,
  TUTXO,
} from "@sundaeswap/core";

import { TDelegation, TDelegationPrograms } from "./contracts";

// /** A map of pools with their associated weight. */
// export type TDelegationProgramPools = Map<string, bigint>;
// /** A map of programs with their associated {@link TDelegationProgramPools} map. */
// export type TDelegationPrograms = Map<string, TDelegationProgramPools>;

/**
 * Arguments for locking assets into the YF v2 contract.
 */
export interface ILockArguments {
  delegation: TDelegation;
  referralFee?: ITxBuilderReferralFee;
}

/**
 * The configuration object for a FreezerConfig instance.
 */
export interface ILockConfigArgs extends IBaseConfig {
  programs?: TDelegationPrograms | null;
  existingPositions?: TUTXO[];
  lockedValues?: AssetAmount<{ assetId: string; decimals: number }>[] | null;
  ownerAddress: string;
}
