import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";

import { ADA_METADATA } from "../../../constants.js";
import { DatumBuilderLucidV3 } from "../../DatumBuilder.Lucid.V3.class.js";

let builderInstance: DatumBuilderLucidV3;

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("buildAssetDatum", () => {
  it("should correctly build the datum for ADA", () => {
    const result = builderInstance.buildAssetAmountDatum(
      new AssetAmount(100n, ADA_METADATA)
    );
    expect(result.inline).toEqual("9f40401864ff");
  });

  it("should correctly build the datum for alt-coin", () => {
    const result = builderInstance.buildAssetAmountDatum(
      new AssetAmount(100_000_000n, {
        ...ADA_METADATA,
        assetId:
          "d441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf.44554d4d59",
      })
    );
    expect(result.inline).toEqual(
      "9f581cd441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf4544554d4d591a05f5e100ff"
    );
  });
});
