import { EDatumType, IComposedTx } from "src/@types";

export abstract class TxBuilderAbstract {
  abstract getOrderAddress(address: string): Promise<string>;
  abstract getMaxScooperFeeAmount(): Promise<bigint>;
  abstract swap(args: unknown): Promise<IComposedTx>;
  abstract getDatumType(): EDatumType;
}
