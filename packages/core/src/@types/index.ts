import { Blaze, Provider, Wallet } from "@blaze-cardano/sdk";
import type { QueryProvider } from "../Abstracts/QueryProvider.abstract.class.js";

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
  /** A built blaze instance. */
  blazeInstance: Blaze<Provider, Wallet>;
}

export * from "./configs.js";
export * from "./datumbuilder.js";
export * from "./queryprovider.js";
export * from "./txbuilders.js";
export * from "./utilities.js";
