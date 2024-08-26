import { jest } from "@jest/globals";

import {
  DatumBuilderBlazeV3,
  IDatumBuilderMintPoolV3Args,
} from "../../DatumBuilder.Blaze.V3.class.js";
import { V3_EXPECTATIONS } from "../../__data__/v3.expectations.js";

let builderInstance: DatumBuilderBlazeV3;

beforeEach(() => {
  builderInstance = new DatumBuilderBlazeV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("builderMintPoolDatum()", () => {
  it("should build the pool mint datum properly", () => {
    const spiedOnComputePoolId = jest.spyOn(
      DatumBuilderBlazeV3,
      "computePoolId"
    );
    const spiedOnBuildLexicographicalAssetsDatum = jest.spyOn(
      DatumBuilderBlazeV3.prototype,
      "buildLexicographicalAssetsDatum"
    );

    const { inline, hash } = builderInstance.buildMintPoolDatum(
      V3_EXPECTATIONS.buildMintPoolDatum[0].args
    );

    expect(spiedOnComputePoolId).toHaveBeenNthCalledWith(
      ...(V3_EXPECTATIONS.buildMintPoolDatum[0].expectations.calledWith as [
        number,
        IDatumBuilderMintPoolV3Args["seedUtxo"]
      ])
    );
    expect(spiedOnComputePoolId).toHaveNthReturnedWith(
      ...(V3_EXPECTATIONS.buildMintPoolDatum[0].expectations.returnedWith as [
        number,
        string
      ])
    );
    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations
        .buildLexicographicalAssetsDatumCalls
    );
    expect(inline).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations.inline
    );
    expect(hash).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[0].expectations.hash
    );
  });

  it("should build the pool mint datum properly with split fees", () => {
    const spiedOnComputePoolId = jest.spyOn(
      DatumBuilderBlazeV3,
      "computePoolId"
    );
    const spiedOnBuildLexicographicalAssetsDatum = jest.spyOn(
      DatumBuilderBlazeV3.prototype,
      "buildLexicographicalAssetsDatum"
    );

    const { inline, hash } = builderInstance.buildMintPoolDatum(
      V3_EXPECTATIONS.buildMintPoolDatum[1].args
    );

    expect(spiedOnComputePoolId).toHaveNthReturnedWith(
      ...(V3_EXPECTATIONS.buildMintPoolDatum[1].expectations.returnedWith as [
        number,
        string
      ])
    );
    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations
        .buildLexicographicalAssetsDatumCalls
    );
    expect(inline).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations.inline
    );
    expect(hash).toEqual(
      V3_EXPECTATIONS.buildMintPoolDatum[1].expectations.hash
    );
  });
});