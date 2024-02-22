import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { IMintV3PoolConfigArgs } from "../@types/index.js";

import { TFee } from "../@types/queryprovider.js";
import { Config } from "../Abstracts/Config.abstract.class.js";

export class MintV3PoolConfig extends Config<IMintV3PoolConfigArgs> {
  assetA?: AssetAmount<IAssetAmountMetadata>;
  assetB?: AssetAmount<IAssetAmountMetadata>;
  fees?: TFee;
  marketTimings?: [bigint, bigint];
  ownerAddress?: string;
  protocolFee?: bigint;

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
    protocolFee,
    referralFee,
  }: IMintV3PoolConfigArgs): void {
    referralFee && this.setReferralFee(referralFee);
    this.setAssetA(assetA);
    this.setAssetB(assetB);
    this.setFees(fees);
    this.setMarketTimings(marketTimings);
    this.setOwnerAddress(ownerAddress);
    this.setProtocolFee(protocolFee ?? 2_000_000n);
  }

  buildArgs(): Omit<IMintV3PoolConfigArgs, "protocolFee" | "marketTimings"> & {
    protocolFee: bigint;
    marketTimings: [bigint, bigint];
  } {
    this.validate();
    return {
      assetA: this.assetA as AssetAmount<IAssetAmountMetadata>,
      assetB: this.assetB as AssetAmount<IAssetAmountMetadata>,
      fees: this.fees as TFee,
      marketTimings: this.marketTimings as [bigint, bigint],
      ownerAddress: this.ownerAddress as string,
      protocolFee: this.protocolFee ?? 2_000_000n,
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

  setProtocolFee(fee: bigint) {
    this.protocolFee = fee;
    return this;
  }

  validate(): void {
    super.validate();
  }
}
