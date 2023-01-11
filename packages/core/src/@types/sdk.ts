import { IBuildSwapArgs, IPoolQuery } from ".";

/**
 * Arguments
 */
export interface ISwapArgs extends Omit<IBuildSwapArgs, "pool"> {
  poolQuery: IPoolQuery;
}
