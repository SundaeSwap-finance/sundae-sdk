import { parse, serialize } from "@blaze-cardano/data";
import { Core } from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import {
  EDatumType,
  TDatumResult,
  TDestinationAddress,
} from "../@types/datumbuilder.js";
import type { TSupportedNetworks } from "../@types/utilities.js";
import { DatumBuilderAbstract } from "../Abstracts/DatumBuilder.abstract.class.js";
import { BlazeHelper } from "../Utilities/BlazeHelper.class.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import { V4Types } from "./ContractTypes/index.js";

/**
 * The three basic-order constraint classes, identified on-chain by the
 * constructor index of the constraint `data`. (Swap orders use a separate,
 * partial-fill-capable encoding — see {@link DatumBuilderV4.buildSwapConstraintData}.)
 */
export enum EV4BasicConstraint {
  Deposit = 0,
  Withdraw = 1,
  Claim = 3,
}

/**
 * The arguments to assemble a v4 `OrderDatum` shell.
 *
 * The `constraints` are the generic `(module_hash, data)` pairs that make v4
 * orders composable — each entry names a withdraw-validator module and the
 * opaque `Data` payload that module interprets. This builder does NOT encode
 * those payloads (they live outside the blueprint and differ per module); the
 * caller supplies pre-serialized `Core.PlutusData` for each. See the
 * per-module constraint encoders (Phase 3+) for the swap/deposit/withdraw
 * payload construction.
 */
export interface IDatumBuilderV4OrderArgs {
  /** The address (or explicit multisig) that owns / can cancel the order. */
  owner: string | V4Types.MultisigScript;
  /** Where the order pays out, or `Self` to re-lock at the order address. */
  destination: TDestinationAddress | "Self";
  /** The maximum protocol/batcher fee (lovelace) the order will pay. */
  budget: bigint;
  /** The batcher's share of the fee. */
  shareBatcher: bigint;
  /** The asset name of the config token identifying the protocol config. */
  configToken: string;
  /** The `(module_hash, data)` constraint entries. */
  constraints: Array<[string, Core.PlutusData]>;
  /** Arbitrary extension data. Defaults to `Void`. */
  extension?: Core.PlutusData;
}

/**
 * Datum + redeemer builder for sundae-v4 transactions.
 *
 * Unlike v1/v3 — where one Order datum shape served the whole protocol — v4
 * splits intent into a list of `(module_hash, data)` constraints attached to a
 * generic `OrderDatum`. This class encodes the authoritative, blueprint-backed
 * pieces of that datum: the `owner` multisig, the `destination`, asset classes,
 * and the surrounding `OrderDatum` shell.
 *
 * The per-constraint `data` payloads (e.g. the swap constraint's fields) are
 * intentionally NOT encoded here yet: on-chain they are opaque `Data` decoded
 * by each withdraw module, so they are not described by the blueprint and are
 * built by the module-specific encoders that land alongside the tx-builder
 * actions.
 */
export class DatumBuilderV4 implements DatumBuilderAbstract {
  /** The current network id. */
  public network: TSupportedNetworks;

  constructor(network: TSupportedNetworks) {
    this.network = network;
  }

