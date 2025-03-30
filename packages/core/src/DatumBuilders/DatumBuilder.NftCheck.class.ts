import { Core, Data } from "@blaze-cardano/sdk";
import {
  NftCheckDatum,
  TCheck,
  TNftCheckDatum,
} from "./ContractTypes/Contract.NftCheck";
import { DatumBuilderCondition } from "./DatumBuilder.Condition.abstract.class";

export interface IDatumBuilderNftCheckArgs {
  value: [string, [string, bigint]][];
  check: TCheck;
}

export class DatumBuilderNftCheck extends DatumBuilderCondition {
  public buildConditionDatum(args: IDatumBuilderNftCheckArgs): Core.PlutusData {
    const datum: TNftCheckDatum = {
      value: args.value,
      check: args.check,
    };

    const data = Data.to(datum, NftCheckDatum);

    return data;
  }
}
