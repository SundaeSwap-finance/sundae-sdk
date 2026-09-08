import { parse } from "@blaze-cardano/data";
import { Blaze, Core, makeValue, Provider, Wallet } from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import type {
  ICancelConfigArgs,
  IComposedTx,
  ISundaeProtocolParamsFull,
  ISundaeProtocolReference,
  ISundaeProtocolSetting,
  ISundaeProtocolValidatorFull,
  ITxBuilderFees,
  ITxBuilderReferralFee,
  TSupportedNetworks,
  TUTXO,
} from "../@types/index.js";
import { EContractVersion } from "../@types/index.js";
import { CancelConfig } from "../Configs/CancelConfig.class.js";
import { EDatumType, TDestinationAddress } from "../@types/datumbuilder.js";
import { TxBuilderAbstractV4 } from "../Abstracts/TxBuilderAbstract.V4.class.js";
import { ADA_METADATA, ORDER_DEPOSIT_DEFAULT } from "../constants.js";
import { V4Types } from "../DatumBuilders/ContractTypes/index.js";
import {
  DatumBuilderV4,
  EV4BasicConstraint,
} from "../DatumBuilders/DatumBuilder.V4.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";

type TBlazeTx = ReturnType<Blaze<Provider, Wallet>["newTransaction"]>;

/**
 * The validator titles the v4 builder resolves out of the protocol params
 * (via the Sundae API `protocols` query — the same source V3 uses). These are
 * the deployment's canonical module keys, matching the `V4` entry in the
 * `*-sundae-protocol--protocol` table, which is populated from the sundae-v4
 * deployment blueprint (`<network>-blueprint.json`) — dotted `module.purpose`
 * titles matching the V1/V3/Stableswaps convention (`pool.mint`,
 * `order.spend`, …), not the kebab-case names the scooper's own config uses.
 */
export const V4_VALIDATORS = {
  /** The order spend validator — its hash forms the order script address. */
  order: "order.spend",
  /** The swap-order constraint module — keyed in a Swap order's constraints. */
  swapConstraint: "swap_order.withdraw",
  /** The basic-order constraint module — keyed in Deposit/Withdraw/Claim orders. */
  basicConstraint: "basic_order.withdraw",
  /** The route-order constraint module — required by swap (and strategy) orders. */
  routeConstraint: "route_order.withdraw",
  /** The strategy-order constraint module — keyed in a strategy order's constraints. */
  strategyConstraint: "strategy_order.withdraw",
  /** The fairness-order constraint module — required by every order type. */
  fairnessConstraint: "fairness_order.withdraw",
  /** The fee constraint — the once-per-scoop service-fee aggregator required
   *  by the audited `trade + fee` order packages (docs/fee-system.md). */
  feeConstraint: "fee_constraint.withdraw",
  /** The pool NFT minting policy. */
  poolMint: "pool.mint",
  /** The pool spend validator — its hash is the pool script address. */
  pool: "pool.spend",
  /** The constant-sum curve module. */
  constantSum: "constant_sum.withdraw",
  /** The fee-split module carried by every pool. */
  feeSplit: "fee_split.withdraw",
  /** The fairness pool module (distinct from the `fairness_order` constraint). */
  fairnessModule: "fairness.withdraw",
} as const;

/**
 * Default order economics (see sundae-v4 docs/fee-system.md). Callers can
 * override per order.
 *
 * `DEFAULT_BUDGET` is the lifetime `service_budget`; at 3 ADA it funds one
 * partial fill plus a terminal settlement at the default cap.
 * `DEFAULT_MAX_PER_EXECUTION` is the per-scoop cap — the flat fee a terminal
 * fill settles at, and what buys the scooper's routing fan-out (2 ADA covers
 * `baseFee + 2·feePerStep` at the current fee settings, i.e. up to a 2-pool
 * route). Used only when the fee-settings node can't be resolved.
 */
const DEFAULT_BUDGET = 3_000_000n;
const DEFAULT_MAX_PER_EXECUTION = 2_000_000n;

/** Min-ADA overhead for a token-only pool UTxO (no ADA reserve). */
const POOL_MIN_ADA = 3_000_000n;
/** Min-ADA for the CIP-68 reference-token output parked at the pool address. */
const POOL_REF_MIN_ADA = 2_000_000n;

/**
 * The settings `label` of the OrderConfig entry each order type fulfills. Used
 * to resolve an order's `config_token` from the protocol query's indexed
 * settings when the caller doesn't pass one explicitly.
 */
export const V4_ORDER_CONFIG_LABEL = {
  swap: "swap-order",
  basic: "basic-order",
  strategy: "strategy-order",
} as const;

/**
 * Shared shape for placing a v4 order. `budget` is the max batcher fee the
 * order will pay (lovelace); `configToken` is the asset name of the OrderConfig
 * settings entry this order's constraints must satisfy. Both are protocol/
 * settings-derived; until the protocol query exposes them they are supplied
 * here explicitly.
 */
export interface IOrderV4Base {
  /** The order owner (bech32). Also the default payout destination. */
  ownerAddress: string;
  /** Where fills pay out. Defaults to a `Fixed` destination at `ownerAddress`. */
  destination?: TDestinationAddress | "Self";
  /**
   * Lifetime service-fee allocation (`service_budget`), in lovelace. Defaults
   * to `DEFAULT_BUDGET` (3 ADA).
   */
  budget?: bigint;
  /**
   * Flat per-scoop fee cap (`max_per_execution`), in lovelace — also the
   * terminal-settlement amount, and the scooper's routing-fan-out budget
   * (`maxPerExecution / costPerPool` pools). Defaults to
   * `baseFee + 2·feePerStep` from the protocol's fee settings, falling back to
   * `DEFAULT_MAX_PER_EXECUTION` (2 ADA). Too small a value makes the order
   * unroutable: below `baseFee` the scooper can't afford a single pool.
   */
  maxPerExecution?: bigint;
  /**
   * The OrderConfig settings-entry asset name whose `required_constraints` this
   * order fulfills. Optional — when omitted it is resolved from the protocol
   * query's indexed settings (the entry labeled `swap-order` / `basic-order`).
   * Pass it explicitly to override, or if the API isn't serving settings yet.
   */
  configToken?: string;
  referralFee?: ITxBuilderReferralFee;
}

/** Arguments for placing a v4 swap order via `TxBuilderV4.swap`. */
export interface ISwapV4Args extends IOrderV4Base {
  /** The asset (and amount) being offered into the swap. */
  offered: AssetAmount<IAssetAmountMetadata>;
  /** The minimum the owner will accept, per asset. */
  minReceived:
    | AssetAmount<IAssetAmountMetadata>
    | AssetAmount<IAssetAmountMetadata>[];
}

/** Arguments for placing a v4 basic order via `TxBuilderV4.basic`/`deposit`/`withdraw`. */
export interface IBasicV4Args extends IOrderV4Base {
  /** Deposit / Withdraw / Claim. */
  type: EV4BasicConstraint;
  /** The assets (and amounts) offered. */
  offered: AssetAmount<IAssetAmountMetadata>[];
  /** The minimum received, per asset. */
  minReceived: AssetAmount<IAssetAmountMetadata>[];
}

