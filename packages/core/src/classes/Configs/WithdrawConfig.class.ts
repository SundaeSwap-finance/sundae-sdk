import {
  WithdrawConfigArgs,
  IAsset,
  IPoolData,
  IWithdrawArgs,
  OrderAddresses,
} from "../../@types";
import { Config } from "../Abstracts/Config.abstract.class";

/**
 * The `WithdrawConfig` class helps to properly format your withdraw arguments for use within {@link TxBuilder.buildWithdrawTx | TxBuilder.buildWithdrawTx}.
 *
 * @example
 *
 * ```ts
 * const config = new WithdrawConfig()
 *   .setPool( /** ...pool data... *\/)
 *   .setSuppliedLPAsset({
 *     assetId: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
 *     amount: new AssetAmount(20n, 6),
 *   })
 *   .setOrderAddresses({
 *      DestinationAddress: {
 *        address: "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32"
 *      }
 *   });
 *
 * const { submit, cbor } = await SDK.swap(config);
 * ```
 *
 * @see {@link SundaeSDK.withdraw}
 */
export class WithdrawConfig extends Config {
  suppliedLPAsset?: IAsset;

  constructor(args?: WithdrawConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  /**
   * Set the default arguments from a JSON object as opposed to individually.
   */
  setFromObject({
    suppliedLPAsset,
    orderAddresses,
    pool,
  }: WithdrawConfigArgs): void {
    this.setPool(pool);
    this.setOrderAddresses(orderAddresses);
    this.setSuppliedLPAsset(suppliedLPAsset);
  }

  /**
   * Set the funded asset of LP tokens.
   * @param asset
   * @returns
   */
  setSuppliedLPAsset(asset: IAsset) {
    this.suppliedLPAsset = asset;
    return this;
  }

  /**
   * Build a valid arguments object for a TxBuilder withdraw method.
   * @returns
   */
  buildArgs(): IWithdrawArgs {
    return {
      pool: this.pool as IPoolData,
      orderAddresses: this.orderAddresses as OrderAddresses,
      suppliedLPAsset: this.suppliedLPAsset as IAsset,
    };
  }

  /**
   * Validates the current config and throws an Error if any required item is not set.
   */
  validate(): void {
    super.validate();

    if (!this.suppliedLPAsset) {
      throw new Error(
        "There was no LP asset set! Set the LP token with .setSuppliedLPAsset()"
      );
    }
  }
}
