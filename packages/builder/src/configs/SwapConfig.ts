import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { IPoolData } from "../@types/queryprovider.js";

/**
 * An enum to represent a Swap order type.
 */
export enum ESwapType {
  MARKET = "MARKET",
  LIMIT = "LIMIT",
}

/**
 * An interface that represents a market order
 * swap with required slippage.
 */
export interface IMarketSwap {
  type: ESwapType.MARKET;
  slippage: number;
}

/**
 * An interface that represents a limit order
 * swap with required minimum receivable.
 */
export interface ILimitSwap {
  type: ESwapType.LIMIT;
  minReceivable: AssetAmount<IAssetAmountMetadata>;
}

/**
 * A union type to represent all possible swap types.
 */
export type TSwapType = IMarketSwap | ILimitSwap;

/**
 * The arguments configuration for building a valid Swap.
 */
export interface ISwapConfigArgs {
  pool: IPoolData;
  suppliedAsset: AssetAmount<IAssetAmountMetadata>;
  swapType: TSwapType;
}

export class SwapConfig {
  constructor(private args: ISwapConfigArgs) {
    this.validate();
  }

  getArgs(): ISwapConfigArgs {
    return this.args;
  }

  validate(): void | never {
    // Validation logic.
  }
}