/**
 * Arguments for placing a v4 strategy order via `TxBuilderV4.strategy`. The
 * order locks the offered assets; a designated strategist later signs a
 * `StrategyExecution` (off-chain) that the scooper fills. The order carries the
 * full `[strategy-order, route-order, fairness-order]` constraint set.
 */
export interface IStrategyV4Args extends IOrderV4Base {
  /** The assets (and amounts) locked for the strategy to execute against. */
  offered: AssetAmount<IAssetAmountMetadata>[];
  /**
   * The party authorized to sign executions — a bech32 address (single-`Signature`
   * auth) or an explicit `MultisigScript` for richer authorization.
   */
  authSigner: string | V4Types.MultisigScript;
  /**
   * Allowed final payout destinations an execution may route to (an execution
   * picks one by index, or falls back to the order's own destination).
   * Defaults to `[]`.
   */
  finalDestinations?: TDestinationAddress[];
}

/**
 * The replacement order for an {@link TxBuilderV4.update} — a fresh swap or
 * basic order placed in the same transaction that cancels the old one. The
 * `kind` discriminator selects which constraint set the new order carries.
 */
/**
 * The order shapes an update may produce. No `swap` member: an update cancels
 * and re-places, so replacing a route order is placing one, and that is outside
 * the audited surface (see {@link TxBuilderV4.swap}). An existing route order
 * can still be cancelled.
 */
export type TUpdateV4Order = { kind: "basic" } & IBasicV4Args;

/**
 * Arguments for placing several basic orders in one transaction via
 * {@link TxBuilderV4.batch}.
 */
export interface IBatchV4Args {
  /**
   * The orders to place. Each carries its own type, offered assets and
   * minimums; their `referralFee` fields are ignored in favour of the batch's.
   */
  orders: IBasicV4Args[];
  /** Taken once for the whole batch, not per order. */
  referralFee?: ITxBuilderReferralFee;
}

/** Arguments for updating a v4 order via {@link TxBuilderV4.update}. */
export interface IUpdateV4Args {
  /** The order UTxO being replaced — spent via the order validator's Cancel path. */
  cancelUtxo: TUTXO;
  /** The replacement order (swap or basic) locked in the same transaction. */
  order: TUpdateV4Order;
}

/** A `Rational` fraction (`num/den`) as used by v4 module configs. */
export interface IFractionV4 {
  num: bigint;
  den: bigint;
}

/**
 * The curve (pool kind) for {@link TxBuilderV4.mintPool}. A discriminated union
 * so new curves slot in without changing the call shape. Only `constantSum` is
 * wired today; `constantProduct`/`concentratedLiquidity` are reserved.
 */
export type TPoolCurveV4 = {
  kind: "constantSum";
  /** Per-asset price weights (defaults to all `1n`, i.e. equal-valued assets). */
  prices?: bigint[];
  /** The pool's swap fee. */
  fee: IFractionV4;
  /** Rebalance-bounty rate; defaults to `fee / 2`. Pass `{num:0n,den:1n}` to disable. */
  bountyK?: IFractionV4;
  /** Whether tag-5 claim steps waive the LP fee on the embedded swap. */
  waiveFeeOnClaim?: boolean;
};

/** Arguments for creating a v4 pool via {@link TxBuilderV4.mintPool}. */
export interface IMintPoolV4Args {
  /** The initial reserves — at least two distinct assets. */
  assets: AssetAmount<IAssetAmountMetadata>[];
  /** The curve (pool kind) and its config. */
  curve: TPoolCurveV4;
  /** The pool creator (bech32) — funds the seed UTxO and receives the circulating LP. */
  ownerAddress: string;
  /**
   * Override the initial circulating LP supply (also the preminted buffer). When
   * omitted it is computed per curve — for constant-sum, `Σ price_i·reserve_i`.
   */
  totalLp?: bigint;
  referralFee?: ITxBuilderReferralFee;
}

/**
 * A decoded v4 pool — the shape returned by {@link TxBuilderV4.getPoolByIdent}.
 * Unlike the 2-asset `IPoolData`, this represents the full v4 `PoolDatum`
 * (2–16 assets for constant-sum) and the CIP-68 LP/NFT asset ids, so callers
 * can build deposit/withdraw orders against it.
 */
export interface IPoolV4 {
  /** The pool identifier (28-byte hex). */
  ident: string;
  /** Reserves, in pool-datum order. `assetId` is `policy.name` (`ada.lovelace` for ADA). */
  assets: Array<{ assetId: string; quantity: bigint }>;
  /** LP accounting from the pool datum. */
  totalLp: bigint;
  circulatingLp: bigint;
  premintedLp: bigint;
  /** The pool's LP token (`policy.name`), i.e. the `333` asset. */
  lpAssetId: string;
  /** The pool's NFT (`policy.name`), i.e. the `222` asset. */
  nftAssetId: string;
  /** The live pool UTxO. */
  utxo: Core.TransactionUnspentOutput;
}

/**
 * `TxBuilderV4` builds transactions against the sundae-v4 protocol.
 *
 * v4 is a module-composable redesign: swap math (curve), authorization, and fee
 * policy are pluggable withdraw-validator modules rather than hardcoded into the
 * pool. Order placement is a generic `OrderDatum` carrying a list of
 * `(module_hash, data)` constraints; `swap`/`deposit`/`withdraw` are convenience
 * wrappers that attach the appropriate constraint via {@link DatumBuilderV4}.
 *
 * Deployment addresses/hashes (order validator, constraint modules, pool policy)
 * are resolved from `getProtocolParams()` — the Sundae API `protocols` query
 * filtered to {@link EContractVersion.V4}. That entry must be present for these
 * methods to run; the titles resolved are {@link V4_VALIDATORS}.
 *
 * @extends {TxBuilderAbstractV4}
 */
export class TxBuilderV4 extends TxBuilderAbstractV4 {
  contractVersion: EContractVersion = EContractVersion.V4;
  datumBuilder: DatumBuilderV4;
  queryProvider: QueryProviderSundaeSwap;
  network: TSupportedNetworks;
  protocolParams: ISundaeProtocolParamsFull | undefined;
  settings: ISundaeProtocolSetting[] | undefined;
  tracing: boolean = false;

  constructor(
    public blaze: Blaze<Provider, Wallet>,
    queryProvider?: QueryProviderSundaeSwap,
  ) {
    super();
    const resolvedNetwork = SundaeUtils.getNetworkFromProvider(
      blaze.provider.networkName,
    );
    this.network = resolvedNetwork;
    this.queryProvider =
      queryProvider ?? new QueryProviderSundaeSwap(resolvedNetwork);
    this.datumBuilder = new DatumBuilderV4(resolvedNetwork);
  }

  public enableTracing(enable: boolean): TxBuilderV4 {
    this.tracing = enable;
    return this;
  }

  public newTxInstance(): TBlazeTx {
    const instance = this.blaze.newTransaction();
    instance.enableTracing(this.tracing);
    return instance;
  }

  // -- Protocol params ------------------------------------------------

