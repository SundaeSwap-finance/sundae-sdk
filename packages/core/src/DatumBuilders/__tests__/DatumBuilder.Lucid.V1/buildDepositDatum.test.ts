import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { DatumBuilderLucidV1 } from "../../DatumBuilder.Lucid.V1.class.js";
import { V1_EXPECTATIONS } from "../../__data__/v1.expectations.js";

let builderInstance: DatumBuilderLucidV1;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV1("preview");
});

afterEach(() => {
  mock.restore();
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
