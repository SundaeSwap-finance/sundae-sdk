import { PREVIEW_DATA } from "../../../testing/mockData";
import { IAsset } from "../../../@types";
import { AssetAmount } from "../../AssetAmount.class";
import { WithdrawConfig } from "../WithdrawConfig.class";

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
      pool: PREVIEW_DATA.pool,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      },
      suppliedLPAsset: PREVIEW_DATA.assets.tindy,
    });

    expect(myConfig.buildArgs()).toEqual({
      pool: PREVIEW_DATA.pool,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      },
      suppliedLPAsset: PREVIEW_DATA.assets.tindy,
    });
  });

  it("it should set the pool correctly", () => {
    config.setPool(PREVIEW_DATA.pool);
    expect(config.pool).toMatchObject(PREVIEW_DATA.pool);
  });

  it("should set the suppliedAsset correctly", () => {
    const asset: IAsset = {
      amount: new AssetAmount(20n, 6),
      assetId: "",
    };

    config.setSuppliedLPAsset(asset);
    expect(config.suppliedLPAsset).toMatchObject(asset);
  });

  it("should set the orderAddresses correctly", () => {
    config.setOrderAddresses({
      DestinationAddress: {
        address: PREVIEW_DATA.address,
      },
    });
    expect(config.orderAddresses).toEqual({
      DestinationAddress: {
        address: PREVIEW_DATA.address,
      },
    });
  });

  it("should throw an error if a pool isn't set", () => {
    config.setSuppliedLPAsset({
      amount: new AssetAmount(20n, 6),
      assetId: "tINDY",
    });

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "You haven't set a pool in your Config. Set a pool with .setPool()"
      );
    }
  });

  it("should throw when providing invalid assetIDs to setSuppliedLPAsset()", () => {
    config
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      })
      .setPool(PREVIEW_DATA.pool)
      .setSuppliedLPAsset({
        amount: new AssetAmount(20n, 6),
        assetId: "tINDY",
      });

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()"
      );
    }

    config
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      })
      .setPool(PREVIEW_DATA.pool)
      .setSuppliedLPAsset({
        amount: new AssetAmount(20n, 6),
        assetId:
          "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459",
      });

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "Invalid assetId: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459. You likely forgot to concatenate with a period, like so: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459"
      );
    }
  });

  it("should throw when not providing a receiving address", () => {
    config
      .setPool(PREVIEW_DATA.pool)
      .setSuppliedLPAsset(PREVIEW_DATA.assets.tindy);

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()"
      );
    }
  });

  it("should run buildArgs() without errors", () => {
    const validFunding: IAsset = {
      amount: new AssetAmount(2n, 6),
      assetId: "",
    };

    config
      .setPool(PREVIEW_DATA.pool)
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      })
      .setSuppliedLPAsset(validFunding);

    expect(config.buildArgs()).toEqual({
      pool: PREVIEW_DATA.pool,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      },
      suppliedLPAsset: validFunding,
    });
  });

  it("should throw an error when validating with no suppliedLPAsset defined", () => {
    config.setPool(PREVIEW_DATA.pool).setOrderAddresses({
      DestinationAddress: {
        address: PREVIEW_DATA.address,
      },
    });

    try {
      config.validate();
    } catch (e) {
      expect((e as Error).message).toEqual(
        "There was no LP asset set! Set the LP token with .setSuppliedLPAsset()"
      );
    }
  });
});
