import { AssetAmount } from "../AssetAmount.class";

describe("AssetAmount class", () => {
  it("should return the decimals", () => {
    const result = new AssetAmount(10000000n, 8);
    expect(result.getDecimals()).toEqual(8);
  });
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
  it("should accurately add to the amount", () => {
    const asset = new AssetAmount(10n);
    expect(asset.add(10n).getDenominatedAmount()).toEqual(20);
  });
  it("should accurately subtract to the amount", () => {
    const asset = new AssetAmount(20n);
    expect(asset.subtract(10n).getDenominatedAmount()).toEqual(10);
  });
});
