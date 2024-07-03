import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { getSwapOutput } from "@sundaeswap/cpp";
import { Fraction } from "@sundaeswap/fraction";

import type {
  EContractVersion,
  EPoolCoin,
  ICurrentFeeFromDecayingFeeArgs,
  IPoolData,
  ISundaeProtocolParams,
  TFee,
  TSupportedNetworks,
} from "../@types/index.js";
import {
  ADA_ASSET_DECIMAL,
  ORDER_DEPOSIT_DEFAULT,
  V3_POOL_IDENT_LENGTH,
} from "../constants.js";

export class SundaeUtils {
  static ADA_ASSET_IDS = [
    "",
    ".",
    "ada.lovelace",
    "cardano.ada",
    "616461.6c6f76656c616365",
  ];
  static MAINNET_OFFSET = 1591566291;
  static PREVIEW_OFFSET = 1666656000;

  /**
   * Helper function to check if an asset is ADA.
   * @param {IAssetAmountMetadata} asset The asset metadata.
   * @returns {boolean}
   */
  static isAdaAsset(asset?: IAssetAmountMetadata) {
    if (
      !asset ||
      !SundaeUtils.ADA_ASSET_IDS.includes(asset.assetId) ||
      asset.decimals !== ADA_ASSET_DECIMAL
    ) {
      return false;
    }

    return true;
  }

  /**
   * Helper function to check if a pool identifier is a valid V3 pool identifier.
   * @param poolIdent The pool identifier to be checked.
   * @returns {boolean} Returns true if the pool identifier is a valid V3 pool identifier, otherwise false.
   */
  static isV3PoolIdent(poolIdent: string) {
    return poolIdent.length === V3_POOL_IDENT_LENGTH;
  }

  /**
   * Determines if a given asset is a Liquidity Pool (LP) asset based on its policy ID, associated protocols, and version.
   * This method checks whether the asset's policy ID matches the hash of the 'pool.mint' validator in the specified protocol version.
   *
   * @static
   * @param {Object} params - The parameters for the method.
   * @param {string} params.assetPolicyId - The policy ID of the asset to be checked.
   * @param {IProtocol[]} params.protocols - An array of protocol objects, where each protocol corresponds to a different contract version.
   * @param {EContractVersion} params.version - The version of the contract to be used for validating the asset.
   * @returns {boolean} Returns true if the asset's policy ID matches the 'pool.mint' validator hash in the specified protocol version, otherwise false.
   */
  static isLPAsset({
    assetPolicyId,
    protocols,
    version,
  }: {
    assetPolicyId: string;
    protocols: ISundaeProtocolParams[];
    version: EContractVersion;
  }) {
    const protocol = protocols.find((p) => p.version === version);
    const validator = protocol?.blueprint.validators.find(
      (v) => v.title === "pool.mint"
    );
    return validator?.hash === assetPolicyId;
  }

  static sortSwapAssetsWithAmounts(
    assets: [
      AssetAmount<IAssetAmountMetadata>,
      AssetAmount<IAssetAmountMetadata>
    ]
  ) {
    return assets.sort((a, b) => {
      const isASpecial = SundaeUtils.isAdaAsset(a.metadata);
      const isBSpecial = SundaeUtils.isAdaAsset(b.metadata);

      if (isASpecial && !isBSpecial) {
        return -1;
      }

      if (!isASpecial && isBSpecial) {
        return 1;
      }

      return a.metadata.assetId.localeCompare(b.metadata.assetId);
    });
  }

  static getAssetSwapDirection(
    asset: IAssetAmountMetadata,
    assets: [IAssetAmountMetadata, IAssetAmountMetadata]
  ): EPoolCoin {
    const sorted = SundaeUtils.sortSwapAssetsWithAmounts([
      new AssetAmount<IAssetAmountMetadata>(0n, assets[0]),
      new AssetAmount<IAssetAmountMetadata>(0n, assets[1]),
    ]);

    if (
      SundaeUtils.isAssetIdsEqual(sorted[1]?.metadata.assetId, asset.assetId)
    ) {
      return 1;
    }

    return 0;
  }

