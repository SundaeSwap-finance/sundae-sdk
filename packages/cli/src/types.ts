/* eslint-disable no-console */
import {
  QueryProviderSundaeSwap,
  SundaeSDK,
  type ISundaeProtocolParamsFull,
  type TSupportedNetworks,
} from "@sundaeswap/core";
import {
  Sprinkle,
  WalletSettingsSchema,
  type TExact,
} from "@sundaeswap/sprinkles";
import type { CliSettingsSchema } from "./schema.js";
import { decrypt } from "./utils.js";
import { password } from "@inquirer/prompts";
import * as fs from "fs";
import * as path from "path";
import type { Blaze, Provider, Wallet } from "@blaze-cardano/sdk";

export interface IAppContext {
  sprinkle: Sprinkle<typeof CliSettingsSchema>;
  sdk(): Promise<SundaeSDK>;
  refreshSdk(): Promise<void>;
}

export function createAppContext(
  sprinkle: Sprinkle<typeof CliSettingsSchema>,
): IAppContext {
  let sdkInstance: SundaeSDK | undefined;
  let initPromise: Promise<void> | undefined;

  async function ensureInitialized(): Promise<void> {
    if (sdkInstance) return;
    if (!initPromise) {
      initPromise = doRefreshSdk();
    }
    await initPromise;
  }

  async function doRefreshSdk(): Promise<void> {
    const settings = sprinkle.settings;

    // Build wallet settings for Sprinkle.GetBlaze
    // For hot wallets, decrypt the private key with user's password
    let walletSettings: TExact<typeof WalletSettingsSchema>;
    if (settings.wallet.type === "hot") {
      let privateKey: string | undefined;
      do {
        const pw = await password({
          message: "Enter wallet password",
        });
        privateKey = await decrypt(settings.wallet.privateKey, pw);
      } while (!privateKey);
      walletSettings = { type: "hot", privateKey };
    } else {
      walletSettings = {
        type: "cold",
        address: settings.wallet.address,
      };
    }

    const blazeInstance = await Sprinkle.GetBlaze(
      settings.network,
      settings.provider,
      walletSettings,
    );

    if (!sdkInstance) {
      sdkInstance = SundaeSDK.new({ blazeInstance });
    } else {
      sdkInstance.options.blazeInstance = blazeInstance as Blaze<
        Provider,
        Wallet
      >;
    }

    // Load custom validators per pool type
    if (settings.customValidators) {
      const queryProvider = new QueryProviderSundaeSwap(
        settings.network as TSupportedNetworks,
      );

      // First pass: load all param files
      const loadedParams: Record<string, ISundaeProtocolParamsFull> = {};
      for (const [version, entry] of Object.entries(
        settings.customValidators,
      )) {
        if (!entry?.paramsPath) continue;
        try {
          const paramsJson = fs.readFileSync(
            path.resolve(entry.paramsPath),
            "utf-8",
          );
          loadedParams[version] = JSON.parse(
            paramsJson,
          ) as ISundaeProtocolParamsFull;
        } catch (error) {
          console.error(
            `Failed to load custom params for ${version} from ${entry.paramsPath}:`,
            error,
          );
        }
      }

      // Second pass: apply settingsSource overrides
      for (const [version, entry] of Object.entries(
        settings.customValidators,
      )) {
        if (!entry?.settingsSource || !loadedParams[version]) continue;
        const sourceParams = loadedParams[entry.settingsSource];
        if (!sourceParams) {
          console.warn(
            `settingsSource "${entry.settingsSource}" for ${version} not found in loaded params, skipping`,
          );
          continue;
        }
        const sourceSettingsMint = sourceParams.blueprint.validators.find(
          (v) => v.title === "settings.mint",
        );
        if (sourceSettingsMint) {
          const targetValidators = loadedParams[version].blueprint.validators;
          const existingIdx = targetValidators.findIndex(
            (v) => v.title === "settings.mint",
          );
          if (existingIdx >= 0) {
            targetValidators[existingIdx] = sourceSettingsMint;
          } else {
            targetValidators.push(sourceSettingsMint);
          }
        }
      }

      // Third pass: register all custom params with query provider
      for (const params of Object.values(loadedParams)) {
        queryProvider.addCustomProtocolParams(params);
      }

      sdkInstance.queryProvider = queryProvider;
      [...sdkInstance.builders.values()].forEach((builder) => {
        builder.setQueryProvider(queryProvider);
      });
    }
  }

  const ctx: IAppContext = {
    sprinkle,

    async sdk(): Promise<SundaeSDK> {
      await ensureInitialized();
      return sdkInstance!;
    },

    async refreshSdk(): Promise<void> {
      sdkInstance = undefined;
      initPromise = undefined;
      await ensureInitialized();
    },
  };

  return ctx;
}
