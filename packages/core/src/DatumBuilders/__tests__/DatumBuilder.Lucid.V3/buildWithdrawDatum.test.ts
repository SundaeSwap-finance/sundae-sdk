import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { DatumBuilderLucidV3 } from "../../DatumBuilder.Lucid.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderLucidV3;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV3("preview");
});

afterEach(() => {
  mock.restore();
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
