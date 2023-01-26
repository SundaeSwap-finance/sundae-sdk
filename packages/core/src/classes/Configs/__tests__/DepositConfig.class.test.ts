import { IAsset, IPoolData } from "../../../@types";
import { AssetAmount } from "../../AssetAmount.class";
import { DepositConfig } from "../DepositConfig.class";

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

const mockFundingA: IAsset = {
  amount: new AssetAmount(20n, 6),
  assetId: "",
};

const mockFundingB: IAsset = {
  amount: new AssetAmount(20n, 6),
  assetId:
    "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
};

const mockAddress =
  "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32";

let config: DepositConfig;
beforeEach(() => {
  config = new DepositConfig();
});

describe("WithdrawConfig class", () => {
  it("should construct with no parameters", () => {
    expect(config).toBeInstanceOf(DepositConfig);
  });

  it("should construct with a config", () => {
    const myConfig = new DepositConfig({
      pool: mockPool,
      orderAddresses: {
        DestinationAddress: {
          address: mockAddress,
        },
      },
      suppliedAssets: [mockFundingA, mockFundingB],
    });

    expect(myConfig.buildArgs()).toEqual({
      pool: mockPool,
      orderAddresses: {
        DestinationAddress: {
          address: mockAddress,
        },
      },
      suppliedAssets: [mockFundingA, mockFundingB],
    });
  });

  it("it should set the pool correctly", () => {
    config.setPool(mockPool);
    expect(config.pool).toMatchObject(mockPool);
  });

  it("should set the suppliedAsset correctly", () => {
    config.setSuppliedAssets([mockFundingA, mockFundingB]);
    expect(config.suppliedAssets).toMatchObject([mockFundingA, mockFundingB]);
  });

  it("should set the orderAddresses correctly", () => {
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

  it("should throw an error when validating with no suppliedLPAsset defined", () => {
    config.setPool(mockPool).setOrderAddresses({
      DestinationAddress: {
        address: mockAddress,
      },
    });

    try {
      config.validate();
    } catch (e) {
      expect((e as Error).message).toEqual(
        "You did not provided funding for this deposit! Make sure you supply both sides of the pool with .setSuppliedAssets()"
      );
    }
  });
});
