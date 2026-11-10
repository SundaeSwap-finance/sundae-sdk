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
  /**
   * Base URLs of the CIP-0198 services an order placed as a sub-transaction
   * is offered to, such as `https://ces.example/api/cardano`.
   *
   * @experimental CIP-0118 is not live on mainnet; this API may change.
   */
  offerServices?: string[];
}

export * from "./configs.js";
export * from "./datumbuilder.js";
export * from "./queryprovider.js";
export * from "./txbuilders.js";
export * from "./utilities.js";
