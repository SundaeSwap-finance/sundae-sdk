import { AssetAmount } from "@sundaeswap/asset";
import { PREVIEW_DATA } from "../../TestUtilities/mockData.js";
import { IDatumBuilderNftCheckArgs } from "../DatumBuilder.NftCheck.class.js";

export const NFTCHECK_EXPECTATIONS = {
  buildConditionDatum: [
    {
      args: {
        value: [new AssetAmount(1n, PREVIEW_DATA.assets.tindy.metadata)],
        check: "All",
      } as IDatumBuilderNftCheckArgs,
      expectations: {
        cbor: "d8799fa1581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e445901d87980ff",
      },
    },
    {
      args: {
        value: [new AssetAmount(1n, PREVIEW_DATA.assets.tindy.metadata)],
        check: "Any",
      } as IDatumBuilderNftCheckArgs,
      expectations: {
        cbor: "d8799fa1581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e445901d87a80ff",
      },
    },
    {
      args: {
        value: [
          new AssetAmount(1n, PREVIEW_DATA.assets.tindy.metadata),
          new AssetAmount(1n, PREVIEW_DATA.assets.usdc.metadata),
        ],
        check: "All",
      } as IDatumBuilderNftCheckArgs,
      expectations: {
        cbor: "d8799fa2581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e445901581c99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15a1445553444301d87980ff",
      },
    },
    {
      args: {
        value: [
          new AssetAmount(1n, PREVIEW_DATA.assets.tindy.metadata),
          new AssetAmount(1n, PREVIEW_DATA.assets.usdc.metadata),
        ],
        check: "Any",
      } as IDatumBuilderNftCheckArgs,
      expectations: {
        cbor: "d8799fa2581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e445901581c99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15a1445553444301d87a80ff",
      },
    },
  ],
};
