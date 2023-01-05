import type { IBuildSwapArgs, TSwapAsset } from "../../types";
import { IPoolData } from "../modules/Provider/Provider.abstract.class";

export class SwapConfig {
  private pool?: Omit<IPoolData, "fee">;
  private funding?: TSwapAsset;
  private receiverAddress?: string;

  static minAssetLength = 56;

  /**
   *
   * @param funding The asset which you are providing for the swap. The assetID should follow the format: policyID.assetName
   * @param assetA The concatenated assetID of the pool's.
   * @param assetB The second human-readable ticker name or concatenated assetID of the pool.
   * @param fee The desired fee of the pool you want to use.
   * @param receiverAddress Where you want assetB to be sent to.
   */
  constructor() {}

  setFunding(asset: TSwapAsset) {
    this.funding = asset;
    return this;
  }

  setPool(pool: Omit<IPoolData, "fee">) {
    this.pool = pool;
    return this;
  }

  setReceiverAddress(addr: string) {
    this.receiverAddress = addr;
    return this;
  }

  build(): IBuildSwapArgs {
    return {
      ...this.validateAndGetPool(),
      givenAsset: this.validateAndGetFunding(),
      receiverAddress: this.validateAndGetReceiverAddr(),
    };
  }

  private validateAndGetReceiverAddr(): string {
    if (!this.receiverAddress) {
      throw this.getPropertyDoesNotExistError("receiverAddress");
    }

    return this.receiverAddress;
  }

  private validateAndGetPool(): Omit<IPoolData, "fee"> {
    if (!this.pool) {
      throw this.getPropertyDoesNotExistError("pool");
    }

    if (!this.pool.ident) {
      throw this.getPropertyDoesNotExistError("ident", "setPool");
    }

    if (!this.pool.assetA) {
      throw this.getPropertyDoesNotExistError("assetA", "setPool");
    }

    if (!this.isValidAssetID(this.pool.assetA.assetId)) {
      throw this.getMinAssetLengthError(`assetA`, this.pool.assetA.assetId);
    }

    if (!this.pool.assetB) {
      throw this.getPropertyDoesNotExistError("assetB", "setPool");
    }

    if (!this.isValidAssetID(this.pool.assetB.assetId)) {
      throw this.getMinAssetLengthError(`assetB`, this.pool.assetB.assetId);
    }

    return this.pool;
  }

  private validateAndGetFunding(): TSwapAsset {
    if (!this.funding) {
      throw this.getPropertyDoesNotExistError("funding");
    }

    if (!this.isValidAssetID(this.funding.assetID)) {
      throw this.getMinAssetLengthError(`funding`, this.funding.assetID);
    }

    return this.funding;
  }

  private getPropertyDoesNotExistError(prop: string, method?: string): Error {
    return new Error(
      `The parameter does not exist: ${prop}. Use the set${
        method ?? prop
      }() method.`
    );
  }

  private getMinAssetLengthError(prop: string, asset: string): Error {
    return new Error(
      `The parameter should have a minimum length of ${SwapConfig.minAssetLength}: ${prop}. Received (${asset.length}) ${asset}`
    );
  }

  private isValidAssetID(assetID: string) {
    // Valid for ADA native currency.
    if (assetID === "") {
      return true;
    }

    if (assetID.length < SwapConfig.minAssetLength) {
      return false;
    }

    if (assetID.split("")?.[56] !== ".") {
      return false;
    }

    return true;
  }
}
