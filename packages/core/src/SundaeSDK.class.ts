import {
  EContractVersion,
  ETxBuilderType,
  ISundaeSDKOptions,
} from "./@types/index.js";
import { QueryProvider } from "./Abstracts/QueryProvider.abstract.class.js";
import { TxBuilder } from "./Abstracts/TxBuilder.abstract.class.js";
import { DatumBuilderLucidV1 } from "./DatumBuilders/DatumBuilder.Lucid.V1.class.js";
import { DatumBuilderLucidV3 } from "./DatumBuilders/DatumBuilder.Lucid.V3.class.js";
import { QueryProviderSundaeSwap } from "./QueryProviders/QueryProviderSundaeSwap.js";
import { TxBuilderLucidV1 } from "./TxBuilders/TxBuilder.Lucid.V1.class.js";
import { TxBuilderLucidV3 } from "./TxBuilders/TxBuilder.Lucid.V3.class.js";

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
 * const sdk = new SundaeSDK({
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
  private builders: Map<EContractVersion | string, TxBuilder> = new Map();
  private queryProvider: QueryProvider;
  private options: ISundaeSDKOptions;

  /**
   * Builds a class instance using the arguments specified.
   *
   * @param {ISundaeSDKOptions} args - The primary arguments object for the SDK.
   * @returns {SundaeSDK}
   */
  public constructor(args: ISundaeSDKOptions) {
    this.queryProvider =
      args.customQueryProvider ||
      new QueryProviderSundaeSwap(args.wallet.network);
    this.options = {
      ...args,
      ...SDK_OPTIONS_DEFAULTS,
    };

    this.registerTxBuilders();
  }

  /**
   * Registers TxBuilders depending on the TxBuilder
   * type. Currently we only support Lucid, but plan on adding
   * more types in the future. This gives full flexibility to the
   * client in which they can utilize the SDK according to their
   * software stack.
   */
  private registerTxBuilders() {
    switch (this.options.wallet.builder.type) {
      case ETxBuilderType.LUCID:
        this.builders.set(
          EContractVersion.V1,
          new TxBuilderLucidV1(
            this.options.wallet.builder.lucid,
            new DatumBuilderLucidV1(this.options.wallet.network)
          )
        );

        this.builders.set(
          EContractVersion.V3,
          new TxBuilderLucidV3(
            this.options.wallet.builder.lucid,
            new DatumBuilderLucidV3(this.options.wallet.network)
          )
        );

        // Helper: initialize wallet if not already done so.
        if (!this.options.wallet.builder.lucid.wallet) {
          window.cardano[this.options.wallet.name]
            .enable()
            .then((api) => this.options.wallet.builder.lucid.selectWallet(api));
        }
        break;
      default:
        throw new Error(
          "A valid wallet provider type must be defined in your options object."
        );
    }
  }

  /**
   * Utility method to retrieve the SDK options object.
   *
   * @returns {ISundaeSDKOptions}
   */
  getOptions(): ISundaeSDKOptions {
    return this.options;
  }

  // Overloads
  builder(contractVersion: EContractVersion.V1): TxBuilderLucidV1;
  builder(contractVersion: EContractVersion.V3): TxBuilderLucidV3;
  builder(
    contractVersion?: EContractVersion
  ): TxBuilderLucidV1 | TxBuilderLucidV3;
  /**
   * Creates the appropriate transaction builder by which you can create valid transactions.
   *
   * @returns {TxBuilder}
   */
  builder(
    contractVersion: EContractVersion = EContractVersion.V1
  ): TxBuilderLucidV1 | TxBuilderLucidV3 {
    if (!this.builders.has(contractVersion)) {
      throw new Error(
        "Could not find a matching TxBuilder for this version. Please register a custom builder with `.registerBuilder()` first, then try again."
      );
    }

    switch (contractVersion) {
      case EContractVersion.V3: {
        return this.builders.get(contractVersion) as TxBuilderLucidV3;
      }
      default:
      case EContractVersion.V1: {
        return this.builders.get(contractVersion) as TxBuilderLucidV1;
      }
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
