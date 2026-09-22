/**
 * @parent "@sundaeswap/core"
 * @module ProviderTypes
 */

import type { EContractVersion, EPoolCurve } from "./txbuilders";

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
 * Query arguments for finding pools by an asset.
 */
export interface IPoolByAssetQuery {
  /** The assets's id. */
  assetId: string;
  /** Whether to fetch a trimmed down version of the pool data, or everything; defaults to everything */
  minimal?: boolean;
}

/**
 * Query arguments for finding pools by a search term
 */
export interface IPoolBySearchTermQuery {
  /** The search term to use */
  search: string;
  /** Whether to fetch a trimmed down version of the pool data, or everything; defaults to everything */
  minimal?: boolean;
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
  assetLP: Omit<IPoolDataAsset, "decimals"> & { decimals?: number };
  liquidity: {
    aReserve: bigint;
    bReserve: bigint;
    lpTotal: bigint;
  };
  version: EContractVersion;
  conditionDatum?: string;
  protocolFee?: number;
  /**
   * For **v3 Stableswaps** pools (`EContractVersion.Stableswaps`), the pool
   * datum's amplification factor, already scaled by the v3 `A_PRECISION`. It is
   * not the v4 stableswap curve's amplification — that one is `amplification`
   * below, and the two scales differ. Do not read one for the other.
   */
  linearAmplificationFactor?: bigint;
  /**
   * For v4 pools, the invariant curve module — determines which swap math
   * applies (constant product / sum / concentrated liquidity / stableswap).
   * Absent for pre-v4 pools, whose math is fixed by the contract version.
   */
  curve?: EPoolCurve;
  /**
   * For v4 constant-sum pools, the per-asset prices from the pool's constant-sum
   * config, aligned to `[assetA, assetB]`. Required to compute constant-sum swap
   * output; ignored by other curves.
   */
  prices?: [bigint, bigint];
  /**
   * For v4 concentrated-liquidity pools, the immutable sqrt-price range bounds
   * from the pool's CL config as exact rationals `[[aNum, aDen], [bNum, bDen]]`
   * (lower bound `a` < upper bound `b`). Required to compute CL swap output;
   * ignored by other curves.
   */
  sqrtPrices?: [[bigint, bigint], [bigint, bigint]];
  /**
   * For v4 stableswap pools (`EPoolCurve.V4Stableswap`), the per-asset integer
   * rates from the pool's stableswap config, aligned to `[assetA, assetB]`. The
   * curve balances where `aReserve·rates[0] == bReserve·rates[1]`, so a
   * 6-decimal against 8-decimal pair is `[100, 1]` and a yield-bearing asset
   * that has accrued 2% against its base is `[1000000, 1020000]`. Required to
   * compute stableswap swap output; ignored by other curves.
   */
  rates?: [bigint, bigint];
  /**
   * For v4 stableswap pools (`EPoolCurve.V4Stableswap`), the `linear_amplification`
   * (`A`) from the pool's stableswap config, as a raw integer with no precision
   * scale. A larger `A` holds the price near par across a wider band of reserve
   * ratios. Required to compute stableswap swap output; ignored by other
   * curves.
   *
   * This is NOT `linearAmplificationFactor` above, which belongs to the v3
   * Stableswaps contract and carries the v3 `A_PRECISION` scale.
   */
  amplification?: bigint;
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
 * An indexed settings entry for a protocol, as served by the `protocols` query.
 * A single root-settings entry for v1/v3/stableswaps; several for v4 (root
 * settings plus the per-order-type OrderConfig and pool config entries),
 * distinguished by `label`. `values` is the decoded datum (fields vary by
 * label / version); `datum` is the raw inline CBOR.
 */
export interface ISundaeProtocolSetting {
  label: string;
  txIn: {
    hash: string;
    index: number;
  };
  datum: string;
  values: Record<string, unknown> | null;
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
  /** Indexed settings (present once the API serves it; may be undefined). */
  settings?: ISundaeProtocolSetting[];
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
  /** Indexed settings (present once the API serves it; may be undefined). */
  settings?: ISundaeProtocolSetting[];
}
