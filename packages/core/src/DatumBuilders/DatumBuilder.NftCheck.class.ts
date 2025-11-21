import { parse, serialize } from "@blaze-cardano/data";
import { Core } from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { NftCheckTypes } from "./ContractTypes/index.js";
import { DatumBuilderCondition } from "./DatumBuilder.Condition.class.js";

/**
 * Interface for the arguments required to build a datum for NFT checks.
 */
export interface IDatumBuilderNftCheckArgs {
  value: AssetAmount<IAssetAmountMetadata>[];
  check: NftCheckTypes.Check;
}

/**
 * This class extends the DatumBuilderCondition class to build a datum for NFT checks.
 */
export class DatumBuilderNftCheck extends DatumBuilderCondition {
  public buildConditionDatum(args: IDatumBuilderNftCheckArgs): Core.PlutusData {
    // Use Map objects to prevent prototype pollution
    const asset_map: Map<string, Map<string, bigint>> = new Map();
    args.value.forEach((asset) => {
      const [policy_id, asset_name] = asset.metadata.assetId.split(".");
      if (!asset_map.has(policy_id)) {
        asset_map.set(policy_id, new Map());
      }
      const assets_for_policy = asset_map.get(policy_id)!;
      if (!assets_for_policy.has(asset_name)) {
        assets_for_policy.set(asset_name, asset.amount);
      } else {
        assets_for_policy.set(asset_name, assets_for_policy.get(asset_name)! + asset.amount);
      }
    });
    // Convert Map back to plain object for datum construction
    const object_asset_map: { [policy_id: string]: { [assetName: string]: bigint } } = {};
    for (const [policy_id, assets_map] of asset_map.entries()) {
      object_asset_map[policy_id] = Object.fromEntries(assets_map);
    }
    const datum: NftCheckTypes.NftCheckDatum = {
      value: object_asset_map,
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
