import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";

import { EmulatorProvider } from "@blaze-cardano/emulator";
import { Blaze, ColdWallet } from "@blaze-cardano/sdk";
import {
  EContractVersion,
  ISundaeSDKOptions,
} from "../@types/index.js";
import { windowCardano } from "../exports/testing.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { SundaeSDK } from "../SundaeSDK.class.js";
import { setupBlaze } from "../TestUtilities/setupBlaze.js";
import { TxBuilderV1 } from "../TxBuilders/TxBuilder.V1.class.js";
import { TxBuilderV3 } from "../TxBuilders/TxBuilder.V3.class.js";

let lucidInstance: Blaze<EmulatorProvider, ColdWallet>;
let defaultWallet: ISundaeSDKOptions["wallet"];

setupBlaze(async (blaze) => {
  lucidInstance = blaze;
  defaultWallet = {
    name: "eternl",
    network: "preview",
    blazeInstance: blaze
  };
});

beforeAll(() => {
  global.window = {
    // @ts-ignore
    cardano: windowCardano,
  };
});

afterAll(() => {
  mock.restore();
});

describe("SundaeSDK", () => {
  it("should build settings with correct defaults", async () => {
    const sdk = await SundaeSDK.new({
      wallet: defaultWallet,
    });

    expect(sdk.getOptions()).toMatchObject({
      debug: false,
      minLockAda: 5_000_000n,
      wallet: defaultWallet,
    } as ISundaeSDKOptions);
  });

  it("should build settings with correct overrides", async () => {
    const sdk = await SundaeSDK.new({
      debug: true,
      minLockAda: 10_000_000n,
      wallet: defaultWallet,
    });

    expect(sdk.getOptions()).toMatchObject({
      debug: false,
      minLockAda: 5_000_000n,
      wallet: defaultWallet,
    } as ISundaeSDKOptions);
  });

  it("should populate correct TxBuilders", async () => {
    const sdk = await SundaeSDK.new({
      wallet: defaultWallet,
    });

    expect(sdk.builder()).toBeInstanceOf(TxBuilderV3);
    expect(
      sdk.builder(EContractVersion.V1),
    ).toBeInstanceOf(TxBuilderV1);
  });

  it("should populate correct QueryProvider", async () => {
    const sdk = await SundaeSDK.new({
      wallet: defaultWallet,
    });

    expect(sdk.query()).toBeInstanceOf(QueryProviderSundaeSwap);
  });
});
