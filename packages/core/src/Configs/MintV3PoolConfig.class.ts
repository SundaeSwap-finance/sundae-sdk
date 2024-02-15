import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { IMintV3PoolConfigArgs } from "../@types/index.js";

import { TFee } from "../@types/queryprovider.js";
import { Config } from "../Abstracts/Config.abstract.class.js";

export class MintV3PoolConfig extends Config<IMintV3PoolConfigArgs> {
  assetA?: AssetAmount<IAssetAmountMetadata>;
  assetB?: AssetAmount<IAssetAmountMetadata>;
  feeDecay?: TFee;
  feeSlotEnd?: bigint;
  feeSlotStart?: bigint;
  ownerAddress?: string;
  protocolFee?: bigint;

  constructor(args?: IMintV3PoolConfigArgs) {
    super();
    args && this.setFromObject(args);
  }

  setFromObject({
    assetA,
    assetB,
    feeDecay,
    feeSlotEnd,
    feeSlotStart,
    ownerAddress,
    protocolFee,
    referralFee,
  }: IMintV3PoolConfigArgs): void {
    referralFee && this.setReferralFee(referralFee);
    this.setAssetA(assetA);
    this.setAssetB(assetB);
    this.setFeeDecay(feeDecay);
    this.setSlotEnd(feeSlotEnd);
    this.setSlotStart(feeSlotStart);
    this.setOwnerAddress(ownerAddress);
    this.setProtocolFee(protocolFee ?? 2_000_000n);
  }

  buildArgs(): Omit<IMintV3PoolConfigArgs, "protocolFee"> & {
    protocolFee: bigint;
  } {
    this.validate();
    return {
      assetA: this.assetA as AssetAmount<IAssetAmountMetadata>,
      assetB: this.assetB as AssetAmount<IAssetAmountMetadata>,
      feeDecay: this.feeDecay as TFee,
      feeSlotEnd: this.feeSlotEnd as bigint,
      feeSlotStart: this.feeSlotStart as bigint,
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

  setFeeDecay(fee: TFee) {
    this.feeDecay = fee;
    return this;
  }

  setSlotEnd(slot: bigint) {
    this.feeSlotEnd = slot;
    return this;
  }

  setSlotStart(slot: bigint) {
    this.feeSlotStart = slot;
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
