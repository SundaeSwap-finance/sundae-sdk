import { AssetAmount, AssetRatio } from "@sundaeswap/asset";
import { TSwapOutcome, getSwapInput, getSwapOutput } from "@sundaeswap/cpp";

import { IAssetMetaData } from "../../../types/Asset.types";
import { TPool } from "../../../types/Pool.types";
import {
  calculateSwapOutcome,
  getApplicableFee,
  getAssetReserve,
} from "../../../utils/pool.utils";

interface ICalculateFunctionDeps {
  orderRoute?: TPool[];
  ratio?: AssetRatio<IAssetMetaData>;
  isLimitOrder?: boolean;
}

export interface ICalculateTakenAmountFromGivenArgs
  extends ICalculateFunctionDeps {
  given?: AssetAmount<IAssetMetaData>;
  taken?: AssetAmount<IAssetMetaData>;
}

/**
 * Handles the order calculations for a single swap route.
 * @param {ICalculateTakenAmountFromGivenArgs} args - The arguments for the calculation.
 * @returns {AssetAmount<IAssetMetaData>} - The resulting taken amount after the swap.
 */
const handleSingleRouteOrderTakenFromGiven = ({
  given,
  pool,
  ratio,
  isLimitOrder,
  taken,
}: ICalculateTakenAmountFromGivenArgs & { pool: TPool }) => {
  if (!given || given.amount === 0n || !taken || !pool) {
    return new AssetAmount(0n, taken?.metadata);
  }

  if (!isLimitOrder) {
    const estimatedOutput = getSwapOutput(
      given.amount,
      getAssetReserve(given, pool),
      getAssetReserve(taken, pool),
      getApplicableFee({
        pool,
        givenAssetId: given.metadata.assetId,
      }).toNumber(),
      given.decimals === 0,
    );

    return new AssetAmount(estimatedOutput.output, taken.metadata);
  }

  if (isLimitOrder && ratio) {
    return given.exchangeAt(ratio);
  }

  return taken;
};

/**
 * Handles the order calculations for multiple swap routes.
 * @param {ICalculateTakenAmountFromGivenArgs} args - The arguments for the calculation including multiple routes.
 * @returns {AssetAmount<IAssetMetaData>} - The resulting taken amount after the swap through multiple routes.
 */
export const handleMultiRouteOrderTakenFromGiven = ({
  given,
  orderRoute,
  taken,
}: ICalculateTakenAmountFromGivenArgs) => {
  if (!given || given.amount === 0n || !taken || !orderRoute) {
    return new AssetAmount(0n, taken?.metadata);
  }

  const firstPool = orderRoute[0];
  const { firstInputAsset, firstOutputAsset } =
    given.metadata.assetId === firstPool.assetA.assetId
      ? {
          firstInputAsset: firstPool.assetA,
          firstOutputAsset: firstPool.assetB,
        }
      : {
          firstInputAsset: firstPool.assetB,
          firstOutputAsset: firstPool.assetA,
        };

  const firstSwapOutcome = calculateSwapOutcome(
    given.amount,
    firstInputAsset,
    firstOutputAsset,
    firstPool,
    getApplicableFee({
      pool: firstPool,
      givenAssetId: firstInputAsset.assetId,
    }).toNumber(),
  );

  const secondPool = orderRoute[1];
  const { secondInputAsset, secondOutputAsset } =
    taken.metadata.assetId === secondPool.assetA.assetId
      ? {
          secondOutputAsset: secondPool.assetA,
          secondInputAsset: secondPool.assetB,
        }
      : {
          secondOutputAsset: secondPool.assetB,
          secondInputAsset: secondPool.assetA,
        };

  const secondSwapOutcome = calculateSwapOutcome(
    firstSwapOutcome.output,
    secondInputAsset,
    secondOutputAsset,
    secondPool,
    getApplicableFee({
      pool: secondPool,
      givenAssetId: secondInputAsset.assetId,
    }).toNumber(),
  );

  return new AssetAmount(secondSwapOutcome.output, taken.metadata);
};

/**
 * Calculates the taken amount from a given amount, considering both single and multiple route orders.
 * @param {ICalculateTakenAmountFromGivenArgs} args - The calculation arguments.
 * @returns {AssetAmount<IAssetMetaData>} - The resulting taken amount.
 */
export const calculateTakenAmountFromGiven = ({
  given,
  orderRoute,
  ratio,
  isLimitOrder,
  taken,
}: ICalculateTakenAmountFromGivenArgs) => {
  if (!orderRoute) return taken;

  if (orderRoute.length === 1) {
    return handleSingleRouteOrderTakenFromGiven({
      given,
      pool: orderRoute[0],
      ratio,
      isLimitOrder,
      taken,
    });
  }

  return handleMultiRouteOrderTakenFromGiven({ given, orderRoute, taken });
};