  /**
   * Subtracts the pool fee percentage from the asset amount.
   *
   * @param {AssetAmount<IAssetAmountMetadata>} amount The amount we are subtracting from.
   * @param {TFee} fee The fee percentage, represented as a tuple: [numerator, denominator].
   * @returns
   */
  static subtractPoolFeeFromAmount(
    amount: AssetAmount<IAssetAmountMetadata>,
    fee: TFee
  ): number {
    const percent = new Fraction(fee[0], fee[1]).toNumber();
    return Number(amount.amount) * (1 - percent);
  }

  static getCurrentFeeFromDecayingFee({
    endFee,
    endSlot,
    network,
    startFee,
    startSlot,
  }: ICurrentFeeFromDecayingFeeArgs): number {
    const currentUnix = Math.floor(Date.now() / 1000);
    const poolOpen = SundaeUtils.slotToUnix(startSlot, network);
    const feesFinalized = SundaeUtils.slotToUnix(endSlot, network);

    const openingFee = new Fraction(...startFee);
    const finalFee = new Fraction(...endFee);

    if (currentUnix <= poolOpen) {
      return openingFee.toNumber();
    }

    if (currentUnix > feesFinalized) {
      return finalFee.toNumber();
    }

    const totalDuration = feesFinalized - poolOpen;
    const elapsedDuration = currentUnix - poolOpen;
    const feeRange = elapsedDuration / totalDuration;

    const interpolatedFee = Fraction.asFraction(
      openingFee.toNumber() +
        feeRange * (finalFee.toNumber() - openingFee.toNumber())
    );

    return interpolatedFee.toNumber();
  }

  /**
   * Calculates the current fee based on a decaying fee structure between a start and an end point in time.
   * The fee decays linearly from the start fee to the end fee over the period from the start slot to the end slot.
   *
   * @param {ICurrentFeeFromDecayingFeeArgs} args - An object containing necessary arguments:
   *   @param {number[]} args.endFee - The fee percentage at the end of the decay period, represented as a Fraction.
   *   @param {number} args.endSlot - The slot number representing the end of the fee decay period.
   *   @param {TSupportedNetworks} args.network - The network identifier to be used for slot to Unix time conversion.
   *   @param {number[]} args.startFee - The starting fee percentage at the beginning of the decay period, represented as a Fraction.
   *   @param {number} args.startSlot - The slot number representing the start of the fee decay period.
   *
   * @returns {number} The interpolated fee percentage as a number, based on the current time within the decay period.
   *
   * @example
   * ```ts
   * const currentFee = getCurrentFeeFromDecayingFee({
   *   endFee: [1, 100], // 1%
   *   endSlot: 12345678,
   *   network: 'preview',
   *   startFee: [2, 100], // 2%
   *   startSlot: 12345600
   * });
   * console.log(currentFee); // Outputs the current fee percentage based on the current time
   * ```
   */
  static getMinReceivableFromSlippage(
    pool: IPoolData,
    suppliedAsset: AssetAmount<IAssetAmountMetadata>,
    slippage: number
  ): AssetAmount<IAssetAmountMetadata> {
    const supplyingPoolAssetA = SundaeUtils.isAssetIdsEqual(
      pool.assetA.assetId,
      suppliedAsset.metadata.assetId
    );

    const output = getSwapOutput(
      suppliedAsset.amount,
      supplyingPoolAssetA ? pool.liquidity.aReserve : pool.liquidity.bReserve,
      supplyingPoolAssetA ? pool.liquidity.bReserve : pool.liquidity.aReserve,
      pool.currentFee,
      false
    );

    if (
      !SundaeUtils.isAssetIdsEqual(
        pool.assetA.assetId,
        suppliedAsset.metadata.assetId
      ) &&
      !SundaeUtils.isAssetIdsEqual(
        pool.assetB.assetId,
        suppliedAsset.metadata.assetId
      )
    ) {
      throw new Error(
        `The supplied asset ID does not match either assets within the supplied pool data. ${JSON.stringify(
          {
            suppliedAssetID: suppliedAsset.metadata.assetId,
            poolAssetIDs: [pool.assetA.assetId, pool.assetB.assetId],
          }
        )}`
      );
    }

    const receivableAssetMetadata = supplyingPoolAssetA
      ? pool.assetB
      : pool.assetA;

    const amount = BigInt(Math.ceil(Number(output.output) * (1 - slippage)));

    if (amount < 0n) {
      throw new Error("Cannot have a negative minimum receivable amount.");
    }

    return new AssetAmount<IAssetAmountMetadata>(
      amount,
      receivableAssetMetadata
    );
  }

