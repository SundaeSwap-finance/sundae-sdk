import { beforeEach, describe, expect, it } from "bun:test";

import { AssetAmount } from "@sundaeswap/asset";
import { EDatumType, EDestinationType } from "../../@types/index.js";
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
      destination: {
        type: EDestinationType.FIXED,
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      },
      authSigner: "cafed00d",
      suppliedAsset: PREVIEW_DATA.assets.tada,
    });

    expect(myConfig.buildArgs()).toMatchObject({
      pool: PREVIEW_DATA.pools.v3,
      destination: {
        type: EDestinationType.FIXED,
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      },
      ownerAddress: PREVIEW_DATA.addresses.current,
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
      destination: {
        type: EDestinationType.SELF,
      },
      ownerAddress: PREVIEW_DATA.addresses.current,
      authScript: "cafed00d",
      suppliedAsset: PREVIEW_DATA.assets.tada,
    });

    expect(myConfig.buildArgs()).toMatchObject({
      pool: PREVIEW_DATA.pools.v3,
      destination: {
        type: EDestinationType.SELF,
      },
      ownerAddress: PREVIEW_DATA.addresses.current,
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

  it("should throw when not calling setDestination()", () => {
    config
      .setPool(PREVIEW_DATA.pools.v3)
      .setAuthSigner("cafebabe")
      .setSuppliedAsset(
        new AssetAmount(20n, { assetId: "tINDY", decimals: 0 }),
      );

    expect(() => config.buildArgs()).toThrowError(new Error("You haven't defined the Destination in your Config. Set with .setDestination()"))
  });

  it("should throw when not calling setPool()", () => {
    config
      .setDestination({
        type: EDestinationType.FIXED,
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      })
      .setAuthSigner("cafebabe")
      .setSuppliedAsset(new AssetAmount(20n, { assetId: "tINDY", decimals: 0 }));

      expect(() => config.buildArgs()).toThrowError(new Error("You haven't set a pool in your Config. Set a pool with .setPool()"))
  });

  it("should throw when not calling setAuthSigner() or setAuthScript()", () => {
    config
      .setDestination({
        type: EDestinationType.FIXED,
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      })
      .setPool(PREVIEW_DATA.pools.v3)
      .setSuppliedAsset(new AssetAmount(20n, { assetId: "tINDY", decimals: 0 }));

      expect(() => config.buildArgs()).toThrowError(new Error("You need to authorize someone to execute the strategy, by calling .setAuthSigner() or .setAuthScript()"))
  });

  it("should throw when calling both setAuthSigner() and setAuthScript()", () => {
    config
      .setDestination({
        type: EDestinationType.FIXED,
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      })
      .setPool(PREVIEW_DATA.pools.v3)
      .setAuthSigner("cafebabe")
      .setAuthScript("cafed00d")
      .setSuppliedAsset(new AssetAmount(20n, { assetId: "tINDY", decimals: 0 }));

      expect(() => config.buildArgs()).toThrowError(new Error("You may authorize with either a signer or a script, but not both."))
  });

  it("should default executionCount to 1n when not provided", () => {
    const myConfig = new StrategyConfig({
      pool: PREVIEW_DATA.pools.v3,
      destination: {
        type: EDestinationType.FIXED,
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      },
      authSigner: "cafed00d",
      suppliedAsset: PREVIEW_DATA.assets.tada,
    });

    expect(myConfig.buildArgs().executionCount).toBe(1n);
  });

  it("should use provided executionCount when explicitly set", () => {
    const myConfig = new StrategyConfig({
      pool: PREVIEW_DATA.pools.v3,
      destination: {
        type: EDestinationType.FIXED,
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      },
      authSigner: "cafed00d",
      suppliedAsset: PREVIEW_DATA.assets.tada,
      executionCount: 5n,
    });

    expect(myConfig.buildArgs().executionCount).toBe(5n);
  });

  it("should throw when executionCount is 0n", () => {
    config
      .setDestination({
        type: EDestinationType.FIXED,
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      })
      .setPool(PREVIEW_DATA.pools.v3)
      .setAuthSigner("cafebabe")
      .setSuppliedAsset(new AssetAmount(20n, { assetId: "tINDY", decimals: 0 }))
      .setExecutionCount(0n);

    expect(() => config.buildArgs()).toThrowError(
      new Error("executionCount must be a positive bigint or undefined")
    );
  });

  it("should throw when executionCount is negative", () => {
    config
      .setDestination({
        type: EDestinationType.FIXED,
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      })
      .setPool(PREVIEW_DATA.pools.v3)
      .setAuthSigner("cafebabe")
      .setSuppliedAsset(new AssetAmount(20n, { assetId: "tINDY", decimals: 0 }))
      .setExecutionCount(-1n);

    expect(() => config.buildArgs()).toThrowError(
      new Error("executionCount must be a positive bigint or undefined")
    );
  });
});