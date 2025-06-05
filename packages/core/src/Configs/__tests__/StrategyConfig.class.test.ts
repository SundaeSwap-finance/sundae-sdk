import { beforeEach, describe, expect, it } from "bun:test";

import { AssetAmount } from "@sundaeswap/asset";
import { EDatumType } from "../../@types/index.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { StrategyConfig } from "../StrategyConfig.class";

let config: StrategyConfig;
beforeEach(() => {
  config = new StrategyConfig();
});

describe("StrategyConfig class", () => {
  it("should construct with no parameters", () => {
    expect(config).toBeInstanceOf(StrategyConfig);
  });

  it("should construct with a signer config", () => {
    const myConfig = new StrategyConfig({
      pool: PREVIEW_DATA.pools.v3,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          }
        }
      },
      authSigner: "cafed00d",
      suppliedAsset: PREVIEW_DATA.assets.tada,
    });

    expect(myConfig.buildArgs()).toMatchObject({
      pool: PREVIEW_DATA.pools.v3,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          }
        },
      },
      authSigner: "cafed00d",
      suppliedAsset: expect.objectContaining({
        amount: PREVIEW_DATA.assets.tada.amount,
        metadata: {
          decimals: PREVIEW_DATA.assets.tada.decimals,
          assetId: PREVIEW_DATA.assets.tada.metadata.assetId,
        },
      }),
    });
  });

  it("should construct with a script config", () => {
    const myConfig = new StrategyConfig({
      pool: PREVIEW_DATA.pools.v3,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          }
        }
      },
      authScript: "cafed00d",
      suppliedAsset: PREVIEW_DATA.assets.tada,
    });

    expect(myConfig.buildArgs()).toMatchObject({
      pool: PREVIEW_DATA.pools.v3,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          }
        },
      },
      authScript: "cafed00d",
      suppliedAsset: expect.objectContaining({
        amount: PREVIEW_DATA.assets.tada.amount,
        metadata: {
          decimals: PREVIEW_DATA.assets.tada.decimals,
          assetId: PREVIEW_DATA.assets.tada.metadata.assetId,
        },
      }),
    });
  });

  it("should throw when not calling setOrderAddresses()", () => {
    config
      .setPool(PREVIEW_DATA.pools.v3)
      .setAuthSigner("cafebabe")
      .setSuppliedAsset(
        new AssetAmount(20n, { assetId: "tINDY", decimals: 0 }),
      );

    expect(() => config.buildArgs()).toThrowError(new Error("You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()"))
  });

  it("should throw when not calling setPool()", () => {
    config
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      })
      .setAuthSigner("cafebabe")
      .setSuppliedAsset(new AssetAmount(20n, { assetId: "tINDY", decimals: 0 }));

      expect(() => config.buildArgs()).toThrowError(new Error("You haven't set a pool in your Config. Set a pool with .setPool()"))
  });

  it("should throw when not calling setAuthSigner() or setAuthScript()", () => {
    config
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      })
      .setPool(PREVIEW_DATA.pools.v3)
      .setSuppliedAsset(new AssetAmount(20n, { assetId: "tINDY", decimals: 0 }));

      expect(() => config.buildArgs()).toThrowError(new Error("You need to authorize someone to execute the strategy, by calling .setAuthSigner() or .setAuthScript()"))
  });

  it("should throw when calling both setAuthSigner() and setAuthScript()", () => {
    config
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      })
      .setPool(PREVIEW_DATA.pools.v3)
      .setAuthSigner("cafebabe")
      .setAuthScript("cafed00d")
      .setSuppliedAsset(new AssetAmount(20n, { assetId: "tINDY", decimals: 0 }));

      expect(() => config.buildArgs()).toThrowError(new Error("You may authorize with either a signer or a script, but not both."))
  });
});