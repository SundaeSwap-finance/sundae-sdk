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

describe("buildWithdrawDatum()", () => {
  it("should correctly build the datum, variation 1", () => {
    const result = builderInstance.buildWithdrawDatum(
      V3_EXPECTATIONS.buildWithdrawDatum[0].args
    );

    expect(result.inline).toEqual(
      V3_EXPECTATIONS.buildWithdrawDatum[0].expectations.inline
    );
    expect(result.hash).toEqual(
      V3_EXPECTATIONS.buildWithdrawDatum[0].expectations.hash
    );
  });
});