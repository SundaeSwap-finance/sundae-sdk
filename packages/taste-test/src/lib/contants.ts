export const SETNODE_PREFIX = "FSN";
export const TWENTY_FOUR_HOURS_MS = 86_400_000;

export const NODE_DEPOSIT_ADA = 3_000_000n;
export const FOLDING_FEE_ADA = 1_000_000n;
export const MIN_COMMITMENT_ADA = NODE_DEPOSIT_ADA + FOLDING_FEE_ADA;

export const TIME_TOLERANCE_MS =
  process.env.NODE_ENV == "emulator" ? 0 : 100_000;
