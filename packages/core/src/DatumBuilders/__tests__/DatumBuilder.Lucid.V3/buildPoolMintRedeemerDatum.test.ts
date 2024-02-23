import { jest } from "@jest/globals";

import { PREVIEW_DATA } from "../../../exports/testing.js";
import {
  DatumBuilderLucidV3,
  IDatumBuilderPoolMintRedeemerV3Args,
} from "../../DatumBuilder.Lucid.V3.class.js";

let builderInstance: DatumBuilderLucidV3;

const defaultArgs: IDatumBuilderPoolMintRedeemerV3Args = {
  assetA: PREVIEW_DATA.assets.tada,
  assetB: PREVIEW_DATA.assets.tindy,
  metadataOutput: 2n,
  poolOutput: 0n,
};

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

    const { inline } = builderInstance.buildPoolMintRedeemerDatum(defaultArgs);

    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(1);
    expect(inline).toEqual(
      "d87a9f9f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff0002ff"
    );
  });
});
