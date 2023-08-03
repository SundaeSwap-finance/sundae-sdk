import { FreezerConfig } from "../FreezerConfig.class";
import { PREVIEW_DATA } from "../../../testing/mockData";
import { DelegationProgramPools, DelegationPrograms } from "../../../@types";

let config: FreezerConfig;
beforeEach(() => {
  config = new FreezerConfig();
});

const delegationMap: DelegationPrograms = new Map();
const sundaeDelegation: DelegationProgramPools = new Map();

sundaeDelegation.set("01", 1n);
sundaeDelegation.set("02", 5n);
delegationMap.set("SUNDAE", sundaeDelegation);

describe("FreezerConfig class", () => {
  it("should construct with no parameters", () => {
    expect(config).toBeInstanceOf(FreezerConfig);
  });

  it("should construct with a config", () => {
    const myConfig = new FreezerConfig({
      ownerAddress: PREVIEW_DATA.address,
      lockedValues: [PREVIEW_DATA.assets.tada, PREVIEW_DATA.assets.tindy],
      delegation: delegationMap,
      existingPositions: [],
    });

    expect(myConfig.buildArgs()).toStrictEqual({
      ownerAddress: PREVIEW_DATA.address,
      lockedValues: [
        expect.objectContaining({
          amount: PREVIEW_DATA.assets.tada.amount,
        }),
        expect.objectContaining({
          amount: PREVIEW_DATA.assets.tindy.amount,
        }),
      ],
      delegation: delegationMap,
      existingPositions: [],
      referralFee: undefined,
    });
  });

  it("should correctly set the setFromObject method", () => {
    const freezer = new FreezerConfig();
    expect(() => freezer.buildArgs()).toThrow();

    const myConfig = {
      ownerAddress: PREVIEW_DATA.address,
      lockedValues: [PREVIEW_DATA.assets.tada, PREVIEW_DATA.assets.tindy],
      delegation: delegationMap,
      existingPositions: [],
    };

    freezer.setFromObject(myConfig);

    expect(freezer.buildArgs()).toStrictEqual({
      ownerAddress: PREVIEW_DATA.address,
      lockedValues: [PREVIEW_DATA.assets.tada, PREVIEW_DATA.assets.tindy],
      delegation: delegationMap,
      existingPositions: [],
      referralFee: undefined,
    });
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
    config.setDelegation(delegationMap);
    expect(config.delegation).toStrictEqual(delegationMap);
  });

  it("should throw an error when validating that lockedValues are of the AssetAmount class", () => {
    config.setLockedValues([
      PREVIEW_DATA.assets.tada,
      // @ts-ignore
      100n,
    ]);

    expect(() => config.validate()).toThrowError(
      new Error("One or more of your locked values is not of type AssetAmount.")
    );
  });

  it("should throw an error when giving a delegation but no locked values or existing data", () => {
    config.setDelegation(delegationMap);

    expect(() => config.validate()).toThrowError(
      new Error(
        "You provided a delegation map but no assets are assigned to accompany the data."
      )
    );
  });

  it("should throw an error when no owner address is given", () => {
    config.setLockedValues([
      PREVIEW_DATA.assets.tada,
      PREVIEW_DATA.assets.tindy,
    ]);
    config.setDelegation(delegationMap);
    config.setExistingPositions([]);

    expect(() => config.validate()).toThrowError(
      new Error(
        "You did not provide an owner's address. An owner's address is required to add, update, or remove locked assets."
      )
    );
  });
});
