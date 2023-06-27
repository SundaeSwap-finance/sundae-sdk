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
} from "../../@types";
import { AssetAmount } from "@sundaeswap/asset";
import { Utils } from "../Utils.class";

/**
 * The main builder interface for constructing valid Datums
 * for SundaeSwap protocol transactions.
 *
 * **NOTE**: Be careful when building custom representations of this,
 * as invalid datum constructs can brick user funds!
 *
 * To accurately create a custom DatumBuilder, refer to our Jest testing helper
 * methods exported to easily ensure your builder is outputting the correct hex-encoded
 * CBOR strings.
 */
export abstract class DatumBuilder<Data = any> {
  abstract network: TSupportedNetworks;

  /**
   * Should take a valid Datum structure or hex-encoded CBOR string of a valid Datum and convert it to a hash.
   * This is primarily used for testing but is a useful utility.
   * @param datum The Data representation or hex-encoded CBOR string of the datum.
   */
  abstract datumToHash(datum: Data | string): string;

  /**
   * Should parse the given datum cbor and extract the {@link DestinationAddress} from it.
   * @param datum The hex-encoded CBOR string of the datum.
   */
  abstract getDestinationAddressFromCBOR(datum: string): string;

  /**
   * Should build a Datum for Swap transaction.
   * @param args The Swap arguments.
   */
  abstract buildSwapDatum(args: SwapArguments): DatumResult<Data>;

  /**
   * Should build a Datum for a Deposit transaction.
   * @param args The Deposit arguments.
   */
  abstract buildDepositDatum(args: DepositArguments): DatumResult<Data>;

  /**
   * Should build a Datum for a Zap transaction.
   * @param args
   */
  abstract buildZapDatum(args: ZapArguments): DatumResult<Data>;

  /**
   * Should build a Datum for a Withdraw transaction.
   * @param args The Withdraw arguments.
   */
  abstract buildWithdrawDatum(args: WithdrawArguments): DatumResult<Data>;

  abstract buildLockDatum(args: LockArguments): DatumResult<Data>;

  abstract buildScooperFee(fee: bigint): bigint;
  abstract buildWithdrawAsset(fundedLPAsset: IAsset): DatumResult<Data>;
  abstract buildDepositPair(deposit: DepositMixed): DatumResult<Data>;
  abstract buildDepositZap(deposit: DepositSingle): DatumResult<Data>;
  abstract buildOrderAddresses(addresses: OrderAddresses): DatumResult<Data>;
  abstract buildSwapDirection(
    swap: Swap,
    amount: AssetAmount
  ): DatumResult<Data>;

  getParams() {
    return Utils.getParams(this.network);
  }

  /**
   * This must be called when an invalid address is supplied to the buildOrderAddresses method.
   * While there is no way to enforce this from being called, it will fail tests unless invalid addresses cause the error
   * to be thrown.
   *
   * @see {@link Testing}
   * @param orderAddresses
   * @param errorMessage
   */
  static throwInvalidOrderAddressesError(
    orderAddresses: OrderAddresses,
    errorMessage: string
  ): never {
    throw new Error(
      `You supplied invalid OrderAddresses: ${JSON.stringify(
        orderAddresses
      )}. Please check your arguments and try again. Error message from DatumBuilder: ${errorMessage}`
    );
  }
}