  /**
   * Assembles the v4 `OrderDatum` shell from its parts. Every non-strategy
   * order placement ultimately produces one of these.
   */
  public buildOrderDatum({
    owner,
    destination,
    budget,
    shareBatcher,
    configToken,
    constraints,
    extension,
  }: IDatumBuilderV4OrderArgs): TDatumResult<V4Types.OrderDatum> {
    const ownerSchema =
      typeof owner === "string" ? this.buildOwnerDatum(owner).schema : owner;

    const destinationSchema =
      destination === "Self"
        ? this.buildSelfDestination().schema
        : this.buildDestinationAddresses(destination).schema;

    const datum: V4Types.OrderDatum = {
      owner: ownerSchema,
      destination: destinationSchema,
      budget,
      share_batcher: shareBatcher,
      config_token: configToken,
      constraints: constraints.map(
        ([moduleHash, data]) =>
          [moduleHash, data] as V4Types.Tuple_ByteArray_Data,
      ),
      extension: extension ?? DatumBuilderV4.buildVoidData(),
    };

    const data = serialize(V4Types.OrderDatum, datum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  /**
   * Builds the `owner` multisig for an order from a bech32 address. A script
   * address becomes a `Script` owner; otherwise a single `Signature` owner
   * keyed on the staking hash if present, else the payment hash (mirroring the
   * v3 convention). Richer multisig shapes (`AtLeast`, `AllOf`, …) can be
   * supplied directly to {@link buildOrderDatum} as a `MultisigScript`.
   */
  public buildOwnerDatum(main: string): TDatumResult<V4Types.MultisigScript> {
    BlazeHelper.validateAddressNetwork(main, this.network);
    const paymentPart = BlazeHelper.getPaymentHashFromBech32(main);
    const stakingPart = BlazeHelper.getStakingHashFromBech32(main);

    const ownerDatum: V4Types.MultisigScript = BlazeHelper.isScriptAddress(main)
      ? { Script: { script_hash: stakingPart || paymentPart } }
      : { Signature: { key_hash: stakingPart || paymentPart } };

    const data = serialize(V4Types.MultisigScript, ownerDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: ownerDatum,
    };
  }

  /**
   * Builds a `Fixed` destination — a concrete address plus an optional inline
   * datum to attach to the payout. v4 destinations carry an `Option<Data>`
   * datum (no datum-hash variant), so a `HASH` datum type is rejected.
   */
  public buildDestinationAddresses({
    address,
    datum,
  }: TDestinationAddress): TDatumResult<V4Types.Destination> {
    BlazeHelper.validateAddressAndDatumAreValid({
      address,
      datum,
      network: this.network,
    });

    let attachedDatum: Core.PlutusData | undefined;
    switch (datum.type) {
      case EDatumType.NONE:
        attachedDatum = undefined;
        break;
      case EDatumType.INLINE:
        attachedDatum = Core.PlutusData.fromCbor(Core.HexBlob(datum.value));
        break;
      case EDatumType.HASH:
        throw new Error(
          "v4 destinations carry an optional inline datum only; a datum hash " +
            "cannot be attached to a v4 order destination.",
        );
      default:
        throw new Error(
          "Could not find a matching datum type for the destination address. Aborting.",
        );
    }

    const paymentPart = BlazeHelper.getPaymentHashFromBech32(address);
    const stakingPart = BlazeHelper.getStakingHashFromBech32(address);

    const destinationDatum: V4Types.Destination = {
      Fixed: {
        address: {
          payment_credential: BlazeHelper.isScriptAddress(address)
            ? { Script: [paymentPart] }
            : { VerificationKey: [paymentPart] },
          stake_credential: stakingPart
            ? { Inline: [{ VerificationKey: [stakingPart] }] }
            : undefined,
        },
        datum: attachedDatum,
      },
    };

    const data = serialize(V4Types.Destination, destinationDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: destinationDatum,
    };
  }

  /**
   * Builds the `Self` destination, which re-locks the order's payout at the
   * order address itself (used by multi-step / routed intents).
   */
  public buildSelfDestination(): TDatumResult<V4Types.Destination> {
    const destinationDatum: V4Types.Destination = "Self";
    const data = serialize(V4Types.Destination, destinationDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: destinationDatum,
    };
  }

  /**
   * Builds a v4 `AssetClass` (`{ policy, name }`) from an SDK asset. ADA is
   * canonicalised to the empty policy / empty name.
   */
  public buildAssetClassDatum(
    asset: AssetAmount<IAssetAmountMetadata>,
  ): TDatumResult<V4Types.AssetClass> {
    const isAdaLovelace = SundaeUtils.isAdaAsset(asset.metadata);
    const [policy, name] = isAdaLovelace
      ? ["", ""]
      : asset.metadata.assetId.split(".");

    const assetClass: V4Types.AssetClass = { policy, name: name ?? "" };
    const data = serialize(V4Types.AssetClass, assetClass);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: assetClass,
    };
  }

  /**
   * Builds the constraint `data` for a **swap** order — the payload keyed under
   * the swap-order constraint module hash in {@link IDatumBuilderV4OrderArgs}'s
   * `constraints`. This is a partial-fill-capable order: `originalOffered` is
   * the immutable quote reference and `remainingOffered` shrinks as fills land.
   *
   * Encoding (constructor index **2**, verified against the sundae-v4 CLI's
   * `plutusSwapConstraints`):
   * ```
   * Swap = Constr 2 [
   *   offered: AssetClass,                 // Constr 0 [policy, name]
   *   original_offered: Int,
   *   remaining_offered: Int,
   *   min_received: List<(AssetClass, Int)> // each pair is a 2-elem list
   * ]
   * ```
   */
  public buildSwapConstraintData({
    offered,
    originalOffered,
    remainingOffered,
    minReceived,
  }: {
    offered: AssetAmount<IAssetAmountMetadata>;
    originalOffered: bigint;
    remainingOffered: bigint;
    minReceived: AssetAmount<IAssetAmountMetadata>[];
  }): Core.PlutusData {
    const fields = new Core.PlutusList();
    fields.add(this.assetClassData(offered));
    fields.add(Core.PlutusData.newInteger(originalOffered));
    fields.add(Core.PlutusData.newInteger(remainingOffered));
    fields.add(this.assetAmountListData(minReceived));

    return Core.PlutusData.newConstrPlutusData(
      new Core.ConstrPlutusData(2n, fields),
    );
  }

  /**
   * Builds the constraint `data` for a **basic** order — `Deposit`, `Withdraw`,
   * or `Claim`. All three share the same field shape and are distinguished by
   * their constructor index (verified against the CLI's `plutusBasicConstraints`):
   * ```
   * Deposit  = Constr 0 [offered: List<(AssetClass, Int)>, min_received: List<(AssetClass, Int)>]
   * Withdraw = Constr 1 [ …same… ]
   * Claim    = Constr 3 [ …same… ]
   * ```
   */
  public buildBasicConstraintData({
    type,
    offered,
    minReceived,
  }: {
    type: EV4BasicConstraint;
    offered: AssetAmount<IAssetAmountMetadata>[];
    minReceived: AssetAmount<IAssetAmountMetadata>[];
  }): Core.PlutusData {
    const fields = new Core.PlutusList();
    fields.add(this.assetAmountListData(offered));
    fields.add(this.assetAmountListData(minReceived));

    return Core.PlutusData.newConstrPlutusData(
      new Core.ConstrPlutusData(BigInt(type), fields),
    );
  }

  /**
   * Builds a `ConstantSumConfig` — the config for a constant-sum pool module.
   * `prices` are the per-asset weights; `fee`/`bountyK` are `Rational`
   * fractions; `waiveFeeOnClaim` toggles the tag-claim bounty fee waiver.
   */
  public buildConstantSumConfigDatum({
    prices,
    fee,
    bountyK = { num: 0n, den: 1n },
    waiveFeeOnClaim = false,
  }: {
    prices: bigint[];
    fee: { num: bigint; den: bigint };
    bountyK?: { num: bigint; den: bigint };
    waiveFeeOnClaim?: boolean;
  }): TDatumResult<V4Types.ConstantSumConfig> {
    const config: V4Types.ConstantSumConfig = {
      prices,
      fee,
      bounty_k: bountyK,
      waive_fee_on_claim: waiveFeeOnClaim,
    };
    const data = serialize(V4Types.ConstantSumConfig, config);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: config,
    };
  }

