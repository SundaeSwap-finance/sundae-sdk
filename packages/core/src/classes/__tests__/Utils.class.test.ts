import { AssetAmount } from "../AssetAmount.class";
import { Utils } from "../Utils.class";
import { ADA_ASSET_ID } from "../../lib/constants";
import { PREVIEW_DATA } from "../../testing/mockData";

describe("Utils class", () => {
  it("getMinReceivableFromSlippage", () => {
    const resultA = Utils.getMinReceivableFromSlippage(
      PREVIEW_DATA.pool,
      PREVIEW_DATA.assets.tada,
      0.1
    );

    expect(resultA).toBeInstanceOf(AssetAmount);
    expect(resultA).toMatchObject({
      amount: 8910000n,
      decimals: 0,
    });

    const resultB = Utils.getMinReceivableFromSlippage(
      PREVIEW_DATA.pool,
      PREVIEW_DATA.assets.tindy,
      0.1
    );

    expect(resultB).toBeInstanceOf(AssetAmount);
    expect(resultB).toMatchObject({
      amount: 35640000n,
      decimals: 6,
    });

    try {
      Utils.getMinReceivableFromSlippage(
        PREVIEW_DATA.pool,
        {
          assetId: "not in the pool",
          amount: new AssetAmount(10n),
        },
        0.1
      );
    } catch (e) {
      expect((e as Error).message).toEqual(
        `The supplied asset ID does not match either assets within the supplied pool data. {"suppliedAssetID":"not in the pool","poolAssetIDs":["","fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459"]}`
      );
    }
  });

  it("should accurately accumulate suppliedAssets", () => {
    const aggregate = Utils.accumulateSuppliedAssets(
      [
        PREVIEW_DATA.assets.tada,
        {
          assetId: ADA_ASSET_ID,
          amount: new AssetAmount(25000000n, 6),
        },
        PREVIEW_DATA.assets.tindy,
      ],
      "preview"
    );

    const { SCOOPER_FEE, RIDER_FEE } = Utils.getParams("preview");

    expect(aggregate).toEqual({
      lovelace: 45000000n + SCOOPER_FEE + RIDER_FEE,
      fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459:
        20000000n,
    });
  });

  it("should accurately sort a pair of assets", () => {
    const result = Utils.sortSwapAssets([
      PREVIEW_DATA.assets.tindy,
      PREVIEW_DATA.assets.tada,
    ]);
    expect(result[0]).toEqual(PREVIEW_DATA.assets.tada);
    expect(result[1]).toEqual(PREVIEW_DATA.assets.tindy);

    const result2 = Utils.sortSwapAssets([
      PREVIEW_DATA.assets.tindy,
      {
        ...PREVIEW_DATA.assets.tindy,
        assetId: "abcd",
      },
    ]);
    expect(result2[0]).toEqual({
      ...PREVIEW_DATA.assets.tindy,
      assetId: "abcd",
    });
    expect(result2[1]).toEqual(PREVIEW_DATA.assets.tindy);
  });

  it("should accurately get the swap direction", () => {
    const result = Utils.getAssetSwapDirection(
      { assetId: "", amount: new AssetAmount(10n) },
      [PREVIEW_DATA.pool.assetA, PREVIEW_DATA.pool.assetB]
    );
    expect(result).toEqual(0);

    const result2 = Utils.getAssetSwapDirection(PREVIEW_DATA.assets.tindy, [
      PREVIEW_DATA.pool.assetA,
      PREVIEW_DATA.pool.assetB,
    ]);
    expect(result2).toEqual(1);
  });
});
