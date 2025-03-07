import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    mock,
    spyOn,
} from "bun:test";

import {
    DatumBuilderBlazeV3,
    IDatumBuilderMintPoolV3Args,
} from "../../DatumBuilder.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderBlazeV3;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV3("preview");
});

afterEach(() => {
  mock.restore();
});

describe("builderMintPoolDatum()", () => {
  it("should build the pool mint datum properly", () => {
    const spiedOnComputePoolId = spyOn(DatumBuilderBlazeV3, "computePoolId");
    const spiedOnBuildLexicographicalAssetsDatum = spyOn(
      DatumBuilderBlazeV3.prototype,
      "buildLexicographicalAssetsDatum",
    );

    const { inline, hash } = builderInstance.buildMintPoolDatum(
      V3_EXPECTATIONS.buildMintPoolDatum[0].args,
    );

    expect(spiedOnComputePoolId).toHaveBeenNthCalledWith(
      ...(V3_EXPECTATIONS.buildMintPoolDatum[0].expectations.calledWith as [
        number,
        IDatumBuilderMintPoolV3Args["seedUtxo"],
      ]),
    );
    expect(spiedOnComputePoolId).toHaveReturnedTimes(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations
        .returnedWith[0] as number,
    );
    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations
        .buildLexicographicalAssetsDatumCalls,
    );
    expect(inline).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations.inline,
    );
    expect(hash).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations.hash,
    );
  });

  it("should build the pool mint datum properly with split fees", () => {
    const spiedOnComputePoolId = spyOn(DatumBuilderBlazeV3, "computePoolId");
    const spiedOnBuildLexicographicalAssetsDatum = spyOn(
      DatumBuilderBlazeV3.prototype,
      "buildLexicographicalAssetsDatum",
    );

    const { inline, hash } = builderInstance.buildMintPoolDatum(
      V3_EXPECTATIONS.buildMintPoolDatum[1].args,
    );

    expect(spiedOnComputePoolId).toHaveReturnedTimes(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations
        .returnedWith[0] as number,
    );
    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations
        .buildLexicographicalAssetsDatumCalls,
    );
    expect(inline).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations.inline,
    );
    expect(hash).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations.hash,
    );
  });
});
