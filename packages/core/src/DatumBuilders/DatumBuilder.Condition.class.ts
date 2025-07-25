import { parse, serialize } from "@blaze-cardano/data";
import { Core } from "@blaze-cardano/sdk";
import { sqrt } from "@sundaeswap/bigint-math";
import { TDatumResult } from "../@types/datumbuilder.js";
import { DatumBuilderAbstractCondition } from "../Abstracts/DatumBuilderCondition.abstract.class.js";
import { VOID_BYTES } from "../constants.js";
import * as ConditionTypes from "./ContractTypes/Contract.Condition.js";
import {
  DatumBuilderV3,
  IDatumBuilderMintPoolArgs,
} from "./DatumBuilder.V3.class.js";

export class DatumBuilderCondition
  extends DatumBuilderV3
  implements DatumBuilderAbstractCondition
{
  /** The error to throw when the pool ident does not match V1 constraints. */
  static INVALID_POOL_IDENT =
    "You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order.";

  public buildConditionDatum(_args: unknown): Core.PlutusData {
    return VOID_BYTES;
  }

  /**
   * Creates a new pool datum for minting a the pool. This is attached to the assets that are sent
   * to the pool minting contract. See {@link Core.TxBuilderV3} for more details.
   *
   * @param {IDatumBuilderMintPoolArgs} params The arguments for building a pool mint datum.
   *  - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - fee: The pool fee represented as per thousand.
   *  - marketOpen: The POSIX timestamp for when pool trades should start executing.
   *  - protocolFee: The fee gathered for the protocol treasury.
   *  - seedUtxo: The UTXO to use as the seed, which generates asset names and the pool ident.
   *
   * @returns {TDatumResult<TConditionPoolDatum>} An object containing the hash of the inline datum, the inline datum itself,
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
    conditionDatumArgs,
  }: IDatumBuilderMintPoolArgs): TDatumResult<ConditionTypes.ConditionPoolDatum> {
    const ident = DatumBuilderCondition.computePoolId(seedUtxo);
    const liquidity = sqrt(assetA.amount * assetB.amount);

    const assetsPair = this.buildLexicographicalAssetsDatum(
      assetA,
      assetB,
    ).schema;

    const newPoolDatum: ConditionTypes.ConditionPoolDatum = {
      assets: assetsPair,
      circulatingLp: liquidity,
      bidFeesPer_10Thousand: fees.bid,
      askFeesPer_10Thousand: fees.ask,
      feeManager: undefined,
      identifier: ident,
      marketOpen: marketOpen || 0n,
      protocolFees: depositFee,
      condition: condition || undefined,
      conditionDatum: conditionDatumArgs
        ? this.buildConditionDatum(conditionDatumArgs)
        : undefined,
    };

    const data = serialize(ConditionTypes.ConditionPoolDatum, newPoolDatum);

    return { hash: data.hash(), inline: data.toCbor(), schema: newPoolDatum };
  }

  public decodeDatum(
    datum: Core.PlutusData,
  ): ConditionTypes.ConditionPoolDatum {
    const decoded = parse(ConditionTypes.ConditionPoolDatum, datum);
    return decoded;
  }
}
