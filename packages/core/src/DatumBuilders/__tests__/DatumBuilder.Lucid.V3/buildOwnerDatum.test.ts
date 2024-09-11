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

describe("buildOwnerDatum()", () => {
  it("should build the owner datum properly", () => {
    const result = builderInstance.buildOwnerDatum(
      V3_EXPECTATIONS.buildOwnerDatum[0].args,
    );

    expect(result.inline).toEqual(
      V3_EXPECTATIONS.buildOwnerDatum[0].expectations.inline,
    );
    expect(result.hash).toEqual(
      V3_EXPECTATIONS.buildOwnerDatum[0].expectations.hash,
    );
    expect(result.schema).toMatchObject(
      V3_EXPECTATIONS.buildOwnerDatum[0].expectations.schemaMatch,
    );
  });
});
