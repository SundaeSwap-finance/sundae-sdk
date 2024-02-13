import { AssetAmount } from "@sundaeswap/asset";
import type { ITxBuilderReferralFee } from "@sundaeswap/core";
import { Config } from "@sundaeswap/core";

import { ILockConfigArgs } from "../../@types/index.js";

/**
 * The main config class for building valid arguments for a Lock transaction.
 */
export class LockConfig extends Config<ILockConfigArgs> {
  referralFee?: ITxBuilderReferralFee | undefined;
  ownerAddress?: ILockConfigArgs["ownerAddress"];
  existingPositions?: ILockConfigArgs["existingPositions"];
  lockedValues?: ILockConfigArgs["lockedValues"];
  programs?: ILockConfigArgs["programs"];

  constructor(args?: ILockConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  setFromObject({
    existingPositions,
    lockedValues,
    ownerAddress,
    programs,
    referralFee,
  }: ILockConfigArgs): void {
    this.setLockedValues(lockedValues);
    this.setPrograms(programs);
    this.setOwnerAddress(ownerAddress);
    existingPositions && this.setExistingPositions(existingPositions);
    referralFee && this.setReferralFee(referralFee);
  }

  buildArgs(): ILockConfigArgs | never {
    this.validate();

    return {
      existingPositions: this
        .existingPositions as ILockConfigArgs["existingPositions"],
      lockedValues: this.lockedValues as ILockConfigArgs["lockedValues"],
      programs: this.programs as ILockConfigArgs["programs"],
      ownerAddress: this.ownerAddress as ILockConfigArgs["ownerAddress"],
      referralFee: this.referralFee,
    };
  }

  setOwnerAddress(ownerAddress: ILockConfigArgs["ownerAddress"]) {
    this.ownerAddress = ownerAddress;
    return this;
  }

  setExistingPositions(positions: ILockConfigArgs["existingPositions"]) {
    this.existingPositions = positions;
    return this;
  }

  setLockedValues(values: ILockConfigArgs["lockedValues"]) {
    this.lockedValues = values;
    return this;
  }

  setPrograms(programs: ILockConfigArgs["programs"]) {
    this.programs = programs;
    return this;
  }

  validate(): void {
    super.validate();

    if (!this.ownerAddress) {
      throw new Error(
        "You did not provide an owner's address. An owner's address is required to add, update, or remove locked assets."
      );
    }

    if (
      this?.lockedValues &&
      this?.lockedValues.filter((val) => !(val instanceof AssetAmount))
        ?.length > 0
    ) {
      throw new Error(
        "One or more of your locked values is not of type AssetAmount."
      );
    }

    if (
      this?.programs &&
      !this?.lockedValues?.length &&
      !this?.existingPositions?.length
    ) {
      throw new Error(
        "You provided a program map but no assets are assigned to accompany the data."
      );
    }
  }
}
