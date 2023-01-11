/**
 * The SundaeSwap protocol parameters object.
 *
 * @category Utility
 */
interface IProtocolParams {
  ESCROW_ADDRESS: string;
  SCOOPER_FEE: bigint;
  RIDER_FEE: bigint;
}

/**
 * A type constant used for determining valid Cardano Network values.
 *
 * @category Utility
 */
type TSupportedNetworks = "mainnet" | "preview";

/**
 * A type constant used for determining valid CIP-30 compliant Web3 Wallets for Cardano.
 *
 * @category Utility
 */
type TSupportedWallets =
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