  public async getProtocolParams(): Promise<ISundaeProtocolParamsFull> {
    if (!this.protocolParams) {
      this.protocolParams =
        await this.queryProvider.getProtocolParamsWithScripts(
          this.contractVersion,
        );
    }

    if (!this.protocolParams) {
      throw new Error(
        "No v4 protocol parameters were found. The Sundae API must expose a " +
          "protocol entry with `version: V4` (validators + references) for the " +
          "v4 builder to resolve deployment addresses.",
      );
    }

    return this.protocolParams;
  }

  public async getValidatorScript(
    name: string,
  ): Promise<ISundaeProtocolValidatorFull> {
    const { blueprint } = await this.getProtocolParams();
    const result = blueprint.validators.find(({ title }) => title === name);
    if (!result) {
      throw new Error(
        `Could not find a validator that matched the key: ${name}`,
      );
    }
    return result;
  }

  public async getReferenceScript(
    key: string,
  ): Promise<ISundaeProtocolReference> {
    const { references } = await this.getProtocolParams();
    const match = references.find((ref) => ref.key === key);
    if (!match) {
      throw new Error(`Could not find reference input with key: ${key}`);
    }
    return match;
  }

  /**
   * The protocol's indexed settings (root settings + v4 OrderConfig registry).
   * Returns `[]` if the API isn't serving settings yet — callers must then pass
   * `configToken` explicitly.
   */
  public async getSettings(): Promise<ISundaeProtocolSetting[]> {
    if (!this.settings) {
      const fetched = await this.queryProvider.getProtocolSettings(
        this.contractVersion,
      );
      // Only cache a real result. `undefined` means the API didn't serve
      // settings (transient error or not-yet-migrated env) — return `[]` without
      // caching so a later call in the same instance can retry.
      if (fetched === undefined) {
        return [];
      }
      this.settings = fetched;
    }
    return this.settings;
  }

  /**
   * Builds an order's `(hash, data)` constraint list from its OrderConfig
   * entry's on-chain `required_constraints` — the order validator requires an
   * exact match, and which constraints a package carries is deployment-defined
   * (the audited launch packages are `trade + fee`; earlier deployments used
   * `trade + fairness`). The primary (trade) constraint's data is supplied by
   * the caller; every other known constraint takes its canonical filler:
   * fairness/fee → Void, route → an empty (any-pool) whitelist.
   */
  private async resolveOrderConstraints(
    configToken: string,
    primary: [hash: string, data: Core.PlutusData],
    fallback: Array<[keyof typeof V4_VALIDATORS, () => Core.PlutusData]>,
  ): Promise<Array<[string, Core.PlutusData]>> {
    const settings = await this.getSettings();
    const entry = settings.find(
      (st) =>
        (st.values?.token as string | undefined) === configToken && st.datum,
    );
    if (!entry) {
      // A caller-supplied token the API doesn't index (e.g. a custom config
      // on a dev deployment): keep the legacy package for the order type.
      const rest = await Promise.all(
        fallback.map(
          async ([name, make]): Promise<[string, Core.PlutusData]> => {
            const { hash } = await this.getValidatorScript(V4_VALIDATORS[name]);
            return [hash, make()];
          },
        ),
      );
      return [primary, ...rest];
    }
    const config = parse(
      V4Types.OrderConfig,
      Core.PlutusData.fromCbor(Core.HexBlob(entry.datum as string)),
    );
    const [primaryHash, primaryData] = primary;
    const fillers: Array<[keyof typeof V4_VALIDATORS, () => Core.PlutusData]> =
      [
        ["fairnessConstraint", () => DatumBuilderV4.buildVoidData()],
        ["feeConstraint", () => DatumBuilderV4.buildVoidData()],
        ["routeConstraint", () => emptyListData()],
      ];
    const fillerHashes = new Map<string, () => Core.PlutusData>();
    for (const [name, make] of fillers) {
      try {
        const { hash } = await this.getValidatorScript(V4_VALIDATORS[name]);
        fillerHashes.set(hash, make);
      } catch {
        // Not part of this deployment — it can't appear in
        // required_constraints either.
      }
    }
    return config.required_constraints.map(
      (hash: string): [string, Core.PlutusData] => {
        if (hash === primaryHash) return [hash, primaryData];
        const make = fillerHashes.get(hash);
        if (!make) {
          throw new Error(
            `OrderConfig ${configToken} requires constraint ${hash}, which is ` +
              "not a module this SDK knows how to satisfy.",
          );
        }
        return [hash, make()];
      },
    );
  }

  /**
   * Resolves an order type's `config_token` (the value an order sets as its
   * `config_token`) from the indexed settings, by the OrderConfig entry's label.
   */
  public async getOrderConfigToken(label: string): Promise<string> {
    const settings = await this.getSettings();
    const entry = settings.find((s) => s.label === label);
    const token = entry?.values?.token;
    if (typeof token !== "string") {
      throw new Error(
        `Could not resolve the "${label}" OrderConfig token from the protocol ` +
          `settings. Either the API isn't serving v4 settings yet, or the entry ` +
          `is missing — pass \`configToken\` explicitly to the order.`,
      );
    }
    return token;
  }

  /**
   * Fetches a v4 pool by its `ident`: resolves the live pool UTxO by its `222`
   * NFT and decodes the `PoolDatum`. Returns the reserves (2–16 assets), LP
   * accounting, and the CIP-68 LP/NFT asset ids — everything a caller needs to
   * build a deposit/withdraw order against the pool. See {@link IPoolV4}.
   */
  public async getPoolByIdent(ident: string): Promise<IPoolV4> {
    const poolMint = await this.getValidatorScript(V4_VALIDATORS.poolMint);
    const { nft, lp } = DatumBuilderV4.cip68Names(ident);
    const nftUnit = poolMint.hash + nft;
    const utxo = await this.blaze.provider.getUnspentOutputByNFT(
      Core.AssetId(nftUnit),
    );
    const inline = utxo.output().datum()?.asInlineData();
    if (!inline) {
      throw new Error(
        `getPoolByIdent: pool UTxO for ${ident} has no inline datum.`,
      );
    }
    const datum = parse(V4Types.PoolDatum, inline);
    const toAssetId = (ac: { policy: string; name: string }) =>
      ac.policy === "" ? "ada.lovelace" : `${ac.policy}.${ac.name}`;
    return {
      ident,
      assets: datum.assets.map(([ac, qty]) => ({
        assetId: toAssetId(ac),
        quantity: qty,
      })),
      totalLp: datum.total_lp,
      circulatingLp: datum.circulating_lp,
      premintedLp: datum.preminted_lp,
      lpAssetId: `${poolMint.hash}.${lp}`,
      nftAssetId: `${poolMint.hash}.${nft}`,
      utxo,
    };
  }

