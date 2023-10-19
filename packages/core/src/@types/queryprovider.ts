/**
 * @module ProviderTypes
 */

import { UTXO } from "./datumbuilder";

/**
 * Defines the type of pool list to retrieve.
 */
export enum EPoolSearchType {
  ALL = "pools",
  POPULAR = "poolsPopular",
}

/**
 * The base Provider interface by which you can implement custom Provider classes.
 *
 * @group Extension Builders
 */
export interface IQueryProviderClass {
  /**
   * Finds a matching pool on the SundaeSwap protocol.
   *
   * @param pair An array of the hex-encoded assetIDs in the pool, separated by a period (i.e. POLICY_ID.ASSET_NAME).
   * @param fee A string representation of the pool fee, as a float (i.e. "0.03").
   * @returns {Promise<IPoolData>} Returns the queried pool's data.
   */
  findPoolData: (query: IPoolQuery) => Promise<IPoolData>;

  /**
   * Finds a matching pool on the SundaeSwap protocol and returns only the ident.
   *
   * @param pair An array of the hex-encoded assetIDs in the pool, separated by a period (i.e. POLICY_ID.ASSET_NAME).
   * @param fee A string representation of the pool fee, as a float (i.e. "0.03").
   * @returns {Promise<string>} Returns queried pool's ident.
   */
  findPoolIdent: (query: IPoolQuery) => Promise<string>;

  /**
   * Retrieves all available pools' data.
   *
   * @param type The type of search to perform.
   * @param query A string to use as your query.
   * @returns {Promise<IPoolData[]>} Returns an array of IPoolData objects, each representing the data for an individual pool.
   */
  getAllPools: (type?: EPoolSearchType, query?: string) => Promise<IPoolData[]>;

  /**
   * Finds the associated UTXO data of an open order.
   *
   * @param utxo The transaction hash and index of the open order in the escrow contract.
   */
  findOpenOrderDatum: (
    utxo: UTXO
  ) => Promise<{ datum: string; datumHash: string }>;
}

/**
 * An interface for querying details about a pool.
 *
 * ```ts
 * const query: IPoolQuery = {
 *   pair: ["assetIdA", "assetIdB"],
 *   fee: "0.03"
 * }
 * ```
 *
 * @see {@link IQueryProviderClass}
 */
export interface IPoolQuery {
  /** The pool pair, as an array of {@link IPoolDataAsset.assetId} */
  pair: [string, string];
  /** The desired pool fee as a percentage string. */
  fee: string;
}

/**
 * Asset data returned from {@link IQueryProviderClass.findPoolData}.
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

/**
 * Pool data that is returned from {@link IQueryProviderClass.findPoolData}.
 */
export interface IPoolData {
  /** The pool fee represented as a string. i.e. 1% === "1" and .03% === "0.03" */
  fee: string;
  /** The unique identifier of the pool. Also returned directly via {@link  IQueryProviderClass.findPoolIdent} */
  ident: string;
  /** Asset data for the pool pair, Asset A */
  assetA: IPoolDataAsset;
  /** Asset data for the pool pair, Asset B */
  assetB: IPoolDataAsset;
  /** The pool quantity of {@link assetA} */
  quantityA: string;
  /** The pool quantity of {@link assetB} */
  quantityB: string;
}
