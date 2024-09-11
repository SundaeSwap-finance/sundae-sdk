import { AssetAmount } from "@sundaeswap/asset";
import { Config } from "@sundaeswap/core";

import { ILockConfigArgs } from "../../@types/configs.js";

/**
 * The main config class for building valid arguments for a Lock transaction.
 */
export class LockConfig<Programs> extends Config<ILockConfigArgs<Programs>> {
  ownerAddress?: ILockConfigArgs<Programs>["ownerAddress"];
  existingPositions?: ILockConfigArgs<Programs>["existingPositions"];
  lockedValues?: ILockConfigArgs<Programs>["lockedValues"];
  programs?: ILockConfigArgs<Programs>["programs"];

  constructor(args?: ILockConfigArgs<Programs>) {
    super();

    args && this.setFromObject(args);
  }

  setFromObject({
    existingPositions,
    lockedValues,
    ownerAddress,
    programs,
    referralFee,
  }: ILockConfigArgs<Programs>): void {
    this.setLockedValues(lockedValues);
    this.setPrograms(programs);
    this.setOwnerAddress(ownerAddress);
    existingPositions && this.setExistingPositions(existingPositions);
    referralFee && this.setReferralFee(referralFee);
  }

  buildArgs(): ILockConfigArgs<Programs> | never {
    this.validate();

    return {
      existingPositions: this
        .existingPositions as ILockConfigArgs<Programs>["existingPositions"],
      lockedValues: this
        .lockedValues as ILockConfigArgs<Programs>["lockedValues"],
      programs: this.programs as ILockConfigArgs<Programs>["programs"],
      ownerAddress: this
        .ownerAddress as ILockConfigArgs<Programs>["ownerAddress"],
      referralFee: this.referralFee,
    };
  }

  setOwnerAddress(ownerAddress: ILockConfigArgs<Programs>["ownerAddress"]) {
    this.ownerAddress = ownerAddress;
    return this;
  }

  setExistingPositions(
    positions: ILockConfigArgs<Programs>["existingPositions"],
  ) {
    this.existingPositions = positions;
    return this;
  }

  setLockedValues(values: ILockConfigArgs<Programs>["lockedValues"]) {
    this.lockedValues = values;
    return this;
  }

  setPrograms(programs: ILockConfigArgs<Programs>["programs"]) {
    this.programs = programs;
    return this;
  }

  validate(): void {
    super.validate();

    if (!this.ownerAddress) {
      throw new Error(
        "You did not provide an owner's address. An owner's address is required to add, update, or remove locked assets.",
      );
    }

    if (
      this?.lockedValues &&
      this?.lockedValues.filter((val) => !(val instanceof AssetAmount))
        ?.length > 0
    ) {
      throw new Error(
        "One or more of your locked values is not of type AssetAmount.",
      );
    }

    if (
      this?.programs &&
      !this?.lockedValues?.length &&
      !this?.existingPositions?.length
    ) {
      throw new Error(
        "You provided a program map but no assets are assigned to accompany the data.",
      );
    }
  }
}
