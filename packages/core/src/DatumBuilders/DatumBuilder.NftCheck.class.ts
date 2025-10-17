import { parse, serialize } from "@blaze-cardano/data";
import { Core } from "@blaze-cardano/sdk";
import { IBaseDatumBuilderNftCheckArgs } from "../@types/datumbuilder.js";
import { NftCheckTypes } from "./ContractTypes/index.js";
import { DatumBuilderCondition } from "./DatumBuilder.Condition.class.js";

/**
 * Interface for the arguments required to build a datum for NFT checks.
 * Extends the base interface with the specific Check type.
 */
export interface IDatumBuilderNftCheckArgs
  extends IBaseDatumBuilderNftCheckArgs {
  check: NftCheckTypes.Check;
}

/**
 * This class extends the DatumBuilderCondition class to build a datum for NFT checks.
 */
export class DatumBuilderNftCheck extends DatumBuilderCondition {
  public buildConditionDatum(args: IDatumBuilderNftCheckArgs): Core.PlutusData {
    const asset_map: { [policy_id: string]: { [assetName: string]: bigint } } =
      {};
    args.value.forEach((asset) => {
      const [policy_id, asset_name] = asset.metadata.assetId.split(".");
      if (!(policy_id in asset_map)) {
        asset_map[policy_id] = {};
      }
      if (!(asset_name in asset_map[policy_id])) {
        asset_map[policy_id][asset_name] = asset.amount;
      } else {
        asset_map[policy_id][asset_name] += asset.amount;
      }
    });
    const datum: NftCheckTypes.NftCheckDatum = {
      value: asset_map,
      check: args.check,
    };

    const data = serialize(NftCheckTypes.NftCheckDatum, datum);

    return data;
  }

  public decodeConditionDatum(
    datum: Core.PlutusData | string,
  ): NftCheckTypes.NftCheckDatum {
    if (typeof datum === "string") {
      datum = Core.PlutusData.fromCbor(Core.HexBlob(datum));
    }
    return parse(NftCheckTypes.NftCheckDatum, datum);
  }
}
