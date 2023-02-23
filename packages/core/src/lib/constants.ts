/**
 * The minimum asset length is determined by the hex-encoded byte string length of a Policy ID.
 * This condition is ignored for the Cardano $ADA asset, which has a Policy ID and Asset Name of "".
 */
export const MIN_ASSET_LENGTH = 56;

/**
 * The AssetID for the Cardano native token, $ADA.
 */
export const ADA_ASSET_ID = "";
export const ADA_ASSET_DECIMAL = 6;
