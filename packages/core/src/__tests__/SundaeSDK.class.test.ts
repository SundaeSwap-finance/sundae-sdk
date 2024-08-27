import { jest } from "@jest/globals";
import { type Lucid } from "lucid-cardano";

import {
  EContractVersion,
  ETxBuilderType,
  ISundaeSDKOptions,
} from "../@types/index.js";
import { windowCardano } from "../exports/testing.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { SundaeSDK } from "../SundaeSDK.class.js";
import { setupLucid } from "../TestUtilities/setupLucid.js";
import { TxBuilderLucidV1 } from "../TxBuilders/TxBuilder.Lucid.V1.class.js";
import { TxBuilderLucidV3 } from "../TxBuilders/TxBuilder.Lucid.V3.class.js";

let lucidInstance: Lucid;
let defaultWallet: ISundaeSDKOptions["wallet"];

setupLucid(async (lucid) => {
  lucidInstance = lucid;
  defaultWallet = {
    name: "eternl",
    builder: {
      type: ETxBuilderType.LUCID,
      lucid,
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
  jest.resetModules();
});

describe("SundaeSDK", () => {
  it("should build settings with correct defaults", async () => {
    const sdk = await SundaeSDK.new({
      wallet: defaultWallet,
    });

    expect(sdk.getOptions()).toMatchObject<ISundaeSDKOptions>({
      debug: false,
      minLockAda: 5_000_000n,
      wallet: defaultWallet,
    });
  });

  it("should build settings with correct overrides", async () => {
    const sdk = await SundaeSDK.new({
      debug: true,
      minLockAda: 10_000_000n,
      wallet: defaultWallet,
    });

    expect(sdk.getOptions()).toMatchObject<ISundaeSDKOptions>({
      debug: false,
      minLockAda: 5_000_000n,
      wallet: defaultWallet,
    });
  });

  it("should populate correct TxBuilders", async () => {
    const sdk = await SundaeSDK.new({
      wallet: defaultWallet,
    });

    expect(sdk.builder()).toBeInstanceOf(TxBuilderLucidV3);
    expect(
      sdk.builder(EContractVersion.V1, ETxBuilderType.LUCID)
    ).toBeInstanceOf(TxBuilderLucidV1);
  });

  it("should populate correct QueryProvider", async () => {
    const sdk = await SundaeSDK.new({
      wallet: defaultWallet,
    });

    expect(sdk.query()).toBeInstanceOf(QueryProviderSundaeSwap);
  });

  it("should throw an error if given an invalid provider type", async () => {
    try {
      await SundaeSDK.new({
        wallet: {
          builder: {
            // @ts-ignore
            type: "invalid",
          },
        },
      });
    } catch (e) {
      expect((e as Error).message).toEqual(
        "A valid wallet provider type must be defined in your options object."
      );
    }
  });
});
