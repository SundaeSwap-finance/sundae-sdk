import { jest } from "@jest/globals";

import { DatumBuilderLucidV3 } from "../../DatumBuilder.Lucid.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderLucidV3;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("static getSignerKeyFromDatum()", () => {
  it("should properly extract the owner's key hash from the datum", () => {
    expect(
      DatumBuilderLucidV3.getSignerKeyFromDatum(
        V3_EXPECTATIONS.getSignerKeyFromDatum[0].args
      )
    ).toEqual(V3_EXPECTATIONS.getSignerKeyFromDatum[0].expectations.result);
  });
});
