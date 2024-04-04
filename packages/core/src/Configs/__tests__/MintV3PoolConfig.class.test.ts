import { IMintV3PoolConfigArgs } from "../../@types/configs.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { MintV3PoolConfig } from "../MintV3PoolConfig.class.js";

const defaultArgs: IMintV3PoolConfigArgs = {
  assetA: PREVIEW_DATA.assets.tada,
  assetB: PREVIEW_DATA.assets.tindy,
  fees: [20n, 100n],
  marketTimings: [0, 100],
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
      fees: [20n, 100n],
      marketTimings: [0n, 100n],
      ownerAddress: "addr_test",
    });
  });

  it("should fail when marketTimings are not linearly increasing", () => {
    const myConfig = new MintV3PoolConfig({
      ...defaultArgs,
      marketTimings: [100, 0],
    });

    expect(() => myConfig.buildArgs()).toThrowError(
      "The second timestamp in the marketTimings tuple must be greater than the first."
    );
  });

  it("should fail when any of the fees surpass the max fee", () => {
    expect(() =>
      new MintV3PoolConfig({
        ...defaultArgs,
        fees: [11_000n, 10n],
      }).buildArgs()
    ).toThrowError("Fees cannot supersede the max fee of 10000.");

    expect(() =>
      new MintV3PoolConfig({
        ...defaultArgs,
        fees: [10n, 10_200n],
      }).buildArgs()
    ).toThrowError("Fees cannot supersede the max fee of 10000.");
  });
});
