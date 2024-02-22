import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { IMintV3PoolConfigArgs } from "../@types/index.js";

import { TFee } from "../@types/queryprovider.js";
import { Config } from "../Abstracts/Config.abstract.class.js";

export class MintV3PoolConfig extends Config<IMintV3PoolConfigArgs> {
  assetA?: AssetAmount<IAssetAmountMetadata>;
  assetB?: AssetAmount<IAssetAmountMetadata>;
  feeDecay?: TFee;
  feeDecayEnd?: bigint;
  marketOpen?: bigint;
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
    feeDecayEnd,
    marketOpen,
    ownerAddress,
    protocolFee,
    referralFee,
  }: IMintV3PoolConfigArgs): void {
    referralFee && this.setReferralFee(referralFee);
    this.setAssetA(assetA);
    this.setAssetB(assetB);
    this.setFeeDecay(feeDecay);
    this.setFeeDecayEnd(feeDecayEnd);
    this.setMarketOpen(marketOpen);
    this.setOwnerAddress(ownerAddress);
    this.setProtocolFee(protocolFee ?? 2_000_000n);
  }

  buildArgs(): Omit<
    IMintV3PoolConfigArgs,
    "protocolFee" | "marketOpen" | "feeDecayEnd"
  > & {
    protocolFee: bigint;
    marketOpen: bigint;
    feeDecayEnd: bigint;
  } {
    this.validate();
    return {
      assetA: this.assetA as AssetAmount<IAssetAmountMetadata>,
      assetB: this.assetB as AssetAmount<IAssetAmountMetadata>,
      feeDecay: this.feeDecay as TFee,
      feeDecayEnd: this.feeDecayEnd as bigint,
      marketOpen: this.marketOpen as bigint,
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

  setFeeDecayEnd(posix: bigint | number) {
    this.feeDecayEnd = BigInt(posix);
    return this;
  }

  setMarketOpen(posix: bigint | number) {
    this.marketOpen = BigInt(posix);
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
