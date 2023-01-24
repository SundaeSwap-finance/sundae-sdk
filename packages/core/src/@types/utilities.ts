import { AssetAmount } from "../classes/AssetAmount.class";

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
 * Basic asset structure with the amount.
 */
export interface IAsset {
  /** The hex encoded asset string, separating the Policy ID from the Asset Name with a period. @example POLICY_ID.ASSET_NAME */
  assetId: string;
  /** An instance of the asset amount including the decimal place. */
  amount: AssetAmount;
}
