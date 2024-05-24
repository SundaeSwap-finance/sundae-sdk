import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { Constr, Data } from "lucid-cardano";

import {
  EDatumType,
  IDepositArguments,
  ISwapArguments,
  IWithdrawArguments,
  IZapArguments,
  TDatumResult,
  TDepositMixed,
  TDepositSingle,
  TOrderAddresses,
  TSupportedNetworks,
  TSwap,
} from "../@types/index.js";
import { DatumBuilder } from "../Abstracts/DatumBuilder.abstract.class.js";
import { LucidHelper } from "../Utilities/LucidHelper.class.js";
import { V1_MAX_POOL_IDENT_LENGTH } from "../constants.js";

/**
 * The Lucid implementation for building valid Datums for
 * V1 contracts on the SundaeSwap protocol.
 */
export class DatumBuilderLucidV1 implements DatumBuilder {
  /** The current network id. */
  public network: TSupportedNetworks;
  /** The error to throw when the pool ident does not match V1 constraints. */
  static INVALID_POOL_IDENT =
    "You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order.";

  constructor(network: TSupportedNetworks) {
    this.network = network;
  }

  /**
   * Constructs a swap datum object based on the provided swap arguments.
   * The function initializes a new datum with specific properties such as the pool ident,
   * order addresses, scooper fee, and swap direction schema. It then converts this datum
   * into an inline format and computes its hash using {@link Lucid.LucidHelper}. The function returns an
   * object containing the hash of the inline datum, the inline datum itself, and the original
   * datum schema.
   *
   * @param {ISwapArguments} params - The swap arguments required to build the swap datum.
   * @returns {TDatumResult<Data>} An object containing the hash of the inline datum, the inline datum itself,
   *                               and the schema of the original datum.
   */
  buildSwapDatum({
    ident,
    orderAddresses,
    fundedAsset,
    swap,
    scooperFee,
  }: ISwapArguments): TDatumResult<Data> {
    const datum = new Constr(0, [
      this.buildPoolIdent(ident),
      this.buildOrderAddresses(orderAddresses).schema,
      scooperFee,
      this.buildSwapDirection(swap, fundedAsset).schema,
    ]);

    const inline = Data.to(datum);

    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: datum,
    };
  }

  /**
   * Creates a deposit datum object from the given deposit arguments. The function initializes
   * a new datum with specific properties such as the pool ident, order addresses, scooper fee,
   * and deposit pair schema. It then converts this datum into an inline format and calculates
   * its hash using {@link Lucid.LucidHelper}. The function returns an object containing the hash of the inline
   * datum, the inline datum itself, and the original datum schema.
   *
   * @param {IDepositArguments} params - The deposit arguments required to construct the deposit datum.
   * @returns {TDatumResult<Data>} An object containing the hash of the inline datum, the inline datum itself,
   *                               and the schema of the original datum.
   */
  buildDepositDatum({
    ident,
    orderAddresses,
    deposit,
    scooperFee,
  }: IDepositArguments): TDatumResult<Data> {
    const datum = new Constr(0, [
      this.buildPoolIdent(ident),
      this.buildOrderAddresses(orderAddresses).schema,
      scooperFee,
      this.buildDepositPair(deposit).schema,
    ]);

    const inline = Data.to(datum);

    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: datum,
    };
  }

  /**
   * Constructs a zap datum object from provided zap arguments. This function creates a new datum with
   * specific attributes such as the pool ident, order addresses, scooper fee, and deposit zap schema.
   * The datum is then converted to an inline format, and its hash is computed using {@link Lucid.LucidHelper}. The function
   * returns an object that includes the hash of the inline datum, the inline datum itself, and the original
   * datum schema, facilitating the integration of the zap operation within a larger transaction framework.
   *
   * @param {IZapArguments} params - The arguments necessary for constructing the zap datum.
   * @returns {TDatumResult<Data>} An object containing the hash of the inline datum, the inline datum itself,
   *                               and the schema of the original datum, which are essential for the zap transaction's execution.
   */
  experimental_buildZapDatum({
    ident,
    orderAddresses,
    zap,
    scooperFee,
  }: IZapArguments): TDatumResult<Data> {
    const datum = new Constr(0, [
      this.buildPoolIdent(ident),
      this.buildOrderAddresses(orderAddresses).schema,
      scooperFee,
      this.experimental_buildDepositZap(zap).schema,
    ]);

    const inline = Data.to(datum);

    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: datum,
    };
  }

  /**
   * Generates a withdraw datum object from the specified withdraw arguments. This function constructs
   * a new datum with defined attributes such as the pool ident, order addresses, scooper fee, and
   * the schema for the supplied LP (Liquidity Provider) asset for withdrawal. After constructing the datum,
   * it is converted into an inline format, and its hash is calculated using {@link Lucid.LucidHelper}. The function returns
   * an object containing the hash of the inline datum, the inline datum itself, and the schema of the original
   * datum, which are crucial for executing the withdrawal operation within a transactional framework.
   *
   * @param {IWithdrawArguments} params - The arguments necessary to construct the withdraw datum.
   * @returns {TDatumResult<Data>} An object comprising the hash of the inline datum, the inline datum itself,
   *                               and the schema of the original datum, facilitating the withdrawal operation's integration into the transactional process.
   */
  buildWithdrawDatum({
    ident,
    orderAddresses,
    suppliedLPAsset,
    scooperFee,
  }: IWithdrawArguments): TDatumResult<Data> {
    const datum = new Constr(0, [
      this.buildPoolIdent(ident),
      this.buildOrderAddresses(orderAddresses).schema,
      scooperFee,
      this.buildWithdrawAsset(suppliedLPAsset).schema,
    ]);

    const inline = Data.to(datum);

    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: datum,
    };
  }

  buildDepositPair(deposit: TDepositMixed): TDatumResult<Data> {
    const datum = new Constr(2, [
      new Constr(1, [
        new Constr(0, [deposit.CoinAAmount.amount, deposit.CoinBAmount.amount]),
      ]),
    ]);

    const inline = Data.to(datum);

    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: datum,
    };
  }

  experimental_buildDepositZap(zap: TDepositSingle): TDatumResult<Data> {
    const datum = new Constr(2, [
      new Constr(zap.ZapDirection, [zap.CoinAmount.amount]),
    ]);

    const inline = Data.to(datum);

    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: datum,
    };
  }

  buildWithdrawAsset(
    fundedLPAsset: AssetAmount<IAssetAmountMetadata>
  ): TDatumResult<Data> {
    const datum = new Constr(1, [fundedLPAsset.amount]);

    const inline = Data.to(datum);

    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: datum,
    };
  }

  buildSwapDirection(
    swap: TSwap,
    amount: AssetAmount<IAssetAmountMetadata>
  ): TDatumResult<Data> {
    const datum = new Constr(0, [
      new Constr(swap.SuppliedCoin, []),
      amount.amount,
      swap.MinimumReceivable
        ? new Constr(0, [swap.MinimumReceivable.amount])
        : new Constr(1, []),
    ]);

    const inline = Data.to(datum);

    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: datum,
    };
  }

  buildOrderAddresses(addresses: TOrderAddresses): TDatumResult<Data> {
    LucidHelper.validateAddressAndDatumAreValid({
      ...addresses.DestinationAddress,
      network: this.network,
    });

    addresses?.AlternateAddress &&
      LucidHelper.validateAddressAndDatumAreValid({
        address: addresses.AlternateAddress,
        network: this.network,
        datum: {
          type: EDatumType.NONE,
        },
      });

    const { DestinationAddress, AlternateAddress } = addresses;
    const destination = LucidHelper.getAddressHashes(
      DestinationAddress.address
    );

    const destinationDatum = new Constr(0, [
      new Constr(0, [
        new Constr(
          LucidHelper.isScriptAddress(DestinationAddress.address) ? 1 : 0,
          [destination.paymentCredentials]
        ),
        destination?.stakeCredentials
          ? new Constr(0, [
              new Constr(0, [
                new Constr(
                  LucidHelper.isScriptAddress(DestinationAddress.address)
                    ? 1
                    : 0,
                  [destination?.stakeCredentials]
                ),
              ]),
            ])
          : new Constr(1, []),
      ]),
      DestinationAddress.datum.type !== EDatumType.NONE
        ? new Constr(0, [DestinationAddress.datum.value])
        : new Constr(1, []),
    ]);

    const alternate =
      AlternateAddress && LucidHelper.getAddressHashes(AlternateAddress);
    const alternateDatum = new Constr(
      alternate ? 0 : 1,
      alternate
        ? [alternate.stakeCredentials ?? alternate.paymentCredentials]
        : []
    );

    const datum = new Constr(0, [destinationDatum, alternateDatum]);

    const inline = Data.to(datum);

    return {
      hash: LucidHelper.inlineDatumToHash(inline),
      inline,
      schema: datum,
    };
  }

  buildPoolIdent(ident: string): string {
    if (ident.length > V1_MAX_POOL_IDENT_LENGTH) {
      throw new Error(DatumBuilderLucidV1.INVALID_POOL_IDENT);
    }

    return ident;
  }
}
