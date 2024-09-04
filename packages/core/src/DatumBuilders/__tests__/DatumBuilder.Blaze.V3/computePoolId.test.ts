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

describe("static computePoolId()", () => {
  it("should properly generate a pool id from a seed utxo", () => {
    expect(
      DatumBuilderBlazeV3.computePoolId(V3_EXPECTATIONS.computePoolId[0].args)
    ).toEqual(V3_EXPECTATIONS.computePoolId[0].expectations.result);
  });
});
