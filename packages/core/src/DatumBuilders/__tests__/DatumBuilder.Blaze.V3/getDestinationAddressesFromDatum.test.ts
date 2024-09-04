import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { DatumBuilderBlazeV3 } from "../../DatumBuilder.Blaze.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderBlazeV3;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV3("preview");
});

afterEach(() => {
  mock.restore();
});

describe("static getDestinationAddressesFromDatum()", () => {
  it("should properly extract the addresses from the datum", () => {
    expect(
      DatumBuilderBlazeV3.getDestinationAddressesFromDatum(
        V3_EXPECTATIONS.getDestinationFromDatum[0].args
      )
    ).toMatchObject(
      V3_EXPECTATIONS.getDestinationFromDatum[0].expectations.result
    );
  });
});
