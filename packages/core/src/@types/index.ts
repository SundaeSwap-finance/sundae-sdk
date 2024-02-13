import { QueryProvider } from "../Abstracts/QueryProvider.abstract.class.js";
import { TWalletBuilder } from "./txbuilders.js";
import { TSupportedWallets } from "./utilities.js";

/**
 * The SundaeSDK options argument when creating a new instance.
 */
export interface ISundaeSDKOptions {
  /** An optional custom QueryProvider for general protocol queries. */
  customQueryProvider?: QueryProvider;
  /** Whether to allow debugging console logs. */
  debug?: boolean;
  /** The minimum amount of ADA required for a locking position. */
  minLockAda?: bigint;
  /** The wallet options. */
  wallet: {
    /** A CIP-30 compatible wallet. */
    name: TSupportedWallets;
    /** The desired network. */
    network: "preview" | "mainnet";
    /** The type of builder to use. Currently only supports Lucid. */
    builder: TWalletBuilder;
  };
}

export * from "./configs.js";
export * from "./datumbuilder.js";
export * from "./queryprovider.js";
export * from "./txbuilders.js";
export * from "./utilities.js";
