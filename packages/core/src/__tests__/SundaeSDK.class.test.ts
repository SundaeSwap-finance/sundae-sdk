import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";

import { EContractVersion, ISundaeSDKOptions } from "../@types/index.js";
import { windowCardano } from "../exports/testing.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { SundaeSDK } from "../SundaeSDK.class.js";
import { setupBlaze } from "../TestUtilities/setupBlaze.js";
import { TxBuilderV1 } from "../TxBuilders/TxBuilder.V1.class.js";
import { TxBuilderV3 } from "../TxBuilders/TxBuilder.V3.class.js";
let defaultWallet: ISundaeSDKOptions["blazeInstance"];

setupBlaze(async (blaze) => {
  defaultWallet = blaze;
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
      blazeInstance: defaultWallet,
    });

    expect(sdk.options).toMatchObject({
      debug: false,
      minLockAda: 5_000_000n,
      blazeInstance: defaultWallet,
    } as ISundaeSDKOptions);
  });

  it("should build settings with correct overrides", async () => {
    const sdk = await SundaeSDK.new({
      debug: true,
      minLockAda: 10_000_000n,
      blazeInstance: defaultWallet,
    });

    expect(sdk.options).toMatchObject({
      debug: false,
      minLockAda: 5_000_000n,
      blazeInstance: defaultWallet,
    } as ISundaeSDKOptions);
  });

  it("should populate correct TxBuilders", async () => {
    const sdk = await SundaeSDK.new({
      blazeInstance: defaultWallet,
    });

    expect(sdk.builder()).toBeInstanceOf(TxBuilderV3);
    expect(sdk.builder(EContractVersion.V1)).toBeInstanceOf(TxBuilderV1);
  });

  it("should populate correct QueryProvider", async () => {
    const sdk = await SundaeSDK.new({
      blazeInstance: defaultWallet,
    });

    expect(sdk.query()).toBeInstanceOf(QueryProviderSundaeSwap);
  });
});
