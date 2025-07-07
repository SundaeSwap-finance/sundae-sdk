import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { IFeesConfig, TConditionDatumArgs, TMintPoolConfigArgs } from "../@types/index.js";
import { Config } from "../Abstracts/Config.abstract.class.js";

export class MintPoolConfig extends Config<TMintPoolConfigArgs> {
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
  linearAmplification?: bigint;
  linearAmplificationManager?: string;

  constructor(args?: TMintPoolConfigArgs) {
    super();
    args && this.setFromObject(args);
  }

  setFromObject(args: TMintPoolConfigArgs): void {
    args.referralFee && this.setReferralFee(args.referralFee);
    this.setAssetA(args.assetA);
    this.setAssetB(args.assetB);
    this.setFees(args.fees);
    this.setMarketOpen(args.marketOpen || 0n);
    this.setOwnerAddress(args.ownerAddress);
    this.setDonateToTreasury(args.donateToTreasury);
    this.setFeeManager(args.feeManager);
    if ("condition" in args) {
      this.setCondition(args.condition);
    }
    if ("conditionDatumArgs" in args) {
      this.setConditionDatumArgs(args.conditionDatumArgs);
    }
    if ("linearAmplification" in args) {
      this.setLinearAmplification(args.linearAmplification);
    }
    if ("linearAmplificationManager" in args) {
      this.setLinearAmplificationManager(args.linearAmplificationManager);
    }
  }

  buildArgs(): Omit<TMintPoolConfigArgs, "fees"> & {
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
    };
  }

  setLinearAmplification(linearAmplification?: bigint) {
    this.linearAmplification = linearAmplification;
    return this;
  }

  setLinearAmplificationManager(linearAmplificationManager?: string) {
    this.linearAmplificationManager = linearAmplificationManager;
    return this;
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
