import { IPoolData } from "../../../@types";
import { Config } from "../Config.abstract.class";

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

const mockAddress =
  "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32";

class TestClass extends Config {
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

describe("Config.buildArgs()", () => {
  it("should throw an Error when OrderAddresses are not set", () => {
    const config = new TestClass();
    config.setPool(mockPool);

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toEqual(
        "You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()"
      );
    }
  });

  it("should throw an error if a pool isn't set", () => {
    const config = new TestClass();
    config.setOrderAddresses({
      DestinationAddress: {
        address: mockAddress,
      },
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
});
