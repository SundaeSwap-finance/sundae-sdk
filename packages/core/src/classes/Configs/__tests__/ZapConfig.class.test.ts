import { ZapConfig } from "../ZapConfig.class";
import { PREVIEW_DATA } from "../../../testing/mockData";
import { PoolCoin, ZapConfigArgs } from "../../../@types";

let config: ZapConfig;
beforeEach(() => {
  config = new ZapConfig();
});

describe("ZapConfig class", () => {
  it("should construct with no parameters", () => {
    expect(config).toBeInstanceOf(ZapConfig);
  });

  it("should construct with a config", () => {
    const myConfig = new ZapConfig({
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      },
      pool: PREVIEW_DATA.pool,
      suppliedAsset: PREVIEW_DATA.assets.tada,
      zapDirection: PoolCoin.A,
      swapSlippage: 0.3,
    });

    expect(myConfig.buildArgs()).toStrictEqual({
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      },
      pool: PREVIEW_DATA.pool,
      suppliedAsset: expect.objectContaining({
        amount: PREVIEW_DATA.assets.tada.amount,
      }),
      referralFee: undefined,
      zapDirection: PoolCoin.A,
      swapSlippage: 0.3,
    });
  });

  it("should correctly set the setFromObject method", () => {
    const zap = new ZapConfig();
    expect(() => zap.buildArgs()).toThrow();

    const myConfig: ZapConfigArgs = {
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      },
      pool: PREVIEW_DATA.pool,
      suppliedAsset: PREVIEW_DATA.assets.tada,
      zapDirection: PoolCoin.A,
      swapSlippage: 0.3,
    };

    zap.setFromObject(myConfig);

    expect(zap.buildArgs()).toStrictEqual({
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      },
      pool: PREVIEW_DATA.pool,
      suppliedAsset: expect.objectContaining({
        amount: PREVIEW_DATA.assets.tada.amount,
      }),
      referralFee: undefined,
      zapDirection: PoolCoin.A,
      swapSlippage: 0.3,
    });
  });

  it("it should set the orderAddresses correctly", () => {
    config.setOrderAddresses({
      DestinationAddress: {
        address: "test1",
        datumHash: "test2",
      },
      AlternateAddress: "test3",
    });

    expect(config.orderAddresses).toMatchObject({
      DestinationAddress: {
        address: "test1",
        datumHash: "test2",
      },
      AlternateAddress: "test3",
    });
  });

  it("should set the pool correctly", () => {
    config.setPool(PREVIEW_DATA.pool);
    expect(config.pool).toMatchObject(PREVIEW_DATA.pool);
  });

  it("should set the suppliedAsset correctly", () => {
    config.setSuppliedAsset(PREVIEW_DATA.assets.tindy);
    expect(config.suppliedAsset).toStrictEqual(PREVIEW_DATA.assets.tindy);
  });

  it("should set the zapDirection correctly", () => {
    config.setZapDirection(PoolCoin.A);
    expect(config.zapDirection).toStrictEqual(PoolCoin.A);
  });

  it("should set the swapSlippage correctly", () => {
    config.setPool(PREVIEW_DATA.pool);
    config.setOrderAddresses(PREVIEW_DATA.orderAddresses);
    config.setSwapSlippage(0.45);
    expect(config.swapSlippage).toEqual(0.45);

    const newConfig = new ZapConfig();
    newConfig.setPool(PREVIEW_DATA.pool);
    newConfig.setOrderAddresses(PREVIEW_DATA.orderAddresses);
    newConfig.setSuppliedAsset(PREVIEW_DATA.assets.tada);
    newConfig.setZapDirection(PoolCoin.A);
    expect(newConfig.swapSlippage).toBeUndefined();
    expect(newConfig.buildArgs().swapSlippage).toBe(0);
  });

  it("should throw the correct errors when building the config", () => {
    expect(() => config.validate()).toThrowError(
      "You haven't set a pool in your Config. Set a pool with .setPool()"
    );
    config.setPool(PREVIEW_DATA.pool);

    expect(() => config.validate()).toThrowError(
      "You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()"
    );
    config.setOrderAddresses(PREVIEW_DATA.orderAddresses);

    expect(() => config.validate()).toThrowError(
      "You did not provided funding for this deposit! Make sure you supply both sides of the pool with .setSuppliedAssets()"
    );
    config.setSuppliedAsset(PREVIEW_DATA.assets.tada);

    expect(() => config.validate()).toThrowError(
      "You did not provide a Zap Direction for this deposit! Make sure you supply the Zap Direction with .setZapDirection()"
    );
    config.setZapDirection(PoolCoin.A);

    config.setSwapSlippage(-1);
    expect(() => config.validate()).toThrowError(
      "You provided an invalid number for the desired swap slippage. Please choose a float number between 0 and 1."
    );

    config.setSwapSlippage(1.1);
    expect(() => config.validate()).toThrowError(
      "You provided an invalid number for the desired swap slippage. Please choose a float number between 0 and 1."
    );
  });
});
