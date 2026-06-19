import { Blaze, Core, Provider, Wallet } from "@blaze-cardano/sdk";
import type {
  IComposedTx,
  ISundaeProtocolParamsFull,
  ISundaeProtocolValidatorFull,
  TSupportedNetworks,
} from "../@types/index.js";
import { EContractVersion } from "../@types/index.js";
import { TxBuilderAbstractV4 } from "../Abstracts/TxBuilderAbstract.V4.class.js";
import { DatumBuilderV4 } from "../DatumBuilders/DatumBuilder.V4.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";

/**
 * `TxBuilderV4` builds transactions against the sundae-v4 protocol.
 *
 * v4 is a module-composable redesign of the protocol — the swap math
 * (curve), authorization, fee policy, and other behaviors are pluggable
 * withdraw-validator modules rather than hardcoded into the pool
 * validator. Order placement is correspondingly factored into a list of
 * (`module_hash`, `data`) constraints carried on a generic OrderDatum.
 *
 * This class mirrors `TxBuilderV3`'s public surface (`swap`, `deposit`,
 * `withdraw`, `cancel`, `mintPool`) and adds `basic()` — the v4
 * placement primitive every non-strategy intent ultimately uses.
 *
 * Phase 1 ships the class skeleton with stub methods that throw
 * `NotImplementedError`; subsequent phases land each action's body in
 * turn (see `SDK V4 Phase 2…6` tasks).
 *
 * @extends {TxBuilderAbstractV4}
 */
export class TxBuilderV4 extends TxBuilderAbstractV4 {
  contractVersion: EContractVersion = EContractVersion.V4;
  datumBuilder: DatumBuilderV4;
  queryProvider: QueryProviderSundaeSwap;
  network: TSupportedNetworks;
  protocolParams: ISundaeProtocolParamsFull | undefined;
  referenceUtxos: Core.TransactionUnspentOutput[] | undefined;
  settingsUtxoDatum: string | undefined;
  validatorScripts: Record<string, ISundaeProtocolValidatorFull> = {};
  tracing: boolean = false;

  /**
   * @param {Blaze<Provider, Wallet>} blaze A configured Blaze instance to use.
   * @param {QueryProviderSundaeSwap} queryProvider A custom query provider if desired.
   */
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

  /**
   * Enables tracing in the Blaze transaction builder.
   */
  public enableTracing(enable: boolean): TxBuilderV4 {
    this.tracing = enable;
    return this;
  }

  /**
   * Creates a new transaction instance. Phase 1 placeholder — the
   * downstream methods will use this in subsequent phases.
   */
  public newTxInstance(): unknown {
    return this.blaze.newTransaction();
  }

  // -- Action stubs ---------------------------------------------------

  /**
   * Builds a v4 swap order — a single-asset offer with a list of
   * min-received targets routed via the pluggable swap constraint.
   *
   * Phase 3 will land the body.
   */
  public async swap(_args: unknown): Promise<IComposedTx> {
    throw notImplemented("swap");
  }

  /**
   * Builds a v4 basic order — the placement primitive that backs every
   * non-strategy intent. A basic order pays out to its destination when
   * the destination output carries at least the declared min_received
   * list, regardless of which pools the scooper routed through.
   *
   * Phase 3 will land the body.
   */
  public async basic(_args: unknown): Promise<IComposedTx> {
    throw notImplemented("basic");
  }

  /**
   * Builds a v4 deposit order — a basic order whose min_received list
   * names the pool's LP asset.
   *
   * Phase 4 will land the body.
   */
  public async deposit(_args: unknown): Promise<IComposedTx> {
    throw notImplemented("deposit");
  }

  /**
   * Builds a v4 withdraw order — a basic order whose offered asset is
   * the pool's LP asset and min_received names the underlying assets.
   *
   * Phase 4 will land the body.
   */
  public async withdraw(_args: unknown): Promise<IComposedTx> {
    throw notImplemented("withdraw");
  }

  /**
   * Cancels an existing v4 order, returning the locked value to the
   * owner.
   *
   * Phase 5 will land the body.
   */
  public async cancel(_args: unknown): Promise<IComposedTx> {
    throw notImplemented("cancel");
  }

  /**
   * Mints a new v4 pool — composes the curve, fee, and auth modules
   * declared by the supplied PoolConfig and seeds initial liquidity.
   *
   * Phase 6 will land the body.
   */
  public async mintPool(_args: unknown): Promise<IComposedTx> {
    throw notImplemented("mintPool");
  }
}

const notImplemented = (method: string) =>
  new Error(
    `TxBuilderV4.${method}() is not yet implemented — see the SDK V4 phased rollout.`,
  );
