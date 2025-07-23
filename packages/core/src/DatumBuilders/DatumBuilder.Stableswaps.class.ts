import { serialize } from "@blaze-cardano/data";
import { sqrt } from "@sundaeswap/bigint-math";
import { IFeesConfig } from "../@types/configs.js";
import { TDatumResult } from "../@types/datumbuilder.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import { StableswapsTypes } from "./ContractTypes/index.js";
import { IDatumBuilderMintV3PoolArgs } from "./DatumBuilder.V3.class.js";
import { DatumBuilderV3Like } from "./DatumBuilder.V3Like.class.js";

export interface IDatumBuilderMintStablePoolArgs
  extends IDatumBuilderMintV3PoolArgs {
  protocolFees: IFeesConfig;
  linearAmplification: bigint;
  linearAmplificationManager?: string;
}

export class DatumBuilderStableswaps extends DatumBuilderV3Like {
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
    const ident = DatumBuilderV3Like.computePoolId(seedUtxo);
    const liquidity = sqrt(assetA.amount * assetB.amount);

    const assetsPair = this.buildLexicographicalAssetsDatum(
      assetA,
      assetB,
    ).schema;

    const feeManagerScript = this.getMultiSigFromAddress(feeManager);

    const linearAmplificationScript = this.getMultiSigFromAddress(
      linearAmplificationManager,
    );

    const sumInvariant = SundaeUtils.getSumInvariant(
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
