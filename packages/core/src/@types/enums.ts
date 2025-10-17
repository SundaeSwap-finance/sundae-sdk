/**
 * The contract version to be used when building transactions
 * of any time that interact with SundaeSwap contracts.
 */
export enum EContractVersion {
  V1 = "V1",
  V3 = "V3",
  NftCheck = "NftCheck",
  Condition = "Condition",
}

/**
 * The Datum type to be passed along with an address.
 */
export enum EDatumType {
  HASH = "HASH",
  INLINE = "INLINE",
  NONE = "NONE",
}

/**
 * The type of destination specified for an order.
 */
export enum EDestinationType {
  FIXED = "FIXED",
  SELF = "SELF",
}

/**
 * An enum to represent a Swap order type.
 */
export enum ESwapType {
  MARKET = "MARKET",
  LIMIT = "LIMIT",
}
