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

describe("buildDepositDatum()", () => {
  it("should correctly build the datum, variation 1", () => {
    const result = builderInstance.buildDepositDatum(
      V3_EXPECTATIONS.buildDepositDatum[0].args,
    );

    expect(result.inline).toEqual(
      V3_EXPECTATIONS.buildDepositDatum[0].expectations.inline,
    );
    expect(result.hash).toEqual(
      V3_EXPECTATIONS.buildDepositDatum[0].expectations.hash,
    );
  });
});
