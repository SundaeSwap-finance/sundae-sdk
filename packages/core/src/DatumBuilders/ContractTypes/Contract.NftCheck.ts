import { Data, Static } from "@blaze-cardano/sdk";

export const CheckSchema = Data.Enum([
    Data.Literal("All"), 
    Data.Literal("Any")
]);
export type TCheck = Static<typeof CheckSchema>;
export const Check = CheckSchema as unknown as TCheck;

export const NftCheckDatumSchema = Data.Object({
    value: Data.Array(Data.Tuple([Data.Bytes(), Data.Tuple([Data.Bytes(), Data.Integer()])])),
    check: CheckSchema
});
export type TNftCheckDatum = Static<typeof NftCheckDatumSchema>;
export const NftCheckDatum = NftCheckDatumSchema as unknown as TNftCheckDatum;