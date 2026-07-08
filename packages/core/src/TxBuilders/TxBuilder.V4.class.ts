import { Blaze, Core, makeValue, Provider, Wallet } from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import type {
  IComposedTx,
  ISundaeProtocolParamsFull,
  ISundaeProtocolReference,
  ISundaeProtocolValidatorFull,
  ITxBuilderFees,
  ITxBuilderReferralFee,
  TSupportedNetworks,
} from "../@types/index.js";
import { EContractVersion } from "../@types/index.js";
import { EDatumType, TDestinationAddress } from "../@types/datumbuilder.js";
import { TxBuilderAbstractV4 } from "../Abstracts/TxBuilderAbstract.V4.class.js";
import { ADA_METADATA, ORDER_DEPOSIT_DEFAULT } from "../constants.js";
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
 * `*-sundae-protocol--protocol` table (which is populated from the scooper's
 * deployment config, e.g. scooper-v2 `config/<network>-v4.json` module-scripts).
 */
export const V4_VALIDATORS = {
  /** The order spend validator — its hash forms the order script address. */
  order: "order",
  /** The swap-order constraint module — keyed in a Swap order's constraints. */
  swapConstraint: "swap-order",
  /** The basic-order constraint module — keyed in Deposit/Withdraw/Claim orders. */
  basicConstraint: "basic-order",
  /** The route-order constraint module — required by swap (and strategy) orders. */
  routeConstraint: "route-order",
  /** The fairness-order constraint module — required by every order type. */
  fairnessConstraint: "fairness-order",
  /** The pool NFT minting policy. */
  poolMint: "pool-mint",
} as const;

/**
 * Default order economics, mirroring the values live preview orders currently
 * use. Callers can override per order; a later pass can resolve these from the
 * settings UTxO (`min_share_batcher`) and protocol fee config.
 */
const DEFAULT_BUDGET = 3_000_000n;
const DEFAULT_SHARE_BATCHER = 10_000n;

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
  /** Max batcher fee, in lovelace. Defaults to `DEFAULT_BUDGET` (3 ADA). */
  budget?: bigint;
  /** The batcher's share of the fee. Defaults to `DEFAULT_SHARE_BATCHER`. */
  shareBatcher?: bigint;
  /**
   * The OrderConfig settings-entry asset name whose `required_constraints` this
   * order fulfills. Deployment-specific (a minted registry token, per order
   * type); resolve it from the OrderConfig settings entries. See the note on
   * config-token resolution in the class docs.
   */
  configToken: string;
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

    return new Core.Address({
      type: Core.AddressType.BasePaymentScriptStakeKey,
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
   * Places a v4 swap order — a single-asset offer that fills against whichever
   * pool the scooper routes it through, subject to the `minReceived` targets.
   *
   * A swap order must carry the full constraint set the swap `OrderConfig`
   * requires — verified against live preview orders as
   * `[swap-order, route-order, fairness-order]`, in that order:
   *   - swap-order: the `SwapFields` payload (Constr 2)
   *   - route-order: an empty list `[]` (scooper fills in routing at scoop time)
   *   - fairness-order: `Void`
   * The order-validator checks this list matches the OrderConfig's
   * `required_constraints` exactly, so a partial set is rejected on-chain.
   */
  public async swap(
    args: ISwapV4Args,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    const minReceived = Array.isArray(args.minReceived)
      ? args.minReceived
      : [args.minReceived];

    const swapData = this.datumBuilder.buildSwapConstraintData({
      offered: args.offered,
      originalOffered: args.offered.amount,
      remainingOffered: args.offered.amount,
      minReceived,
    });

    const [swapHash, routeHash, fairnessHash] = await this.getValidatorHashes([
      V4_VALIDATORS.swapConstraint,
      V4_VALIDATORS.routeConstraint,
      V4_VALIDATORS.fairnessConstraint,
    ]);

    return this.placeOrder(
      args,
      [args.offered],
      [
        [swapHash, swapData],
        [routeHash, emptyListData()],
        [fairnessHash, DatumBuilderV4.buildVoidData()],
      ],
    );
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
    const basicData = this.datumBuilder.buildBasicConstraintData({
      type: args.type,
      offered: args.offered,
      minReceived: args.minReceived,
    });

    const [basicHash, fairnessHash] = await this.getValidatorHashes([
      V4_VALIDATORS.basicConstraint,
      V4_VALIDATORS.fairnessConstraint,
    ]);

    return this.placeOrder(args, args.offered, [
      [basicHash, basicData],
      [fairnessHash, DatumBuilderV4.buildVoidData()],
    ]);
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
   * Shared placement primitive: assemble the `OrderDatum`, lock the offered
   * assets + the fee budget at the order script address, and complete. Exposed
   * (protected) so the datum/output assembly is unit-testable without a live
   * tx completion.
   */
  protected async placeOrder(
    args: IOrderV4Base,
    offered: AssetAmount<IAssetAmountMetadata>[],
    constraints: Array<[string, Core.PlutusData]>,
  ): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    const destination: TDestinationAddress | "Self" = args.destination ?? {
      address: args.ownerAddress,
      datum: { type: EDatumType.NONE },
    };

    const budget = args.budget ?? DEFAULT_BUDGET;

    const { inline } = this.datumBuilder.buildOrderDatum({
      owner: args.ownerAddress,
      destination,
      budget,
      shareBatcher: args.shareBatcher ?? DEFAULT_SHARE_BATCHER,
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

    const tx = this.newTxInstance();
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

    return this.completeTx({
      tx,
      datum: inline,
      referralFee: args.referralFee?.payment,
      deposit: orderDeposit,
    });
  }

  // -- Not yet implemented -------------------------------------------

  /**
   * Cancels an existing v4 order. Pending: spend the order UTxO via the order
   * validator's Cancel path (needs the order reference script + owner-signer
   * resolution from the multisig).
   */
  public async cancel(_args: unknown): Promise<IComposedTx> {
    throw notImplemented("cancel");
  }

  /**
   * Mints a new v4 pool. The pool DATUM is ready ({@link DatumBuilderV4.buildPoolDatum}
   * + {@link DatumBuilderV4.hashModuleConfig}); the remaining tx work (seed-utxo
   * consumption, CIP-68 222/100/333 NFT mint via the pool policy, module withdraw
   * registrations, settings reference) lands once the protocol query exposes the
   * v4 pool-mint policy + settings.
   */
  public async mintPool(_args: unknown): Promise<IComposedTx> {
    throw notImplemented("mintPool");
  }

  // -- Completion -----------------------------------------------------

  protected async completeTx({
    tx,
    datum,
    referralFee,
    deposit,
  }: {
    tx: TBlazeTx;
    datum: string;
    referralFee?: Core.Value;
    deposit?: bigint;
  }): Promise<IComposedTx<TBlazeTx, Core.Transaction>> {
    let finishedTx: Core.Transaction | undefined;
    const that = this;

    const baseFees: Omit<ITxBuilderFees, "cardanoTxFee"> = {
      deposit: new AssetAmount(deposit ?? ORDER_DEPOSIT_DEFAULT, ADA_METADATA),
      scooperFee: new AssetAmount(0n, ADA_METADATA),
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

const notImplemented = (method: string) =>
  new Error(
    `TxBuilderV4.${method}() is not yet implemented — see the SDK V4 phased rollout.`,
  );

/** The empty-list constraint payload (`[]`, CBOR `80`) — the route constraint. */
const emptyListData = (): Core.PlutusData =>
  Core.PlutusData.newList(new Core.PlutusList());
