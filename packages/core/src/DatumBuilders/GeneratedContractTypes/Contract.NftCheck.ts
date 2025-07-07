import { Exact, Type } from "@blaze-cardano/data";

const Contracts = Type.Module({
  Check: Type.Union([
    Type.Literal("All", { ctor: 0n }),
    Type.Literal("Any", { ctor: 1n }),
  ]),
  NftCheckAsset: Type.Record(
    Type.String(),
    Type.BigInt(),
  ),
  NftCheckPolicy: Type.Record(
    Type.String(),
    Type.Ref("NftCheckAsset"),
  ),
  NftCheckDatum: Type.Optional(
    Type.Object({
      value: Type.Ref("NftCheckPolicy"),
      check: Type.Ref("Check"),
    }, { ctor: 0n }),
  ),
});

export const Check = Contracts.Import("Check");
export type Check = Exact<typeof Check>;
export const NftCheckDatum = Contracts.Import("NftCheckDatum");
export type NftCheckDatum = Exact<typeof NftCheckDatum>;
