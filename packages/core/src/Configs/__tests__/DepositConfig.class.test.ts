import { EDatumType } from "../../@types/index.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { DepositConfig } from "../DepositConfig.class";

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
      pool: PREVIEW_DATA.pools.v1,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      },
      suppliedAssets: [PREVIEW_DATA.assets.tada, PREVIEW_DATA.assets.tindy],
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
      suppliedAssets: [PREVIEW_DATA.assets.tada, PREVIEW_DATA.assets.tindy],
      referralFee: undefined,
    });
  });

  it("it should set the pool correctly", () => {
    config.setPool(PREVIEW_DATA.pools.v1);
    expect(config.pool).toMatchObject(PREVIEW_DATA.pools.v1);
  });

  it("should set the suppliedAsset correctly", () => {
    config.setSuppliedAssets([
      PREVIEW_DATA.assets.tada,
      PREVIEW_DATA.assets.tindy,
    ]);
    expect(config.suppliedAssets).toMatchObject([
      PREVIEW_DATA.assets.tada,
      PREVIEW_DATA.assets.tindy,
    ]);
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
        "You did not provided funding for this deposit! Make sure you supply both sides of the pool with .setSuppliedAssets()"
      );
    }
  });
});
