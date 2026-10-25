import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import type { Blaze, Provider, Wallet } from "@blaze-cardano/sdk";

import type {
  IChainLegV4,
  IPoolData,
  ITxBuilderReferralFee,
  TChainLeg,
} from "../@types/index.js";
import { EContractVersion } from "../@types/index.js";
import { EDatumType, TDestinationAddress } from "../@types/datumbuilder.js";
import type { QueryProvider } from "../Abstracts/QueryProvider.abstract.class.js";
import { SwapConfig } from "../Configs/SwapConfig.class.js";
import { SundaeUtils } from "./SundaeUtils.class.js";

/**
 * A chained swap places ONE order whose payout destination is the NEXT order's
 * script address, carrying that next order's datum. The scooper fills leg N,
 * and its output lands as a live leg N+1 order. Legs therefore execute in
 * separate scoops — a chain is sequential, not atomic.
 *
 * The exception is a v4 leg. A v4 order is a pool-agnostic intent (offered +
 * minReceived) that the scooper routes and splits across any number of v4
 * pools inside ONE scoop. So an arbitrarily long v4 tail collapses into a
 * single chain leg, and the only sequential seam in a v3 -> v4 route is the
 * crossing itself.
 */

/** True when this leg is a v4 intent rather than a swap against one pool. */
export const isChainLegV4 = (leg: TChainLeg): leg is IChainLegV4 =>
  (leg as IChainLegV4).contractVersion === EContractVersion.V4;

/** The contract version a leg's order belongs to. */
export const chainLegVersion = (leg: TChainLeg): EContractVersion =>
  isChainLegV4(leg) ? EContractVersion.V4 : leg.pool.version;

/**
 * What a legacy leg is guaranteed to deliver: its pool's OTHER asset, at the
 * leg's minimum receivable. This is what the next leg can be offered, since a
 * chain's datums are fixed before any leg fills.
 */
export const legacyLegMinOutput = (
  pool: IPoolData,
  suppliedAsset: AssetAmount<IAssetAmountMetadata>,
  minReceivable: AssetAmount<IAssetAmountMetadata>,
): AssetAmount<IAssetAmountMetadata> => {
  const [aReserve, bReserve] = SundaeUtils.sortSwapAssetsWithAmounts([
    new AssetAmount(pool.liquidity.aReserve, pool.assetA),
    new AssetAmount(pool.liquidity.bReserve, pool.assetB),
  ]);
  return SundaeUtils.isAssetIdsEqual(
    suppliedAsset.metadata.assetId,
    aReserve.metadata.assetId,
  )
    ? bReserve.withAmount(minReceivable.amount)
    : aReserve.withAmount(minReceivable.amount);
};

/**
 * A built chain leg, described from the point of view of the leg BEFORE it:
 * where to pay out, how to attach the datum, and how much ADA to forward.
 */
export interface IBuiltChainLeg {
  /** The address the preceding leg must pay out to. */
  orderScriptAddress: string;
  /** How the preceding leg must attach `datum` (v4 and v3 are inline). */
  datumType: EDatumType;
  /** This leg's order datum, CBOR hex. */
  datum: string;
  /** ADA this leg's order must carry, so the preceding leg forwards it. */
  scooperFee: bigint;
  referralFee?: ITxBuilderReferralFee;
  /** Datums this leg names only by hash, for the preceding leg to publish. */
  supplementalDatums?: string[];
}

/**
 * The order script address of a leg, without building its order.
 *
 * A chain is assembled back-to-front, but the PRECEDING leg's destination must
 * be known before its minimum receivable is fixed — and that minimum is what
 * this leg is supplied with. So the address is resolved on its own first, and
 * the order built once the supplied amount is known.
 */
export const chainLegOrderAddress = async ({
  blazeInstance,
  queryProvider,
  leg,
  ownerAddress,
}: Omit<
  IBuildChainLegArgs,
  "suppliedAsset" | "destination"
>): Promise<string> => {
  // Dynamic import to avoid a circular dependency with the tx builders.
  const { SundaeSDK } = await import("../SundaeSDK.class.js");
  const sdk = SundaeSDK.new({
    blazeInstance,
    customQueryProvider: queryProvider,
  });

  return isChainLegV4(leg)
    ? sdk.builder(EContractVersion.V4).getOrderScriptAddress(ownerAddress)
    : sdk.builder(leg.pool.version).getOrderScriptAddress(ownerAddress);
};

