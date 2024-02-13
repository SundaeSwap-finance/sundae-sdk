import { AssetAmount } from "@sundaeswap/asset";

import { EDatumType } from "../../@types/index.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { WithdrawConfig } from "../WithdrawConfig.class.js";

let config: WithdrawConfig;
beforeEach(() => {
  config = new WithdrawConfig();
});

describe("WithdrawConfig class", () => {
  it("should construct with no parameters", () => {
    expect(config).toBeInstanceOf(WithdrawConfig);
  });

  it("should construct with a config", () => {
    const myConfig = new WithdrawConfig({
      pool: PREVIEW_DATA.pools.v1,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      },
      suppliedLPAsset: PREVIEW_DATA.assets.tindy,
    });

    expect(myConfig.buildArgs()).toStrictEqual({
      pool: PREVIEW_DATA.pools.v1,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      },
      suppliedLPAsset: PREVIEW_DATA.assets.tindy,
      referralFee: undefined,
    });
  });

  it("it should set the pool correctly", () => {
    config.setPool(PREVIEW_DATA.pools.v1);
    expect(config.pool).toMatchObject(PREVIEW_DATA.pools.v1);
  });

  it("should set the suppliedAsset correctly", () => {
    const asset = new AssetAmount(20n, { assetId: "", decimals: 6 });

    config.setSuppliedLPAsset(asset);
    expect(config.suppliedLPAsset).toMatchObject(asset);
  });

  it("should set the orderAddresses correctly", () => {
    config.setOrderAddresses({
      DestinationAddress: {
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      },
    });
    expect(config.orderAddresses).toStrictEqual({
      DestinationAddress: {
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      },
    });
  });

  it("should throw an error if a pool isn't set", () => {
    config.setSuppliedLPAsset(
      new AssetAmount(20n, { assetId: "tINDY", decimals: 6 })
    );

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toStrictEqual(
        "You haven't set a pool in your Config. Set a pool with .setPool()"
      );
    }
  });

  it("should throw when providing invalid assetIDs to setSuppliedLPAsset()", () => {
    config
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      })
      .setPool(PREVIEW_DATA.pools.v1)
      .setSuppliedLPAsset(
        new AssetAmount(20n, { assetId: "tINDY", decimals: 6 })
      );

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toStrictEqual(
        "You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()"
      );
    }

    config
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      })
      .setPool(PREVIEW_DATA.pools.v1)
      .setSuppliedLPAsset(
        new AssetAmount(20n, {
          assetId:
            "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459",
          decimals: 6,
        })
      );

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toStrictEqual(
        "Invalid assetId: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459. You likely forgot to concatenate with a period, like so: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459"
      );
    }
  });

  it("should throw when not providing a receiving address", () => {
    config
      .setPool(PREVIEW_DATA.pools.v1)
      .setSuppliedLPAsset(PREVIEW_DATA.assets.tindy);

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toStrictEqual(
        "You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()"
      );
    }
  });

  it("should run buildArgs() without errors", () => {
    const validFunding = new AssetAmount(2n, { assetId: "", decimals: 6 });

    config
      .setPool(PREVIEW_DATA.pools.v1)
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      })
      .setSuppliedLPAsset(validFunding);

    expect(config.buildArgs()).toStrictEqual({
      pool: PREVIEW_DATA.pools.v1,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      },
      suppliedLPAsset: validFunding,
      referralFee: undefined,
    });
  });

  it("should throw an error when validating with no suppliedLPAsset defined", () => {
    config.setPool(PREVIEW_DATA.pools.v1).setOrderAddresses({
      DestinationAddress: {
        address: PREVIEW_DATA.addresses.current,
        datum: {
          type: EDatumType.NONE,
        },
      },
    });

    try {
      config.validate();
    } catch (e) {
      expect((e as Error).message).toStrictEqual(
        "There was no LP asset set! Set the LP token with .setSuppliedLPAsset()"
      );
    }
  });
});
