export const SETNODE_PREFIX = "FSN";
export const TWENTY_FOUR_HOURS_MS = 86_400_000;

export const NODE_DEPOSIT_ADA = 3_000_000n;
export const FOLDING_FEE_ADA = 1_000_000n;
export const MIN_COMMITMENT_ADA = 1_000_000n;
export const TT_UTXO_ADDITIONAL_ADA = NODE_DEPOSIT_ADA + FOLDING_FEE_ADA * 2n;

export const VALID_FROM_TOLERANCE_MS = 20_000;
// TODO: return this from the API
export const VALID_TO_TOLERANCE_MS = 600_000;
