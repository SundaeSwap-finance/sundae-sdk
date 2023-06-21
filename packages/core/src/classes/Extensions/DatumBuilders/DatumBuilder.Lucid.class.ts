import { Data, Constr, C } from "lucid-cardano";
import { AssetAmount } from "@sundaeswap/asset";

import {
  DatumResult,
  DepositArguments,
  DepositMixed,
  DepositSingle,
  IAsset,
  LockArguments,
  OrderAddresses,
  Swap,
  SwapArguments,
  TSupportedNetworks,
  WithdrawArguments,
  ZapArguments,
} from "../../../@types";
import { DatumBuilder } from "../../Abstracts/DatumBuilder.abstract.class";
import { LucidHelper } from "../LucidHelper.class";

/**
 * The Lucid implementation of a {@link Core.DatumBuilder}. This is useful
 * if you would rather just build valid CBOR strings for just the datum
 * portion of a valid SundaeSwap transaction.
 */
export class DatumBuilderLucid extends DatumBuilder<Data> {
  constructor(public network: TSupportedNetworks) {
    super();
  }

  /**
   * Builds a hash from a Data object.
   */
  datumToHash(datum: Data | string): string {
    if (typeof datum === "string") {
      const data = Data.from(datum);
      return Data.to(data);
    }

    return Data.to(datum);
  }

  /**
   * Parses out the DesintationAddress from a datum.
   * @TODO Ensure that we can reliably parse the DesinationAddress from the datum string.
   */
  getDestinationAddressFromCBOR(datum: string) {
    return "";
  }

  /**
   * Builds the datum for asset locking, including LP tokens and other
   * native Cardano assets.
   */
  buildLockDatum({ address, delegation }: LockArguments): DatumResult<Data> {
    LucidHelper.validateAddressNetwork(address, this.network);
    const addressDetails = LucidHelper.getAddressHashes(address);
    const delegationData: Data = [];
    delegation.forEach((programMap, program) => {
      programMap.forEach((weight, pool) => {
        delegationData.push(
          new Constr(1, [
            Buffer.from(program).toString("hex"),
            pool,
            BigInt(weight),
          ])
        );
      });
    });

    const owner = new Constr(0, [
      addressDetails?.stakeCredentials ?? addressDetails?.paymentCredentials,
    ]);

    const datum = new Constr(0, [
      owner,
      delegationData?.length > 0 ? delegationData : new Constr(0, []),
    ]);
    return {
      cbor: Data.to(datum),
      hash: C.hash_plutus_data(
        C.PlutusData.from_bytes(Buffer.from(Data.to(datum), "hex"))
      )?.to_hex(),
      datum,
    };
  }

  /**
   * Builds the Swap datum.
   */
  buildSwapDatum({
    ident,
    orderAddresses,
    fundedAsset,
    swap,
    scooperFee,
  }: SwapArguments) {
    const datum = new Constr(0, [
      ident,
      this.buildOrderAddresses(orderAddresses).datum,
      this.buildScooperFee(scooperFee),
      this.buildSwapDirection(swap, fundedAsset.amount).datum,
    ]);

    return {
      cbor: Data.to(datum),
      hash: C.hash_plutus_data(
        C.PlutusData.from_bytes(Buffer.from(Data.to(datum), "hex"))
      )?.to_hex(),
      datum,
    };
  }

  /**
   * Builds the Deposit datum.
   */
  buildDepositDatum({
    ident,
    orderAddresses,
    deposit,
    scooperFee,
  }: DepositArguments) {
    const datum = new Constr(0, [
      ident,
      this.buildOrderAddresses(orderAddresses).datum,
      this.buildScooperFee(scooperFee),
      this.buildDepositPair(deposit).datum,
    ]);

    return {
      cbor: Data.to(datum),
      hash: C.hash_plutus_data(
        C.PlutusData.from_bytes(Buffer.from(Data.to(datum), "hex"))
      )?.to_hex(),
      datum,
    };
  }

  /**
   * Builds the Zap datum.
   */
  buildZapDatum({ ident, orderAddresses, zap, scooperFee }: ZapArguments) {
    const datum = new Constr(0, [
      ident,
      this.buildOrderAddresses(orderAddresses).datum,
      this.buildScooperFee(scooperFee),
      this.buildDepositZap(zap).datum,
    ]);

    return {
      cbor: Data.to(datum),
      hash: C.hash_plutus_data(
        C.PlutusData.from_bytes(Buffer.from(Data.to(datum), "hex"))
      )?.to_hex(),
      datum,
    };
  }

