import { IBuildSwapArgs, IPoolData, IPoolQuery } from ".";

/**
 * Arguments
 */
export interface ISDKSwapArgs
  extends Pick<IBuildSwapArgs, "orderAddresses" | "suppliedAsset"> {
  poolQuery?: IPoolQuery;
  pool?: IPoolData;
}
