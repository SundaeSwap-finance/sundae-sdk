/**
 * @parent "@sundaeswap/core"
 * @module ProviderTypes
 */

import type { EContractVersion } from "./txbuilders";

/**
 * Defines the type of pool list to retrieve.
 */
export enum EPoolSearchType {
  ALL = "pools",
  POPULAR = "poolsPopular",
}

/**
 * An interface for querying details about a pool.
 *
 * ```ts
 * const query: IPoolByPairQuery = {
 *   pair: ["assetIdA", "assetIdB"],
 *   fee: "0.03"
 * }
 * ```
 */
export interface IPoolByPairQuery {
  /** The pool pair, as an array of {@link IPoolDataAsset.assetId} */
  pair: [string, string];
  /** The desired pool fee as a percentage string. */
  fee: string;
}

/**
 * Query arguments for finding a pool by its ident.
 */
export interface IPoolByIdentQuery {
  /** The pool's ident. */
  ident: string;
}

/**
 * Asset data returned from {@link Core.QueryProvider.findPoolData}.
 */
export interface IPoolDataAsset {
  /**
   * The hex encoded asset ID, separating the Policy ID from the Asset Name.
   *
   * @example
   * POLICY_ID_HEX.ASSET_NAME_HEX
   */
  assetId: string;
  /** The registered decimal places of the asset. */
  decimals: number;
}

/** The structure for pool Dates, denoted as a timestamp string. */
export interface IPoolDate {
  slot: number;
}

/** The fee structure, denoted as an array of numerator and denominator. */
export type TFee = [bigint, bigint];

/**
 * Pool data that is returned from {@link Core.QueryProvider.findPoolData}.
 */
export interface IPoolData {
  /** Returns the current pool fee as a float. */
  currentFee: number;
  /** The pool identification hash. */
  ident: string;
  assetA: IPoolDataAsset;
  assetB: IPoolDataAsset;
  assetLP: IPoolDataAsset;
  liquidity: {
    aReserve: bigint;
    bReserve: bigint;
    lpTotal: bigint;
  };
  version: string;
}

/**
 * Interface describing the format of the basic validator.
 */
export interface ISundaeProtocolValidator {
  title: string;
  hash: string;
}

/**
 * Extended interface describing the validator with the compiled code included.
 */
export interface ISundaeProtocolValidatorFull extends ISundaeProtocolValidator {
  compiledCode: string;
}

/**
 * Interface describing the expected structure of the reference object returned by the API.
 */
export interface ISundaeProtocolReference {
  key: string;
  txIn: {
    hash: string;
    index: number;
  };
}

/**
 * The Sundae protocol parameters.
 */
export interface ISundaeProtocolParams {
  version: EContractVersion;
  blueprint: {
    validators: ISundaeProtocolValidator[];
  };
  references: ISundaeProtocolReference[];
}

/**
 * The Sundae protocol parameters with the compiled
 * code included in the response.
 */
export interface ISundaeProtocolParamsFull {
  version: EContractVersion;
  blueprint: {
    validators: ISundaeProtocolValidatorFull[];
  };
  references: ISundaeProtocolReference[];
}
