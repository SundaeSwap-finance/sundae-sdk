import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { SwapConfig } from "../configs/SwapConfig";
import { SerializationLibrary } from "./SerializationLibrary.abstract.class";

export interface IDatum {
  cbor: string;
  hash: string;
}

export interface ITask {
  _id: string;
  datum: IDatum;
  payment: Record<string, bigint>;
}

export interface ICompleteTx {
  datums: IDatum[];
  fees: Record<string, AssetAmount<IAssetAmountMetadata>>;
}

export abstract class Builder {
  abstract tasks: ITask[];
  abstract serializationLibrary: SerializationLibrary;
  abstract txUnsigned?: string;
  abstract txSigned?: string;

  abstract swap(config: SwapConfig | ((prevDatum: any) => SwapConfig)): Builder;

  public getTasks(): ITask[] {
    return this.tasks;
  }
}
