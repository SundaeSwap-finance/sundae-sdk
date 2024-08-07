import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import type { IPoolData } from "@sundaeswap/core";
import { SundaeUtils } from "@sundaeswap/core/utilities";
import {
  type TSwapOutcome,
  getSwapInput,
  getSwapOutput,
} from "@sundaeswap/cpp";
import type { TFractionLike } from "@sundaeswap/fraction";

interface ICalculateFunctionDeps {
  pool?: IPoolData;
}

export interface ICalculateTakenAmountFromGivenArgs
  extends ICalculateFunctionDeps {
  given?: AssetAmount<IAssetAmountMetadata>;
  taken?: AssetAmount<IAssetAmountMetadata>;
}

/**
 * Gets the reserve amount of a specific asset in a given liquidity pool.
 *
 * @param {AssetAmount<IAssetMetaData>} asset - The asset for which to get the reserve.
 * @param {TPool} pool - The liquidity pool from which to get the reserve.
 * @returns {bigint} The reserve amount of the asset in the pool. If the asset matches pool's assetA, it returns the quantity of assetA; otherwise, it returns the quantity of assetB.
 *
 * @example
 *
 * const assetReserve = getAssetReserve(assetAmount, liquidityPool);
 */
export const getAssetReserve = (
  asset: AssetAmount<IAssetAmountMetadata>,
  pool: IPoolData
): bigint => {
  return SundaeUtils.isAssetIdsEqual(
    asset?.metadata?.assetId,
    pool.assetA.assetId
  )
    ? pool?.liquidity.aReserve || 0n
    : pool?.liquidity.bReserve || 0n;
};

/**
 * Calculates the outcome of a swap transaction in a given pool.
 * @param {bigint} amount - The amount of the input asset.
 * @param {IAssetAmountMetadata} inputAsset - Metadata of the input asset.
 * @param {IAssetAmountMetadata} outputAsset - Metadata of the output asset.
 * @param {IPoolData} pool - The pool fragment where the swap occurs.
 * @param {TFractionLike} feePercentage - The fee percentage for the swap.
 * @returns {Object} The output amount after the swap.
 */
export const calculateSwapOutcome = (
  amount: bigint,
  inputAsset: IAssetAmountMetadata,
  outputAsset: IAssetAmountMetadata,
  pool: IPoolData,
  feePercentage: TFractionLike
) => {
  const inputReserve = getAssetReserve(new AssetAmount(1, inputAsset), pool);
  const outputReserve = getAssetReserve(new AssetAmount(1, outputAsset), pool);
  return getSwapOutput(amount, inputReserve, outputReserve, feePercentage);
};

/**
 * Handles the order calculations for a single swap route.
 * @param {ICalculateTakenAmountFromGivenArgs} args - The arguments for the calculation.
 * @returns {AssetAmount<IAssetAmountMetadata>} - The resulting taken amount after the swap.
 */
const handleSingleRouteOrderTakenFromGiven = ({
  given,
  pool,
  taken,
}: ICalculateTakenAmountFromGivenArgs & { pool: IPoolData }) => {
  if (!given || given.amount === 0n || !taken || !pool) {
    return new AssetAmount(0n, taken?.metadata);
  }

  const estimatedOutput = getSwapOutput(
    given.amount,
    getAssetReserve(given, pool),
    getAssetReserve(taken, pool),
    pool.currentFee,
    given.decimals === 0
  );

  return new AssetAmount(estimatedOutput.output, taken.metadata);
};

/**
 * Calculates the taken amount from a given amount, considering both single and multiple route orders.
 * @param {ICalculateTakenAmountFromGivenArgs} args - The calculation arguments.
 * @returns {AssetAmount<IAssetAmountMetadata>} - The resulting taken amount.
 */
export const calculateTakenAmountFromGiven = ({
  given,
  pool,
  taken,
}: ICalculateTakenAmountFromGivenArgs) => {
  if (!pool) return taken;

  return handleSingleRouteOrderTakenFromGiven({
    given,
    pool,
    taken,
  });
};

export interface ICalculateGivenFromTakenArgs extends ICalculateFunctionDeps {
  taken: AssetAmount<IAssetAmountMetadata>;
  given?: AssetAmount<IAssetAmountMetadata>;
}

/**
 * Handles the order calculations for a single swap route, determining the 'given' asset amount from the 'taken' asset amount.
 * @param {ICalculateGivenFromTakenArgs & { pool: IPoolData }} args - The arguments for the calculation.
 * @returns {AssetAmount<IAssetAmountMetadata>} - The resulting given amount after the swap.
 */
const handleSingleRouteOrderGivenFromTaken = ({
  given,
  pool,
  taken,
}: ICalculateGivenFromTakenArgs & { pool: IPoolData }) => {
  if (taken?.amount > 0n && pool && given) {
    let estimatedOutput: Pick<TSwapOutcome, "input"> | undefined;
    try {
      estimatedOutput = getSwapInput(
        taken.amount,
        getAssetReserve(given, pool),
        getAssetReserve(taken, pool),
        pool.currentFee
      );
    } catch (e) {
      if ((e as Error)?.message === "Output must be less than output reserve") {
        estimatedOutput = {
          input: getAssetReserve(given, pool),
        };
      }
    }
    return new AssetAmount(estimatedOutput?.input || 0, given.metadata);
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
 * @returns {AssetAmount<IAssetAmountMetadata>} - The resulting given amount.
 */
export const calculateGivenAmountFromTaken = ({
  given,
  pool,
  taken,
}: ICalculateGivenFromTakenArgs) => {
  if (!pool) return new AssetAmount(0n, given?.metadata);

  return handleSingleRouteOrderGivenFromTaken({
    given,
    pool,
    taken,
  });
};
