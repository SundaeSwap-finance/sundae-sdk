import { jest } from "@jest/globals";
import { AssetAmount } from "../../classes/utilities/AssetAmount.class";

describe("AssetAmount class", () => {
  it("should accurately convert an amount when decimals are provided", () => {
    const asset = new AssetAmount(100n, 6);
    expect(asset.getAmount()).toEqual(100n);
    expect(asset.getRawAmount()).toEqual(100000000n);
    expect(asset.getRawAmount(4)).toEqual(1000000n);
  });
  it("should accurately convert an amount when no decimals are provided", () => {
    const asset = new AssetAmount(100n);
    expect(asset.getAmount()).toEqual(100n);
    expect(asset.getRawAmount()).toEqual(100n);
    expect(asset.getRawAmount(6)).toEqual(100000000n);
  });
});
