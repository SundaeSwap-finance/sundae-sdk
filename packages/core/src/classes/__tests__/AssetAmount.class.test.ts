import { AssetAmount } from "../AssetAmount.class";

describe("AssetAmount class", () => {
  it("should accurately convert an amount when decimals are provided", () => {
    const asset = new AssetAmount(100000000n, 6);
    expect(asset.getAmount()).toEqual(100000000n);
    expect(asset.getDenominatedAmount()).toEqual(100);
  });
  it("should accurately convert an amount when no decimals are provided", () => {
    const asset = new AssetAmount(100n);
    expect(asset.getAmount()).toEqual(100n);
    expect(asset.getDenominatedAmount()).toEqual(100);
  });
  it("should accurately convert an amount to the denominated representation", () => {
    const asset = new AssetAmount(112314142n, 6);
    expect(asset.getDenominatedAmount()).toEqual(112.314142);
  });
});
