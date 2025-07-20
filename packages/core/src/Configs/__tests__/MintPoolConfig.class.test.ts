import { beforeEach, describe, expect, it } from "bun:test";
import { IMintPoolConfigArgs } from "../../@types/index.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { MintV3LikePoolConfig } from "../MintV3LikePoolConfig.class.js";

const defaultArgs: IMintPoolConfigArgs = {
  assetA: PREVIEW_DATA.assets.tada,
  assetB: PREVIEW_DATA.assets.tindy,
  fees: 20n,
  marketOpen: 0n,
  ownerAddress: "addr_test",
};

let config: MintV3LikePoolConfig;
beforeEach(() => {
  config = new MintV3LikePoolConfig();
});

describe("MintV3PoolConfig class", () => {
  it("should construct with no parameters", () => {
    expect(config).toBeInstanceOf(MintV3LikePoolConfig);
  });

  it("should construct with a config", () => {
    const myConfig = new MintV3LikePoolConfig(defaultArgs);

    expect(myConfig.buildArgs()).toMatchObject({
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
    } as ReturnType<(typeof myConfig)["buildArgs"]>);
  });

  it("should fail when any of the fees surpass the max fee", () => {
    expect(() =>
      new MintV3LikePoolConfig({
        ...defaultArgs,
        fees: 11_000n,
      }).buildArgs(),
    ).toThrowError(
      `Fees cannot supersede the max fee of ${MintV3LikePoolConfig.MAX_FEE}.`,
    );

    expect(() =>
      new MintV3LikePoolConfig({
        ...defaultArgs,
        fees: 10n,
      }).buildArgs(),
    ).not.toThrowError(
      `Fees cannot supersede the max fee of ${MintV3LikePoolConfig.MAX_FEE}.`,
    );
  });

  it("should fail when an ask fee surpasses the max fee", () => {
    expect(() =>
      new MintV3LikePoolConfig({
        ...defaultArgs,
        fees: {
          bid: 10n,
          ask: 11_000n,
        },
      }).buildArgs(),
    ).toThrowError(
      `Ask fee cannot supersede the max fee of ${MintV3LikePoolConfig.MAX_FEE}.`,
    );
  });

  it("should fail when a bid fee surpasses the max fee", () => {
    expect(() =>
      new MintV3LikePoolConfig({
        ...defaultArgs,
        fees: {
          bid: 11_000n,
          ask: 10n,
        },
      }).buildArgs(),
    ).toThrowError(
      `Bid fee cannot supersede the max fee of ${MintV3LikePoolConfig.MAX_FEE}.`,
    );
  });
});
