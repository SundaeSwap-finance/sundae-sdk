import { ZapConfigArgs } from "./configs";

/**
 * The arguments for a Zap when calling from the top-level {@link SundaeSDK}.
 */
export interface SDKZapArgs extends Omit<ZapConfigArgs, "zapDirection"> {}
