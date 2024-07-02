import { IMintV3PoolConfigArgs } from "../../@types/configs.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { MintV3PoolConfig } from "../MintV3PoolConfig.class.js";

const defaultArgs: IMintV3PoolConfigArgs = {
  assetA: PREVIEW_DATA.assets.tada,
  assetB: PREVIEW_DATA.assets.tindy,
  fees: 20n,
  marketOpen: 0n,
  ownerAddress: "addr_test",
};

let config: MintV3PoolConfig;
beforeEach(() => {
  config = new MintV3PoolConfig();
});

describe("MintV3PoolConfig class", () => {
  it("should construct with no parameters", () => {
    expect(config).toBeInstanceOf(MintV3PoolConfig);
  });

  it("should construct with a config", () => {
    const myConfig = new MintV3PoolConfig(defaultArgs);

    expect(myConfig.buildArgs()).toMatchObject<
      ReturnType<(typeof myConfig)["buildArgs"]>
    >({
      assetA: expect.objectContaining({
        amount: PREVIEW_DATA.assets.tada.amount,
      }),
      assetB: expect.objectContaining({
        amount: PREVIEW_DATA.assets.tindy.amount,
      }),
      fees: {
        bid: 20n,
        ask: 20n,
      },
      marketOpen: 0n,
      ownerAddress: "addr_test",
    });
  });

  it("should fail when any of the fees surpass the max fee", () => {
    expect(() =>
      new MintV3PoolConfig({
        ...defaultArgs,
        fees: 11_000n,
      }).buildArgs()
    ).toThrowError(
      `Fees cannot supersede the max fee of ${MintV3PoolConfig.MAX_FEE}.`
    );

    expect(() =>
      new MintV3PoolConfig({
        ...defaultArgs,
        fees: 10n,
      }).buildArgs()
    ).not.toThrowError(
      `Fees cannot supersede the max fee of ${MintV3PoolConfig.MAX_FEE}.`
    );
  });

  it("should fail when an ask fee surpasses the max fee", () => {
    expect(() =>
      new MintV3PoolConfig({
        ...defaultArgs,
        fees: {
          bid: 10n,
          ask: 11_000n,
        },
      }).buildArgs()
    ).toThrowError(
      `Ask fee cannot supersede the max fee of ${MintV3PoolConfig.MAX_FEE}.`
    );
  });

  it("should fail when a bid fee surpasses the max fee", () => {
    expect(() =>
      new MintV3PoolConfig({
        ...defaultArgs,
        fees: {
          bid: 11_000n,
          ask: 10n,
        },
      }).buildArgs()
    ).toThrowError(
      `Bid fee cannot supersede the max fee of ${MintV3PoolConfig.MAX_FEE}.`
    );
  });
});
