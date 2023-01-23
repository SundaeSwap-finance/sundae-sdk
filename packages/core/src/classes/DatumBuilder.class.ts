import {
  DatumResult,
  DepositArguments,
  DepositMixed,
  OrderAddresses,
  Swap,
  SwapArguments,
  TSupportedNetworks,
} from "../@types";
import { AssetAmount } from "./AssetAmount.class";
import { Utils } from "./Utils.class";

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
   * Should build a Datum for Swap transaction.
   * @param args The Swap arguments.
   */
  abstract buildSwapDatum(args: SwapArguments): DatumResult<Data>;

  /**
   * Should build a Datum for a Deposit transaction.
   * @param args The Deposit arguments.
   */
  abstract buildDepositDatum(args: DepositArguments): DatumResult<Data>;

  abstract buildScooperFee(fee: bigint): bigint;
  abstract buildDepositPair(deposit: DepositMixed): DatumResult<Data>;
  abstract buildOrderAddresses(addresses: OrderAddresses): DatumResult<Data>;
  abstract buildSwapDirection(
    swap: Swap,
    amount: AssetAmount
  ): DatumResult<Data>;

  getParams() {
    return Utils.getParams(this.network);
  }

  protected validateScooperFee() {}
}