  /**
   * The order script address: the order validator's hash as the payment
   * credential, with the owner's stake credential attached (when present) so
   * placed orders stay delegated to the owner's pool.
   */
  public async getOrderScriptAddress(ownerAddress?: string): Promise<string> {
    const { hash } = await this.getValidatorScript(V4_VALIDATORS.order);
    const networkId = this.network === "mainnet" ? 1 : 0;

    const enterprise = Core.addressFromCredential(
      networkId,
      Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16(hash),
        type: Core.CredentialType.ScriptHash,
      }),
    ).toBech32();

    const ownerStakeCred = ownerAddress
      ? Core.addressFromBech32(ownerAddress).asBase()?.getStakeCredential()
      : undefined;
    if (!ownerStakeCred) {
      return enterprise;
    }

    // The address type must match the owner's stake-credential type — a script
    // stake credential needs `BasePaymentScriptStakeScript`, not `...StakeKey`.
    const stakeIsScript =
      ownerStakeCred.type === Core.CredentialType.ScriptHash;
    return new Core.Address({
      type: stakeIsScript
        ? Core.AddressType.BasePaymentScriptStakeScript
        : Core.AddressType.BasePaymentScriptStakeKey,
      paymentPart: {
        hash: Core.Hash28ByteBase16(hash),
        type: Core.CredentialType.ScriptHash,
      },
      delegationPart: ownerStakeCred,
      networkId,
    }).toBech32();
  }

  // -- Order placement ------------------------------------------------

  /**
   * NOT IMPLEMENTED — use {@link swapIntent}.
   *
   * A swap order carries the route constraint, which validates a strictly
   * serial chain on-chain. That module is outside the launch's audited surface,
   * so this builder will not construct one: an unaudited validator that nothing
   * can reach is a validator nobody has to trust.
   *
   * The name is kept, and throws, on purpose. It is the method an integrator
   * reaches for first, and failing loudly with a pointer is better than either
   * a missing method (which reads as "v4 cannot swap") or a silent build
   * against a validator we are not standing behind.
   *
   * Returns when the route module is audited and route orders are supported.
   */
  public async swap(_args: ISwapV4Args): Promise<never> {
    throw new Error(
      "TxBuilderV4.swap is not implemented: swap orders carry the route " +
        "constraint, which is not part of the audited launch surface. Use " +
        "swapIntent(), which places the same trade as a basic order.",
    );
  }

  /**
   * Places a v4 swap.
   *
   * An INTENT, which is what a v4 order is: an offer and a floor, naming no
   * pool. The scooper decides how to fill it — one pool, a split across a
   * pair's pools, or a multi-hop chain — and `minReceived` is what bounds the
   * result. Nothing here mentions routes, reserves or curves, because the order
   * does not.
   *
   * The route constraint that {@link swap} carries enforces strictly serial
   * routing on-chain (each hop's output is consumed by the next), so it cannot
   * represent a parallel same-pair split. A basic order carries only
   * `[basic-order, fairness-order]` (no route), leaving the aggregate
   * consumption bound + the `minReceived` floor as the sole on-chain checks — so
   * the scooper is free to fan the fill out across pools. Because `minReceived`
   * is set from the *blended* quote (tighter than any single pool can deliver),
   * the floor itself bounds how far a fill can deviate from the intended split.
   *
   * A basic order settles single-shot to a `Fixed` destination (no partial
   * fills) — a market swap, not a resting/limit order. Route a serial fill
   * (single pool, or a genuine multi-hop chain across different pairs) through
   * {@link swap} instead, to keep its on-chain anti-skim guarantee.
   */
  public async swapIntent(
    args: ISwapV4Args,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    const minReceived = Array.isArray(args.minReceived)
      ? args.minReceived
      : [args.minReceived];
    return this.basic({
      ...args,
      type: EV4BasicConstraint.Swap,
      offered: [args.offered],
      minReceived,
    });
  }

  /**
   * Places a v4 basic order — `Deposit`, `Withdraw`, or `Claim` (per
   * `args.type`).
   *
   * A basic order's required constraint set (per the basic `OrderConfig`) is
   * `[basic-order, fairness-order]` — note there is no route constraint:
   *   - basic-order: the `BasicFields` payload (Constr 0/1/3)
   *   - fairness-order: `Void`
   */
  public async basic(
    args: IBasicV4Args,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    const { offered, constraints, configToken } =
      await this.buildBasicPlacement(args);
    return this.placeOrder({ ...args, configToken }, offered, constraints);
  }

  /**
   * Resolves a basic order's offered assets, constraint set, and `config_token`
   * — shared by {@link basic} and {@link update}. A basic order carries
   * `[basic-order, fairness-order]` (no route constraint).
   */
  private async buildBasicPlacement(args: IBasicV4Args): Promise<{
    offered: AssetAmount<IAssetAmountMetadata>[];
    constraints: Array<[string, Core.PlutusData]>;
    configToken: string;
  }> {
    const basicData = this.datumBuilder.buildBasicConstraintData({
      type: args.type,
      offered: args.offered,
      minReceived: args.minReceived,
    });

    const [basicHash] = await this.getValidatorHashes([
      V4_VALIDATORS.basicConstraint,
    ]);

    const configToken =
      args.configToken ??
      (await this.getOrderConfigToken(V4_ORDER_CONFIG_LABEL.basic));

    return {
      offered: args.offered,
      constraints: await this.resolveOrderConstraints(
        configToken,
        [basicHash, basicData],
        [["fairnessConstraint", () => DatumBuilderV4.buildVoidData()]],
      ),
      configToken,
    };
  }

  /**
   * Places a v4 strategy order. The order locks the offered assets and names a
   * strategist (`authSigner`) authorized to sign the `StrategyExecution` the
   * scooper later fills. It carries the full `[strategy-order, route-order,
   * fairness-order]` constraint set, matching the strategy `OrderConfig`.
   */
  public async strategy(
    args: IStrategyV4Args,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    const auth =
      typeof args.authSigner === "string"
        ? this.datumBuilder.buildOwnerDatum(args.authSigner).schema
        : args.authSigner;
    const finalDestinations = (args.finalDestinations ?? []).map(
      (d) => this.datumBuilder.buildDestinationAddresses(d).schema,
    );
    const strategyData = this.datumBuilder.buildStrategyConstraintData({
      auth,
      finalDestinations,
    });

    const [strategyHash] = await this.getValidatorHashes([
      V4_VALIDATORS.strategyConstraint,
    ]);

    const configToken =
      args.configToken ??
      (await this.getOrderConfigToken(V4_ORDER_CONFIG_LABEL.strategy));

    return this.placeOrder(
      { ...args, configToken },
      args.offered,
      await this.resolveOrderConstraints(
        configToken,
        [strategyHash, strategyData],
        [
          ["routeConstraint", () => emptyListData()],
          ["fairnessConstraint", () => DatumBuilderV4.buildVoidData()],
        ],
      ),
    );
  }

  /** Resolves several validator hashes from the protocol params in one pass. */
  private async getValidatorHashes(names: string[]): Promise<string[]> {
    return Promise.all(
      names.map(async (name) => (await this.getValidatorScript(name)).hash),
    );
  }

  /** Deposit is a basic order whose min-received names the pool's LP asset. */
  public async deposit(
    args: Omit<IBasicV4Args, "type">,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    return this.basic({ ...args, type: EV4BasicConstraint.Deposit });
  }

  /** Withdraw is a basic order whose offered asset is the pool's LP asset. */
  public async withdraw(
    args: Omit<IBasicV4Args, "type">,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    return this.basic({ ...args, type: EV4BasicConstraint.Withdraw });
  }

  /**
   * Claim is a basic order that collects a pool's accrued claimables (e.g. a
   * constant-sum pool's bounty) rather than trading against its reserves.
   */
  public async claim(
    args: Omit<IBasicV4Args, "type">,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    return this.basic({ ...args, type: EV4BasicConstraint.Claim });
  }

  /**
   * Places SEVERAL basic orders in one transaction.
   *
   * Some intents are irreducibly plural: covering a stretch of the price line
   * with concentrated liquidity means depositing into every pool whose range it
   * touches, and those are separate orders because they are separate pools. One
   * order per transaction would mean one wallet signature per pool, and a
   * partially-signed set leaves the position half-built.
   *
   * Every order is locked onto the same transaction, and the reported deposit
   * and scooper fee are the SUMS across them — each order reserves its own
   * budget, so a batch of five costs five budgets, not one.
   *
   * `datum` on the result is the first order's, since the shape carries a single
   * datum; the orders' own datums are each locked into their outputs. Referral
   * is taken once for the batch rather than per order — the per-order field is
   * ignored here, so a caller can't accidentally pay it N times.
   */
  public async batch(
    args: IBatchV4Args,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    if (!args.orders.length) {
      throw new Error("A batch needs at least one order.");
    }

    const tx = this.newTxInstance();
    let totalDeposit = 0n;
    let totalBudget = 0n;
    let firstDatum: string | undefined;

    // Sequential rather than concurrent: each call mutates the shared tx, and
    // the settings lookups behind them are cached after the first.
    for (const order of args.orders) {
      const { offered, constraints, configToken } =
        await this.buildBasicPlacement(order);
      const { inline, deposit, budget } = await this.lockOrderIntoTx(
        tx,
        { ...order, configToken, referralFee: undefined },
        offered,
        constraints,
      );
      firstDatum ??= inline;
      totalDeposit += deposit;
      totalBudget += budget;
    }

    if (args.referralFee) {
      tx.payAssets(
        Core.addressFromBech32(args.referralFee.destination),
        args.referralFee.payment,
      );
    }

    return this.completeTx({
      tx,
      datum: firstDatum as string,
      referralFee: args.referralFee?.payment,
      deposit: totalDeposit,
      scooperFee: totalBudget,
    });
  }

  /**
   * Shared placement primitive: assemble the `OrderDatum`, lock the offered
   * assets + the fee budget at the order script address, and complete. Exposed
   * (protected) so the datum/output assembly is unit-testable without a live
   * tx completion.
   */
  protected async placeOrder(
    args: IOrderV4Base & { configToken: string },
    offered: AssetAmount<IAssetAmountMetadata>[],
    constraints: Array<[string, Core.PlutusData]>,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    const tx = this.newTxInstance();
    const { inline, deposit, budget } = await this.lockOrderIntoTx(
      tx,
      args,
      offered,
      constraints,
    );

    return this.completeTx({
      tx,
      datum: inline,
      referralFee: args.referralFee?.payment,
      deposit,
      scooperFee: budget,
    });
  }

  /**
   * The default per-scoop fee cap for an order — `baseFee + 2·feePerStep` from
   * the protocol's indexed `fee-settings` node (enough for a 2-pool route),
   * falling back to {@link DEFAULT_MAX_PER_EXECUTION} when the API isn't
   * serving settings. Callers can override per order via `maxPerExecution`.
   */
  private async getDefaultMaxPerExecution(): Promise<bigint> {
    const settings = await this.getSettings();
    const fees = settings.find((s) => s.label === "fee-settings")?.values;
    try {
      const baseFee = fees?.baseFee;
      const feePerStep = fees?.feePerStep;
      if (baseFee != null && feePerStep != null) {
        return (
          BigInt(baseFee as string | number) +
          2n * BigInt(feePerStep as string | number)
        );
      }
      return DEFAULT_MAX_PER_EXECUTION;
    } catch {
      return DEFAULT_MAX_PER_EXECUTION;
    }
  }

  /**
   * Assembles the `OrderDatum` and locks the offered assets + fee budget at the
   * order script address on the given transaction, returning the inline datum,
   * the ADA deposit, and the reserved `budget`. Shared by {@link placeOrder} and
   * {@link update} (which locks the replacement order onto the same tx that
   * cancels the old one).
   */
  private async lockOrderIntoTx(
    tx: TBlazeTx,
    args: IOrderV4Base & { configToken: string },
    offered: AssetAmount<IAssetAmountMetadata>[],
    constraints: Array<[string, Core.PlutusData]>,
  ): Promise<{ inline: string; deposit: bigint; budget: bigint }> {
    const destination: TDestinationAddress | "Self" = args.destination ?? {
      address: args.ownerAddress,
      datum: { type: EDatumType.NONE },
    };

    const budget = args.budget ?? DEFAULT_BUDGET;
    const maxPerExecution =
      args.maxPerExecution ?? (await this.getDefaultMaxPerExecution());

    const { inline } = this.datumBuilder.buildOrderDatum({
      owner: args.ownerAddress,
      destination,
      budget,
      maxPerExecution,
      configToken: args.configToken,
      constraints,
    });

    const orderDeposit = ORDER_DEPOSIT_DEFAULT;
    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: offered,
      scooperFee: budget,
      orderDeposit,
    });

    const orderScriptAddress = await this.getOrderScriptAddress(
      args.ownerAddress,
    );

    if (args.referralFee) {
      tx.payAssets(
        Core.addressFromBech32(args.referralFee.destination),
        args.referralFee.payment,
      );
    }

    tx.lockAssets(
      Core.addressFromBech32(orderScriptAddress),
      makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      ),
      Core.PlutusData.fromCbor(Core.HexBlob(inline)),
    );

    return { inline, deposit: orderDeposit, budget };
  }

  // -- Cancel / Update ------------------------------------------------

  /**
   * Cancels an existing v4 order, returning its locked assets to the owner. The
   * order UTxO is spent through the order validator's `Cancel` path (redeemer
   * `Constr 0 []`), which only requires the datum `owner` multisig to be
   * satisfied — so the owner's key hash is added as a required signer.
   *
   * Note: order owners are keyed on the address's **stake** credential (see
   * {@link DatumBuilderV4.buildOwnerDatum}), so the resulting transaction must
   * carry a witness from the stake key. CIP-30 browser wallets provide this
   * automatically; a headless signer must opt in — e.g. blaze's
   * `HotWallet.signTransaction(tx, partialSign, signWithStakeKey=true)`.
   */
  public async cancel(
    args: ICancelConfigArgs,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    const { utxo, referralFee } = new CancelConfig(args).buildArgs();

    const tx = this.newTxInstance();
    const spendingDatum = await this.addOrderCancellation(tx, utxo);

    if (referralFee) {
      tx.payAssets(
        Core.addressFromBech32(referralFee.destination),
        referralFee.payment,
      );
    }

    return this.completeTx({
      tx,
      datum: spendingDatum,
      deposit: 0n,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Spends a v4 order UTxO via the order validator's `Cancel` path, adding the
   * order reference script and the owner's required signer to `tx`. Returns the
   * spent order's inline datum (CBOR). Shared by {@link cancel} and
   * {@link update}.
   */
  private async addOrderCancellation(
    tx: TBlazeTx,
    utxo: TUTXO,
  ): Promise<string> {
    const [utxoToSpend] = await this.blaze.provider.resolveUnspentOutputs([
      new Core.TransactionInput(
        Core.TransactionId(utxo.hash),
        BigInt(utxo.index),
      ),
    ]);
    if (!utxoToSpend) {
      throw new Error(
        `Could not resolve the order UTxO to cancel: ${utxo.hash}#${utxo.index}.`,
      );
    }

    const inlineDatum = utxoToSpend.output().datum()?.asInlineData();
    if (!inlineDatum) {
      throw new Error(
        "Cannot cancel a v4 order whose UTxO carries no inline datum.",
      );
    }
    const spendingDatum = inlineDatum.toCbor();

    const orderRef = await this.getReferenceScript(V4_VALIDATORS.order);
    const [refUtxo] = await this.blaze.provider.resolveUnspentOutputs([
      new Core.TransactionInput(
        Core.TransactionId(orderRef.txIn.hash),
        BigInt(orderRef.txIn.index),
      ),
    ]);
    if (!refUtxo) {
      throw new Error(
        `Could not resolve the v4 order reference script UTxO: ` +
          `${orderRef.txIn.hash}#${orderRef.txIn.index}.`,
      );
    }

    // The order validator's `Cancel` redeemer is constructor 0 with no fields,
    // identical in shape to the canonical Void datum.
    tx.addInput(utxoToSpend, DatumBuilderV4.buildVoidData());
    tx.addReferenceInput(
      Core.TransactionUnspentOutput.fromCbor(refUtxo.toCbor()),
    );

    const signerKey = DatumBuilderV4.getSignerKeyFromDatum(spendingDatum);
    if (signerKey) {
      tx.addRequiredSigner(Core.Ed25519KeyHashHex(signerKey));
    }

    return spendingDatum;
  }

  /**
   * Updates an order in place: cancels the existing order UTxO and locks a
   * fresh swap/basic order in the same transaction. The replacement carries its
   * own constraint set and `config_token`; the returned assets from the cancel
   * fund the new order's deposit/budget/offer (Blaze balances the difference).
   *
   * Like {@link cancel}, this spends a stake-keyed order, so the transaction
   * needs the owner's stake-key witness. CIP-30 browser wallets supply it via
   * the composed `sign()`; a headless signer (e.g. blaze `HotWallet`) must sign
   * with the stake key explicitly.
   */
  public async update(
    args: IUpdateV4Args,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    const tx = this.newTxInstance();
    await this.addOrderCancellation(tx, args.cancelUtxo);

    const { order } = args;
    const { offered, constraints, configToken } =
      await this.buildBasicPlacement(order);

    const { inline, deposit, budget } = await this.lockOrderIntoTx(
      tx,
      { ...order, configToken },
      offered,
      constraints,
    );

    return this.completeTx({
      tx,
      datum: inline,
      referralFee: order.referralFee?.payment,
      deposit,
      scooperFee: budget,
    });
  }

  /**
   * Creates (mints) a new v4 pool. Consumes a seed UTxO from the creator to
   * derive the pool `identifier`, mints the CIP-68 `100`/`222`/`333` tokens, and
   * writes the pool UTxO (reserves + NFT + the preminted LP buffer) with a
   * `PoolDatum` whose `actions` mirror the on-chain settings `PoolConfig`.
   *
   * Module handling is generic: it follows whatever the on-chain `PoolConfig`
   * references. The caller supplies only the curve config (fees/prices); every
   * other module's `Create` config is published in the settings
   * (`values.moduleConfigs`) and applied verbatim, and each module's reference
   * script is resolved by `hash → protocol-entry title → reference` — so a
   * different governance (or any) module hash on another network just works.
   * The circulating LP (issued to the creator via change) defaults to
   * `Σ price_i·reserve_i`; an equal amount is preminted into the pool.
   */
  public async mintPool(
    args: IMintPoolV4Args,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    if (args.curve.kind !== "constantSum") {
      throw new Error(
        `mintPool: only the "constantSum" curve is supported today (got "${args.curve.kind}").`,
      );
    }
    if (args.assets.length < 2 || args.assets.length > 16) {
      throw new Error(
        "mintPool: a constant-sum pool supports 2 to 16 assets (got " +
          `${args.assets.length}).`,
      );
    }
    const assetIds = args.assets.map((a) => a.metadata.assetId);
    if (new Set(assetIds).size !== assetIds.length) {
      throw new Error(
        "mintPool: pool assets must be distinct — a duplicate asset id was " +
          "supplied (the contract rejects duplicate pool assets).",
      );
    }

    const networkId = this.network === "mainnet" ? 1 : 0;

    // The curve module (user-chosen) is resolved by title; the pool + pool-mint
    // scripts by title too. The auxiliary modules are resolved generically from
    // whatever hashes the on-chain PoolConfig references.
    const [poolMintScript, curveScript, poolScript] = await Promise.all([
      this.getValidatorScript(V4_VALIDATORS.poolMint),
      this.getValidatorScript(V4_VALIDATORS.constantSum),
      this.getValidatorScript(V4_VALIDATORS.pool),
    ]);

    // The on-chain PoolConfig (for this curve) dictates the pool datum's
    // actions exactly, and publishes each module's Create config.
    const { poolValidator, actions, settingsTxIn, minSurplus, moduleConfigs } =
      await this.resolvePoolConfig(curveScript.hash);
    if (poolValidator !== poolScript.hash) {
      throw new Error(
        `mintPool: settings pool_validator (${poolValidator}) does not match ` +
          `the deployed pool hash (${poolScript.hash}).`,
      );
    }
    // The trade action (action[0]) must lead with the requested curve module.
    if (actions[0]?.modules[0] !== curveScript.hash) {
      throw new Error(
        "mintPool: the settings PoolConfig's first action must lead with the " +
          `constant-sum module (${curveScript.hash}).`,
      );
    }

    // Seed UTxO → pool identifier + CIP-68 asset names.
    const ownerUtxos = await this.blaze.provider.getUnspentOutputs(
      Core.addressFromBech32(args.ownerAddress),
    );
    const seed = ownerUtxos[0];
    if (!seed) {
      throw new Error(
        `mintPool: no UTxOs at ${args.ownerAddress} to seed the pool.`,
      );
    }
    const seedTxHash = seed.input().transactionId().toString();
    const seedIndex = Number(seed.input().index());
    const ident = DatumBuilderV4.computePoolIdent(seedTxHash, seedIndex);
    const {
      ref: refName,
      nft: nftName,
      lp: lpName,
    } = DatumBuilderV4.cip68Names(ident);

    // LP economics: circulating = Σ price·reserve (or override); premint equal.
    const prices = args.curve.prices ?? args.assets.map(() => 1n);
    if (prices.length !== args.assets.length) {
      throw new Error("mintPool: prices length must match assets length.");
    }
    if (prices.some((p) => p <= 0n)) {
      throw new Error("mintPool: every constant-sum price must be positive.");
    }
    // Fail fast on malformed rationals (the CS module requires den > 0, num >= 0).
    const isValidFraction = (f: IFractionV4) => f.den > 0n && f.num >= 0n;
    if (!isValidFraction(args.curve.fee)) {
      throw new Error(
        "mintPool: fee must be a non-negative fraction with a positive denominator.",
      );
    }
    if (args.curve.bountyK && !isValidFraction(args.curve.bountyK)) {
      throw new Error(
        "mintPool: bountyK must be a non-negative fraction with a positive denominator.",
      );
    }
    const circulatingLp =
      args.totalLp ??
      args.assets.reduce((sum, a, i) => sum + a.amount * prices[i], 0n);
    if (circulatingLp <= 0n) {
      throw new Error("mintPool: computed LP supply must be positive.");
    }
    const premintedLp = circulatingLp;
    const lpMinted = circulatingLp + premintedLp;

    // The curve module's config comes from the caller; every other module's
    // config is published verbatim in the settings (values.moduleConfigs).
    const fee = args.curve.fee;
    const bountyK = args.curve.bountyK ?? { num: fee.num, den: fee.den * 2n };
    const curveConfig = Core.PlutusData.fromCbor(
      Core.HexBlob(
        this.datumBuilder.buildConstantSumConfigDatum({
          prices,
          fee,
          bountyK,
          waiveFeeOnClaim: args.curve.waiveFeeOnClaim ?? false,
        }).inline,
      ),
    );

    // Every distinct module across all actions, in first-appearance order —
    // this is also the `module_state` order.
    const orderedModules: string[] = [];
    const seenModules = new Set<string>();
    for (const a of actions) {
      for (const m of a.modules) {
        if (!seenModules.has(m)) {
          seenModules.add(m);
          orderedModules.push(m);
        }
      }
    }

    // For each module: its Create config (curve from args, others from the
    // published moduleConfigs) and its reference script (resolved by
    // hash → protocol-entry title → reference, so any deployed module works).
    const params = await this.getProtocolParams();
    const validatorByHash = new Map(
      params.blueprint.validators.map((v) => [v.hash, v]),
    );
    const referenceByKey = new Map(params.references.map((r) => [r.key, r]));
    const moduleInfo = await Promise.all(
      orderedModules.map(async (hash) => {
        let config: Core.PlutusData | null;
        if (hash === curveScript.hash) {
          config = curveConfig;
        } else {
          const published = moduleConfigs?.[hash];
          if (published === undefined) {
            throw new Error(
              `mintPool: the settings PoolConfig references module ${hash}, but ` +
                "the protocol settings publish no Create config for it " +
                "(values.moduleConfigs). Publish its config, or extend the SDK.",
            );
          }
          config = published
            ? Core.PlutusData.fromCbor(Core.HexBlob(published))
            : null;
        }
        const validator = validatorByHash.get(hash);
        if (!validator) {
          throw new Error(
            `mintPool: module ${hash} is not in the protocol deployment ` +
              "(no validator entry) — cannot resolve its reference script.",
          );
        }
        const ref = referenceByKey.get(validator.title);
        if (!ref) {
          throw new Error(
            `mintPool: no reference UTxO for module ${validator.title} (${hash}).`,
          );
        }
        const [refUtxo] = await this.blaze.provider.resolveUnspentOutputs([
          new Core.TransactionInput(
            Core.TransactionId(ref.txIn.hash),
            BigInt(ref.txIn.index),
          ),
        ]);
        if (!refUtxo) {
          throw new Error(
            `mintPool: could not resolve the reference UTxO for ` +
              `${validator.title} (${ref.txIn.hash}#${ref.txIn.index}).`,
          );
        }
        return { hash, config, refUtxo };
      }),
    );

    const moduleState: Array<[string, string]> = moduleInfo.map(
      ({ hash, config }) => [
        hash,
        config ? DatumBuilderV4.hashModuleConfig(config.toCbor()) : "80",
      ],
    );

    const { inline: poolDatumInline } = this.datumBuilder.buildPoolDatum({
      assets: args.assets,
      totalLp: circulatingLp,
      circulatingLp,
      premintedLp,
      identifier: ident,
      actions: actions.map((a) => ({
        tag: BigInt(a.tag),
        enabled: a.enabled,
        modules: a.modules,
      })),
      moduleState,
      minSurplus,
    });

    // Reference inputs: the settings pool config, the pool-mint policy, and each
    // module's reference script.
    const [settingsRefUtxo, poolMintRefUtxo] = await this.resolveRefUtxos([
      { key: "settings pool config", txIn: settingsTxIn },
      { key: V4_VALIDATORS.poolMint },
    ]);
    const allRefs = [
      settingsRefUtxo,
      poolMintRefUtxo,
      ...moduleInfo.map((m) => m.refUtxo),
    ];

    // settings_ref_index = the settings UTxO's slot in the canonical
    // (txId, index)-sorted list of all reference inputs.
    const refSortKey = (u: Core.TransactionUnspentOutput) =>
      `${u.input().transactionId()}#${String(u.input().index()).padStart(20, "0")}`;
    const settingsRefIndex = [...allRefs]
      .sort((a, b) => refSortKey(a).localeCompare(refSortKey(b)))
      .findIndex((u) => refSortKey(u) === refSortKey(settingsRefUtxo));

    // ── Assemble the transaction ──────────────────────────────────────
    const tx = this.newTxInstance();
    if (args.referralFee) {
      tx.payAssets(
        Core.addressFromBech32(args.referralFee.destination),
        args.referralFee.payment,
      );
    }
    tx.addInput(seed);

    // Mint the CIP-68 100/222/333 tokens.
    const mintMap = new Map<Core.AssetName, bigint>();
    mintMap.set(Core.AssetName(nftName), 1n);
    mintMap.set(Core.AssetName(refName), 1n);
    mintMap.set(Core.AssetName(lpName), lpMinted);
    tx.addMint(
      Core.PolicyId(poolMintScript.hash),
      mintMap,
      DatumBuilderV4.buildCreatePoolMintRedeemer({
        seedTxHash,
        seedIndex,
        settingsRefIndex,
      }),
    );

    for (const r of allRefs) tx.addReferenceInput(r);

    // Pool output: reserves + NFT + preminted LP, at the pool script address.
    const poolAddr = Core.addressFromCredential(
      networkId,
      Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16(poolScript.hash),
        type: Core.CredentialType.ScriptHash,
      }),
    );
    tx.lockAssets(
      poolAddr,
      this.buildPoolValue(
        args.assets,
        poolMintScript.hash,
        nftName,
        lpName,
        premintedLp,
      ),
      Core.PlutusData.fromCbor(Core.HexBlob(poolDatumInline)),
    );

    // CIP-68 reference output: the 100 token parked at the pool address.
    tx.addOutput(
      new Core.TransactionOutput(
        poolAddr,
        makeValue(POOL_REF_MIN_ADA, [poolMintScript.hash + refName, 1n]),
      ),
    );

    // The circulating LP (333) lands in the creator's change automatically.

    // Module Create withdrawals (validate initial module_state commitments) —
    // one per module, with its Create config (or nullary for config-less ones).
    for (const { hash, config } of moduleInfo) {
      tx.addWithdrawal(
        Core.RewardAccount.fromCredential(
          {
            type: Core.CredentialType.ScriptHash,
            hash: Core.Hash28ByteBase16(hash),
          },
          networkId,
        ),
        0n,
        DatumBuilderV4.buildModuleCreateRedeemer(config ?? undefined),
      );
    }

    return this.completeTx({
      tx,
      datum: poolDatumInline,
      referralFee: args.referralFee?.payment,
      deposit: 0n,
    });
  }

  /**
   * Resolves the on-chain `PoolConfig` for a given curve from the indexed
   * settings. There may be several `pool` entries (one per curve, e.g. constant
   * sum vs constant product); this picks the one whose trade action's curve
   * module matches `curveHash`. Its `txIn` is the create tx's settings ref.
   */
  private async resolvePoolConfig(curveHash: string): Promise<{
    poolValidator: string;
    actions: V4Types.ActionEntry[];
    settingsTxIn: { hash: string; index: number };
    /** Lovelace surplus floor the pool datum must pin (ADR-0012). */
    minSurplus: bigint;
    /** Per-module Create config (CBOR, or `null` for config-less modules), keyed by module hash. */
    moduleConfigs: Record<string, string | null> | undefined;
  }> {
    const settings = await this.getSettings();
    // PoolConfig entries are labeled per curve ("cs-pool", "cp-pool",
    // "cl-pool"); the bare "pool" label is accepted for older rows.
    const poolEntries = settings.filter(
      (s) => (s.label === "pool" || s.label?.endsWith("-pool")) && s.datum,
    );
    if (poolEntries.length === 0) {
      throw new Error(
        "mintPool: could not find a `pool` PoolConfig entry in the protocol " +
          "settings (needed to build a pool matching the on-chain config).",
      );
    }
    for (const entry of poolEntries) {
      const config = parse(
        V4Types.PoolConfig,
        Core.PlutusData.fromCbor(Core.HexBlob(entry.datum as string)),
      );
      // The trade action is action[0]; its first module is the curve module.
      if (config.actions[0]?.modules[0] === curveHash) {
        // values.moduleConfigs: { [moduleHash]: { configCbor: string | null } }.
        const raw = (entry.values?.moduleConfigs ?? undefined) as
          | Record<string, { configCbor: string | null }>
          | undefined;
        const moduleConfigs = raw
          ? Object.fromEntries(
              Object.entries(raw).map(([h, v]) => [h, v?.configCbor ?? null]),
            )
          : undefined;
        return {
          poolValidator: config.pool_validator,
          actions: config.actions,
          settingsTxIn: entry.txIn,
          minSurplus: config.min_surplus,
          moduleConfigs,
        };
      }
    }
    throw new Error(
      `mintPool: no settings PoolConfig has a curve module matching ${curveHash}. ` +
        "The protocol may not offer this pool kind yet.",
    );
  }

  /**
   * Resolves reference-script (or settings) UTxOs. An entry with a `txIn` is
   * resolved directly; an entry with only a `key` is resolved via the protocol
   * query's reference list.
   */
  private async resolveRefUtxos(
    entries: Array<{ key: string; txIn?: { hash: string; index: number } }>,
  ): Promise<Core.TransactionUnspentOutput[]> {
    return Promise.all(
      entries.map(async ({ key, txIn }) => {
        const ref = txIn ?? (await this.getReferenceScript(key)).txIn;
        const [utxo] = await this.blaze.provider.resolveUnspentOutputs([
          new Core.TransactionInput(
            Core.TransactionId(ref.hash),
            BigInt(ref.index),
          ),
        ]);
        if (!utxo) {
          throw new Error(
            `mintPool: could not resolve reference UTxO for ${key} ` +
              `(${ref.hash}#${ref.index}).`,
          );
        }
        return utxo;
      }),
    );
  }

  /**
   * The pool output's value: the reserve assets (ADA folded into lovelace), the
   * pool NFT, and the preminted LP buffer. Token-only pools get a fixed min-ADA
   * overhead; a pool holding ADA uses the ADA reserve as its lovelace.
   */
  private buildPoolValue(
    assets: AssetAmount<IAssetAmountMetadata>[],
    poolMintHash: string,
    nftName: string,
    lpName: string,
    premintedLp: bigint,
  ): Core.Value {
    let lovelace = 0n;
    const multiasset: Array<[string, bigint]> = [];
    for (const a of assets) {
      if (SundaeUtils.isAdaAsset(a.metadata)) {
        lovelace += a.amount;
      } else {
        multiasset.push([a.metadata.assetId.replace(".", ""), a.amount]);
      }
    }
    if (lovelace === 0n) lovelace = POOL_MIN_ADA;
    return makeValue(
      lovelace,
      [poolMintHash + nftName, 1n],
      [poolMintHash + lpName, premintedLp],
      ...multiasset,
    );
  }

  // -- Completion -----------------------------------------------------

  protected async completeTx({
    tx,
    datum,
    referralFee,
    deposit,
    scooperFee,
  }: {
    tx: TBlazeTx;
    datum: string;
    referralFee?: Core.Value;
    deposit?: bigint;
    /**
     * The max batcher fee (`budget`) the order reserves in its output — surfaced
     * so callers see the ADA actually locked. `0n`/omitted for transactions that
     * reserve no order budget (cancel, mintPool).
     */
    scooperFee?: bigint;
  }): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    let finishedTx: Core.Transaction | undefined;
    const that = this;

    const baseFees: Omit<ITxBuilderFees, "cardanoTxFee"> = {
      deposit: new AssetAmount(deposit ?? ORDER_DEPOSIT_DEFAULT, ADA_METADATA),
      scooperFee: new AssetAmount(scooperFee ?? 0n, ADA_METADATA),
      referral: referralFee
        ? new AssetAmount(referralFee.coin() ?? 0n, ADA_METADATA)
        : undefined,
    };

    const thisTx: IComposedTx<TBlazeTx, Core.Transaction> = {
      tx,
      datum,
      fees: baseFees,
      async build() {
        if (!finishedTx) {
          finishedTx = await tx.complete();
          thisTx.fees.cardanoTxFee = new AssetAmount(
            BigInt(finishedTx?.body().fee()?.toString() ?? "0"),
            ADA_METADATA,
          );
        }

        return {
          cbor: finishedTx.toCbor(),
          builtTx: finishedTx,
          sign: async () => {
            const signedTx = await that.blaze.signTransaction(
              finishedTx as Core.Transaction,
            );
            return {
              cbor: signedTx.toCbor(),
              submit: async () => await that.blaze.submitTransaction(signedTx),
            };
          },
        };
      },
    };

    return thisTx;
  }
}

/** The empty-list constraint payload (`[]`, CBOR `80`) — the route constraint. */
const emptyListData = (): Core.PlutusData =>
  Core.PlutusData.newList(new Core.PlutusList());