  /**
   * Builds a `PoolDatum` for a v4 pool. The `moduleState` entries pair a module
   * hash with its config-commitment: use {@link DatumBuilderV4.hashModuleConfig}
   * on the module's serialized config (e.g. the CS config), or the sentinel
   * `"80"` (CBOR empty) for config-less modules like fairness.
   */
  public buildPoolDatum({
    assets,
    totalLp,
    circulatingLp,
    premintedLp,
    identifier,
    actions,
    moduleState,
  }: {
    assets: AssetAmount<IAssetAmountMetadata>[];
    totalLp: bigint;
    circulatingLp: bigint;
    premintedLp: bigint;
    identifier: string;
    actions: Array<{ tag: bigint; enabled: boolean; modules: string[] }>;
    moduleState: Array<[moduleHash: string, stateHash: string]>;
  }): TDatumResult<V4Types.PoolDatum> {
    const datum: V4Types.PoolDatum = {
      assets: assets.map((asset) => {
        const { policy, name } = this.assetClassParts(asset);
        return [{ policy, name }, asset.amount] as V4Types.Tuple_AssetClass_Int;
      }),
      total_lp: totalLp,
      circulating_lp: circulatingLp,
      preminted_lp: premintedLp,
      identifier,
      actions: actions.map(({ tag, enabled, modules }) => ({
        tag,
        enabled,
        modules,
      })),
      module_state: moduleState.map(
        ([moduleHash, stateHash]) =>
          [moduleHash, stateHash] as V4Types.Tuple_ModuleHash_ByteArray,
      ),
    };
    const data = serialize(V4Types.PoolDatum, datum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: datum,
    };
  }

