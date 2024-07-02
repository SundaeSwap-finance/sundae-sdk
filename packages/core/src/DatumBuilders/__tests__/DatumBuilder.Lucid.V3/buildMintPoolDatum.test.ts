import { jest } from "@jest/globals";

import { PREVIEW_DATA } from "../../../exports/testing.js";
import {
  DatumBuilderLucidV3,
  IDatumBuilderMintPoolV3Args,
} from "../../DatumBuilder.Lucid.V3.class.js";

let builderInstance: DatumBuilderLucidV3;

const defaultArgs: IDatumBuilderMintPoolV3Args = {
  assetA: PREVIEW_DATA.assets.tada,
  assetB: PREVIEW_DATA.assets.tindy,
  fees: {
    bid: 5n,
    ask: 5n,
  },
  marketOpen: 123n,
  depositFee: 2_000_000n,
  seedUtxo: {
    address:
      "addr_test1qrp8nglm8d8x9w783c5g0qa4spzaft5z5xyx0kp495p8wksjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqtjfk6s",
    txHash: "598d48e74d2aec716c1c8c889b34d77b9e0f5240dbee805c23267c2f1f97cc11",
    outputIndex: 1,
    assets: {
      lovelace: 3679167n,
      fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459:
        645575242n,
    },
  },
};

beforeEach(() => {
  builderInstance = new DatumBuilderLucidV3("preview");
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("builderMintPoolDatum()", () => {
  it("should build the pool mint datum properly", () => {
    const spiedOnComputePoolId = jest.spyOn(
      DatumBuilderLucidV3,
      "computePoolId"
    );
    const spiedOnBuildLexicographicalAssetsDatum = jest.spyOn(
      DatumBuilderLucidV3.prototype,
      "buildLexicographicalAssetsDatum"
    );
    const expectedIdent =
      "82f70fd1663b2b6f4250d6054fe4cac8c815d9eef8b38f68bbe22c92";

    const { inline } = builderInstance.buildMintPoolDatum(defaultArgs);

    expect(spiedOnComputePoolId).toHaveBeenNthCalledWith(
      1,
      defaultArgs.seedUtxo
    );
    expect(spiedOnComputePoolId).toHaveNthReturnedWith(1, expectedIdent);
    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(1);
    expect(inline).toEqual(
      "d8799f581c82f70fd1663b2b6f4250d6054fe4cac8c815d9eef8b38f68bbe22c929f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d000505d87a80187b1a001e8480ff"
    );
  });

  it("should build the pool mint datum properly with split fees", () => {
    const spiedOnComputePoolId = jest.spyOn(
      DatumBuilderLucidV3,
      "computePoolId"
    );
    const spiedOnBuildLexicographicalAssetsDatum = jest.spyOn(
      DatumBuilderLucidV3.prototype,
      "buildLexicographicalAssetsDatum"
    );
    const expectedIdent =
      "82f70fd1663b2b6f4250d6054fe4cac8c815d9eef8b38f68bbe22c92";

    const { inline } = builderInstance.buildMintPoolDatum({
      ...defaultArgs,
      fees: {
        ask: 87n,
        bid: 100n,
      },
    });

    expect(spiedOnComputePoolId).toHaveBeenNthCalledWith(
      1,
      defaultArgs.seedUtxo
    );
    expect(spiedOnComputePoolId).toHaveNthReturnedWith(1, expectedIdent);
    expect(spiedOnBuildLexicographicalAssetsDatum).toHaveBeenCalledTimes(1);
    expect(inline).toEqual(
      "d8799f581c82f70fd1663b2b6f4250d6054fe4cac8c815d9eef8b38f68bbe22c929f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d0018641857d87a80187b1a001e8480ff"
    );
  });
});
