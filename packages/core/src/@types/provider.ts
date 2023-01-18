/**
 * @module ProviderTypes
 */

/**
 * The base Provider interface by which you can implement custom Provider classes.
 *
 * @group Extension Builders
 */
export interface IProviderClass {
  /**
   * Finds a matching pool on the SundaeSwap protocol.
   *
   * @param pair An array of the hex-encoded assetIDs in the pool, separated by a period (i.e. POLICY_ID.ASSET_NAME).
   * @param fee A string representation of the pool fee, as a float (i.e. "0.03").
   */
  findPoolData: (query: IPoolQuery) => Promise<IPoolData>;

  /**
   * Finds a matching pool on the SundaeSwap protocol and returns only the ident.
   *
   * @param pair An array of the hex-encoded assetIDs in the pool, separated by a period (i.e. POLICY_ID.ASSET_NAME).
   * @param fee A string representation of the pool fee, as a float (i.e. "0.03").
   */
  findPoolIdent: (query: IPoolQuery) => Promise<string>;
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
 * @see {@link IProviderClass}
 */
export interface IPoolQuery {
  /** The pool pair, as an array of {@link IPoolDataAsset.assetId} */
  pair: [string, string];
  /** The desired pool fee. */
  fee: string;
}

/**
 * Asset data returned from {@link IProviderClass.findPoolData}.
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
 * Pool data that is returned from {@link IProviderClass.findPoolData}.
 */
export interface IPoolData {
  /** The pool fee as a percentage. */
  fee: string;
  /** The unique identifier of the pool. Also returned directly via {@link  IProviderClass.findPoolIdent} */
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
