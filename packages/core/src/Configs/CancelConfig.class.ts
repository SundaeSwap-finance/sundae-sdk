import { ICancelConfigArgs, TUTXO } from "../@types/index.js";
import { OrderConfig } from "../Abstracts/OrderConfig.abstract.class.js";

/**
 * The main config class for building valid arguments for a Cancel.
 */
export class CancelConfig extends OrderConfig<ICancelConfigArgs> {
  ownerAddress?: string;
  utxo?: TUTXO;

  constructor(args?: ICancelConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  setUTXO(utxo: TUTXO) {
    this.utxo = utxo;
    return this;
  }

  setOwnerAddress(address: string) {
    this.ownerAddress = address;
  }

  buildArgs(): ICancelConfigArgs {
    this.validate();

    return {
      ownerAddress: this.ownerAddress as string,
      utxo: this.utxo as TUTXO,
      referralFee: this.referralFee,
    };
  }

  setFromObject({ utxo, ownerAddress, referralFee }: ICancelConfigArgs): void {
    this.setUTXO(utxo);
    ownerAddress && this.setOwnerAddress(ownerAddress);
    referralFee && this.setReferralFee(referralFee);
  }

  validate(): never | void {
    if (!this.utxo) {
      throw new Error(
        "You did not add the order's UTXO for this cancellation. Set a valid UTXO with .setUTXO()",
      );
    }
  }
}