export interface IBuildChainLegArgs {
  blazeInstance: Blaze<Provider, Wallet>;
  queryProvider?: QueryProvider;
  /** The leg to build. */
  leg: TChainLeg;
  /** The owner, and the default payout destination. */
  ownerAddress: string;
  /** Overrides the payout destination. */
  destination?: TDestinationAddress;
  /**
   * What this leg receives from its predecessor. This is the predecessor's
   * MINIMUM receivable, not its actual fill: a chain's datum is fixed when the
   * chain is placed, so any surplus the predecessor wins arrives at this leg's
   * address without being named in this leg's datum.
   */
  suppliedAsset: AssetAmount<IAssetAmountMetadata>;
}

/**
 * Build one chain leg's order, so the preceding leg can address and fund it.
 *
 * Dispatches on the leg's contract version. v4 is reached through the explicit
 * `builder(V4)` overload and `swapIntent`, because `TxBuilderV4.swap` throws by
 * design — route orders are outside the audited launch surface — and because
 * `TxBuilderV4` is deliberately absent from the shared `TTxBuilder` union.
 */
export const buildChainLeg = async ({
  blazeInstance,
  queryProvider,
  leg,
  ownerAddress,
  destination,
  suppliedAsset,
}: IBuildChainLegArgs): Promise<IBuiltChainLeg> => {
  // Dynamic import to avoid a circular dependency with the tx builders.
  const { SundaeSDK } = await import("../SundaeSDK.class.js");
  const sdk = SundaeSDK.new({
    blazeInstance,
    customQueryProvider: queryProvider,
  });

  if (isChainLegV4(leg)) {
    const builder = sdk.builder(EContractVersion.V4);
    const [orderScriptAddress, order] = await Promise.all([
      builder.getOrderScriptAddress(ownerAddress),
      builder.swapIntent({
        ownerAddress,
        destination,
        // A v4 order's offered is an upper bound on what a scooper may
        // consume, so a caller may name the expected fill rather than the
        // previous leg's minimum and have the whole arrival converted. Falls
        // back to what actually arrives when no expectation is given.
        offered: leg.offered ?? suppliedAsset,
        minReceived: leg.minReceived,
        budget: leg.budget,
        maxPerExecution: leg.maxPerExecution,
        configToken: leg.configToken,
        referralFee: leg.referralFee,
      }),
    ]);

    return {
      orderScriptAddress,
      datumType: builder.getDatumType(),
      datum: order.datum as string,
      scooperFee: order.fees.scooperFee.amount,
      referralFee: leg.referralFee,
    };
  }

  const builder = sdk.builder(leg.pool.version);
  const orderScriptAddress = await builder.getOrderScriptAddress(ownerAddress);

  const config = new SwapConfig({
    ...leg,
    suppliedAsset,
    ownerAddress,
    orderAddresses: destination
      ? {
          DestinationAddress: destination,
          // Keeps the owner as the v1 canceller.
          AlternateAddress: ownerAddress,
        }
      : {
          DestinationAddress: {
            address: ownerAddress,
            datum: { type: EDatumType.NONE },
          },
        },
  }).buildArgs();

  // `buildArgs` drops the owner; v3 would fall back to the destination.
  const order = await builder.swap({
    ...config,
    ownerAddress,
    swapType: leg.swapType,
  });

  return {
    orderScriptAddress,
    datumType: builder.getDatumType(),
    datum: order.datum as string,
    scooperFee: order.fees.scooperFee.amount,
    referralFee: config.referralFee,
    // A hash-datum (v1) order names an inline destination datum by hash.
    supplementalDatums:
      builder.getDatumType() === EDatumType.HASH &&
      destination?.datum.type === EDatumType.INLINE
        ? [destination.datum.value]
        : undefined,
  };
};