  /**
   * Helper function to test equality of asset ids. This is necessary
   * because of inconsistent naming conventions across the industry for
   * the asset id of the native Cardano token ADA. The function also
   * normalizes the asset ids by ensuring they follow a standard format
   * before comparing them. If an asset id does not contain a '.', it is
   * normalized by appending a '.' at the end. This normalization step
   * ensures consistent comparisons regardless of slight variations in
   * the asset id format.
   *
   * @param {string} aId The first asset's assetId (both policy and asset name IDs).
   * @param {string} bId The second asset's assetId (both policy and asset name IDs).
   * @returns {boolean}
   */
  static isAssetIdsEqual(aId: string, bId: string) {
    if (
      SundaeUtils.ADA_ASSET_IDS.includes(aId) &&
      SundaeUtils.ADA_ASSET_IDS.includes(bId)
    ) {
      return true;
    }
    const normalizedAId = aId.includes(".") ? aId : `${aId}.`;
    const normalizedBId = bId.includes(".") ? bId : `${bId}.`;
    return normalizedAId === normalizedBId;
  }

  /**
   * Takes an array of {@link IAsset} and aggregates them into an object of amounts.
   * This is useful for when you are supplying an asset that is both for the payment and
   * the Order.
   *
   * @param suppliedAssets
   */
  static accumulateSuppliedAssets({
    scooperFee,
    suppliedAssets,
    orderDeposit,
  }: {
    orderDeposit?: bigint;
    suppliedAssets: AssetAmount<IAssetAmountMetadata>[];
    scooperFee: bigint;
  }): Record<
    /** The PolicyID and the AssetName concatenated together with no period. */
    string | "lovelace",
    /** The amount as a bigint (no decimals) */
    bigint
  > {
    const assets: Record<string, bigint> = {};

    const aggregatedAssets = suppliedAssets.reduce((acc, curr) => {
      const existingAssetIndex = acc.findIndex(({ metadata }) =>
        SundaeUtils.isAssetIdsEqual(curr.metadata.assetId, metadata.assetId)
      );
      if (existingAssetIndex !== -1) {
        acc[existingAssetIndex] = acc[existingAssetIndex].add(curr);

        return acc;
      }

      return [...acc, curr];
    }, [] as AssetAmount<IAssetAmountMetadata>[]);

    // Set the minimum ADA amount.
    assets.lovelace = scooperFee + (orderDeposit ?? ORDER_DEPOSIT_DEFAULT);

    aggregatedAssets.forEach((suppliedAsset) => {
      if (SundaeUtils.isAdaAsset(suppliedAsset.metadata)) {
        assets.lovelace += suppliedAsset.amount;
      } else {
        assets[suppliedAsset.metadata.assetId.replace(".", "")] =
          suppliedAsset.amount;
      }
    });

    return assets;
  }

