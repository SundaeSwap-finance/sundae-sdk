import { AssetAmount } from "@sundaeswap/asset";

import { ITxBuilderReferralFee } from "../@types/index.js";

/**
 * The Config class represents a base configuration for all SDK methods.
 * It is meant to be extended by more specific configuration classes.
 * @template Args The type of the arguments object, defaulting to an empty object.
 */
export abstract class Config<Args = {}> {
  INVALID_FEE_AMOUNT = `The fee amount must be of type AssetAmount.`;

  /**
   * An optional argument that contains referral fee data.
   */
  public referralFee?: ITxBuilderReferralFee;

  /**
   * An abstract method to set the configuration from an object.
   * Implementations should take an object and use it to set their own properties.
   * @abstract
   * @param {Object} obj - The object from which to set the configuration.
   */
  abstract setFromObject(obj: {}): void;

  /**
   * An abstract method to build the arguments for the configuration.
   * Implementations should take an object of arguments and return a potentially modified version of it.
   * @abstract
   * @throws {Error} If validation fails.
   * @returns {Args} The potentially modified arguments.
   */
  abstract buildArgs(): Args | never;

  /**
   * An inherited method that allows a config to add an optional referral fee.
   *
   * @param {ITxBuilderReferralFee} fee The desired fee.
   */
  setReferralFee(fee: ITxBuilderReferralFee): void {
    this.referralFee = fee;
  }

  /**
   * A method to validate the current configuration.
   * Implementations should check their properties and throw errors if they are invalid.
   * @throws {Error} If the configuration is invalid.
   */
  validate() {
    if (!this.referralFee) {
      return;
    }

    if (!(this.referralFee.payment instanceof AssetAmount)) {
      throw new Error(this.INVALID_FEE_AMOUNT);
    }
  }
}
