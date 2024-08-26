import { jest } from "@jest/globals";

import { BlazeHelper } from "../../../Utilities/BlazeHelper.class.js";
import { DatumBuilderBlazeV3 } from "../../DatumBuilder.Blaze.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderBlazeV3;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildDestinationAddresses()", () => {
  it("should pass when providing a valid DestinationAddress argument", () => {
    // With staking credential.
    const result = builderInstance.buildDestinationAddresses(
      V3_EXPECTATIONS.buildDestinationAddresses[0].args
    );
    expect(result.inline).toStrictEqual(
      V3_EXPECTATIONS.buildDestinationAddresses[0].expectations.inline
    );
    expect(result.hash).toStrictEqual(
      V3_EXPECTATIONS.buildDestinationAddresses[0].expectations.hash
    );

    // Without staking credential.
    const result2 = builderInstance.buildDestinationAddresses(
      V3_EXPECTATIONS.buildDestinationAddresses[1].args
    );

    expect(result2.inline).toStrictEqual(
      V3_EXPECTATIONS.buildDestinationAddresses[1].expectations.inline
    );
    expect(result2.hash).toStrictEqual(
      V3_EXPECTATIONS.buildDestinationAddresses[1].expectations.hash
    );

    const result3 = builderInstance.buildDestinationAddresses(
      V3_EXPECTATIONS.buildDestinationAddresses[2].args
    );
    expect(result3.inline).toStrictEqual(
      V3_EXPECTATIONS.buildDestinationAddresses[2].expectations.inline
    );
    expect(result3.hash).toStrictEqual(
      V3_EXPECTATIONS.buildDestinationAddresses[2].expectations.hash
    );

    const result4 = builderInstance.buildDestinationAddresses(
      V3_EXPECTATIONS.buildDestinationAddresses[3].args
    );

    expect(result4.inline).toEqual(
      V3_EXPECTATIONS.buildDestinationAddresses[3].expectations.inline
    );
    expect(result4.hash).toEqual(
      V3_EXPECTATIONS.buildDestinationAddresses[3].expectations.hash
    );

    const resultWithScriptDestination =
      builderInstance.buildDestinationAddresses(
        V3_EXPECTATIONS.buildDestinationAddresses[4].args
      );

    expect(resultWithScriptDestination.inline).toEqual(
      V3_EXPECTATIONS.buildDestinationAddresses[4].expectations.inline
    );
    expect(resultWithScriptDestination.hash).toEqual(
      V3_EXPECTATIONS.buildDestinationAddresses[4].expectations.hash
    );
  });

  it("should fail when an invalid DatumType is used", () => {
    expect(() =>
      builderInstance.buildDestinationAddresses(
        V3_EXPECTATIONS.buildDestinationAddresses[5].args
      )
    ).toThrowError(
      V3_EXPECTATIONS.buildDestinationAddresses[5].expectations.error as string
    );
  });

  it("should fail when passing just a staking key as the DestinationAddress", () => {
    try {
      builderInstance.buildDestinationAddresses(
        V3_EXPECTATIONS.buildDestinationAddresses[6].args
      );
    } catch (e) {
      expect((e as Error).message).toStrictEqual(
        V3_EXPECTATIONS.buildDestinationAddresses[6].expectations.error
      );
    }
  });

  it("should fail with non-serializable address strings", () => {
    expect(() =>
      builderInstance.buildDestinationAddresses(
        V3_EXPECTATIONS.buildDestinationAddresses[7].args
      )
    ).toThrowError(
      // @ts-expect-error
      V3_EXPECTATIONS.buildDestinationAddresses[7].expectations.error.blaze
    );
  });

  it("should fail when passing a Preview Network DestinationAddress to an Mainnet instance", () => {
    builderInstance.network = "mainnet";
    expect(() =>
      builderInstance.buildDestinationAddresses(
        V3_EXPECTATIONS.buildDestinationAddresses[8].args
      )
    ).toThrowError(
      // @ts-expect-error
      V3_EXPECTATIONS.buildDestinationAddresses[8].expectations.error.blaze
    );
  });

  it("should fail when passing a Mainnet DestinationAddress to a Preview instance", () => {
    expect(() =>
      builderInstance.buildDestinationAddresses(
        V3_EXPECTATIONS.buildDestinationAddresses[9].args
      )
    ).toThrowError(
      // @ts-expect-error
      V3_EXPECTATIONS.buildDestinationAddresses[9].expectations.error.blaze
    );
  });

  it("should fail when passing a script address to DestinationAddress without a datum attached", () => {
    jest.spyOn(BlazeHelper, "throwInvalidOrderAddressesError");
    try {
      builderInstance.buildDestinationAddresses(
        V3_EXPECTATIONS.buildDestinationAddresses[10].args
      );
    } catch (e) {
      expect(BlazeHelper.throwInvalidOrderAddressesError).toHaveBeenCalledWith(
        V3_EXPECTATIONS.buildDestinationAddresses[10].expectations.calledWith,
        V3_EXPECTATIONS.buildDestinationAddresses[10].expectations.error
      );
    }
  });

  it("should fail when passing an invalid datum along with a script DestinationAddress", () => {
    jest.spyOn(BlazeHelper, "throwInvalidOrderAddressesError");
    try {
      builderInstance.buildDestinationAddresses(
        V3_EXPECTATIONS.buildDestinationAddresses[11].args
      );
    } catch (e) {
      expect(BlazeHelper.throwInvalidOrderAddressesError).toHaveBeenCalledWith(
        V3_EXPECTATIONS.buildDestinationAddresses[11].expectations.calledWith,
        // @ts-expect-error
        V3_EXPECTATIONS.buildDestinationAddresses[11].expectations.error.blaze
      );
    }
  });
});
