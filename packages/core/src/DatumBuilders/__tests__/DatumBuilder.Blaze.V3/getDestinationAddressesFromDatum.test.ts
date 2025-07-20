import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { DatumBuilderV3Like } from "../../DatumBuilder.V3Like.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderV3Like;

beforeEach(() => {
  builderInstance = new DatumBuilderV3Like("preview");
});

afterEach(() => {
  mock.restore();
});

describe("static getDestinationAddressesFromDatum()", () => {
  it("should properly extract the addresses from the datum", () => {
    expect(
      DatumBuilderV3Like.getDestinationAddressesFromDatum(
        V3_EXPECTATIONS.getDestinationFromDatum[0].args,
      ),
    ).toMatchObject(
      V3_EXPECTATIONS.getDestinationFromDatum[0].expectations.result,
    );
  });
});
