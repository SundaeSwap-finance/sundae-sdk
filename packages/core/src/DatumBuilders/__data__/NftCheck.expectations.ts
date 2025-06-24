import { AssetAmount } from "@sundaeswap/asset";
import { PREVIEW_DATA } from "../../TestUtilities/mockData";
import { IDatumBuilderNftCheckArgs } from "../DatumBuilder.NftCheck.class";

export const NFTCHECK_EXPECTATIONS = {
  buildConditionDatum: [
    {
      args: {
        value: [new AssetAmount(1n, PREVIEW_DATA.assets.tindy.metadata)],
        check: "All",
      } as IDatumBuilderNftCheckArgs,
      expectations: {
        cbor: "d8799fd8799fa1581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e445901d87980ffff",
      },
    },
  ],
};
