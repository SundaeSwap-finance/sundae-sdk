import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { Core } from "@blaze-cardano/sdk";
import { TxBuilderNftCheck } from "../TxBuilders/TxBuilder.NftCheck.class.js";
import { TxBuilderV1 } from "../TxBuilders/TxBuilder.V1.class.js";
import { TxBuilderV3 } from "../TxBuilders/TxBuilder.V3.class.js";
import { ISwapConfigArgs } from "./configs.js";
import type { TDestinationAddress } from "./datumbuilder.js";
import { TxBuilderStableswaps } from "../TxBuilders/TxBuilder.Stableswaps.class.js";

/**
 * The full list of calculated fees for a transaction built by a TxBuilder instance.
 */
export interface ITxBuilderFees {
  cardanoTxFee?: AssetAmount<IAssetAmountMetadata>;
  deposit: AssetAmount<IAssetAmountMetadata>;
  liquidity?: AssetAmount<IAssetAmountMetadata>;
  referral?: AssetAmount<IAssetAmountMetadata>;
  scooperFee: AssetAmount<IAssetAmountMetadata>;
}

export interface ITxBuilderSubmit {
  /** The CBOR encoded hex string of the transaction. Useful if you want to do something with it instead of submitting to the wallet. */
  cbor: string;
  /** Submits the CBOR encoded transaction to the connected wallet returns a hex encoded transaction hash. */
  submit: () => Promise<string>;
}

export interface ITxBuilderSign<BuiltTransaction> {
  /** The CBOR encoded hex string of the transaction. Useful if you want to do something with it instead of submitting to the wallet. */
  cbor: string;
  /** Requests a signature from the user and rebuilds the transaction with the witness set. */
  sign: () => Promise<ITxBuilderSubmit>;
  builtTx: BuiltTransaction;
}

/**
 * The primary top-level API surface for dealing with built TxBuilder transactions.
 */
export interface IComposedTx<
  Transaction = unknown,
  BuiltTransaction = unknown,
  Datum = string | undefined,
  Fees = Record<string, AssetAmount<IAssetAmountMetadata>>,
> {
  tx: Transaction;
  datum: Datum;
  fees: ITxBuilderFees & Fees;
  build: () => Promise<ITxBuilderSign<BuiltTransaction>>;
}

/**
 * The referral fee object if set.
 */
export interface ITxBuilderReferralFee {
  destination: string;
  payment: Core.Value;
  /** The label that prefixes the fee amount in the metadata. */
  feeLabel?: string;
}

/**
 * The contract version to be used when building transactions
 * of any time that interact with SundaeSwap contracts.
 */
export enum EContractVersion {
  V1 = "V1",
  V3 = "V3",
  NftCheck = "NftCheck",
  Condition = "Condition",
  Stableswaps = "Stableswaps",
  V4 = "V4",
}

/**
 * The invariant ("curve") module bound to a v4 pool, which determines its swap
 * math. v4 is module-composable, so unlike pre-v4 versions the swap behavior
 * isn't implied by the contract version alone. The identifier values match the
 * on-chain module identifiers surfaced by the GraphQL `Pool.modules` field.
 */
export enum EPoolCurve {
  ConstantProduct = "constant_product",
  ConstantSum = "constant_sum",
  ConcentratedLiquidity = "concentrated_liquidity",
  /**
   * The v4 stableswap invariant module: a Curve-style two-asset curve for
   * pegged pairs, priced on rated reserves with a `linear_amplification`.
   *
   * NOT `EContractVersion.Stableswaps`. That is the **v3 stableswap contract**
   * — a whole contract version with its own datum and transaction builders
   * (`DatumBuilder.Stableswaps`, `TxBuilder.Stableswaps`). This is one curve a
   * **v4** pool can bind, next to the three above. The estimator for this curve
   * is `V4StableswapPool` in `@sundaeswap/math`; the v3 one is
   * `StableSwapsPool`, and the two are not interchangeable.
   *
   * What the two versions SHARE is the amplification: one parameter, one field
   * (`IPoolData.linearAmplificationFactor`), one scale. What differs is that v3
   * stores `D` in the pool datum and has no per-asset rates, while v4 stores no
   * `D` and carries `rates`.
   */
  V4Stableswap = "stableswap",
  /**
   * The v4 banded concentrated-liquidity module: a ladder of sqrt-price
   * bands, each a concentrated-liquidity arc or a constant-sum bin with its
   * own share of the pool's liquidity and its own fees. LP is one fungible
   * token for the whole ladder. The estimator is
   * `BandedConcentratedLiquidityPool` in `@sundaeswap/math`; the single-range
   * `ConcentratedLiquidity` curve above was removed from the protocol.
   */
  BandedConcentratedLiquidity = "banded_concentrated_liquidity",
}

