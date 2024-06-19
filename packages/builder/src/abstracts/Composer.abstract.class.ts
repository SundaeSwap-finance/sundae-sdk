import { ITask } from "./Builder.abstract.class";

export abstract class Composer {
  abstract finalDestinationAddress: string;

  tasks: ITask[] = [];
  txUnsigned?: string;
  txSigned?: string;

  abstract complete(): Promise<Composer>;
  abstract sign(): Promise<Composer>;
  abstract submit(): Promise<string>;

  protected __checkSign() {
    if (!this.txUnsigned) {
      throw new Error(
        "Attempted to sign a transaction before it was ready. Call .complete() and try again.",
      );
    }
  }

  protected __checkSubmit() {
    if (!this.txSigned) {
      throw new Error(
        "Attempted to submit a transaction before it was signed. Call .sign() and try again.",
      );
    }
  }
}
