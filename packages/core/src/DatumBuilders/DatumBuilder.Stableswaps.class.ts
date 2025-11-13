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

/**
 * Arguments interface for minting a Stableswaps pool, extending the base V3 pool minting arguments
 * with Stableswaps-specific parameters.
 *
 * @extends {IDatumBuilderMintPoolArgs}
 */
export interface IDatumBuilderMintStablePoolArgs
  extends IDatumBuilderMintPoolArgs {
  /**
   * Protocol fee configuration for the Stableswaps pool, including bid and ask fees.
   */
  protocolFees: IFeesConfig;

  /**
   * The linear amplification factor that determines the curve characteristics of the Stableswaps pool.
   * Higher values make the pool behave more like a constant sum pool (better for stable pairs),
   * while lower values make it behave more like a constant product pool.
   */
  linearAmplification: bigint;
}

/**
 * `DatumBuilderStableswaps` is a specialized datum builder class for constructing and parsing
 * datums specific to the Stableswaps protocol. It extends `DatumBuilderV3` and provides methods
 * for building pool datums with Stableswaps-specific parameters such as linear amplification factors
 * and protocol fees.
 *
 * The Stableswaps protocol uses a different automated market maker (AMM) curve optimized for
 * trading assets with similar values, requiring additional parameters compared to standard V3 pools.
 *
 * @extends {DatumBuilderV3}
 */
export class DatumBuilderStableswaps extends DatumBuilderV3 {
  /**
   * Builds the datum required for minting a new Stableswaps liquidity pool.
   * This method constructs the complete pool datum including assets, fees, amplification factors,
   * and calculates the initial invariant and liquidity based on the Stableswaps curve formula.
   *
   * The method performs the following key operations:
   * - Computes a unique pool identifier from the seed UTXO
   * - Orders assets lexicographically
   * - Extracts multisig scripts from manager addresses
   * - Calculates the sum invariant using the Stableswaps formula
   * - Determines initial liquidity based on the invariant
   *
   * @param {IDatumBuilderMintStablePoolArgs} params The arguments for building a Stableswaps pool mint datum.
   *  - assetA: The first asset in the pool with its amount and metadata.
   *  - assetB: The second asset in the pool with its amount and metadata.
   *  - fees: The LP fee configuration (bid/ask).
   *  - marketOpen: Optional timestamp when the market opens (0 for immediate).
   *  - seedUtxo: The UTXO used to generate the unique pool identifier.
   *  - feeManager: Address of the fee manager who can update pool fees.
   *  - depositFee: The deposit fee for the pool.
   *  - protocolFees: The protocol fee configuration (bid/ask).
   *  - linearAmplification: The amplification factor for the Stableswaps curve.
   *  - linearAmplificationManager: Address of the manager who can update the amplification factor.
   *
   * @returns {TDatumResult<StableswapsTypes.StablePoolDatum>} An object containing the datum hash, inline CBOR representation,
   *                                              and the schema of the original Stableswaps pool mint datum.
   */
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

    const liquidity = sumInvariant / StableSwapsPool.RESERVE_PRECISION;

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

  /**
   * Extracts the protocol fees from a Stableswaps settings datum.
   * This method parses the settings datum CBOR to retrieve the protocol fee basis points
   * configured for the Stableswaps protocol.
   *
   * The settings datum contains protocol extensions, and this method specifically looks for
   * the protocol fee extension to extract the bid and ask fee basis points.
   *
   * @param {string} settingsDatum - The CBOR-encoded settings datum string from the settings UTXO.
   * @returns {IFeesConfig} The protocol fees configuration containing bid and ask fee basis points.
   * @throws {Error} If no protocol extension is found in the settings datum.
   * @throws {Error} If the protocol fees cannot be parsed from the settings datum.
   */
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
