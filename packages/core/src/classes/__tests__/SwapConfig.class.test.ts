import { IPoolData } from "../../@types";
import { AssetAmount } from "../AssetAmount.class";
import { SwapConfig } from "../SwapConfig.class";

const mockPool: IPoolData = {
  assetA: {
    assetID: "",
    decimals: 6,
  },
  assetB: {
    assetID:
      "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
    decimals: 0,
  },
  ident: "06",
  fee: "0.30",
  quantityA: "100",
  quantityB: "200",
};

const mockFunding = {
  amount: new AssetAmount(20n, 6),
  assetID:
    "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
};

const mockAddress =
  "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32";

let config: SwapConfig;
beforeEach(() => {
  config = new SwapConfig();
});

describe("SwapConfig class", () => {
  it("should construct with no parameters", () => {
    expect(config).toBeInstanceOf(SwapConfig);
  });

  it("setPool and getPool", () => {
    config.setPool(mockPool);
    expect(config.pool).toMatchObject(mockPool);
  });

  it("setSuppliedAsset and getFunding", () => {
    const asset = {
      amount: new AssetAmount(20n, 6),
      assetID: "",
    };

    config.setSuppliedAsset(asset);
    expect(config.suppliedAsset).toMatchObject(asset);
  });

  it("setEscrowAddress and getEscrowAddress", () => {
    config.setOrderAddresses({
      DestinationAddress: {
        address: mockAddress,
      },
    });
    expect(config.orderAddresses).toEqual({
      DestinationAddress: {
        address: mockAddress,
      },
    });
  });

  it("should throw an error if a pool isn't set", () => {
    config.setSuppliedAsset({
      amount: new AssetAmount(20n, 6),
      assetID: "tINDY",
    });

    try {
      config.buildSwapArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "The pool property is not defined. Set with .setPool()"
      );
    }
  });

  it("should throw when providing invalid assetIDs to setSuppliedAsset()", () => {
    config
      .setOrderAddresses({
        DestinationAddress: {
          address: mockAddress,
        },
      })
      .setPool(mockPool)
      .setSuppliedAsset({
        amount: new AssetAmount(20n, 6),
        assetID: "tINDY",
      });

    try {
      config.buildSwapArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "The orderAddresses property is not defined. Set with .setOrderAddresses()"
      );
    }

    config
      .setOrderAddresses({
        DestinationAddress: {
          address: mockAddress,
        },
      })
      .setPool(mockPool)
      .setSuppliedAsset({
        amount: new AssetAmount(20n, 6),
        assetID:
          "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459",
      });

    try {
      config.buildSwapArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "Invalid assetID: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459. You likely forgot to concatenate with a period, like so: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459"
      );
    }
  });

  it("should throw when not providing a receiving address", () => {
    config.setPool(mockPool).setSuppliedAsset(mockFunding);

    try {
      config.buildSwapArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "The orderAddresses property is not defined. Set with .setOrderAddresses()"
      );
    }
  });

  it("should run buildSwapArgs() without errors", () => {
    const validFunding = {
      amount: new AssetAmount(2n, 6),
      assetID: "",
    };

    config
      .setPool(mockPool)
      .setOrderAddresses({
        DestinationAddress: {
          address: mockAddress,
        },
      })
      .setSuppliedAsset(validFunding);

    expect(config.buildSwapArgs()).toEqual({
      pool: mockPool,
      orderAddresses: {
        DestinationAddress: {
          address: mockAddress,
        },
      },
      minReceivable: new AssetAmount(1n, 0),
      suppliedAsset: validFunding,
    });
  });
});
