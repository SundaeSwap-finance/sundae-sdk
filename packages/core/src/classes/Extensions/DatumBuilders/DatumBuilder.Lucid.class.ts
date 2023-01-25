import { Data, Constr, getAddressDetails } from "lucid-cardano";
import { AssetAmount } from "../../../classes/AssetAmount.class";

import {
  DatumResult,
  DepositArguments,
  DepositMixed,
  IAsset,
  OrderAddresses,
  Swap,
  SwapArguments,
  TSupportedNetworks,
  WithdrawArguments,
} from "../../../@types";
import { DatumBuilder } from "../../Abstracts/DatumBuilder.abstract.class";

export class DatumBuilderLucid extends DatumBuilder<Data> {
  constructor(public network: TSupportedNetworks) {
    super();
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
      datum,
    };
  }

  /**
   * Builds the fee for the Scoopers. Defaults to {@link IProtocolParams.SCOOPER_FEE}
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
        new Constr(0, [
          deposit.CoinAAmount.getAmount(),
          deposit.CoinBAmount.getAmount(),
        ]),
      ]),
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
    const datum = new Constr(1, [fundedLPAsset.amount.getAmount()]);

    return {
      cbor: Data.to(datum),
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
      amount.getAmount(),
      swap.MinimumReceivable
        ? new Constr(0, [swap.MinimumReceivable.getAmount()])
        : new Constr(1, []),
    ]);

    return {
      cbor: Data.to(datum),
      datum,
    };
  }

  /**
   * Builds the datum for the {@link OrderAddresses} interface using a data
   * constructor class from the Lucid library.
   *
   * @param address
   * @returns
   */
  buildOrderAddresses(addresses: OrderAddresses) {
    const { DestinationAddress, AlternateAddress } = addresses;
    const destination = this._getAddressHashes(DestinationAddress.address);

    const destinationDatum = new Constr(0, [
      new Constr(0, [
        new Constr(0, [destination.paymentCredentials]),
        destination?.stakeCredentials
          ? new Constr(0, [
              new Constr(0, [new Constr(0, [destination?.stakeCredentials])]),
            ])
          : new Constr(1, []),
      ]),
      DestinationAddress?.datumHash
        ? new Constr(0, [DestinationAddress.datumHash])
        : new Constr(1, []),
    ]);

    const alternate =
      AlternateAddress && this._getAddressHashes(AlternateAddress);
    const alternateDatum = new Constr(
      alternate ? 0 : 1,
      alternate ? [alternate.paymentCredentials] : []
    );

    const datum = new Constr(0, [destinationDatum, alternateDatum]);

    return {
      cbor: Data.to(datum),
      datum,
    };
  }

  /**
   * Helper function to parse addresses hashses from a Bech32 or hex encoded address.
   * @param address
   * @returns
   */
  private _getAddressHashes(address: string): {
    paymentCredentials: string;
    stakeCredentials?: string;
  } {
    const details = getAddressDetails(address);

    if (!details.paymentCredential) {
      throw new Error(
        "Invalid address. Make sure you are using a Bech32 encoded address."
      );
    }

    return {
      paymentCredentials: details.paymentCredential.hash,
      stakeCredentials: details.stakeCredential?.hash,
    };
  }
}
