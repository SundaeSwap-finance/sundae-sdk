import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { IMintV3PoolConfigArgs } from "../@types/index.js";

import { TFee } from "../@types/queryprovider.js";
import { Config } from "../Abstracts/Config.abstract.class.js";

export class MintV3PoolConfig extends Config<IMintV3PoolConfigArgs> {
  static MAX_FEE: bigint = 10_000n;

  assetA?: AssetAmount<IAssetAmountMetadata>;
  assetB?: AssetAmount<IAssetAmountMetadata>;
  fees?: TFee;
  marketTimings?: [bigint, bigint];
  ownerAddress?: string;

  constructor(args?: IMintV3PoolConfigArgs) {
    super();
    args && this.setFromObject(args);
  }

  setFromObject({
    assetA,
    assetB,
    fees,
    marketTimings,
    ownerAddress,
    referralFee,
  }: IMintV3PoolConfigArgs): void {
    referralFee && this.setReferralFee(referralFee);
    this.setAssetA(assetA);
    this.setAssetB(assetB);
    this.setFees(fees);
    this.setMarketTimings(marketTimings);
    this.setOwnerAddress(ownerAddress);
  }

  buildArgs(): Omit<IMintV3PoolConfigArgs, "marketTimings"> & {
    marketTimings: [bigint, bigint];
  } {
    this.validate();
    return {
      assetA: this.assetA as AssetAmount<IAssetAmountMetadata>,
      assetB: this.assetB as AssetAmount<IAssetAmountMetadata>,
      fees: this.fees as TFee,
      marketTimings: this.marketTimings as [bigint, bigint],
      ownerAddress: this.ownerAddress as string,
      referralFee: this.referralFee,
    };
  }

  setAssetA(assetA: AssetAmount<IAssetAmountMetadata>) {
    this.assetA = assetA;
    return this;
  }

  setAssetB(assetB: AssetAmount<IAssetAmountMetadata>) {
    this.assetB = assetB;
    return this;
  }

  setFees(fee: TFee) {
    this.fees = fee;
    return this;
  }

  setMarketTimings(timings: [bigint | number, bigint | number]) {
    this.marketTimings = [BigInt(timings[0]), BigInt(timings[1])];
    return this;
  }

  setOwnerAddress(address: string) {
    this.ownerAddress = address;
    return this;
  }

  validate(): void {
    super.validate();

    const [feeOpen = 0, feeClose = 0] = this.marketTimings || [];
    if (feeClose < feeOpen) {
      throw new Error(
        "The second timestamp in the marketTimings tuple must be greater than the first."
      );
    }

    const [feeStart = 0n, feeEnd = 0n] = this.fees || [];
    if (
      feeStart > MintV3PoolConfig.MAX_FEE ||
      feeEnd > MintV3PoolConfig.MAX_FEE
    ) {
      throw new Error(
        `Fees cannot supersede the max fee of ${MintV3PoolConfig.MAX_FEE}.`
      );
    }
  }
}
