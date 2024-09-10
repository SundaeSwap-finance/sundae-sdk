import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";

import { EmulatorProvider } from "@blaze-cardano/emulator";
import { Blaze, ColdWallet } from "@blaze-cardano/sdk";
import {
  EContractVersion,
  ETxBuilderType,
  ISundaeSDKOptions,
} from "../@types/index.js";
import { windowCardano } from "../exports/testing.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { SundaeSDK } from "../SundaeSDK.class.js";
import { setupBlaze } from "../TestUtilities/setupBlaze.js";
import { TxBuilderBlazeV1 } from "../TxBuilders/TxBuilder.Blaze.V1.class.js";
import { TxBuilderBlazeV3 } from "../TxBuilders/TxBuilder.Blaze.V3.class.js";

let lucidInstance: Blaze<EmulatorProvider, ColdWallet>;
let defaultWallet: ISundaeSDKOptions["wallet"];

setupBlaze(async (blaze) => {
  lucidInstance = blaze;
  defaultWallet = {
    name: "eternl",
    builder: {
      type: ETxBuilderType.BLAZE,
      blaze,
    },
    network: "preview",
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

    expect(sdk.builder()).toBeInstanceOf(TxBuilderBlazeV3);
    expect(
      sdk.builder(EContractVersion.V1, ETxBuilderType.BLAZE)
    ).toBeInstanceOf(TxBuilderBlazeV1);
  });

  it("should populate correct QueryProvider", async () => {
    const sdk = await SundaeSDK.new({
      wallet: defaultWallet,
    });

    expect(sdk.query()).toBeInstanceOf(QueryProviderSundaeSwap);
  });

  it("should throw an error if given an invalid provider type", async () => {
    expect(() =>
      SundaeSDK.new({
        wallet: {
          builder: {
            // @ts-ignore
            type: "invalid",
          },
        },
      })
    ).toThrowError(
      new Error(
        "A valid wallet provider type must be defined in your options object."
      )
    );
  });
});
