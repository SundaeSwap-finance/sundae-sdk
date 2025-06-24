import { Core, Data } from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { sqrt } from "@sundaeswap/bigint-math";
import { IFeesConfig } from "../@types/configs.js";
import { TDatumResult, TDestinationAddress } from "../@types/datumbuilder.js";
import { DatumBuilderAbstractCondition } from "../Abstracts/DatumBuilderCondition.abstract.class.js";
import * as ConditionTypes from "./ContractTypes/Contract.Condition.js";
import { IDatumBuilderNftCheckArgs } from "./DatumBuilder.NftCheck.class.js";
import { DatumBuilderV3 } from "./DatumBuilder.V3.class.js";

/**
 * The base arguments for the Condition DatumBuilder.
 */
export interface IDatumBuilderBaseConditionArgs {
  destinationAddress: TDestinationAddress;
  ident: string;
  ownerAddress?: string;
  scooperFee: bigint;
}

/**
 * The arguments from building a swap transaction against
 * a Condition pool contract.
 */
export interface IDatumBuilderSwapConditionArgs
  extends IDatumBuilderBaseConditionArgs {
  order: {
    minReceived: AssetAmount<IAssetAmountMetadata>;
    offered: AssetAmount<IAssetAmountMetadata>;
  };
}

/**
 * The arguments from building a withdraw transaction against
 * a Condition pool contract.
 */
export interface IDatumBuilderDepositConditionArgs
  extends IDatumBuilderBaseConditionArgs {
  order: {
    assetA: AssetAmount<IAssetAmountMetadata>;
    assetB: AssetAmount<IAssetAmountMetadata>;
  };
}

/**
 * The arguments for building a withdraw transaction against
 * a Condition pool contract.
 */
export interface IDatumBuilderWithdrawConditionArgs
  extends IDatumBuilderBaseConditionArgs {
  order: {
    lpToken: AssetAmount<IAssetAmountMetadata>;
  };
}

/**
 * A union type representing the potential arguments for building a Condition datum.
 */
export type TConditionDatumArgs = IDatumBuilderNftCheckArgs;

/**
 * The arguments for building a minting a new pool transaction against
 * the Condition pool contract.
 */
export interface IDatumBuilderMintPoolConditionArgs {
  seedUtxo: { txHash: string; outputIndex: number };
  assetA: AssetAmount<IAssetAmountMetadata>;
  assetB: AssetAmount<IAssetAmountMetadata>;
  fees: IFeesConfig;
  depositFee: bigint;
  marketOpen?: bigint;
  feeManager?: string;
  condition?: string;
  conditionDatumArgs?: TConditionDatumArgs;
}

/**
 * The arguments for building a minting a new pool transaction against
 * the Condition pool contract, specifically to be associated with the
 * newly minted assets, such as liquidity tokens.
 */
export interface IDatumBuilderPoolMintRedeemerConditionArgs {
  assetB: AssetAmount<IAssetAmountMetadata>;
  assetA: AssetAmount<IAssetAmountMetadata>;
  poolOutput: bigint;
  metadataOutput: bigint;
}

export class DatumBuilderCondition
  extends DatumBuilderV3
  implements DatumBuilderAbstractCondition
{
  /** The error to throw when the pool ident does not match V1 constraints. */
  static INVALID_POOL_IDENT =
    "You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order.";

  public buildConditionDatum(_args: unknown): Core.PlutusData {
    return Data.void();
  }

  /**
   * Creates a new pool datum for minting a the pool. This is attached to the assets that are sent
   * to the pool minting contract. See {@link Blaze.TxBuilderBlazeCondition} for more details.
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
    conditionDatumArgs,
  }: IDatumBuilderMintPoolConditionArgs): TDatumResult<ConditionTypes.TPoolDatum> {
    const ident = DatumBuilderCondition.computePoolId(seedUtxo);
    const liquidity = sqrt(assetA.amount * assetB.amount);

    const assetsPair = this.buildLexicographicalAssetsDatum(
      assetA,
      assetB,
    ).schema;

    const newPoolDatum: ConditionTypes.TPoolDatum = {
      assets: assetsPair,
      circulatingLp: liquidity,
      bidFeePer10Thousand: fees.bid,
      askFeePer10Thousand: fees.ask,
      feeManager: null,
      identifier: ident,
      marketOpen: marketOpen || 0n,
      protocolFee: depositFee,
      condition: condition || null,
      conditionDatum: this.buildConditionDatum(conditionDatumArgs) || null,
    };

    const data = Data.to(newPoolDatum, ConditionTypes.PoolDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: newPoolDatum,
    };
  }

  public decodeDatum(datum: Core.PlutusData): ConditionTypes.TPoolDatum {
    const decoded = Data.from(datum, ConditionTypes.PoolDatum);
    return decoded;
  }
}
