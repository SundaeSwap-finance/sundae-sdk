import { describe, expect, it } from "bun:test";

import { Core } from "@blaze-cardano/sdk";
import { ITxBuilderReferralFee } from "../../@types/index.js";
import { Config } from "../Config.abstract.class.js";

const mockAddress =
  "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32";

class TestClass extends Config {
  constructor() {
    super();
  }

  setFromObject(): void {}
  buildArgs() {
    this.validate();
    return {};
  }
  validate(): void {
    super.validate();
  }
}

describe("Config", () => {
  it("should set the referral fee correctly", () => {
    const configWithAmount = new TestClass();
    const amountConfig: ITxBuilderReferralFee = {
      destination: mockAddress,

      payment: new Core.Value(10n),
    };

    configWithAmount.setReferralFee(amountConfig);
    expect(configWithAmount.referralFee).toMatchObject(amountConfig);

    const configWithPercent = new TestClass();
    const percentConfig: ITxBuilderReferralFee = {
      destination: mockAddress,
      payment: new Core.Value(10n),
    };

    configWithPercent.setReferralFee(percentConfig);
    expect(configWithPercent.referralFee).toMatchObject(percentConfig);

    const configWithLabel = new TestClass();
    const labelConfig: ITxBuilderReferralFee = {
      destination: mockAddress,
      payment: new Core.Value(10n),
      feeLabel: "Test Fee",
    };

    configWithLabel.setReferralFee(labelConfig);
    expect(configWithLabel.referralFee).toMatchObject(labelConfig);
  });

  it("should validate the referral fee correctly", () => {
    const configWithAmount = new TestClass();
    const amountConfig: ITxBuilderReferralFee = {
      destination: mockAddress,
      // @ts-ignore
      payment: 6,
    };

    configWithAmount.setReferralFee(amountConfig);
    expect(() => configWithAmount.buildArgs()).toThrowError(
      new Error(configWithAmount.INVALID_FEE_AMOUNT),
    );
  });
});
