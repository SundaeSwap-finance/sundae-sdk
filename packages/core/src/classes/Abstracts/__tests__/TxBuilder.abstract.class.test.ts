import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import { ITxBuilderReferralFee } from "../../../@types";
import { TxBuilder } from "../TxBuilder.abstract.class";

describe("TxBuilder", () => {
  it("should accurately calculate the referral fee with no percentage or supplied assets", () => {
    const referral: ITxBuilderReferralFee = {
      destination: "test-address",
      minimumAmount: new AssetAmount<IAssetAmountMetadata>(1000000n, {
        assetId: "",
        decimals: 6,
      }),
    };

    const result = TxBuilder.calculateReferralFee(referral);
    expect(result.destination).toEqual("test-address");
    expect(result.payment.amount).toEqual(1000000n);
    expect(result.payment.decimals).toEqual(6);
    expect(result.payment.metadata.assetId).toEqual("");
  });

  it("should accurately calculate the referral fee with percentage and no supplied asset", () => {
    const referral: ITxBuilderReferralFee = {
      destination: "test-address",
      minimumAmount: new AssetAmount<IAssetAmountMetadata>(1000000n, {
        assetId: "",
        decimals: 6,
      }),
      percent: 0.5,
    };

    const result = TxBuilder.calculateReferralFee(referral);
    expect(result.destination).toEqual("test-address");
    expect(result.payment.amount).toEqual(1000000n);
    expect(result.payment.decimals).toEqual(6);
    expect(result.payment.metadata.assetId).toEqual("");
  });

  it("should accurately calculate the referral fee with percentage and a supplied asset", () => {
    const referralWithMismatchingSuppliedAsset: ITxBuilderReferralFee = {
      destination: "test-address",
      minimumAmount: new AssetAmount<IAssetAmountMetadata>(1000000n, {
        assetId: "",
        decimals: 6,
      }),
      percent: 0.5,
    };

    const resultWithMismatchingSuppliedAsset = TxBuilder.calculateReferralFee(
      referralWithMismatchingSuppliedAsset,
      new AssetAmount(10000000n, { assetId: "different-id", decimals: 6 })
    );
    expect(resultWithMismatchingSuppliedAsset.destination).toEqual(
      "test-address"
    );
    expect(resultWithMismatchingSuppliedAsset.payment.amount).toEqual(1000000n);
    expect(resultWithMismatchingSuppliedAsset.payment.decimals).toEqual(6);
    expect(resultWithMismatchingSuppliedAsset.payment.metadata.assetId).toEqual(
      ""
    );

    const referralWithMatchingSuppliedAsset: ITxBuilderReferralFee = {
      destination: "test-address",
      minimumAmount: new AssetAmount<IAssetAmountMetadata>(1000000n, {
        assetId: "",
        decimals: 6,
      }),
      percent: 0.5,
    };

    const resultWithMatchingSuppliedAsset = TxBuilder.calculateReferralFee(
      referralWithMatchingSuppliedAsset,
      new AssetAmount(10000000n, { assetId: "", decimals: 6 })
    );
    expect(resultWithMatchingSuppliedAsset.destination).toEqual("test-address");
    expect(resultWithMatchingSuppliedAsset.payment.amount).toEqual(5000000n);
    expect(resultWithMatchingSuppliedAsset.payment.decimals).toEqual(6);
    expect(resultWithMatchingSuppliedAsset.payment.metadata.assetId).toEqual(
      ""
    );

    const referralWithPercent: ITxBuilderReferralFee = {
      destination: "test-address",
      minimumAmount: new AssetAmount<IAssetAmountMetadata>(1000000n, {
        assetId: "",
        decimals: 6,
      }),
      percent: 0.01,
    };

    const resultWithMinimumGreaterThanPercent = TxBuilder.calculateReferralFee(
      referralWithPercent,
      new AssetAmount(10000000n, { assetId: "", decimals: 6 })
    );
    expect(resultWithMinimumGreaterThanPercent.destination).toEqual(
      "test-address"
    );
    expect(resultWithMinimumGreaterThanPercent.payment.amount).toEqual(
      1000000n
    );
    expect(resultWithMinimumGreaterThanPercent.payment.decimals).toEqual(6);
    expect(
      resultWithMinimumGreaterThanPercent.payment.metadata.assetId
    ).toEqual("");
  });
});
