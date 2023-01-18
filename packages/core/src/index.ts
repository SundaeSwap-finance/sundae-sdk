/**
 * # Introduction
 * The `@sundae/sdk-core` package serves as the foundation for interacting with the SundaeSwap protocol in a predictable and declarative manner,
 * and includes all typings and class interfaces needed to both [Get Started](#get-started) and extending the API.
 * 
 * ## Get Started
 * To start with [Lucid](https://www.npmjs.com/package/lucid-cardano), install dependencies:
 * 
 * ```sh
 * yarn add lucid-cardano @sundae/sdk-core
 * ```
 * 
 * Next, configure the instance in your app:
 * 
 * ```ts
 * import {
 *     SundaeSDK,
 *     ITxBuilderClass,
 *     TxBuilderLucid,
 *     ProviderSundaeSwap
 * } from "@sundae/sdk-core";
 * 
 * const txBuilder: ITxBuilderClass = new TxBuilderLucid(
 *     {
 *         provider: "blockfrost",
 *         blockfrost: {
 *             url: "https://cardano-preview.blockfrost.io/api/v0",
 *             apiKey: "YOUR_API_KEY"
 *         }
 *     },
 *     new ProviderSundaeSwap("preview")
 * )

 * const sdk: SundaeSDK = new SundaeSDK(txBuilder);
 * 
 * const swap = sdk.swap( /** ... *\/ );
 * ```
 *
 * @packageDocumentation
 */
export { SundaeSDK } from "./classes/SundaeSDK.class";
export { AssetAmount } from "./classes/AssetAmount.class";
export { SwapConfig } from "./classes/SwapConfig.class";
export { ProviderSundaeSwap } from "./classes/Providers/Provider.SundaeSwap";
export { TxBuilder } from "./classes/TxBuilders/TxBuilder.abstract.class";

export {
  TxBuilderLucid,
  ITxBuilderLucidOptions,
} from "./classes/TxBuilders/TxBuilder.Lucid.class";

export * from "./@types";