export interface ICalculateGivenFromTakenArgs extends ICalculateFunctionDeps {
  taken: AssetAmount<IAssetMetaData>;
  given?: AssetAmount<IAssetMetaData>;
}

/**
 * Handles the order calculations for multi-route swaps, determining the 'given' asset amount from the 'taken' asset amount.
 * @param {ICalculateTakenAmountFromGivenArgs} args - The arguments for the calculation including multiple routes.
 * @returns {AssetAmount<IAssetMetaData>} - The resulting given amount after the swap through multiple routes.
 */
const handleMultiRouteOrderGivenFromTaken = ({
  given,
  orderRoute,
  taken,
}: ICalculateTakenAmountFromGivenArgs) => {
  if (!taken || taken.amount === 0n || !given || !orderRoute) {
    return new AssetAmount(0n, given?.metadata);
  }

  const secondPool = orderRoute[1];
  const { secondInputAsset, secondOutputAsset } =
    taken.metadata.assetId === secondPool.assetA.assetId
      ? {
          secondInputAsset: secondPool.assetA,
          secondOutputAsset: secondPool.assetB,
        }
      : {
          secondInputAsset: secondPool.assetB,
          secondOutputAsset: secondPool.assetA,
        };

  const firstSwapOutcome = calculateSwapOutcome(
    taken.amount,
    secondInputAsset,
    secondOutputAsset,
    secondPool,
    getApplicableFee({
      pool: secondPool,
      givenAssetId: secondInputAsset.assetId,
    }).toNumber(),
  );

  const firstPool = orderRoute[0];
  const { firstInputAsset, firstOutputAsset } =
    given.metadata.assetId === firstPool.assetA.assetId
      ? {
          firstOutputAsset: firstPool.assetA,
          firstInputAsset: firstPool.assetB,
        }
      : {
          firstOutputAsset: firstPool.assetB,
          firstInputAsset: firstPool.assetA,
        };

  if (firstSwapOutcome.output === 0n) {
    return new AssetAmount(0n, given?.metadata);
  }

  const secondSwapOutcome = calculateSwapOutcome(
    firstSwapOutcome.output,
    firstInputAsset,
    firstOutputAsset,
    firstPool,
    getApplicableFee({
      pool: firstPool,
      givenAssetId: firstInputAsset.assetId,
    }).toNumber(),
  );

  return new AssetAmount(secondSwapOutcome.output, given.metadata);
};

/**
 * Handles the order calculations for a single swap route, determining the 'given' asset amount from the 'taken' asset amount.
 * @param {ICalculateGivenFromTakenArgs & { pool: TPool }} args - The arguments for the calculation.
 * @returns {AssetAmount<IAssetMetaData>} - The resulting given amount after the swap.
 */
const handleSingleRouteOrderGivenFromTaken = ({
  given,
  pool,
  ratio,
  isLimitOrder,
  taken,
}: ICalculateGivenFromTakenArgs & { pool: TPool }) => {
  if (taken?.amount > 0n && pool && !isLimitOrder && given) {
    let estimatedOutput: Pick<TSwapOutcome, "input"> | undefined;
    try {
      estimatedOutput = getSwapInput(
        taken.amount,
        getAssetReserve(given, pool),
        getAssetReserve(taken, pool),
        getApplicableFee({
          pool,
          givenAssetId: taken.metadata.assetId,
        }).toNumber(),
      );
    } catch (e) {
      if ((e as Error)?.message === "Output must be less than output reserve") {
        estimatedOutput = {
          input: getAssetReserve(given, pool),
        };
      }
    }
    return new AssetAmount(estimatedOutput?.input || 0, given.metadata);
  } else if (taken && ratio && isLimitOrder) {
    return taken?.exchangeAt(ratio);
  } else if (taken?.amount === 0n && pool) {
    const matchingMetadata =
      given?.metadata?.assetId === pool.assetA.assetId
        ? pool.assetA
        : pool.assetB;
    return new AssetAmount(0n, matchingMetadata);
  }

  return given;
};

/**
 * Calculates the given amount from a taken amount, considering both single and multiple route orders.
 * @param {ICalculateGivenFromTakenArgs} args - The calculation arguments.
 * @returns {AssetAmount<IAssetMetaData>} - The resulting given amount.
 */
export const calculateGivenAmountFromTaken = ({
  given,
  orderRoute,
  ratio,
  isLimitOrder,
  taken,
}: ICalculateGivenFromTakenArgs) => {
  if (!orderRoute) return new AssetAmount(0n, given?.metadata);

  if (orderRoute.length === 1) {
    return handleSingleRouteOrderGivenFromTaken({
      given,
      pool: orderRoute[0],
      ratio,
      isLimitOrder,
      taken,
    });
  }

  return handleMultiRouteOrderGivenFromTaken({ given, orderRoute, taken });
};
