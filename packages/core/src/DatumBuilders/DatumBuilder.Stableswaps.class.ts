import { serialize } from "@blaze-cardano/data";
import { sqrt } from "@sundaeswap/bigint-math";
import { TDatumResult } from "../@types/datumbuilder.js";
import { StableswapsTypes } from "./ContractTypes/index.js";
import {
  DatumBuilderV3,
  IDatumBuilderMintPoolArgs,
} from "./DatumBuilder.V3.class.js";
import { IFeesConfig } from "../@types/configs.js";
import { StableSwapsPool } from "@sundaeswap/math";

export interface IDatumBuilderMintStablePoolArgs
  extends IDatumBuilderMintPoolArgs {
  protocolFees: IFeesConfig;
  linearAmplification: bigint;
}

export class DatumBuilderStableswaps extends DatumBuilderV3 {
  public buildMintPoolDatum({
    assetA,
    assetB,
    fees,
    marketOpen,
    seedUtxo,
    feeManager,
    depositFee,
    protocolFees,
    linearAmplification,
    linearAmplificationManager,
  }: IDatumBuilderMintStablePoolArgs): TDatumResult<StableswapsTypes.StablePoolDatum> {
    const ident = DatumBuilderV3.computePoolId(seedUtxo);
    const liquidity = sqrt(assetA.amount * assetB.amount);

    const assetsPair = this.buildLexicographicalAssetsDatum(
      assetA,
      assetB,
    ).schema;

    const feeManagerScript = this.getMultiSigFromAddress(feeManager);

    const linearAmplificationScript = this.getMultiSigFromAddress(
      linearAmplificationManager,
    );

    const sumInvariant = StableSwapsPool.getSumInvariant(
      linearAmplification,
      assetA.amount,
      assetB.amount,
    );

    const newPoolDatum: StableswapsTypes.StablePoolDatum = {
      assets: assetsPair,
      circulatingLp: liquidity,
      lpFeeBasisPoints: [fees.bid, fees.ask],
      protocolFeeBasisPoints: [protocolFees.bid, protocolFees.ask],
      feeManager: feeManagerScript,
      identifier: ident,
      marketOpen: marketOpen || 0n,
      protocolFees: [depositFee, 0n, 0n],
      linearAmplification,
      linearAmplificationManager: linearAmplificationScript,
      sumInvariant,
    };

    const data = serialize(StableswapsTypes.StablePoolDatum, newPoolDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: newPoolDatum,
    };
  }
}
