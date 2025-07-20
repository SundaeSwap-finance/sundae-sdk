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

describe("static computePoolId()", () => {
  it("should properly generate a pool id from a seed utxo", () => {
    expect(
      DatumBuilderV3Like.computePoolId(V3_EXPECTATIONS.computePoolId[0].args),
    ).toEqual(V3_EXPECTATIONS.computePoolId[0].expectations.result);
  });
});
