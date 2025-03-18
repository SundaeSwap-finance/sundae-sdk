import { Data } from "@blaze-cardano/sdk";
import { sqrt } from "@sundaeswap/bigint-math";
import { TDatumResult, TSupportedNetworks } from "src/@types";
import { PoolDatum, TPoolDatum } from "./ContractTypes/Contract.Condition";
import { DatumBuilderV3, IDatumBuilderMintPoolV3Args } from "./DatumBuilder.V3.class";

export interface IDatumBuilderMintPoolConditionArgs extends IDatumBuilderMintPoolV3Args {
    condition?: string,
    conditionDatumArgs?: any
}

export abstract class DatumBuilderCondition extends DatumBuilderV3 {
    constructor(network: TSupportedNetworks) {
        super(network);
    }

    abstract buildConditionDatum(args: any): Data;

    /**
       * Creates a new pool datum for minting a the pool. This is attached to the assets that are sent
       * to the pool minting contract. See {@link Blaze.TxBuilderBlazeV3} for more details.
       *
       * @param {IDatumBuilderMintPoolConditionArgs} params The arguments for building a pool mint datum.
       *  - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
       *  - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
       *  - fee: The pool fee represented as per thousand.
       *  - marketOpen: The POSIX timestamp for when pool trades should start executing.
       *  - protocolFee: The fee gathered for the protocol treasury.
       *  - seedUtxo: The UTXO to use as the seed, which generates asset names and the pool ident.
       *
       * @returns {TDatumResult<TPoolDatum>} An object containing the hash of the inline datum, the inline datum itself,
       *                                              and the schema of the original pool mint datum, crucial for the execution
       *                                              of the minting pool operation.
       */
      public buildMintPoolDatum({
        assetA,
        assetB,
        fees,
        marketOpen,
        depositFee,
        seedUtxo,
        condition,
        conditionDatumArgs
      }: IDatumBuilderMintPoolConditionArgs): TDatumResult<TPoolDatum> {
        const ident = DatumBuilderCondition.computePoolId(seedUtxo);
        const liquidity = sqrt(assetA.amount * assetB.amount);
    
        const assetsPair = this.buildLexicographicalAssetsDatum(
          assetA,
          assetB,
        ).schema;
    
        const newPoolDatum: TPoolDatum = {
          assets: assetsPair,
          circulatingLp: liquidity,
          bidFeePer10Thousand: fees.bid,
          askFeePer10Thousand: fees.ask,
          feeManager: null,
          identifier: ident,
          marketOpen: marketOpen || 0n,
          protocolFee: depositFee,
          condition: condition || null,
          conditionDatum: this.buildConditionDatum(conditionDatumArgs),
        };
    
        const data = Data.to(newPoolDatum, PoolDatum);
    
        return {
          hash: data.hash(),
          inline: data.toCbor(),
          schema: newPoolDatum,
        };
      }

}