import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { IFeesConfig, IMintPoolConfigArgs } from "../@types/index.js";
import { Config } from "../Abstracts/Config.abstract.class.js";
import { TConditionDatumArgs } from "../DatumBuilders/DatumBuilder.V3.class.js";

export class MintPoolConfig extends Config<IMintPoolConfigArgs> {
  static MAX_FEE: bigint = 500n;

  assetA?: AssetAmount<IAssetAmountMetadata>;
  assetB?: AssetAmount<IAssetAmountMetadata>;
  fees?: IFeesConfig;
  marketTimings?: bigint;
  donateToTreasury?: bigint;
  ownerAddress?: string;
  feeManager?: string;
  condition?: string;
  conditionDatumArgs?: TConditionDatumArgs;

  constructor(args?: IMintPoolConfigArgs) {
    super();
    args && this.setFromObject(args);
  }

  setFromObject({
    assetA,
    assetB,
    fees,
    marketOpen,
    ownerAddress,
    referralFee,
    donateToTreasury,
    feeManager,
    condition,
    conditionDatumArgs,
  }: IMintPoolConfigArgs): void {
    referralFee && this.setReferralFee(referralFee);
    this.setAssetA(assetA);
    this.setAssetB(assetB);
    this.setFees(fees);
    this.setMarketOpen(marketOpen || 0n);
    this.setOwnerAddress(ownerAddress);
    this.setDonateToTreasury(donateToTreasury);
    this.setFeeManager(feeManager);
    this.setCondition(condition);
    this.setConditionDatumArgs(conditionDatumArgs);
  }

  buildArgs(): Omit<IMintPoolConfigArgs, "fees"> & {
    fees: IFeesConfig;
  } {
    this.validate();
    return {
      assetA: this.assetA as AssetAmount<IAssetAmountMetadata>,
      assetB: this.assetB as AssetAmount<IAssetAmountMetadata>,
      fees: this.fees as IFeesConfig,
      marketOpen: this.marketTimings as bigint,
      ownerAddress: this.ownerAddress as string,
      referralFee: this.referralFee,
      donateToTreasury: this.donateToTreasury,
      condition: this.condition,
      conditionDatumArgs: this.conditionDatumArgs,
    };
  }

  setFeeManager(val?: string) {
    this.feeManager = val;
    return this;
  }

  setCondition(condition?: string) {
    this.condition = condition;
    return this;
  }

  setConditionDatumArgs(conditionDatumArgs?: TConditionDatumArgs) {
    this.conditionDatumArgs = conditionDatumArgs;
    return this;
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

  setFees(fees: bigint | IFeesConfig) {
    this.fees =
      typeof fees === "bigint"
        ? {
            ask: fees,
            bid: fees,
          }
        : fees;

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

  /// TODO: validate condition against whitelisted conditions
  validate(): void {
    super.validate();

    if (!this.fees) {
      throw new Error(`No fees were set, but are required.`);
    }

    if (this.fees.ask === this.fees.bid) {
      if (
        this.fees.ask > MintPoolConfig.MAX_FEE ||
        this.fees.bid > MintPoolConfig.MAX_FEE
      ) {
        throw new Error(
          `Fees cannot supersede the max fee of ${MintPoolConfig.MAX_FEE}.`,
        );
      }
    } else {
      if (this.fees.ask > MintPoolConfig.MAX_FEE) {
        throw new Error(
          `Ask fee cannot supersede the max fee of ${MintPoolConfig.MAX_FEE}.`,
        );
      }

      if (this.fees.bid > MintPoolConfig.MAX_FEE) {
        throw new Error(
          `Bid fee cannot supersede the max fee of ${MintPoolConfig.MAX_FEE}.`,
        );
      }
    }

    if (
      this.donateToTreasury &&
      (this.donateToTreasury > 100n || this.donateToTreasury < 0n)
    ) {
      throw new Error(
        `Donation value is determined as a percentage between 0 and 100`,
      );
    }
  }
}
