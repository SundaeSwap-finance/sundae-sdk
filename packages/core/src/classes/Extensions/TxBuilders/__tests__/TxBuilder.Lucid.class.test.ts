import { Extensions, MockWalletApi } from "../../../../testing";
MockWalletApi();

import { ProviderSundaeSwap, TxBuilderLucid } from "../../../../extensions";

describe("placeholder", () => {
  it("should pass", () => {});
});

// TODO: debug mocking Lucid
// Extensions.TEST_TxBuilder(
//   () =>
//     new TxBuilderLucid(
//       {
//         network: "preview",
//         providerType: "blockfrost",
//         wallet: "eternl",
//         blockfrost: {
//           apiKey: "",
//           url: "",
//         },
//       },
//       new ProviderSundaeSwap("preview")
//     )
// );
