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

describe("static getDestinationAddressesFromDatum()", () => {
  it("should properly extract the addresses from the datum", () => {
    expect(
      DatumBuilderLucidV3.getDestinationAddressesFromDatum(
        V3_EXPECTATIONS.getDestinationFromDatum[0].args
      )
    ).toMatchObject(
      V3_EXPECTATIONS.getDestinationFromDatum[0].expectations.result
    );
  });
});
