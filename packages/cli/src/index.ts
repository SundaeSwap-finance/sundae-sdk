#!/usr/bin/env node

import { Sprinkle } from "@sundaeswap/sprinkles";
import { CliSettingsSchema } from "./schema.js";
import { createAppContext } from "./types.js";
import { mainMenu } from "./menus/main.js";
import { join } from "path";
import { homedir } from "os";
import { existsSync, readFileSync, writeFileSync } from "fs";

const storagePath = join(homedir(), ".sundaeswap-cli");
const settingsPath = join(storagePath, "settings.json");

// Migrate old flat settings format to new Sprinkles format
if (existsSync(settingsPath)) {
  try {
    const raw = readFileSync(settingsPath, "utf-8");
    const parsed = JSON.parse(raw);

    // Migrate customProtocolParamsPath -> customValidators
    if (
      parsed?.settings?.customProtocolParamsPath &&
      !parsed?.settings?.customValidators
    ) {
      try {
        const oldPath = parsed.settings.customProtocolParamsPath;
        const oldParams = JSON.parse(readFileSync(oldPath, "utf-8"));
        const version = oldParams.version ?? "V3";
        parsed.settings.customValidators = {
          [version]: { paramsPath: oldPath },
        };
        delete parsed.settings.customProtocolParamsPath;
        writeFileSync(settingsPath, JSON.stringify(parsed, null, 2), "utf-8");
        console.log(
          `Migrated customProtocolParamsPath to customValidators.${version}`,
        );
      } catch {
        // Best-effort migration; remove old field either way
        delete parsed.settings.customProtocolParamsPath;
        writeFileSync(settingsPath, JSON.stringify(parsed, null, 2), "utf-8");
      }
    }

    // Old format is a flat object without a "settings" wrapper
    if (parsed && !("settings" in parsed) && "providerType" in parsed) {
      console.log("Migrating settings to new format...");

      const old = parsed as {
        network?: string;
        walletType?: string;
        address?: string;
        privateKey?: string;
        providerType?: string;
        providerKey?: string;
        customProtocolParams?: unknown;
      };

      const provider =
        old.providerType === "maestro"
          ? { type: "maestro" as const, apiKey: old.providerKey ?? "" }
          : {
              type: "blockfrost" as const,
              projectId: old.providerKey ?? "",
            };

      const wallet =
        old.walletType === "hot"
          ? {
              type: "hot" as const,
              privateKey: old.privateKey ?? "",
              address: old.address ?? "",
            }
          : { type: "cold" as const, address: old.address ?? "" };

      const migrated = {
        settings: {
          network: old.network ?? "mainnet",
          provider,
          wallet,
        },
        defaults: {},
      };

      writeFileSync(settingsPath, JSON.stringify(migrated, null, 2), "utf-8");
      console.log("Settings migrated successfully.");
    }
  } catch (e) {
    // If migration fails, Sprinkle.New will prompt for fresh settings
    console.warn("Could not migrate old settings, starting fresh:", e);
  }
}

const sprinkle = await Sprinkle.New(CliSettingsSchema, storagePath);

const ctx = createAppContext(sprinkle);

await sprinkle.showMenu(mainMenu(ctx));
