import { Blaze, Provider, Wallet } from "@blaze-cardano/sdk";
import { TDatumResult } from "src/@types";
import { TPoolDatum } from "src/DatumBuilders/ContractTypes/Contract.Condition";
import { IDatumBuilderMintPoolConditionArgs } from "src/DatumBuilders/DatumBuilder.Condition.abstract.class";
import { DatumBuilderNftCheck } from "src/DatumBuilders/DatumBuilder.NftCheck.class";
import { QueryProviderSundaeSwap } from "src/QueryProviders";
import { TxBuilderCondition } from "./TxBuilder.Condition.abstract.class";

export class TxBuilderNftCheck extends TxBuilderCondition {
    datumBuilder: DatumBuilderNftCheck;

    constructor(
        public blaze: Blaze<Provider, Wallet>,
        queryProvider?: QueryProviderSundaeSwap) {
        super(blaze, queryProvider);
        this.datumBuilder = new DatumBuilderNftCheck(this.network);
    }
    
    public buildMintPoolDatum({ assetA, assetB, fees, marketOpen, depositFee, seedUtxo, condition, conditionDatumArgs }: IDatumBuilderMintPoolConditionArgs): TDatumResult<TPoolDatum> {
        return this.datumBuilder.buildMintPoolDatum({ assetA, assetB, fees, marketOpen, depositFee, seedUtxo, condition, conditionDatumArgs });
    }
    
}