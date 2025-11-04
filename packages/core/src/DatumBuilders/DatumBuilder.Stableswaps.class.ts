import { parse, serialize } from "@blaze-cardano/data";
import { TDatumResult } from "../@types/datumbuilder.js";
import { StableswapsTypes } from "./ContractTypes/index.js";
import {
  DatumBuilderV3,
  IDatumBuilderMintPoolArgs,
} from "./DatumBuilder.V3.class.js";
import { IFeesConfig } from "../@types/configs.js";
import { StableSwapsPool } from "@sundaeswap/math";
import { Core } from "@blaze-cardano/sdk";

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

    const liquidity = sumInvariant / StableSwapsPool.reservePrecision;

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

  public protocolFeesFromSettingsDatum(settingsDatum: string): IFeesConfig {
    const parsedDatum = parse(
      StableswapsTypes.SettingsDatum,
      Core.PlutusData.fromCbor(Core.HexBlob(settingsDatum)),
    );

    const protocolExtension = parsedDatum.extensions[0];
    if (!protocolExtension) {
      throw new Error("No protocol extension found in settings datum");
    }
    const protocolFees = parse(
      StableswapsTypes.ProtocolFeeBasisPointsExtension,
      protocolExtension,
    );
    if (!protocolFees) {
      throw new Error("Could not parse protocol fees in settings datum");
    }
    return {
      bid: protocolFees.protocol_fee_basis_points[0],
      ask: protocolFees.protocol_fee_basis_points[1],
    };
  }
}
