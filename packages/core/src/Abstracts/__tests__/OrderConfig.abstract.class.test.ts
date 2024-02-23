import { EContractVersion, EDatumType, IPoolData } from "../../@types/index.js";
import { OrderConfig } from "../OrderConfig.abstract.class.js";

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
  assetLP: {
    assetId: "",
    decimals: 0,
  },
  ident: "06",
  currentFee: 0.3,
  liquidity: {
    aReserve: 100n,
    bReserve: 200n,
    lpTotal: 141n,
  },
  version: EContractVersion.V1,
};

const mockAddress =
  "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32";

class TestClass extends OrderConfig {
  constructor() {
    super();
  }

  setFromObject(): void {}

  buildArgs() {
    this.validate();

    return {};
  }

  validate(): void {
    super.validate();
  }
}

describe("OrderConfig", () => {
  it("should throw an Error when OrderAddresses are not set", () => {
    const config = new TestClass();
    config.setPool(mockPool);

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toStrictEqual(
        "You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()"
      );
    }
  });

  it("should throw an error if a pool isn't set", () => {
    const config = new TestClass();
    config.setOrderAddresses({
      DestinationAddress: {
        address: mockAddress,
        datum: {
          type: EDatumType.NONE,
        },
      },
    });

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toStrictEqual(
        "You haven't set a pool in your Config. Set a pool with .setPool()"
      );
    }
  });
});
