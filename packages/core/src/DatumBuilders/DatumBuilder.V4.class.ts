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
    BlazeHelper.validateAddressNetwork(address, this.network);
    // v4-specific validation (not the shared V1/V3 validator, whose message
    // refers to "datum hashes" — which v4 rejects). A script destination
    // without an inline datum would lock the payout, so require one.
    if (
      BlazeHelper.isScriptAddress(address) &&
      datum.type !== EDatumType.INLINE
    ) {
      throw new Error(
        `The destination ${address} is a script address, so it requires an ` +
          "inline datum — v4 destinations do not support datum hashes. Supply " +
          "an INLINE datum to avoid locking the payout.",
      );
    }

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
   * Builds the constraint `data` for a **strategy** order — the payload keyed
   * under the strategy-order constraint module hash. It names the party
   * authorized to sign executions (`auth`) and the allowed final payout
   * destinations an execution may route to.
   *
   * ```
   * StrategyConstraints = Constr 0 [
   *   auth: MultisigScript,
   *   final_destinations: List<Destination>,
   * ]
   * ```
   */
  public buildStrategyConstraintData({
    auth,
    finalDestinations,
  }: {
    auth: V4Types.MultisigScript;
    finalDestinations: V4Types.Destination[];
  }): Core.PlutusData {
    const data = serialize(V4Types.StrategyConstraints, {
      auth,
      final_destinations: finalDestinations,
    });
    return Core.PlutusData.fromCbor(data.toCbor());
  }

  /**
   * Builds a `FeeSplitConfig` — the config for the fee-split module carried by
   * every v4 pool. `protocolShare` is the protocol's `Rational` cut of fees.
   */
  public buildFeeSplitConfigDatum({
    protocolShare,
  }: {
    protocolShare: { num: bigint; den: bigint };
  }): TDatumResult<V4Types.FeeSplitConfig> {
    const config: V4Types.FeeSplitConfig = { protocol_share: protocolShare };
    const data = serialize(V4Types.FeeSplitConfig, config);
    return { hash: data.hash(), inline: data.toCbor(), schema: config };
  }

  /**
   * Builds a `GovernanceConfig` (`Constr 0 [admin, delay, None]`) for the
   * governance module, when a pool's settings authorise an upgrade action.
   * `admin` is a bech32 address (resolved to a `Signature`/`Script` multisig);
   * `delayMs` is the upgrade timelock. `pending` is always `None` at creation.
   */
  public buildGovernanceConfigDatum({
    admin,
    delayMs,
  }: {
    admin: string;
    delayMs: bigint;
  }): TDatumResult<Core.PlutusData> {
    const adminData = Core.PlutusData.fromCbor(
      Core.HexBlob(this.buildOwnerDatum(admin).inline),
    );
    const none = Core.PlutusData.newConstrPlutusData(
      new Core.ConstrPlutusData(1n, new Core.PlutusList()),
    );
    const fields = new Core.PlutusList();
    fields.add(adminData);
    fields.add(Core.PlutusData.newInteger(delayMs));
    fields.add(none);
    const data = Core.PlutusData.newConstrPlutusData(
      new Core.ConstrPlutusData(0n, fields),
    );
    return { hash: data.hash(), inline: data.toCbor(), schema: data };
  }

  /**
   * Computes a pool's `identifier`: `blake2b_256` of the CBOR of the seed
   * UTxO's `OutputReference` (`Constr 0 [txId, index]`), truncated to 28 bytes.
   * Must byte-match the pool-mint validator's `cbor.serialise(seed_utxo)`.
   */
  static computePoolIdent(seedTxHash: string, seedIndex: number): string {
    const fields = new Core.PlutusList();
    fields.add(Core.PlutusData.newBytes(Buffer.from(seedTxHash, "hex")));
    fields.add(Core.PlutusData.newInteger(BigInt(seedIndex)));
    const oref = Core.PlutusData.newConstrPlutusData(
      new Core.ConstrPlutusData(0n, fields),
    );
    return Core.blake2b_256(oref.toCbor()).toString().slice(0, 56);
  }

  /** CIP-68 asset-name prefixes used by the v4 pool-mint policy. */
  static readonly CIP68_100 = "000643b0"; // reference (datum) token
  static readonly CIP68_222 = "000de140"; // pool NFT
  static readonly CIP68_333 = "0014df10"; // LP token

  /** The `100`/`222`/`333` CIP-68 asset names for a pool identifier. */
  static cip68Names(ident: string): {
    ref: string;
    nft: string;
    lp: string;
  } {
    return {
      ref: DatumBuilderV4.CIP68_100 + ident,
      nft: DatumBuilderV4.CIP68_222 + ident,
      lp: DatumBuilderV4.CIP68_333 + ident,
    };
  }

  /**
   * The pool-mint `CreatePool` redeemer:
   * `Constr 0 [OutputReference(Constr 0 [txId, index]), settings_ref_index]`.
   */
  static buildCreatePoolMintRedeemer({
    seedTxHash,
    seedIndex,
    settingsRefIndex,
  }: {
    seedTxHash: string;
    seedIndex: number;
    settingsRefIndex: number;
  }): Core.PlutusData {
    const orefFields = new Core.PlutusList();
    orefFields.add(Core.PlutusData.newBytes(Buffer.from(seedTxHash, "hex")));
    orefFields.add(Core.PlutusData.newInteger(BigInt(seedIndex)));
    const oref = Core.PlutusData.newConstrPlutusData(
      new Core.ConstrPlutusData(0n, orefFields),
    );
    const fields = new Core.PlutusList();
    fields.add(oref);
    fields.add(Core.PlutusData.newInteger(BigInt(settingsRefIndex)));
    return Core.PlutusData.newConstrPlutusData(
      new Core.ConstrPlutusData(0n, fields),
    );
  }

  /**
   * A module's `Create` redeemer: `Constr 0 [config]` — used at pool creation
   * to validate each module's initial `module_state` commitment. Pass the
   * module's config `PlutusData`, or omit it for a config-less module (e.g.
   * fairness, whose `Create` is the nullary `Constr 0 []`).
   */
  static buildModuleCreateRedeemer(config?: Core.PlutusData): Core.PlutusData {
    const fields = new Core.PlutusList();
    if (config) fields.add(config);
    return Core.PlutusData.newConstrPlutusData(
      new Core.ConstrPlutusData(0n, fields),
    );
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
   * Extracts the owner's **required-signer key hash** from a v4 order datum's
   * `owner` multisig, for building a Cancel/Update transaction. Only a single
   * `Signature` owner reduces to one required signer — it yields its key hash.
   * Every other shape (`Script`, `AllOf`, `AnyOf`, `AtLeast`, `Before`,
   * `After`) returns `undefined`: a script hash is **not** an Ed25519 key hash
   * (adding it as a required signer would make an unsignable tx), and richer
   * multisigs can't be reduced to one signer. The caller must attach the
   * appropriate witness (native/plutus script, or the needed key set) itself.
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

    return undefined;
  }
}
