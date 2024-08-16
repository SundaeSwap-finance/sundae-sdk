import { EmulatorProvider } from "@blaze-cardano/emulator";
import type {
  Blaze,
  Blockfrost,
  ColdWallet,
  WebWallet,
} from "@blaze-cardano/sdk";
import type { Lucid } from "lucid-cardano";
import {
  EContractVersion,
  ETxBuilderType,
  ILucidBuilder,
  ISundaeSDKOptions,
} from "./@types/index.js";
import { QueryProvider } from "./Abstracts/QueryProvider.abstract.class.js";
import { TxBuilderV1 } from "./Abstracts/TxBuilderV1.abstract.class.js";
import { TxBuilderV3 } from "./Abstracts/TxBuilderV3.abstract.class.js";
import { QueryProviderSundaeSwap } from "./QueryProviders/QueryProviderSundaeSwap.js";
import type {
  TxBuilderBlazeV1,
  TxBuilderBlazeV3,
  TxBuilderLucidV1,
  TxBuilderLucidV3,
} from "./TxBuilders/index.js";

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
  private builders: Map<
    ETxBuilderType,
    Record<EContractVersion, TxBuilderV1 | TxBuilderV3>
  > = new Map();
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
  private async registerTxBuilders() {
    switch (this.options.wallet.builder.type) {
      case ETxBuilderType.LUCID: {
        const [{ TxBuilderLucidV1 }, { TxBuilderLucidV3 }] = await Promise.all([
          import("./TxBuilders/TxBuilder.Lucid.V1.class.js"),
          import("./TxBuilders/TxBuilder.Lucid.V3.class.js"),
        ]);

        this.builders.set(ETxBuilderType.LUCID, {
          [EContractVersion.V1]: new TxBuilderLucidV1(
            this.options.wallet.builder.lucid,
            this.options.wallet.network
          ),
          [EContractVersion.V3]: new TxBuilderLucidV3(
            this.options.wallet.builder.lucid,
            this.options.wallet.network
          ),
        });

        // Helper: initialize wallet if not already done so.
        if (!this.options.wallet.builder.lucid.wallet) {
          const extension = window.cardano?.[this.options.wallet.name];
          if (!extension) {
            throw new Error(
              `Could not find wallet extension: ${this.options.wallet.name}`
            );
          }

          extension
            .enable()
            .then((api) =>
              (this.options.wallet.builder as ILucidBuilder).lucid.selectWallet(
                api
              )
            );
        }

        break;
      }
      case ETxBuilderType.BLAZE: {
        const [{ TxBuilderBlazeV1 }, { TxBuilderBlazeV3 }] = await Promise.all([
          import("./TxBuilders/TxBuilder.Blaze.V1.class.js"),
          import("./TxBuilders/TxBuilder.Blaze.V3.class.js"),
        ]);

        this.builders.set(ETxBuilderType.BLAZE, {
          [EContractVersion.V1]: new TxBuilderBlazeV1(
            this.options.wallet.builder.blaze,
            this.options.wallet.network
          ),
          [EContractVersion.V3]: new TxBuilderBlazeV3(
            this.options.wallet.builder.blaze,
            this.options.wallet.network
          ),
        });

        break;
      }
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
  builder(contractVersion: EContractVersion.V1): TxBuilderV1;
  builder(contractVersion: EContractVersion.V3): TxBuilderV3;
  builder(
    contractVersion: EContractVersion.V1,
    txBuilderType?: ETxBuilderType
  ): TxBuilderV1;
  builder(
    contractVersion: EContractVersion.V3,
    txBuilderType?: ETxBuilderType
  ): TxBuilderV3;
  builder(
    contractVersion: EContractVersion.V3,
    txBuilderType: ETxBuilderType
  ): TxBuilderV3;
  builder(): TxBuilderV3;
  builder(
    contractVersion?: EContractVersion,
    txBuilderType?: ETxBuilderType
  ): TxBuilderV1 | TxBuilderV3;
  /**
   * Creates the appropriate transaction builder by which you can create valid transactions.
   *
   * @returns {TxBuilderV1}
   */
  builder(
    contractVersion: EContractVersion = EContractVersion.V3,
    txBuilderType: ETxBuilderType = ETxBuilderType.LUCID
  ): TxBuilderV1 | TxBuilderV3 {
    const contextBuilders = this.builders.get(txBuilderType);
    if (!contextBuilders) {
      throw new Error(
        "Could not find a matching TxBuilder for this builder type. Please register a custom builder with `.registerBuilder()` first, then try again."
      );
    }

    const builder = contextBuilders[contractVersion];

    switch (txBuilderType) {
      case ETxBuilderType.BLAZE:
        if (contractVersion === EContractVersion.V1) {
          return builder as TxBuilderBlazeV1;
        } else {
          return builder as TxBuilderBlazeV3;
        }
      case ETxBuilderType.LUCID:
      default:
        if (contractVersion === EContractVersion.V1) {
          return builder as TxBuilderLucidV1;
        } else {
          return builder as TxBuilderLucidV3;
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

  /**
   * Helper method to retrieve a Lucid instance.
   *
   * @returns {Lucid | undefined}
   */
  lucid(): Lucid | undefined {
    if (this.options.wallet.builder.type !== ETxBuilderType.LUCID) {
      return undefined;
    }

    const builder = this.builder(
      EContractVersion.V3,
      ETxBuilderType.LUCID
    ) as TxBuilderLucidV3;
    return builder.lucid;
  }

  /**
   * Helper method to retrieve a blaze instance.
   *
   * @returns {Blaze<Blockfrost, WebWallet> | undefined}
   */
  blaze():
    | Blaze<Blockfrost, WebWallet>
    | Blaze<EmulatorProvider, ColdWallet>
    | undefined {
    if (this.options.wallet.builder.type !== ETxBuilderType.BLAZE) {
      return undefined;
    }

    const builder = this.builder(
      EContractVersion.V3,
      ETxBuilderType.BLAZE
    ) as TxBuilderBlazeV3;

    return builder.blaze;
  }
}