/**
 * A v4 leg of a chained swap. A v4 order is a pool-agnostic intent, so it
 * carries no pool: the scooper routes and splits it across any number of v4
 * pools inside ONE scoop. An arbitrarily long v4 tail is therefore a SINGLE
 * chain leg.
 */
export interface IChainLegV4 {
  /** Discriminator. A v4 leg is an intent, not a swap against one pool. */
  contractVersion: EContractVersion.V4;
  /**
   * What this leg may consume, overriding the preceding leg's MINIMUM
   * receivable.
   *
   * A chained leg's datum is fixed when the chain is placed, before the
   * previous leg has filled, so by default it can only name that leg's
   * guaranteed minimum. Anything the previous leg wins above it then arrives
   * in the UTxO unclaimed and is returned unconverted — the owner ends up
   * holding the intermediate asset, in proportion to their slippage setting.
   *
   * A v4 order's `offered` is an UPPER BOUND, not an exact amount: the
   * validator checks `consumed <= offered` per asset
   * (`check_basic_consumption`). Naming more than arrives does not make the
   * order unfillable — the scooper simply consumes what is there. So a chain
   * into v4 can state the EXPECTED fill and convert all of it.
   *
   * Only safe for a leg whose contract bounds consumption this way. v1 and v3
   * cannot overstate what they offer, which is why this is a per-leg override
   * rather than the default.
   *
   * `minReceived` must then be calibrated against the PESSIMISTIC path — what
   * the previous leg's minimum converts to — because it is an absolute floor
   * checked gross, not a proportion of what arrived. Pairing an optimistic
   * `offered` with an optimistic floor leaves the order unable to fill
   * whenever the previous leg underfills.
   */
  offered?: AssetAmount<IAssetAmountMetadata>;
  /** The minimum the owner will accept, per asset. */
  minReceived:
    | AssetAmount<IAssetAmountMetadata>
    | AssetAmount<IAssetAmountMetadata>[];
  /**
   * Lifetime service-fee allocation, in lovelace. This ADA must ARRIVE with
   * the order, so the preceding leg forwards it.
   */
  budget?: bigint;
  /**
   * Per-scoop fee cap, and this leg's routing fan-out budget. For a chained
   * leg this is the v4 tail's SHARE of the caller's total fee budget, not the
   * whole of it.
   */
  maxPerExecution?: bigint;
  configToken?: string;
  referralFee?: ITxBuilderReferralFee;
}

/** A legacy (v1 / v3 / stableswap / nft-check) leg of a chained swap. */
export type TChainLegLegacy = Omit<
  ISwapConfigArgs,
  "suppliedAsset" | "orderAddresses" | "ownerAddress"
>;

/** One leg of a chained swap, after the first. */
export type TChainLeg = TChainLegLegacy | IChainLegV4;

/**
 * Special arguments for an Order-Route Swap. A combination of
 * two swap arguments, but simplified for ease-of-use.
 *
 * `swapB` may be a legacy swap against one pool, or a v4 intent
 * ({@link IChainLegV4}) that absorbs the whole v4 tail of a route.
 */
export interface IOrderRouteSwapArgs {
  ownerAddress: string;
  swapA: Omit<ISwapConfigArgs, "orderAddresses" | "ownerAddress">;
  swapB: TChainLeg;
  /** Final payout destination. Defaults to `ownerAddress`. */
  destination?: TDestinationAddress;
}

export type TTxBuilder =
  | TxBuilderV1
  | TxBuilderV3
  | TxBuilderNftCheck
  | TxBuilderStableswaps;
