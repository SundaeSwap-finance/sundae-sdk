import { FreezerConfigArgs, ITxBuilderReferralFee } from "../../@types";
import { Config } from "../Abstracts/Config.abstract.class";
import { AssetAmount } from "@sundaeswap/asset";

/**
 * The main config class for building valid arguments for a Freezer transaction.
 */
export class FreezerConfig extends Config<FreezerConfigArgs> {
  referralFee?: ITxBuilderReferralFee | undefined;
  ownerAddress?: FreezerConfigArgs["ownerAddress"];
  existingPositions?: FreezerConfigArgs["existingPositions"];
  lockedValues?: FreezerConfigArgs["lockedValues"];
  delegation?: FreezerConfigArgs["delegation"];

  constructor(args?: FreezerConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  setFromObject({
    existingPositions,
    lockedValues,
    delegation,
    ownerAddress,
    referralFee,
  }: FreezerConfigArgs): void {
    this.setLockedValues(lockedValues);
    this.setDelegation(delegation);
    this.setOwnerAddress(ownerAddress);
    existingPositions && this.setExistingPositions(existingPositions);
    referralFee && this.setReferralFee(referralFee);
  }

  buildArgs(): FreezerConfigArgs | never {
    this.validate();

    return {
      existingPositions: this
        .existingPositions as FreezerConfigArgs["existingPositions"],
      lockedValues: this.lockedValues as FreezerConfigArgs["lockedValues"],
      delegation: this.delegation as FreezerConfigArgs["delegation"],
      ownerAddress: this.ownerAddress as FreezerConfigArgs["ownerAddress"],
      referralFee: this.referralFee,
    };
  }

  setOwnerAddress(ownerAddress: FreezerConfigArgs["ownerAddress"]) {
    this.ownerAddress = ownerAddress;
    return this;
  }

  setExistingPositions(positions: FreezerConfigArgs["existingPositions"]) {
    this.existingPositions = positions;
    return this;
  }

  setLockedValues(values: FreezerConfigArgs["lockedValues"]) {
    this.lockedValues = values;
    return this;
  }

  setDelegation(delegation: FreezerConfigArgs["delegation"]) {
    this.delegation = delegation;
    return this;
  }

  validate(): void {
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
      this?.delegation &&
      !this?.lockedValues?.length &&
      !this?.existingPositions?.length
    ) {
      throw new Error(
        "You provided a delegation map but no assets are assigned to accompany the data."
      );
    }

    if (!this?.ownerAddress) {
      throw new Error(
        "You did not provide an owner's address. An owner's address is required to add, update, or remove locked assets."
      );
    }
  }
}
