import { Data } from "@blaze-cardano/sdk";
import { NftCheckDatum, TCheck, TNftCheckDatum } from "./ContractTypes/Contract.Blaze.NftCheck";
import { DatumBuilderBlazeCondition } from "./DatumBuilder.Blaze.Condition.abstract.class";

export interface IDatumBuilderBlazeNftCheckArgs {
    value: [string, [string, bigint]][],
    check: TCheck
}

export class DatumBuilderBlazeNftCheck extends DatumBuilderBlazeCondition {
    public buildConditionDatum(args: IDatumBuilderBlazeNftCheckArgs): Data {
        const datum: TNftCheckDatum = {
            value: args.value,
            check: args.check
        };

        const data = Data.to(datum, NftCheckDatum);

        return data.toCbor();
    }
}