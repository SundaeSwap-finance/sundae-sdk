import {
  Blaze,
  TxBuilder as BlazeTx,
  Core,
  Provider,
  Wallet,
} from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  EContractVersion,
  IComposedTx,
  IMintPoolConfigArgs,
  IPoolData,
} from "../@types/index.js";
import { TxBuilderAbstractCondition } from "../Abstracts/TxBuilderAbstract.Condition.js";
import { NftCheckTypes } from "../DatumBuilders/ContractTypes/index.js";
import {
  DatumBuilderNftCheck,
  IDatumBuilderNftCheckArgs,
} from "../DatumBuilders/index.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/index.js";
import { TxBuilderV3 } from "./TxBuilder.V3.class.js";

/**
 * Interface describing the method arguments for creating a pool
 * in the Condition Pool Contract.
 */
export interface IMintNftCheckPoolConfigArgs extends IMintPoolConfigArgs {
  conditionDatumArgs: IDatumBuilderNftCheckArgs;
}

export class TxBuilderNftCheck
  extends TxBuilderV3
  implements TxBuilderAbstractCondition
{
  contractVersion: EContractVersion = EContractVersion.NftCheck;
  datumBuilder: DatumBuilderNftCheck;

  constructor(
    blaze: Blaze<Provider, Wallet>,
    queryProvider?: QueryProviderSundaeSwap,
  ) {
    super(blaze, queryProvider);
    this.datumBuilder = new DatumBuilderNftCheck(this.network);
  }

  /**
   * Mints a new liquidity pool on the Cardano blockchain. This method
   * constructs and submits a transaction that includes all the necessary generation
   * of pool NFTs, metadata, pool assets, and initial liquidity tokens,
   *
   * @param {IMintNftCheckPoolConfigArgs} mintPoolArgs - Configuration arguments for minting the pool, including assets,
   * fee parameters, owner address, protocol fee, and referral fee.
   *  - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - fee: The desired pool fee, denominated out of 10 thousand.
   *  - marketOpen: The POSIX timestamp for when the pool should allow trades (market open).
   *  - ownerAddress: Who the generated LP tokens should be sent to.
   * @returns {Promise<IComposedTx<BlazeTx, Core.Transaction>>} A completed transaction object.
   *
   * @throws {Error} Throws an error if the transaction fails to build or submit.
   */
  public async mintPool(
    mintPoolArgs: IMintNftCheckPoolConfigArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const condition = (
      await this.getValidatorScript("conditions/nft_check.withdraw")
    ).hash;
    const mintPoolArgsWithCondition = {
      ...mintPoolArgs,
      condition,
    };
    return super.mintPool(mintPoolArgsWithCondition);
  }

  getExtraSuppliedAssets(
    poolData: IPoolData,
  ): AssetAmount<IAssetAmountMetadata>[] {
    if (!poolData.conditionDatum) {
      return [];
    }
    const conditionDatum: NftCheckTypes.NftCheckDatum =
      this.datumBuilder.decodeConditionDatum(poolData.conditionDatum);
    const result: AssetAmount<IAssetAmountMetadata>[] = [];
    Object.entries(conditionDatum?.value).forEach((assets, policyId) => {
      assets.forEach((amount, assetName) => {
        const assetId = `${policyId}.${assetName}`;
        result.push(
          new AssetAmount(Number(amount), {
            assetId,
            decimals: 0,
          }),
        );
      });
    });
    return result;
  }
}
