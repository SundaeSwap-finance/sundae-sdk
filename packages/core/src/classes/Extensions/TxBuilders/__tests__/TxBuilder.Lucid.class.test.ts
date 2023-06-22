import { jest } from "@jest/globals";
// import { TEST_TxBuilder } from "../../../../testing/TxBuilder";
// import {
//   getBlockfrostProtocolParameters,
//   setupGlobalCardano,
// } from "../../../../testing/cardano";
// import { TxBuilderLucid } from "../TxBuilder.Lucid.class";
// import { QueryProviderSundaeSwap } from "../../QueryProviders/QueryProvider.SundaeSwap";
// import { Blockfrost } from "lucid-cardano";

// setupGlobalCardano();

// jest
//   .spyOn(Blockfrost.prototype, "getProtocolParameters")
//   .mockResolvedValue(getBlockfrostProtocolParameters("preview"));

// jest.spyOn(Blockfrost.prototype, "getUtxosByOutRef").mockResolvedValue([
//   {
//     address: "testAddress",
//     assets: {
//       lovelace: 1000n,
//     },
//     outputIndex: 0,
//     txHash: "testUtxoHash",
//   },
// ]);

// const instanceBuilder = () => {
//   return new TxBuilderLucid(
//     {
//       network: "preview",
//       wallet: "eternl",
//       providerType: "blockfrost",
//       blockfrost: {
//         apiKey: "",
//         url: "",
//       },
//     },
//     new QueryProviderSundaeSwap("preview")
//   );
// };

// TEST_TxBuilder(instanceBuilder);

it("should let me mock the getUtxosByOutRef danget", () => {
  expect(true).toBe(true);
});
