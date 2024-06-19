import { Data, Lucid, Utils } from "lucid-cardano";
import {
  ISerializationLibraryResponse,
  SerializationLibrary,
} from "../../abstracts/SerializationLibrary.abstract.class";
import { Swap, TSwap } from "./contracts/contracts.v3";

export class SerializationLucidV3 implements SerializationLibrary {
  utils: Utils;

  constructor() {
    this.utils = new Utils(new Lucid());
  }

  decodeSwapDatum(datum: string): TSwap {
    return Data.from(datum, Swap);
  }

  encodeSwapDatum(data: TSwap): ISerializationLibraryResponse {
    const datum = Data.to(data, Swap);
    return {
      cbor: datum,
      hash: this.utils.datumToHash(datum),
    };
  }
}
