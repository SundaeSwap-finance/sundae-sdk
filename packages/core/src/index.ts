/**
 * # Introduction
 * The `@sundaeswap/core` package serves as the foundation for interacting with the SundaeSwap protocol in a predictable and declarative manner,
 * and includes all typings and class interfaces needed to both [Get Started](#get-started) and extending the API.
 * 
 * ## Get Started
 * To start with [Lucid](https://www.npmjs.com/package/lucid-cardano), install dependencies:
 * 
 * ```sh
 * yarn add lucid-cardano @sundaeswap/core
 * ```
 * 
 * If you plan to use this package in the browser along with Webpack 5, you'll need to add
 * polyfill support for Buffer. You can do this like so:
 * 
 * ```ts
 * plugins: {
 *   new webpack.ProvidePlugin({
 *     Buffer: ["buffer", "Buffer"]
 *   })
 * }
 * ```
 * 
 * Next, configure the instance in your app:
 * 
 * ```ts
 * import { SundaeSDK } from "@sundaeswap/core";
 * import {
 *  TxBuilderLucid,
 *  ProviderSundaeSwap
 * } from "@sundaeswap/core/extensions";
 * 
 * const txBuilder = new TxBuilderLucid(
 *  {
 *      wallet: "eternl",
 *      network: "preview",        
 *      provider: "blockfrost",
 *      blockfrost: {
 *          url: "https://cardano-preview.blockfrost.io/api/v0",
 *          apiKey: "YOUR_API_KEY"
 *      }
 *  },
 *  new ProviderSundaeSwap("preview")
 * );

 * const sdk: SundaeSDK = new SundaeSDK(txBuilder);
 * 
 * const txHash = await sdk.swap( /** ... *\/ ).then(({ submit }) => submit());
 * ```
 *
 * @module Core
 * @packageDocumentation
 */
export { DatumBuilder } from "./classes/Abstracts/DatumBuilder.abstract.class";
export { TxBuilder } from "./classes/Abstracts/TxBuilder.abstract.class";
export { CancelConfig } from "./classes/Configs/CancelConfig.class";
export { DepositConfig } from "./classes/Configs/DepositConfig.class";
export { FreezerConfig } from "./classes/Configs/FreezerConfig.class";
export { SwapConfig } from "./classes/Configs/SwapConfig.class";
export { WithdrawConfig } from "./classes/Configs/WithdrawConfig.class";
export { ZapConfig } from "./classes/Configs/ZapConfig.class";
export { SundaeSDK } from "./classes/SundaeSDK.class";
export { Utils } from "./classes/Utils.class";

export * from "./@types";
