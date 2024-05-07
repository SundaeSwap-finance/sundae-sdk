import { IMintV3PoolConfigArgs } from "../../@types/configs.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { MintV3PoolConfig } from "../MintV3PoolConfig.class.js";

const defaultArgs: IMintV3PoolConfigArgs = {
  assetA: PREVIEW_DATA.assets.tada,
  assetB: PREVIEW_DATA.assets.tindy,
  fee: 20n,
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
      fee: 20n,
      marketOpen: 0n,
      ownerAddress: "addr_test",
    });
  });

  it("should fail when any of the fees surpass the max fee", () => {
    expect(() =>
      new MintV3PoolConfig({
        ...defaultArgs,
        fee: 11_000n,
      }).buildArgs()
    ).toThrowError("Fees cannot supersede the max fee of 10000.");

    expect(() =>
      new MintV3PoolConfig({
        ...defaultArgs,
        fee: 10n,
      }).buildArgs()
    ).not.toThrowError("Fees cannot supersede the max fee of 10000.");
  });
});
