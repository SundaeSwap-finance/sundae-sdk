import { jest } from "@jest/globals";

import { DatumBuilderBlazeV3 } from "../../DatumBuilder.Blaze.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderBlazeV3;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildAssetDatum", () => {
  it("should correctly build the datum for ADA", () => {
    const result = builderInstance.buildAssetAmountDatum(
      V3_EXPECTATIONS.buildAssetAmountDatum[0].args
    );
    expect(result.inline).toEqual(
      V3_EXPECTATIONS.buildAssetAmountDatum[0].expectations.inline
    );
    expect(result.hash).toEqual(
      V3_EXPECTATIONS.buildAssetAmountDatum[0].expectations.hash
    );
  });

  it("should correctly build the datum for alt-coin", () => {
    const result = builderInstance.buildAssetAmountDatum(
      V3_EXPECTATIONS.buildAssetAmountDatum[1].args
    );
    expect(result.inline).toEqual(
      V3_EXPECTATIONS.buildAssetAmountDatum[1].expectations.inline
    );
    expect(result.hash).toEqual(
      V3_EXPECTATIONS.buildAssetAmountDatum[1].expectations.hash
    );
  });
});
