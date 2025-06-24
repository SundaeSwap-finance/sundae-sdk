import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { DatumBuilderNftCheck } from "../../DatumBuilder.NftCheck.class";
import { NFTCHECK_EXPECTATIONS } from "../../__data__/NftCheck.expectations";


let builderInstance: DatumBuilderNftCheck;

beforeEach(() => {
  builderInstance = new DatumBuilderNftCheck("preview");
});

afterEach(() => {
  mock.restore();
});

describe("buildConditionDatum", () => {
  it("should correctly build the condition datum for checking a token", () => {
    const result = builderInstance.buildConditionDatum(
      NFTCHECK_EXPECTATIONS.buildConditionDatum[0].args,
    );
    expect(result.toCbor().toString()).toEqual(
        NFTCHECK_EXPECTATIONS.buildConditionDatum[0].expectations.cbor,
    );
  });
});
