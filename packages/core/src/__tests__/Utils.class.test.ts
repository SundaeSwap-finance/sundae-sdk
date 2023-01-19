import { AssetAmount } from "../classes/AssetAmount.class";
import { IAsset, IPoolData } from "../@types";
import { Utils } from "../classes/Utils.class";

const mockPoolData: IPoolData = {
  ident: "06",
  fee: "0.05",
  assetA: {
    assetId: "",
    decimals: 6,
  },
  assetB: {
    assetId:
      "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
    decimals: 0,
  },
  quantityA: "4973066102",
  quantityB: "377632219",
};

const mockSuppliedADA: IAsset = {
  amount: new AssetAmount(20000000n, 6),
  assetID: "",
};

const mockSuppliedIndy: IAsset = {
  amount: new AssetAmount(20000000n, 0),
  assetID:
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
      amount: 1298496n,
      decimals: 0,
    });

    const resultB = Utils.getMinReceivableFromSlippage(
      mockPoolData,
      mockSuppliedIndy,
      0.1
    );

    expect(resultB).toBeInstanceOf(AssetAmount);
    expect(resultB).toMatchObject({
      amount: 225191141n,
      decimals: 6,
    });
  });
});
