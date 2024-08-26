import { jest } from "@jest/globals";

import { DatumBuilderBlazeV1 } from "../../DatumBuilder.Blaze.V1.class.js";
import { V1_EXPECTATIONS } from "../../__data__/v1.expectations.js";

let builderInstance: DatumBuilderBlazeV1;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV1("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildDepositDatum()", () => {
  it("should correctly build the datum, variation 1", () => {
    const result = builderInstance.buildDepositDatum(
      V1_EXPECTATIONS.datums.buildDepositDatum[0].args
    );

    expect(result.inline).toEqual(
      V1_EXPECTATIONS.datums.buildDepositDatum[0].expectations.inline
    );
    expect(result.hash).toEqual(
      V1_EXPECTATIONS.datums.buildDepositDatum[0].expectations.hash
    );
  });
});
