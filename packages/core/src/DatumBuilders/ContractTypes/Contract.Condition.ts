import { Data, Static } from "@blaze-cardano/sdk";
import { AssetClassPairSchema, IdentSchema, MultiSigScriptSchema } from "./Contract.v3";

export const PoolDatumSchema = Data.Object({
    identifier: IdentSchema,
    assets: AssetClassPairSchema,
    circulatingLp: Data.Integer(),
    bidFeePer10Thousand: Data.Integer(),
    askFeePer10Thousand: Data.Integer(),
    feeManager: Data.Nullable(MultiSigScriptSchema),
    marketOpen: Data.Integer(),
    protocolFee: Data.Integer(),
    condition: Data.Nullable(Data.Bytes()),
    conditionDatum: Data.Nullable(Data.Any())
  });
  export type TPoolDatum = Static<typeof PoolDatumSchema>;
  export const PoolDatum = PoolDatumSchema as unknown as TPoolDatum;