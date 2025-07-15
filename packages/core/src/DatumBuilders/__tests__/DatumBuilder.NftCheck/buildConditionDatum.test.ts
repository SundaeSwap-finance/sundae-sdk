import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { DatumBuilderNftCheck } from "../../DatumBuilder.NftCheck.class.js";
import { NFTCHECK_EXPECTATIONS } from "../../__data__/NftCheck.expectations.js";


let builderInstance: DatumBuilderNftCheck;

beforeEach(() => {
  builderInstance = new DatumBuilderNftCheck("preview");
});

afterEach(() => {
  mock.restore();
});

describe("buildConditionDatum", () => {
  it("should correctly build the condition datum for checking a single token using 'All'", () => {
    const result = builderInstance.buildConditionDatum(
      NFTCHECK_EXPECTATIONS.buildConditionDatum[0].args,
    );
    expect(result.toCbor().toString()).toEqual(
        NFTCHECK_EXPECTATIONS.buildConditionDatum[0].expectations.cbor,
    );
  });
  it("should correctly build the condition datum for checking a single token using 'Any'", () => {
    const result = builderInstance.buildConditionDatum(
      NFTCHECK_EXPECTATIONS.buildConditionDatum[1].args,
    );
    expect(result.toCbor().toString()).toEqual(
        NFTCHECK_EXPECTATIONS.buildConditionDatum[1].expectations.cbor,
    );
  });
  it("should correctly build the condition datum for checking multiple tokens using 'All'", () => {
    const result = builderInstance.buildConditionDatum(
      NFTCHECK_EXPECTATIONS.buildConditionDatum[2].args,
    );
    expect(result.toCbor().toString()).toEqual(
        NFTCHECK_EXPECTATIONS.buildConditionDatum[2].expectations.cbor,
    );
  });
  it("should correctly build the condition datum for checking multiple tokens using 'Any'", () => {
    const result = builderInstance.buildConditionDatum(
      NFTCHECK_EXPECTATIONS.buildConditionDatum[3].args,
    );
    expect(result.toCbor().toString()).toEqual(
        NFTCHECK_EXPECTATIONS.buildConditionDatum[3].expectations.cbor,
    );
  });
});