  /**
   * Commits a module's config into the `module_state`: `blake2b_256` of the
   * config's serialized CBOR. Pair the result with the module hash in
   * {@link buildPoolDatum}'s `moduleState`. (Config-less modules use `"80"`.)
   */
  static hashModuleConfig(configInline: string): string {
    return Core.blake2b_256(Core.HexBlob(configInline)).toString();
  }

  /** Encodes an SDK asset as a v4 `AssetClass` PlutusData (`Constr 0 [policy, name]`). */
  private assetClassData(
    asset: AssetAmount<IAssetAmountMetadata>,
  ): Core.PlutusData {
    const { policy, name } = this.assetClassParts(asset);
    const parts = new Core.PlutusList();
    parts.add(Core.PlutusData.newBytes(Buffer.from(policy, "hex")));
    parts.add(Core.PlutusData.newBytes(Buffer.from(name, "hex")));
    return Core.PlutusData.newConstrPlutusData(
      new Core.ConstrPlutusData(0n, parts),
    );
  }

  /**
   * Encodes a list of assets-with-amounts as `List<(AssetClass, Int)>`. Each
   * `(AssetClass, Int)` tuple is a bare 2-element `PlutusList` (Aiken tuples are
   * plain lists, not constructors).
   */
  private assetAmountListData(
    assets: AssetAmount<IAssetAmountMetadata>[],
  ): Core.PlutusData {
    const list = new Core.PlutusList();
    for (const asset of assets) {
      const pair = new Core.PlutusList();
      pair.add(this.assetClassData(asset));
      pair.add(Core.PlutusData.newInteger(asset.amount));
      list.add(Core.PlutusData.newList(pair));
    }
    return Core.PlutusData.newList(list);
  }

  /** Splits an SDK asset into its `{ policy, name }` hex parts (ADA → empty/empty). */
  private assetClassParts(asset: AssetAmount<IAssetAmountMetadata>): {
    policy: string;
    name: string;
  } {
    if (SundaeUtils.isAdaAsset(asset.metadata)) {
      return { policy: "", name: "" };
    }
    const [policy, name] = asset.metadata.assetId.split(".");
    return { policy, name: name ?? "" };
  }

  /**
   * The canonical `Void` datum (`d87980`) — a constructor-0 value with no
   * fields, used as the default order `extension`.
   */
  static buildVoidData(): Core.PlutusData {
    return Core.PlutusData.newConstrPlutusData(
      new Core.ConstrPlutusData(0n, new Core.PlutusList()),
    );
  }

  /**
   * Extracts the owner's required-signer key hash from a v4 order datum's
   * `owner` multisig, for building a Cancel/Update transaction. Handles the
   * common single-owner shapes: a `Signature` owner yields its key hash, a
   * `Script` owner yields its script hash. Richer multisig shapes (`AllOf`,
   * `AnyOf`, `AtLeast`, …) can't be reduced to a single required signer here —
   * they return `undefined`, and the caller is responsible for attaching the
   * appropriate signers itself.
   *
   * @param datum The order's inline datum, as CBOR hex.
   */
  static getSignerKeyFromDatum(datum: string): string | undefined {
    const { owner } = parse(
      V4Types.OrderDatum,
      Core.PlutusData.fromCbor(Core.HexBlob(datum)),
    );

    if ("Signature" in owner) {
      return owner.Signature.key_hash;
    }

    if ("Script" in owner) {
      return owner.Script.script_hash;
    }

    return undefined;
  }
}
