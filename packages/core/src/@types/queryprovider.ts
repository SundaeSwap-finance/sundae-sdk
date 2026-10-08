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
    /**
     * The LP supply the pool's own invariant is denominated in — the
     * denominator for any deposit, withdrawal or liquidity-depth calculation.
     *
     * For a v4 pool this is the pool datum's `total_lp`: circulating LP plus
     * the protocol's earned-but-unharvested fees. It is NOT the circulating
     * supply alone. Every v4 curve module reads `total_lp`, and concentrated
     * liquidity uses it as its liquidity term `L`, so a client that substitutes
     * the circulating figure computes against a different pool than the chain
     * will validate.
     *
     * For pre-v4 pools there is no separate fee accounting and the two figures
     * are equal, so the meaning is uniform across versions.
     */
    lpTotal: bigint;
  };
  version: EContractVersion;
  conditionDatum?: string;
  protocolFee?: number;
  /**
   * The stableswap amplification factor `A`, for BOTH the v3 Stableswaps
   * contract and the v4 stableswap curve. One parameter, one field, both
   * versions.
   *
   * It is the raw integer the pool stores, with no precision scale applied.
   * Each implementation applies its own scaling internally: v3's
   * `StableSwapsPool` multiplies by its `A_PRECISION`, and the v4 curve uses
   * the integer as it stands. Verified against live data — `V4StableswapPool.getD`
   * at this value reproduces the API's own `sumInvariant` exactly for the
   * preview pool `ac8d4b1b…` (A = 200).
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
   * compute stableswap swap output; empty for every other curve.
   *
   * The amplification the curve also needs is `linearAmplificationFactor`
   * above, which serves v3 and v4 alike. `rates` is the v4-only half.
   */
  rates?: [bigint, bigint];
  /**
   * For v4 banded concentrated-liquidity pools, the ladder in ascending price
   * order. Band i spans sqrt-prices `[bands[i].start, bands[i+1].start)`; the
   * last band ends at `bandClosing`. Required to compute banded swap output;
   * empty for every other curve.
   */
  bands?: IPoolBand[];
  /** For v4 banded pools, the ladder's top sqrt-price edge as `[num, den]`. */
  bandClosing?: [bigint, bigint];
  /** For v4 banded pools, the zero-based band holding the current price. */
  activeBand?: number;
  /**
   * For v4 banded pools, the ladder counter X: band i's liquidity is
   * `floor(bands[i].weight · X / bandWeightTotal)`. Seeds the witness search
   * when quoting; a stale value is recovered from.
   */
  bandCounter?: bigint;
  /** For v4 banded pools, the sum of every band's `weight`. */
  bandWeightTotal?: bigint;
}

/** One band of a v4 banded concentrated-liquidity pool's ladder. */
export interface IPoolBand {
  /** The band's lower sqrt-price edge as `[num, den]`. */
  start: [bigint, bigint];
  /** The band's share of the ladder's liquidity counter. */
  weight: bigint;
  /** 0 = concentrated-liquidity arc, 1 = constant-sum bin. */
  curve: 0 | 1;
  /** Fee on swaps that buy the pool's first asset, as `[num, den]`. */
  feeBuy: [bigint, bigint];
  /** Fee on swaps that sell the pool's first asset, as `[num, den]`. */
  feeSell: [bigint, bigint];
  /**
   * What the band holds at the pool's current reserves, in `[assetA, assetB]`
   * order; the bands sum to the pool's reserves. Empty when the API could not
   * place the reserves on the ladder.
   */
  quantities?: [bigint, bigint];
  /** The band's liquidity, `floor(weight · bandCounter / bandWeightTotal)`. */
  liquidity?: bigint;
  /** Whether this is the band the current price sits in. */
  active?: boolean;
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
