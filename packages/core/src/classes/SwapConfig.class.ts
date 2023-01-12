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
 */
export class SwapConfig {
  private poolQuery?: IPoolQuery;
  private pool?: IPoolData;
  private funding?: IAsset;
  private receiverAddress?: string;

  static minAssetLength = 56;
  constructor() {}

  setFunding(asset: IAsset) {
    this.funding = asset;
    return this;
  }

  setPool(pool: IPoolData) {
    this.pool = pool;
    return this;
  }

  setPoolQuery(poolQuery: IPoolQuery) {
    this.poolQuery = poolQuery;
    return this;
  }

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

  buildSwap(): ISwapArgs {
    return {
      poolQuery: this.validateAndGetPoolQuery(),
      suppliedAsset: this.validateAndGetFunding(),
      receiverAddress: this.validateAndGetReceiverAddr(),
    };
  }

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
