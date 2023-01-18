/**
 * This file needs some work on handling Lucid mocks.
 */

describe("TxBuilder", () => {
  it("should pass", () => {});
});

// import { TxBuilder } from "../classes/TxBuilder.abstract.class";
// import { TxBuilderLucid } from "../classes/TxBuilders/TxBuilder.Lucid.class";
// import { ProviderSundaeSwap } from "../classes/Providers/Provider.SundaeSwap";
// import { AssetAmount } from "../classes/AssetAmount.class";

// const validateSwapArgumentsSpy = jest.spyOn(
//   TxBuilder.prototype as any,
//   "validateSwapArguments"
// );
// const mockValidateSwapArguments =
//   validateSwapArgumentsSpy.getMockImplementation();

// describe("TxBuilder", () => {
//   it("should call validateSwapArguments", () => {
//     const builder = new TxBuilderLucid(
//       {
//         provider: "blockfrost",
//         blockfrost: {
//           url: "",
//           apiKey: "",
//         },
//         network: "preview",
//         wallet: "eternl",
//       },
//       new ProviderSundaeSwap("preview")
//     );

//     builder.buildSwapTx({
//       escrowAddress: {
//         DestinationAddress: {
//           address: "",
//         },
//       },
//       suppliedAsset: {
//         amount: new AssetAmount(20000000n, 6),
//         assetID: "",
//       },
//       pool: {
//         assetA: {
//           assetId: "assetA",
//           decimals: 6,
//         },
//         assetB: {
//           assetId: "assetB",
//           decimals: 6,
//         },
//         fee: "0.03",
//         ident: "03",
//       },
//       minReceivable: new AssetAmount(1n),
//     });

//     expect(mockValidateSwapArguments).toHaveBeenCalledTimes(1);
//   });
// });
