import { TFee } from "./queryprovider.js";

/**
 * The SundaeSwap protocol parameters object.
 */
export interface IProtocolParams {
  /** The Bech32 script address of the SundaeSwap Order V1 contract. */
  ORDER_SCRIPT_V1: string;
  /** The Bech32 script address of the SundaeSwap Order V3 contract. */
  ORDER_SCRIPT_V3: string;
  /** The hex-encoded redeemer value for cancelling V1 Orders */
  CANCEL_REDEEMER_V1: string;
  /** The hex-encoded redeemer value for cancelling V3 Orders */
  CANCEL_REDEEMER_V3: string;
  /** The hex-encoded script validator of the Order V1 contract */
  SCRIPT_VALIDATOR_V1: string;
  /** The hex-encoded script validator of the Order V3 contract */
  SCRIPT_VALIDATOR_V3: string;
  /** The hex-encoded staking key for the Yield Farming lockups. */
  YF_STAKE_KEYHASH: string;
  /** The hex-encoded keyhash for the Yield Farming contract. */
  YF_PAYMENT_SCRIPTHASH: string;
  /** The hex-enc */
  YF_REFERENCE_INPUT: string;
}

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
  | "begin";

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
