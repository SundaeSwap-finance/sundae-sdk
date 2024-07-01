import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { IMintV3PoolConfigArgs } from "../@types/index.js";

import { Config } from "../Abstracts/Config.abstract.class.js";

export class MintV3PoolConfig extends Config<IMintV3PoolConfigArgs> {
  static MAX_FEE: bigint = 10_000n;

  assetA?: AssetAmount<IAssetAmountMetadata>;
  assetB?: AssetAmount<IAssetAmountMetadata>;
  fee?: bigint;
  marketTimings?: bigint;
  donateToTreasury?: bigint;
  ownerAddress?: string;

  constructor(args?: IMintV3PoolConfigArgs) {
    super();
    args && this.setFromObject(args);
  }

  setFromObject({
    assetA,
    assetB,
    fee,
    marketOpen,
    ownerAddress,
    referralFee,
    donateToTreasury,
  }: IMintV3PoolConfigArgs): void {
    referralFee && this.setReferralFee(referralFee);
    this.setAssetA(assetA);
    this.setAssetB(assetB);
    this.setFee(fee);
    this.setMarketOpen(marketOpen || 0n);
    this.setOwnerAddress(ownerAddress);
    this.setDonateToTreasury(donateToTreasury);
  }

  buildArgs(): IMintV3PoolConfigArgs {
    this.validate();
    return {
      assetA: this.assetA as AssetAmount<IAssetAmountMetadata>,
      assetB: this.assetB as AssetAmount<IAssetAmountMetadata>,
      fee: this.fee as bigint,
      marketOpen: this.marketTimings as bigint,
      ownerAddress: this.ownerAddress as string,
      referralFee: this.referralFee,
      donateToTreasury: this.donateToTreasury,
    };
  }

  setDonateToTreasury(val?: bigint) {
    this.donateToTreasury = val;
    return this;
  }

  setAssetA(assetA: AssetAmount<IAssetAmountMetadata>) {
    this.assetA = assetA;
    return this;
  }

  setAssetB(assetB: AssetAmount<IAssetAmountMetadata>) {
    this.assetB = assetB;
    return this;
  }

  setFee(fee: bigint) {
    this.fee = fee;
    return this;
  }

  setMarketOpen(timing: bigint) {
    this.marketTimings = timing;
    return this;
  }

  setOwnerAddress(address: string) {
    this.ownerAddress = address;
    return this;
  }

  validate(): void {
    super.validate();

    if (!this.fee) {
      throw new Error(`No fee was set, but is required.`);
    }

    if (this.fee > MintV3PoolConfig.MAX_FEE) {
      throw new Error(
        `Fees cannot supersede the max fee of ${MintV3PoolConfig.MAX_FEE}.`
      );
    }

    if (
      this.donateToTreasury &&
      (this.donateToTreasury > 100n || this.donateToTreasury < 0n)
    ) {
      throw new Error(
        `Donation value is determined as a percentage between 0 and 100`
      );
    }
  }
}
