import { AssetAmount } from "../../AssetAmount.class";
import { SwapConfig } from "../../SwapConfig.class";

const mockPool = {
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
    expect(config.getPool()).toMatchObject(mockPool);
  });

  it("setFunding and getFunding", () => {
    const asset = {
      amount: new AssetAmount(20n, 6),
      assetID: "",
    };

    config.setFunding(asset);
    expect(config.getFunding()).toMatchObject(asset);
  });

  it("setReceiverAddress and getReceiverAddress", () => {
    const address = "test address";
    config.setReceiverAddress(address);
    expect(config.getReceiverAddress()).toEqual(address);
  });

  it("should throw when providing invalid assetIDs to setPool()", () => {
    config.setPool({
      ...mockPool,
      assetA: {
        ...mockPool.assetA,
        assetId: "ADA",
      },
    });

    try {
      config.build();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "The parameter should have a minimum length of 56: assetID. Received (3) ADA"
      );
    }

    config.setPool({
      ...mockPool,
      assetB: {
        ...mockPool.assetB,
        assetId: "tINDY",
      },
    });

    try {
      config.build();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "The parameter should have a minimum length of 56: assetID. Received (5) tINDY"
      );
    }

    config.setPool({
      ...mockPool,
      assetB: {
        ...mockPool.assetB,
        assetId:
          "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459",
      },
    });

    try {
      config.build();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "Invalid assetID: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459. You likely forgot to concatenate with a period, like so: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459"
      );
    }
  });

  it("should throw an error if a pool isn't set", () => {
    config.setFunding({
      amount: new AssetAmount(20n, 6),
      assetID: "tINDY",
    });

    try {
      config.build();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "The parameter does not exist: pool. Use the setPool() method."
      );
    }
  });

  it("should throw when providing invalid assetIDs to setFunding()", () => {
    config
      .setReceiverAddress(mockAddress)
      .setPool(mockPool)
      .setFunding({
        amount: new AssetAmount(20n, 6),
        assetID: "tINDY",
      });

    try {
      config.build();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "The parameter should have a minimum length of 56: assetID. Received (5) tINDY"
      );
    }

    config
      .setReceiverAddress(mockAddress)
      .setPool(mockPool)
      .setFunding({
        amount: new AssetAmount(20n, 6),
        assetID:
          "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459",
      });

    try {
      config.build();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "Invalid assetID: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459. You likely forgot to concatenate with a period, like so: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459"
      );
    }
  });

  it("should throw when not providing a receiving address", () => {
    config.setPool(mockPool).setFunding(mockFunding);

    try {
      config.build();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "The parameter does not exist: receiverAddress. Use the setreceiverAddress() method."
      );
    }
  });

  it("should build without errors", () => {
    const validFunding = {
      amount: new AssetAmount(2n, 6),
      assetID: "",
    };

    config
      .setPool(mockPool)
      .setReceiverAddress(mockAddress)
      .setFunding(validFunding);

    expect(config.build()).toEqual({
      ...mockPool,
      receiverAddress: mockAddress,
      givenAsset: validFunding,
    });
  });
});
