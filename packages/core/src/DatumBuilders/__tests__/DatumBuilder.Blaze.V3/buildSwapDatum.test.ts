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

describe("buildSwapDatum()", () => {
  it("should correctly build the datums", () => {
    const result = builderInstance.buildSwapDatum(
      V3_EXPECTATIONS.buildSwapDatum[0].args
    );

    expect(result.inline).toEqual(
      V3_EXPECTATIONS.buildSwapDatum[0].expectations.inline
    );
    expect(result.hash).toEqual(
      V3_EXPECTATIONS.buildSwapDatum[0].expectations.hash
    );

    const result2 = builderInstance.buildSwapDatum(
      V3_EXPECTATIONS.buildSwapDatum[1].args
    );

    expect(result2.inline).toEqual(
      V3_EXPECTATIONS.buildSwapDatum[1].expectations.inline
    );
    expect(result2.hash).toEqual(
      V3_EXPECTATIONS.buildSwapDatum[1].expectations.hash
    );
  });
});