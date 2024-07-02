import { TFee } from "./queryprovider.js";

/**
 * A type constant used for determining valid Cardano Network values.
 *
 * @group Utility Types
 */
export type TSupportedNetworks = "mainnet" | "preview";

/**
 * A type constant used for determining valid CIP-30 compliant Web3 Wallets for Cardano.
 *
 * @group Utility Types
 */
export type TSupportedWallets =
  | "nami"
  | "eternl"
  | "typhoncip30"
  | "ccvault"
  | "typhon"
  | "yoroi"
  | "flint"
  | "gerowallet"
  | "cardwallet"
  | "nufi"
  | "begin"
  | "lace"
  | "sorbet";

/**
 * An interface to describe a utility function's arguments in SundaeUtils.
 */
export interface ICurrentFeeFromDecayingFeeArgs {
  endFee: TFee;
  endSlot: string;
  startFee: TFee;
  startSlot: string;
  network: TSupportedNetworks;
}
