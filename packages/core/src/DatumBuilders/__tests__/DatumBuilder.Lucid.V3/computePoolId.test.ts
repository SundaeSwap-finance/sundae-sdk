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

describe("static computePoolId()", () => {
  it("should properly generate a pool id from a seed utxo", () => {
    expect(
      DatumBuilderLucidV3.computePoolId(V3_EXPECTATIONS.computePoolId[0].args),
    ).toEqual(V3_EXPECTATIONS.computePoolId[0].expectations.result);
  });
});
