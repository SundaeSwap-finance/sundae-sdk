import { IAsset, IPoolData } from "../../@types";
import { AssetAmount } from "../AssetAmount.class";
import { SwapConfig } from "../Configs/SwapConfig.class";

const mockPool: IPoolData = {
  assetA: {
    assetId: "",
    decimals: 6,
  },
  assetB: {
    assetId:
      "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
    decimals: 0,
  },
  ident: "06",
  fee: "0.30",
  quantityA: "100",
  quantityB: "200",
};

const mockFunding: IAsset = {
  amount: new AssetAmount(20n, 6),
  assetId:
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

  it("should construct with a config", () => {
    const myConfig = new SwapConfig({
      pool: mockPool,
      orderAddresses: {
        DestinationAddress: {
          address: mockAddress,
        },
      },
      suppliedAsset: mockFunding,
    });

    expect(myConfig.buildArgs()).toEqual({
      pool: mockPool,
      orderAddresses: {
        DestinationAddress: {
          address: mockAddress,
        },
      },
      suppliedAsset: mockFunding,
      // 10% minus the pool fee
      minReceivable: new AssetAmount(8n, 6),
    });
  });

  it("it should set the pool correctly", () => {
    config.setPool(mockPool);
    expect(config.pool).toMatchObject(mockPool);
  });

  it("should set the suppliedAsset correctly", () => {
    const asset: IAsset = {
      amount: new AssetAmount(20n, 6),
      assetId: "",
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

  it("should throw when providing invalid assetIDs to setSuppliedAsset()", () => {
    config
      .setOrderAddresses({
        DestinationAddress: {
          address: mockAddress,
        },
      })
      .setMinReceivable(new AssetAmount(20n))
      .setPool(mockPool)
      .setSuppliedAsset({
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
          address: mockAddress,
        },
      })
      .setMinReceivable(new AssetAmount(20n))
      .setPool(mockPool)
      .setSuppliedAsset({
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
      .setPool(mockPool)
      .setMinReceivable(new AssetAmount(10n))
      .setSuppliedAsset(mockFunding);

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
      .setPool(mockPool)
      .setMinReceivable(new AssetAmount(20n))
      .setOrderAddresses({
        DestinationAddress: {
          address: mockAddress,
        },
      })
      .setSuppliedAsset(validFunding);

    expect(config.buildArgs()).toEqual({
      pool: mockPool,
      orderAddresses: {
        DestinationAddress: {
          address: mockAddress,
        },
      },
      minReceivable: new AssetAmount(20n, 0),
      suppliedAsset: validFunding,
    });
  });

  it("should validate correctly when no suppliedAsset is set", () => {
    config.setPool(mockPool).setOrderAddresses({
      DestinationAddress: {
        address: mockAddress,
      },
    });

    try {
      config.validate();
    } catch (e) {
      expect((e as Error).message).toEqual(
        "You haven't funded this swap on your SwapConfig! Fund the swap with .setSuppliedAsset()"
      );
    }
  });

  it("should validate correctly when no minReceivable is set", () => {
    config
      .setOrderAddresses({
        DestinationAddress: {
          address: mockAddress,
        },
      })
      .setPool(mockPool)
      .setSuppliedAsset(mockFunding);

    try {
      config.validate();
    } catch (e) {
      expect((e as Error).message).toEqual(
        "You haven't set a minimum receivable amount on your SwapConfig!"
      );
    }
  });
});