  /**
   * Builds the Withdraw datum.
   */
  buildWithdrawDatum({
    ident,
    orderAddresses,
    suppliedLPAsset,
    scooperFee,
  }: WithdrawArguments) {
    const datum = new Constr(0, [
      ident,
      this.buildOrderAddresses(orderAddresses).datum,
      this.buildScooperFee(scooperFee),
      this.buildWithdrawAsset(suppliedLPAsset).datum,
    ]);

    return {
      cbor: Data.to(datum),
      hash: C.hash_plutus_data(
        C.PlutusData.from_bytes(Buffer.from(Data.to(datum), "hex"))
      )?.to_hex(),
      datum,
    };
  }

  /**
   * Builds the fee for the Scoopers. Defaults to {@link Core.IProtocolParams.SCOOPER_FEE}
   * @param fee The custom fee if provided.
   * @returns
   */
  buildScooperFee(fee?: bigint): bigint {
    return fee ?? this.getParams().SCOOPER_FEE;
  }

  /**
   * Builds the pair of assets for depositing in the pool.
   * @param deposit A pair of assets that match CoinA and CoinB of the pool.
   * @returns
   */
  buildDepositPair(deposit: DepositMixed): DatumResult<Data> {
    const datum = new Constr(2, [
      new Constr(1, [
        new Constr(0, [deposit.CoinAAmount.amount, deposit.CoinBAmount.amount]),
      ]),
    ]);
    return {
      cbor: Data.to(datum),
      hash: C.hash_plutus_data(
        C.PlutusData.from_bytes(Buffer.from(Data.to(datum), "hex"))
      )?.to_hex(),
      datum,
    };
  }

  /**
   * Builds the atomic zap deposit of a single-sided pool deposit.
   * @param deposit A single deposit config of one side of a pool pair.
   * @returns
   */
  buildDepositZap(zap: DepositSingle): DatumResult<Data> {
    const datum = new Constr(2, [
      new Constr(zap.ZapDirection, [zap.CoinAmount.amount]),
    ]);
    return {
      cbor: Data.to(datum),
      datum,
    };
  }

  /**
   * Builds the LP tokens to send to the pool.
   * @param fundedLPAsset The LP tokens to send to the pool.
   */
  buildWithdrawAsset(fundedLPAsset: IAsset): DatumResult<Data> {
    const datum = new Constr(1, [fundedLPAsset.amount.amount]);

    return {
      cbor: Data.to(datum),
      hash: C.hash_plutus_data(
        C.PlutusData.from_bytes(Buffer.from(Data.to(datum), "hex"))
      )?.to_hex(),
      datum,
    };
  }

  /**
   * Builds the swap action against the pool.
   *
   * @param direction The direction of the swap against the pool.
   * @param amount The amount of the supplied asset we are sending to the pool.
   * @param minReceivable The minimum receivable amount we want (a.k.a limit price).
   * @returns
   */
  buildSwapDirection(swap: Swap, amount: AssetAmount) {
    const datum = new Constr(0, [
      new Constr(swap.SuppliedCoin, []),
      amount.amount,
      swap.MinimumReceivable
        ? new Constr(0, [swap.MinimumReceivable.amount])
        : new Constr(1, []),
    ]);

    return {
      cbor: Data.to(datum),
      hash: C.hash_plutus_data(
        C.PlutusData.from_bytes(Buffer.from(Data.to(datum), "hex"))
      )?.to_hex(),
      datum,
    };
  }

  /**
   * Builds the datum for the {@link Core.OrderAddresses} interface using a data
   * constructor class from the Lucid library.
   *
   * @param address
   * @returns
   */
  buildOrderAddresses(addresses: OrderAddresses) {
    LucidHelper.validateAddressAndDatumAreValid({
      address: addresses.DestinationAddress.address,
      datum: addresses.DestinationAddress?.datumHash,
      network: this.network,
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
      DestinationAddress?.datumHash
        ? new Constr(0, [DestinationAddress.datumHash])
        : new Constr(1, []),
    ]);

    const alternate =
      AlternateAddress && LucidHelper.getAddressHashes(AlternateAddress);
    const alternateDatum = new Constr(
      alternate ? 0 : 1,
      alternate ? [alternate.paymentCredentials] : []
    );

    const datum = new Constr(0, [destinationDatum, alternateDatum]);

    return {
      cbor: Data.to(datum),
      hash: C.hash_plutus_data(
        C.PlutusData.from_bytes(Buffer.from(Data.to(datum), "hex"))
      )?.to_hex(),
      datum,
    };
  }
}
