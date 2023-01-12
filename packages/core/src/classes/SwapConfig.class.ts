import {
  IBuildSwapArgs,
  IPoolData,
  IAsset,
  IPoolQuery,
  ISwapArgs,
} from "../@types";

/**
 * The `SwapConfig` class helps to properly format your swap arguments for use within the {@link SundaeSDK}.
 *
 *
 * @example
 *
 * ```ts
 * const config = new SwapConfig()
 *   .setPoolQuery(poolQuery)
 *   .setFunding({
 *     assetID: "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
 *     amount: new AssetAmount(20n, 6),
 *   })
 *   .setReceiverAddress(
 *     "addr_test1qzrf9g3ea6hzgpnlkm4dr48kx6hy073t2j2gssnpm4mgcnqdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzsfd9r32"
 *   );
 *
 * const { submit, cbor } = await SDK.swap(config);
 * ```
 *
 * @see {@link SundaeSDK.swap}
 */
export class SwapConfig {
  private poolQuery?: IPoolQuery;
  private pool?: IPoolData;
  private funding?: IAsset;
  private receiverAddress?: string;

  static minAssetLength = 56;
  constructor() {}

  /**
   * Set the funding for the swap.
   *
   * @param asset The provided asset and amount from a connected wallet.
   * @returns
   */
  setFunding(asset: IAsset) {
    this.funding = asset;
    return this;
  }

  /**
   * Set the pool data directly for the swap you use.
   *
   * @param pool
   * @returns
   */
  setPool(pool: IPoolData) {
    this.pool = pool;
    return this;
  }

  /**
   * Set the pool query. Used when passing to {@link SundaeSDK.swap}.
   *
   * @param poolQuery
   * @returns
   */
  setPoolQuery(poolQuery: IPoolQuery) {
    this.poolQuery = poolQuery;
    return this;
  }

  /**
   * Set where the pool's other asset should be sent to after a successful scoop.
   *
   * @param addr
   * @returns
   */
  setReceiverAddress(addr: string) {
    this.receiverAddress = addr;
    return this;
  }

  getFunding() {
    return this.funding;
  }

  getPool() {
    return this.pool;
  }

  getPoolQuery() {
    return this.poolQuery;
  }

  getReceiverAddress() {
    return this.receiverAddress;
  }

  /**
   * Used for building a swap where you don't know the pool data.
   *
   * @see {@link SundaeSDK.swap}
   *
   * @returns
   */
  buildSwap(): ISwapArgs {
    return {
      poolQuery: this.validateAndGetPoolQuery(),
      suppliedAsset: this.validateAndGetFunding(),
      receiverAddress: this.validateAndGetReceiverAddr(),
    };
  }

  /**
   * Used for building a swap where you **do** know the pool data.
   * Useful for when building Transactions directly from the builder instance.
   *
   * @see {@link ITxBuilderClass.buildSwap}
   *
   * @returns
   */
  buildRawSwap(): IBuildSwapArgs {
    return {
      pool: this.validateAndGetPool(),
      suppliedAsset: this.validateAndGetFunding(),
      receiverAddress: this.validateAndGetReceiverAddr(),
    };
  }

  private validateAndGetReceiverAddr(): string {
    if (!this.receiverAddress) {
      throw this.getPropertyDoesNotExistError("receiverAddress");
    }

    return this.receiverAddress;
  }

  private validateAndGetPoolQuery(): IPoolQuery {
    if (!this.poolQuery) {
      throw this.getPropertyDoesNotExistError("poolQuery", "setPoolQuery");
    }

    if (!this.poolQuery.fee) {
      throw this.getPropertyDoesNotExistError("fee", "setPoolQuery");
    }

    if (!this.poolQuery.pair || this.poolQuery.pair.length !== 2) {
      throw new Error(
        "Malformed query pair. Please ensure that your pair is represented as an 2-index array of AssetID strings."
      );
    }

    return this.poolQuery;
  }

  private validateAndGetPool(): IPoolData {
    if (!this.pool) {
      throw this.getPropertyDoesNotExistError("pool", "setPool");
    }

    if (!this.pool.ident) {
      throw this.getPropertyDoesNotExistError("ident", "setPool");
    }

    if (!this.pool.assetA) {
      throw this.getPropertyDoesNotExistError("assetA", "setPool");
    }

    if (!this.pool.assetB) {
      throw this.getPropertyDoesNotExistError("assetB", "setPool");
    }

    this.validateAssetID(this.pool.assetA.assetId);
    this.validateAssetID(this.pool.assetB.assetId);

    return this.pool;
  }

  private validateAndGetFunding(): IAsset {
    if (!this.funding) {
      throw this.getPropertyDoesNotExistError("funding");
    }

    this.validateAssetID(this.funding.assetID);

    return this.funding;
  }

  private getPropertyDoesNotExistError(prop: string, method?: string): Error {
    return new Error(
      `The parameter does not exist: ${prop}. Use the ${
        method ? method : `set${prop}`
      }() method.`
    );
  }

  private getMinAssetLengthError(prop: string, asset: string): Error {
    return new Error(
      `The parameter should have a minimum length of ${SwapConfig.minAssetLength}: ${prop}. Received (${asset.length}) ${asset}`
    );
  }

  private validateAssetID(assetID: string) {
    // Valid for ADA native currency.
    if (assetID === "") {
      return;
    }

    if (assetID.length < SwapConfig.minAssetLength) {
      throw this.getMinAssetLengthError("assetID", assetID);
    }

    if (assetID.split("")?.[56] !== ".") {
      throw new Error(
        `Invalid assetID: ${assetID}. You likely forgot to concatenate with a period, like so: ${assetID.slice(
          0,
          56
        )}.${assetID.slice(56)}`
      );
    }
  }
}
