import {
  Data,
  Constr,
  getAddressDetails,
  C,
  AddressDetails,
} from "lucid-cardano";
import { AssetAmount } from "../../../classes/AssetAmount.class";

import {
  DatumResult,
  DepositArguments,
  DepositMixed,
  DepositSingle,
  IAsset,
  OrderAddresses,
  Swap,
  SwapArguments,
  TSupportedNetworks,
  WithdrawArguments,
  ZapArguments,
} from "../../../@types";
import { DatumBuilder } from "../../Abstracts/DatumBuilder.abstract.class";

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
        new Constr(0, [
          deposit.CoinAAmount.getAmount(),
          deposit.CoinBAmount.getAmount(),
        ]),
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
      new Constr(zap.ZapDirection, [zap.CoinAmount.getAmount()]),
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
      amount.getAmount(),
      swap.MinimumReceivable
        ? new Constr(0, [swap.MinimumReceivable.getAmount()])
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
    this._validateAddressesAreValid(addresses);
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
      hash: C.hash_plutus_data(
        C.PlutusData.from_bytes(Buffer.from(Data.to(datum), "hex"))
      )?.to_hex(),
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
        "Invalid address. Make sure you are using a Bech32 encoded address that includes the payment key."
      );
    }

    return {
      paymentCredentials: details.paymentCredential.hash,
      stakeCredentials: details.stakeCredential?.hash,
    };
  }

  /**
   * Validates the {@link Core.OrderAddresses} arguments as being valid Cardano address strings
   * and that they are on the correct network.
   */
  private _validateAddressesAreValid(orderAddresses: OrderAddresses) {
    this._validateAddressNetwork(orderAddresses);

    const address = orderAddresses.DestinationAddress.address;
    const datumHash = orderAddresses.DestinationAddress.datumHash;

    // Ensure that the address can be serialized.
    const realAddress = C.Address.from_bech32(address);

    // Ensure the datumHash is valid HEX if the address is a script.
    const isScript = (realAddress.to_bytes()[0] & 0b00010000) !== 0;
    if (isScript) {
      if (datumHash) {
        try {
          C.DataHash.from_hex(datumHash);
        } catch (e) {
          DatumBuilder.throwInvalidOrderAddressesError(
            orderAddresses,
            `The datumHash provided was not a valid hex string. Original error: ${JSON.stringify(
              {
                datumHash,
                originalErrorMessage: (e as Error).message,
              }
            )}`
          );
        }
      } else {
        DatumBuilder.throwInvalidOrderAddressesError(
          orderAddresses,
          `The DestinationAddress is a Script Address, a Datum hash was not supplied. This will brick your funds! Supply a valid DatumHash with your DestinationAddress to proceed.`
        );
      }
    }
  }

  /**
   * Validates that the {@link Core.OrderAddresses} provided match the instance's network.
   */
  private _validateAddressNetwork(
    orderAddresses: OrderAddresses
  ): void | never {
    const destination = orderAddresses.DestinationAddress.address;
    const alternate = orderAddresses.AlternateAddress;

    let destinationDetails: AddressDetails;
    let alternateDetails: AddressDetails | undefined;
    try {
      destinationDetails = getAddressDetails(destination);
      if (alternate) {
        alternateDetails = getAddressDetails(alternate);
      }
    } catch (e) {
      DatumBuilder.throwInvalidOrderAddressesError(
        orderAddresses,
        (e as Error).message
      );
    }

    // Validate DestinationAddress
    this._maybeThrowDestinationNetworkError(
      destinationDetails.networkId,
      destination,
      orderAddresses
    );

    // Validate AlternateAddress
    if (alternate && alternateDetails) {
      this._maybeThrowDestinationNetworkError(
        alternateDetails.networkId,
        alternate,
        orderAddresses
      );
    }
  }

  /**
   * Throws an error if either of the OrderAddresses are on the wrong network.
   * @param addressNetwork
   * @param address
   * @param orderAddresses
   */
  private _maybeThrowDestinationNetworkError(
    addressNetwork: number,
    address: string,
    orderAddresses: OrderAddresses
  ): never | void {
    if (addressNetwork !== 1 && this.network === "mainnet") {
      DatumBuilder.throwInvalidOrderAddressesError(
        orderAddresses,
        `The given address is not a Mainnet Network address: ${address}.`
      );
    } else if (addressNetwork !== 0) {
      DatumBuilder.throwInvalidOrderAddressesError(
        orderAddresses,
        `The given address is not a (Preview/Testnet/PreProd) Network address: ${address}.`
      );
    }
  }
}
