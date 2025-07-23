import { serialize } from "@blaze-cardano/data";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { sqrt } from "@sundaeswap/bigint-math";
import {
  IFeesConfig,
  TDatumResult,
  TSupportedNetworks,
} from "../@types/index.js";
import { V3Types } from "./ContractTypes/index.js";
import { DatumBuilderV3Like } from "./DatumBuilder.V3Like.class.js";

/**
 * The arguments for building a minting a new pool transaction against
 * the V3 & Condition pool contract.
 */
export interface IDatumBuilderMintV3PoolArgs {
  seedUtxo: { txHash: string; outputIndex: number };
  assetA: AssetAmount<IAssetAmountMetadata>;
  assetB: AssetAmount<IAssetAmountMetadata>;
  fees: IFeesConfig;
  depositFee: bigint;
  marketOpen?: bigint;
  feeManager?: string;
}

/**
 * This class is useful if you would rather just build valid CBOR strings for just the datum
 * portion of a valid SundaeSwap transaction.
 */
export class DatumBuilderV3 extends DatumBuilderV3Like {
  /** The current network id. */
  public network: TSupportedNetworks;
  /** The error to throw when the pool ident does not match V1 constraints. */
  static INVALID_POOL_IDENT =
    "You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order.";

  constructor(network: TSupportedNetworks) {
    super(network);
    this.network = network;
  }

  /**
   * Creates a new pool datum for minting a the pool. This is attached to the assets that are sent
   * to the pool minting contract. See {@link Core.TxBuilderV3} for more details.
   *
   * @param {IDatumBuilderMintPoolV3Args} params The arguments for building a pool mint datum.
   *  - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - fee: The pool fee represented as per thousand.
   *  - marketOpen: The POSIX timestamp for when pool trades should start executing.
   *  - protocolFee: The fee gathered for the protocol treasury.
   *  - seedUtxo: The UTXO to use as the seed, which generates asset names and the pool ident.
   *
   * @returns {TDatumResult<V3Types.TPoolDatum>} An object containing the hash of the inline datum, the inline datum itself,
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
    feeManager,
  }: IDatumBuilderMintV3PoolArgs): TDatumResult<V3Types.PoolDatum> {
    const ident = DatumBuilderV3.computePoolId(seedUtxo);
    const liquidity = sqrt(assetA.amount * assetB.amount);

    const assetsPair = this.buildLexicographicalAssetsDatum(
      assetA,
      assetB,
    ).schema;

    const feeManagerScript = this.getMultiSigFromAddress(feeManager);

    const newPoolDatum: V3Types.PoolDatum = {
      assets: assetsPair,
      circulatingLp: liquidity,
      bidFeesPer_10Thousand: fees.bid,
      askFeesPer_10Thousand: fees.ask,
      feeManager: feeManagerScript,
      identifier: ident,
      marketOpen: marketOpen || 0n,
      protocolFees: depositFee,
    };

    const data = serialize(V3Types.PoolDatum, newPoolDatum);

    return {
      hash: data.hash(),
      inline: data.toCbor(),
      schema: newPoolDatum,
    };
  }
}
