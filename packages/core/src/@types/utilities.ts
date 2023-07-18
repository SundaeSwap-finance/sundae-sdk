import { AssetAmount } from "@sundaeswap/asset";

/**
 * The SundaeSwap protocol parameters object.
 */
export interface IProtocolParams {
  /** The Bech32 script address of the SundaeSwap Escrow contract. */
  ESCROW_ADDRESS: string;
  /** The fee paid to Scoopers who process transactions. */
  SCOOPER_FEE: bigint;
  /** The minimum amount of ADA to deliver assets with. */
  RIDER_FEE: bigint;
  /** The hex-encoded redeemer value for cancelling Escrow Orders  */
  ESCROW_CANCEL_REDEEMER: string;
  /** The hex-encoded script value of the Escrow Order contract */
  ESCROW_SCRIPT_VALIDATOR: string;
  /** The hex-encoded staking key for the Yield Farming lockups. */
  FREEZER_STAKE_KEYHASH: string;
  /** The hex-encoded keyhash for the Yield Farming contract. */
  FREEZER_PAYMENT_SCRIPTHASH: string;
  /** The hex-enc */
  FREEZER_REFERENCE_INPUT: string;
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
