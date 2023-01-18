import { IBuildSwapArgs, IPoolData, IPoolQuery } from ".";

/**
 * Arguments
 */
export interface ISDKSwapArgs
  extends Pick<IBuildSwapArgs, "escrowAddress" | "suppliedAsset"> {
  poolQuery?: IPoolQuery;
  pool?: IPoolData;
}
