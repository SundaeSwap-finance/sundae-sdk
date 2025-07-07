import {
  Blaze,
  TxBuilder as BlazeTx,
  Core,
  Provider,
  Wallet
} from "@blaze-cardano/sdk";
import { ICancelConfigArgs, IMintPoolConfigArgs } from "../@types/configs.js";
import { IComposedTx } from "../@types/txbuilders.js";
import { DatumBuilderV3 } from "../DatumBuilders/DatumBuilder.V3.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/index.js";
import { TxBuilderV1 } from "./TxBuilder.V1.class.js";
import { TxBuilderV3Like } from "./TxBuilder.V3Like.class.js";


/**
 * `TxBuilderBlazeV3` is a class extending `TxBuilder` to support transaction construction
 * for Blaze against the V3 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
 * such as swaps, cancellations, updates, deposits, withdrawals, and zaps.
 *
 * @extends {TxBuilderV3Like}
 */
export class TxBuilderV3 extends TxBuilderV3Like {
  datumBuilder: DatumBuilderV3;

  constructor(
    public blaze: Blaze<Provider, Wallet>,
    queryProvider?: QueryProviderSundaeSwap) {
    super(blaze, queryProvider);
    this.datumBuilder = new DatumBuilderV3(this.network);
  }
  async mintPool(args: IMintPoolConfigArgs): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    return super.mintPool(args);
  }

  async handleOtherOrderTypeCancellation(cancelArgs: ICancelConfigArgs) {
    const v1Builder = new TxBuilderV1(this.blaze);
    return v1Builder.cancel({ ...cancelArgs });
  }
}
