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

describe("static computePoolId()", () => {
  it("should properly generate a pool id from a seed utxo", () => {
    expect(
      DatumBuilderV3.computePoolId(V3_EXPECTATIONS.computePoolId[0].args),
    ).toEqual(V3_EXPECTATIONS.computePoolId[0].expectations.result);
  });
});
