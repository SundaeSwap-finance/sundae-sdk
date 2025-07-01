import { Data, Static } from "@blaze-cardano/sdk";
import {
  AssetClassPairSchema,
  IdentSchema,
  MultiSigScriptSchema,
} from "./Contract.v3.js";

export const ConditionPoolDatumSchema = Data.Object({
  identifier: IdentSchema,
  assets: AssetClassPairSchema,
  circulatingLp: Data.Integer(),
  bidFeePer10Thousand: Data.Integer(),
  askFeePer10Thousand: Data.Integer(),
  feeManager: Data.Nullable(MultiSigScriptSchema),
  marketOpen: Data.Integer(),
  protocolFee: Data.Integer(),
  condition: Data.Nullable(Data.Bytes()),
  conditionDatum: Data.Nullable(Data.Any()),
});
export type TConditionPoolDatum = Static<typeof ConditionPoolDatumSchema>;
export const ConditionPoolDatum =
  ConditionPoolDatumSchema as unknown as TConditionPoolDatum;
