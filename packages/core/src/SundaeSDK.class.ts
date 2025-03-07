import { EContractVersion, ISundaeSDKOptions } from "./@types/index.js";
import { QueryProvider } from "./Abstracts/QueryProvider.abstract.class.js";
import { QueryProviderSundaeSwap } from "./QueryProviders/QueryProviderSundaeSwap.js";
import { TxBuilderV1, TxBuilderV3 } from "./TxBuilders/index.js";

export const SDK_OPTIONS_DEFAULTS: Pick<
  ISundaeSDKOptions,
  "minLockAda" | "debug"
> = {
  minLockAda: 5_000_000n,
  debug: false,
};

/**
 * The main SundaeSDK class that contains all the necessary sub-classes for
 * interacting with the SundaeSwap protocol.
 *
 * ```ts
 * const sdk = await SundaeSDK.new({
 *   baseType: EBasePrototype.Lucid,
 *   network: "preview"
 * });
 *
 * sdk.builder().buildSwapTx({ ...args })
 *   .then(async ({ build, sign }) => {
 *     const { fees } = await build();
 *     console.log(fees);
 *
 *     const { submit } = await sign();
 *     const txHash = submit();
 *
 *     console.log(txHash);
 *   })
 * ```
 */
export class SundaeSDK {
  private builders: Map<EContractVersion, TxBuilderV1 | TxBuilderV3> =
    new Map();
  private queryProvider: QueryProvider;
  private options: ISundaeSDKOptions;

  /**
   * Builds a class instance using the arguments specified.
   *
   * @param {ISundaeSDKOptions} args - The primary arguments object for the SDK.
   * @returns {SundaeSDK}
   */
  private constructor(args: ISundaeSDKOptions) {
    this.queryProvider =
      args.customQueryProvider ||
      new QueryProviderSundaeSwap(args.wallet.network);
    this.options = {
      ...args,
      ...SDK_OPTIONS_DEFAULTS,
    };
  }

  /**
   * Sets up TxBuilders based on the selected builder type. This is async
   * because we only import them after consuming the arguments.
   * @param {ISundaeSDKOptions} args The SundaeSDK arguments.
   * @returns {Promise<SundaeSDK>}
   */
  static async new(args: ISundaeSDKOptions): Promise<SundaeSDK> {
    const instance = new this(args);
    await instance.registerTxBuilders();
    return instance;
  }

  /**
   * Registers TxBuilders depending on the TxBuilder
   * type. Currently we only support Lucid, but plan on adding
   * more types in the future. This gives full flexibility to the
   * client in which they can utilize the SDK according to their
   * software stack.
   */
  private async registerTxBuilders() {
    this.builders.set(
      EContractVersion.V1,
      new TxBuilderV1(
        this.options.wallet.blazeInstance,
        this.options.wallet.network,
      ),
    );
    this.builders.set(
      EContractVersion.V3,
      new TxBuilderV3(
        this.options.wallet.blazeInstance,
        this.options.wallet.network,
      ),
    );
  }

  /**
   * Utility method to retrieve the SDK options object.
   *
   * @returns {ISundaeSDKOptions}
   */
  getOptions(): ISundaeSDKOptions {
    return this.options;
  }

  /**
   * Creates the appropriate transaction builder by which you can create valid transactions.
   *
   * @returns {TxBuilderV1 | TxBuilderV3}
   */
  builder(contractVersion: EContractVersion.V1): TxBuilderV1;
  builder(contractVersion: EContractVersion.V3): TxBuilderV3;
  builder(contractVersion?: EContractVersion): TxBuilderV1 | TxBuilderV3;
  builder(
    contractVersion: EContractVersion = EContractVersion.V3,
  ): TxBuilderV1 | TxBuilderV3 {
    const builder = this.builders.get(contractVersion);
    if (!builder) {
      throw new Error(
        "Could not find a matching TxBuilder for this contract version.",
      );
    }

    switch (contractVersion) {
      case EContractVersion.V1:
        return builder as TxBuilderV1;
      case EContractVersion.V3:
        return builder as TxBuilderV3;
      default:
        throw new Error("Unreachable.");
    }
  }

  /**
   * Utility method to retrieve the provider instance.
   *
   * @returns {QueryProvider} - The QueryProvider instance.
   */
  query(): QueryProvider {
    return this.queryProvider;
  }
}
