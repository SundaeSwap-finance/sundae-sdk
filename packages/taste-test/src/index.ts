/**
 * # Introduction
 * The `@sundaeswap/taste-test` package serves as an additional API by which clients can interact with existing SundaeSwap Taste Tests.
 * 
 * ## Get Started
 * To start with [Lucid](https://www.npmjs.com/package/lucid-cardano), install dependencies:
 * 
 * ```sh
 * yarn add lucid-cardano @sundaeswap/core @sundaeswap/taste-test
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
 * import {
 *  TxBuilderLucid,
 *  ProviderSundaeSwap
 * } from "@sundaeswap/core/extensions";
 * import { SundaeSDK } from "@sundaeswap/core";
 * import { TasteTest } from "@sundaeswap/taste-test"
 * import type { Lucid } from "lucid-cardano";
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
 * const walletInstance = txBuilder.build<unknown, Lucid>().wallet;
 * let tt: TasteTest | undefined;
 * if (walletInstance) {
 *   tt = new TasteTest(txBuilder.build<unknown, Lucid>().wallet)
 * }
 * 
 * tt?.deposit({ ...args });
 * ```
 *
 * @module TasteTest
 * @packageDocumentation
 */
export { TasteTest } from "./TasteTest.class";
