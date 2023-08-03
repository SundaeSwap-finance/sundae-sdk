import { CancelConfigArgs, ITxBuilderReferralFee, UTXO } from "../../@types";
import { OrderConfig } from "../Abstracts/OrderConfig.abstract.class";

/**
 * The main config class for building valid arguments for a Cancel.
 */
export class CancelConfig extends OrderConfig<CancelConfigArgs> {
  referralFee?: ITxBuilderReferralFee | undefined;
  datum?: string;
  datumHash?: string;
  utxo?: UTXO;
  address?: string;

  constructor(args?: CancelConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  setDatum(datum: string) {
    this.datum = datum;
    return this;
  }

  setDatumHash(datumHash: string) {
    this.datumHash = datumHash;
    return this;
  }

  setUTXO(utxo: UTXO) {
    this.utxo = utxo;
    return this;
  }

  setAddress(address: string) {
    this.address = address;
    return this;
  }

  buildArgs(): CancelConfigArgs {
    this.validate();

    return {
      datumHash: this.datumHash as string,
      datum: this.datum as string,
      utxo: this.utxo as UTXO,
      address: this.address as string,
      referralFee: this.referralFee,
    };
  }

  setFromObject({
    datum,
    datumHash,
    utxo,
    address,
    referralFee,
  }: CancelConfigArgs): void {
    this.setDatum(datum);
    this.setDatumHash(datumHash);
    this.setUTXO(utxo);
    this.setAddress(address);
    referralFee && this.setReferralFee(referralFee);
  }

  validate(): never | void {
    if (!this.utxo) {
      throw new Error(
        "You did not add the order's UTXO for this cancellation. Set a valid UTXO with .setUTXO()"
      );
    }

    if (!this.datumHash) {
      throw new Error(
        "You did not add a datumHash for this cancellation. Set a valid datumHash with .setDatumHash()"
      );
    }

    if (!this.datum) {
      throw new Error(
        "You did not add a datum for this cancellation. Set a valid datum with .setDatum()"
      );
    }

    if (!this.address) {
      throw new Error(
        "You did not add a required signer for this cancellation. Set a valid address with .setAddress()"
      );
    }
  }
}
