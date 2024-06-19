export interface ISerializationLibraryResponse {
  cbor: string;
  hash: string;
}

export abstract class SerializationLibrary {
  abstract encodeSwapDatum: (args: any) => ISerializationLibraryResponse;
  abstract decodeSwapDatum: (datum: string) => any;
}
