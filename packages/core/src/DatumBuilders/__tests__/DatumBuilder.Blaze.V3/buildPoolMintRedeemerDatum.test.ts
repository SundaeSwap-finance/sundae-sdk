import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    mock,
    spyOn,
} from "bun:test";

import { DatumBuilderBlazeV3 } from "../../DatumBuilder.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderBlazeV3;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV3("preview");
});

afterEach(() => {
  mock.restore();
});

describe("buildPoolMintRedeemerDatum()", () => {
  it("should build the pool mint redeemer datum properly", () => {
    const spiedOnBuildLexicographicalAssetsDatum = spyOn(
      DatumBuilderBlazeV3.prototype,
      "buildLexicographicalAssetsDatum",
    );

    const { inline, hash } = builderInstance.buildPoolMintRedeemerDatum(
      V3_EXPECTATIONS.buildPoolMintRedeemerDatum[0].args,
    );

    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(
      V3_EXPECTATIONS.buildPoolMintRedeemerDatum[0].expectations.called,
    );
    expect(inline).toEqual(
      V3_EXPECTATIONS.buildPoolMintRedeemerDatum[0].expectations.inline,
    );
    expect(hash).toEqual(
      V3_EXPECTATIONS.buildPoolMintRedeemerDatum[0].expectations.hash,
    );
  });
});
