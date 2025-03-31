import { Data, Static } from "@blaze-cardano/sdk";

export const CheckSchema = Data.Enum([
  Data.Literal("All"),
  Data.Literal("Any"),
]);
export type TCheck = Static<typeof CheckSchema>;
export const Check = CheckSchema as unknown as TCheck;

export const NftCheckAssetSchema = Data.Map(Data.Bytes(), Data.Integer());
export type TNftCheckAsset = Static<typeof NftCheckAssetSchema>;
export const NftCheckAsset = NftCheckAssetSchema as unknown as TNftCheckAsset;

export const NftCheckPolicySchema = Data.Map(Data.Bytes(), NftCheckAssetSchema);
export type TNftCheckPolicy = Static<typeof NftCheckPolicySchema>;
export const NftCheckPolicy =
  NftCheckPolicySchema as unknown as TNftCheckPolicy;

export const NftCheckDatumSchema = Data.Nullable(
  Data.Object({
    value: NftCheckPolicySchema,
    check: CheckSchema,
  }),
);
export type TNftCheckDatum = Static<typeof NftCheckDatumSchema>;
export const NftCheckDatum = NftCheckDatumSchema as unknown as TNftCheckDatum;