  /**
   * Calculates the best liquidity pool for a given swap based on the available pools,
   * the given asset, and the taken asset. It determines the best pool by
   * finding the one that provides the highest output for a fixed input amount.
   *
   * @param {IPoolData[]} availablePools - An array of available liquidity pools for the selected pair.
   * @param {AssetAmount<IAssetAmountMetadata>} [given] - The asset amount and metadata of the given asset.
   * @param {AssetAmount<IAssetAmountMetadata>} [taken] - The asset amount and metadata of the taken asset.
   * @returns {IPoolData | undefined} The liquidity pool that offers the best swap outcome, or undefined if no suitable pool is found.
   */
  static getBestPoolBySwapOutcome({
    availablePools,
    given,
    taken,
  }: {
    availablePools: IPoolData[];
    given?: AssetAmount<IAssetAmountMetadata>;
    taken?: AssetAmount<IAssetAmountMetadata>;
  }) {
    let bestPool;
    let bestOutcome;

    const [resolvedGiven, resolvedTaken] = SundaeUtils.isAdaAsset(
      given?.metadata
    )
      ? [given, taken]
      : [taken, given];

    if (availablePools && resolvedGiven?.metadata && resolvedTaken?.metadata) {
      const givenDecimals = resolvedGiven.metadata.decimals;
      const hundredGiven = BigInt(10 ** givenDecimals) * 100n;

      for (const pool of availablePools) {
        const givenReserve = SundaeUtils.isAssetIdsEqual(
          pool.assetA.assetId,
          resolvedGiven.metadata.assetId
        )
          ? pool.liquidity.aReserve
          : pool.liquidity.bReserve;
        const takenReserve = SundaeUtils.isAssetIdsEqual(
          pool.assetB.assetId,
          resolvedTaken.metadata.assetId
        )
          ? pool.liquidity.bReserve
          : pool.liquidity.aReserve;

        const swapOutcome = getSwapOutput(
          hundredGiven,
          givenReserve,
          takenReserve,
          pool.currentFee
        );

        if (!bestOutcome || swapOutcome.output > bestOutcome.output) {
          bestOutcome = swapOutcome;
          bestPool = pool;
        }
      }
    }

    if (bestPool) {
      return bestPool;
    }
  }

  /**
   * Split a long string into an array of chunks for metadata.
   *
   * @param str Full string that you wish to split by chunks of 64.
   * @param prefix Optional prefix to add to each chunk. This is useful if your transaction builder has helper functions to convert strings to CBOR bytestrings (i.e. Lucid will convert strings with a `0x` prefix).
   */
  static splitMetadataString(str: string, prefix?: string): string[] {
    const result: string[] = [];
    const chunk = prefix ? 64 - prefix.length : 64;
    for (let i = 0; i < str.length; i += chunk) {
      const slicedStr = str.slice(i, i + chunk);
      result.push(`${prefix ?? ""}${slicedStr}`);
    }
    return result;
  }

  /**
   * Helper function to convert unix timestamp to slot
   * by subtracting the network's slot offset.
   *
   * @param {number} unix The time in seconds.
   * @param {TSupportedNetworks} network The network.
   * @returns {number}
   */
  static unixToSlot(
    unix: number | string,
    network: TSupportedNetworks
  ): number {
    return Math.floor(
      Math.trunc(Number(unix)) -
        (network === "mainnet"
          ? SundaeUtils.MAINNET_OFFSET
          : SundaeUtils.PREVIEW_OFFSET)
    );
  }

  /**
   * Helper function to convert slot to unix timestamp
   * by adding the network's slot offset.
   *
   * @param {number} unix The time in seconds.
   * @param {TSupportedNetworks} network The network.
   * @returns {number}
   */
  static slotToUnix(
    unix: number | string,
    network: TSupportedNetworks
  ): number {
    return Math.floor(
      Math.trunc(Number(unix)) +
        (network === "mainnet"
          ? SundaeUtils.MAINNET_OFFSET
          : SundaeUtils.PREVIEW_OFFSET)
    );
  }
}
