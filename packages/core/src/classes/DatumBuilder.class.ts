import {
  DatumResult,
  IAsset,
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

  abstract buildSwapDatum(
    args: SwapArguments,
    fundedAsset: IAsset,
    scooperFee?: bigint
  ): DatumResult<Data>;
  abstract buildOrderAddresses(addresses: OrderAddresses): DatumResult<Data>;
  abstract buildSwapDirection(
    swap: Swap,
    amount: AssetAmount
  ): DatumResult<Data>;

  getParams() {
    return Utils.getParams(this.network);
  }
}
