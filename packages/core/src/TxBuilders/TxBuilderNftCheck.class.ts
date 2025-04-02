import {
  Blaze,
  TxBuilder as BlazeTx,
  Core,
  Provider,
  Wallet,
} from "@blaze-cardano/sdk";
import {
  EContractVersion,
  IComposedTx,
  IMintV3PoolConfigArgs,
  TDatumResult,
} from "src/@types";
import { TPoolDatum } from "src/DatumBuilders/ContractTypes/Contract.Condition";
import { IDatumBuilderMintPoolConditionArgs } from "src/DatumBuilders/DatumBuilder.Condition.class";
import {
  DatumBuilderNftCheck,
  IDatumBuilderNftCheckArgs,
} from "src/DatumBuilders/DatumBuilder.NftCheck.class";
import { QueryProviderSundaeSwap } from "src/QueryProviders";
import { TxBuilderCondition } from "./TxBuilder.Condition.class";

/**
 * Interface describing the method arguments for creating a pool
 * in the Condition Pool Contract.
 */
export interface IMintNftCheckPoolConfigArgs extends IMintV3PoolConfigArgs {
  conditionDatumArgs: IDatumBuilderNftCheckArgs;
}

export class TxBuilderNftCheck extends TxBuilderCondition {
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
    return this.mintPoolGeneric(mintPoolArgsWithCondition);
  }

  public buildMintPoolDatum({
    assetA,
    assetB,
    fees,
    marketOpen,
    depositFee,
    seedUtxo,
    condition,
    conditionDatumArgs,
  }: IDatumBuilderMintPoolConditionArgs): TDatumResult<TPoolDatum> {
    return this.datumBuilder.buildMintPoolDatum({
      assetA,
      assetB,
      fees,
      marketOpen,
      depositFee,
      seedUtxo,
      condition,
      conditionDatumArgs,
    });
  }
}
