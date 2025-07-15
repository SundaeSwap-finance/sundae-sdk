import { Core, Data } from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  NftCheckDatum,
  TCheck,
  TNftCheckDatum,
} from "./ContractTypes/Contract.NftCheck.js";
import { DatumBuilderCondition } from "./DatumBuilder.Condition.class.js";

/**
 * Interface for the arguments required to build a datum for NFT checks.
 */
export interface IDatumBuilderNftCheckArgs {
  value: AssetAmount<IAssetAmountMetadata>[];
  check: TCheck;
}

/**
 * This class extends the DatumBuilderCondition class to build a datum for NFT checks.
 */
export class DatumBuilderNftCheck extends DatumBuilderCondition {
  public buildConditionDatum(args: IDatumBuilderNftCheckArgs): Core.PlutusData {
    const asset_map = new Map<string, Map<string, bigint>>();
    args.value.forEach((asset) => {
      const [policy_id, asset_name] = asset.metadata.assetId.split(".");
      if (!asset_map.has(policy_id)) {
        asset_map.set(policy_id, new Map<string, bigint>());
      }
      const policy = asset_map.get(policy_id);
      if (!policy?.has(asset_name)) {
        policy?.set(asset_name, asset.amount);
      } else {
        const amount = policy.get(asset_name);
        if (amount) {
          policy.set(asset_name, amount + asset.amount);
        }
      }
    });
    const datum: TNftCheckDatum = {
      value: asset_map,
      check: args.check,
    };

    const data = Data.to(datum, NftCheckDatum);

    return data;
  }

  public decodeConditionDatum(datum: Core.PlutusData): TNftCheckDatum {
    const decoded = Data.from(datum, NftCheckDatum);
    return decoded as TNftCheckDatum;
  }
}
