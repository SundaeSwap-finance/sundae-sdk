import { PREVIEW_DATA } from "@sundaeswap/core/testing";
import { beforeEach, describe, expect, it } from "bun:test";

// @ts-expect-error
global.BigInt.prototype.toJSON = function () {
  return this.toString();
};

import { Core } from "@blaze-cardano/sdk";
import { TDelegationPrograms } from "../../../@types/blaze.js";
import { LockConfig } from "../LockConfig.js";

let config: LockConfig<any>;
beforeEach(() => {
  config = new LockConfig();
});

const programs: TDelegationPrograms = [
  { Delegation: [Buffer.from("SUNDAE").toString("hex"), "01", 25n] },
  { Delegation: [Buffer.from("SUNDAE").toString("hex"), "01", 75n] },
];

describe("LockConfig class", () => {
  it("should construct with no parameters", () => {
    expect(config).toBeInstanceOf(LockConfig);
  });

  it("should construct with a config", async () => {
    const myConfig = new LockConfig({
      ownerAddress: PREVIEW_DATA.addresses.current,
      lockedValues: [PREVIEW_DATA.assets.tada, PREVIEW_DATA.assets.tindy],
      programs: programs,
      existingPositions: [],
    });

    expect(myConfig.buildArgs()).toMatchObject({
      ownerAddress: PREVIEW_DATA.addresses.current,
      lockedValues: [
        expect.objectContaining({
          amount: PREVIEW_DATA.assets.tada.amount,
        }),
        expect.objectContaining({
          amount: PREVIEW_DATA.assets.tindy.amount,
        }),
      ],
      programs,
      existingPositions: [],
      referralFee: undefined,
    });
  });

  it("should correctly set the setFromObject method", () => {
    const freezer = new LockConfig();
    expect(() => freezer.buildArgs()).toThrow();

    const myConfig = {
      ownerAddress: PREVIEW_DATA.addresses.current,
      lockedValues: [PREVIEW_DATA.assets.tada, PREVIEW_DATA.assets.tindy],
      programs,
      existingPositions: [],
    };

    freezer.setFromObject(myConfig);

    expect(freezer.buildArgs()).toMatchObject({
      ownerAddress: PREVIEW_DATA.addresses.current,
      lockedValues: [PREVIEW_DATA.assets.tada, PREVIEW_DATA.assets.tindy],
      programs,
      existingPositions: [],
      referralFee: undefined,
    });

    freezer.setFromObject({
      ...myConfig,
      referralFee: {
        destination: "test-destination",
        payment: new Core.Value(50n),
      },
    });

    expect(freezer.buildArgs().referralFee?.destination).toEqual("test-destination");
    expect(freezer.buildArgs().referralFee?.payment.coin()).toEqual(50n);
    expect(freezer.buildArgs().referralFee?.payment.multiasset()).toBeUndefined();
  });

  it("it should set the ownerAddress correctly", () => {
    config.setOwnerAddress("test");
    expect(config.ownerAddress).toEqual("test");
  });

  it("should set the lockValues correctly", () => {
    config.setLockedValues([PREVIEW_DATA.assets.tada]);
    expect(config.lockedValues).toMatchObject([
      expect.objectContaining({
        amount: PREVIEW_DATA.assets.tada.amount,
      }),
    ]);
  });

  it("should set the delegation correctly", () => {
    config.setPrograms(programs);
    expect(config.programs).toMatchObject(programs);
  });

  it("should throw an error when validating that lockedValues are of the AssetAmount class", () => {
    config.setOwnerAddress(PREVIEW_DATA.addresses.current);
    config.setLockedValues([
      PREVIEW_DATA.assets.tada,
      // @ts-ignore
      100n,
    ]);

    expect(() => config.validate()).toThrowError(
      new Error(
        "One or more of your locked values is not of type AssetAmount.",
      ),
    );
  });

  it("should throw an error when giving a program but no locked values or existing data", () => {
    config.setOwnerAddress(PREVIEW_DATA.addresses.current);
    config.setPrograms(programs);

    expect(() => config.validate()).toThrowError(
      new Error(
        "You provided a program map but no assets are assigned to accompany the data.",
      ),
    );
  });

  it("should throw an error when no owner address is given", () => {
    config.setLockedValues([
      PREVIEW_DATA.assets.tada,
      PREVIEW_DATA.assets.tindy,
    ]);
    config.setPrograms(programs);
    config.setExistingPositions([]);

    expect(() => config.validate()).toThrowError(
      new Error(
        "You did not provide an owner's address. An owner's address is required to add, update, or remove locked assets.",
      ),
    );
  });
});
