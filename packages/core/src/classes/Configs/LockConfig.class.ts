import { DelegationMap, LockArguments, LockConfigArgs, UTXO } from "src/@types";
import { Config } from "../Abstracts/Config.abstract.class";
import { AssetAmount } from "@sundaeswap/asset";

export class LockConfig extends Config<LockConfigArgs> {
  ownerAddress?: LockConfigArgs["ownerAddress"];
  inputs?: LockConfigArgs["inputs"];
  existingPositions?: LockConfigArgs["existingPositions"];
  lockedValues?: LockConfigArgs["lockedValues"];
  delegation?: LockConfigArgs["delegation"];

  constructor(args?: LockConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  setFromObject({
    inputs,
    existingPositions,
    lockedValues,
    delegation,
  }: LockConfigArgs): void {
    this.setInputs(inputs);
    this.setLockedValues(lockedValues);
    this.setDelegation(delegation);
    existingPositions && this.setExistingPositions(existingPositions);
  }

  buildArgs(): LockConfigArgs | never {
    this.validate();

    return {
      inputs: this.inputs as LockConfigArgs["inputs"],
      existingPositions: this.existingPositions as LockConfigArgs["inputs"],
      lockedValues: this.lockedValues as LockConfigArgs["lockedValues"],
      delegation: this.delegation as LockConfigArgs["delegation"],
      ownerAddress: this.ownerAddress as LockConfigArgs["ownerAddress"],
    };
  }

  setOwnerAddress(ownerAddress: LockConfigArgs["ownerAddress"]) {
    this.ownerAddress = ownerAddress;
    return this;
  }

  setInputs(inputs: LockConfigArgs["inputs"]) {
    this.inputs = inputs;
    return this;
  }

  setExistingPositions(positions: LockConfigArgs["existingPositions"]) {
    this.existingPositions = positions;
    return this;
  }

  setLockedValues(values: LockConfigArgs["lockedValues"]) {
    this.lockedValues = values;
    return this;
  }

  setDelegation(delegation: LockConfigArgs["delegation"]) {
    this.delegation = delegation;
    return this;
  }

  validate(): void {
    if (!this.inputs?.length) {
      throw new Error(
        "You did not provide any input UTXO's to pull values from. Please set your inputs with .setInputs()"
      );
    }

    if (!this.lockedValues?.length) {
      throw new Error(
        "You did not provide any values to lock. Please set your locked values with .setLockedValues()"
      );
    }

    if (
      this.lockedValues.filter((val) => val! instanceof AssetAmount)?.length > 0
    ) {
      throw new Error(
        "One or more of your locked values is not of type AssetAmount. Please check your lockedValues and try setting them again with .setLockedValues()"
      );
    }

    if (!this?.delegation) {
      throw new Error(
        "You did not provide any delegation. A delegation map is required to supply as a datum to your locked values. Please set your delegation with .setDelegation()"
      );
    }

    if (!this?.ownerAddress) {
      throw new Error(
        "You did not provide an owner's address. An owner's address is required to update delegations or claim rewards. Please set your owner address with .setOwnerAddress()"
      );
    }
  }
}
