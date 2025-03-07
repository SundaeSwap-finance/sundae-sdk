import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { DatumBuilderV3 } from "../../DatumBuilder.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderV3;

beforeEach(() => {
  builderInstance = new DatumBuilderV3("preview");
});

afterEach(() => {
  mock.restore();
});

describe("static getSignerKeyFromDatum()", () => {
  it("should properly extract the owner's key hash from the datum", () => {
    expect(
      DatumBuilderV3.getSignerKeyFromDatum(
        V3_EXPECTATIONS.getSignerKeyFromDatum[0].args,
      ),
    ).toEqual(V3_EXPECTATIONS.getSignerKeyFromDatum[0].expectations.result);
  });
});
