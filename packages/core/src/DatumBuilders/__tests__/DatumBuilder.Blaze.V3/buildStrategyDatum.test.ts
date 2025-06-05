import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { V3_EXPECTATIONS } from "src/DatumBuilders/__data__/v3.expectations.js";
import { DatumBuilderV3 } from "../../DatumBuilder.V3.class.js";

let builderInstance: DatumBuilderV3;

beforeEach(() => {
  builderInstance = new DatumBuilderV3("preview");
});

afterEach(() => {
  mock.restore();
});

describe("buildStrategyDatum()", () => {
  it("should correctly build the datums", () => {
    const result = builderInstance.buildStrategyDatum(
      V3_EXPECTATIONS.buildStrategyDatum[0].args,
    );
    
    expect(result.inline).toEqual(
      V3_EXPECTATIONS.buildStrategyDatum[0].expectations.inline,
    );

    expect(result.hash).toEqual(
      V3_EXPECTATIONS.buildStrategyDatum[0].expectations.hash,
    );

    const result2 = builderInstance.buildStrategyDatum(
      V3_EXPECTATIONS.buildStrategyDatum[1].args,
    );
    
    expect(result2.inline).toEqual(
      V3_EXPECTATIONS.buildStrategyDatum[1].expectations.inline,
    );

    expect(result2.hash).toEqual(
      V3_EXPECTATIONS.buildStrategyDatum[1].expectations.hash,
    );
  });
});