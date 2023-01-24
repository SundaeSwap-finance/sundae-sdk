import { AssetAmount } from "../AssetAmount.class";
import { IAsset, IPoolData } from "../../@types";
import { Utils } from "../Utils.class";
import { ADA_ASSET_ID } from "../../lib/constants";

const mockPoolData: IPoolData = {
  ident: "06",
  fee: "1",
  assetA: {
    assetId: "",
    decimals: 6,
  },
  assetB: {
    assetId:
      "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
    decimals: 0,
  },
  quantityA: "500000000",
  quantityB: "250000000",
};

const mockSuppliedADA: IAsset = {
  amount: new AssetAmount(20000000n, 6),
  assetId: "",
};

const mockSuppliedIndy: IAsset = {
  amount: new AssetAmount(20000000n, 0),
  assetId:
    "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
};

describe("Utils class", () => {
  it("getMinReceivableFromSlippage", () => {
    const resultA = Utils.getMinReceivableFromSlippage(
      mockPoolData,
      mockSuppliedADA,
      0.1
    );

    expect(resultA).toBeInstanceOf(AssetAmount);
    expect(resultA).toMatchObject({
      amount: 8910000n,
      decimals: 0,
    });

    const resultB = Utils.getMinReceivableFromSlippage(
      mockPoolData,
      mockSuppliedIndy,
      0.1
    );

    expect(resultB).toBeInstanceOf(AssetAmount);
    expect(resultB).toMatchObject({
      amount: 35640000n,
      decimals: 6,
    });
  });

  it("should accurately accumulate suppliedAssets", () => {
    const aggregate = Utils.accumulateSuppliedAssets(
      [
        mockSuppliedADA,
        {
          assetId: ADA_ASSET_ID,
          amount: new AssetAmount(25000000n, 6),
        },
        mockSuppliedIndy,
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
});
