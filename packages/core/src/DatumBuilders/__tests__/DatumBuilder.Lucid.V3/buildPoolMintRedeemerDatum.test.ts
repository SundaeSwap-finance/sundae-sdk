import { jest } from "@jest/globals";

import { DatumBuilderLucidV3 } from "../../DatumBuilder.Lucid.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderLucidV3;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildPoolMintRedeemerDatum()", () => {
  it("should build the pool mint redeemer datum properly", () => {
    const spiedOnBuildLexicographicalAssetsDatum = jest.spyOn(
      DatumBuilderLucidV3.prototype,
      "buildLexicographicalAssetsDatum"
    );

    const { inline, hash } = builderInstance.buildPoolMintRedeemerDatum(
      V3_EXPECTATIONS.buildPoolMintRedeemerDatum[0].args
    );

    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(
      V3_EXPECTATIONS.buildPoolMintRedeemerDatum[0].expectations.called
    );
    expect(inline).toEqual(
      V3_EXPECTATIONS.buildPoolMintRedeemerDatum[0].expectations.inline
    );
    expect(hash).toEqual(
      V3_EXPECTATIONS.buildPoolMintRedeemerDatum[0].expectations.hash
    );
  });
});
