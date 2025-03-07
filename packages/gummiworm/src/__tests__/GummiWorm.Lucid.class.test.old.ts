// Convert this to Blaze.
export { };
// import { AssetAmount } from "@sundaeswap/asset";
// import {
//   ADA_METADATA,
//   ETxBuilderType,
//   SundaeSDK,
//   type ITxBuilderFees,
// } from "@sundaeswap/core";
// import { PREVIEW_DATA, setupLucid } from "@sundaeswap/core/testing";
// import { C } from "lucid-cardano";

// import { GummiWormLucid } from "../GummiWorm.Lucid.class.js";

// let GWInstance: GummiWormLucid;

// const { getUtxosByOutRefMock } = setupLucid(async (lucid) => {
//   const sdk = await SundaeSDK.new({
//     wallet: {
//       builder: {
//         lucid,
//         type: ETxBuilderType.LUCID,
//       },
//       name: "eternl",
//       network: "preview",
//     },
//   });

//   GWInstance = new GummiWormLucid(sdk);
// });

// afterEach(() => {
//   getUtxosByOutRefMock.mockReset();
// });

// describe("GummiWormLucid", () => {
//   it("should initiate with correct parameters", () => {
//     expect(GWInstance.network).toEqual("preview");
//     expect(GWInstance.getParam("contractAddress")).toEqual(
//       "addr_test1qzt4mu987ghxdfdhgp42ac57x5vjpyc6hm8gurkvmhldg6tgpzrz0ht2a8faz0waqgsf42pz8rdajr7tf83p08nkdmqqlak2wl",
//     );
//     expect(GWInstance.getParam("minLockAda")).toEqual(5_000_000n);
//   });

//   it("should correctly build an ADA deposit transaction", async () => {
//     const expectedDatum =
//       "d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ff";
//     const deposit = await GWInstance.deposit({
//       assets: [new AssetAmount(10_000_000n, ADA_METADATA)],
//     });

//     expect(deposit.datum).toEqual(expectedDatum);
//     expect(deposit.fees).toMatchObject<ITxBuilderFees>({
//       deposit: expect.objectContaining({
//         amount: GWInstance.getParam("minLockAda"),
//         metadata: ADA_METADATA,
//       }),
//       scooperFee: expect.objectContaining({
//         amount: 0n,
//         metadata: ADA_METADATA,
//       }),
//     });

//     const { builtTx } = await deposit.build();
//     const depositOutput = builtTx.txComplete.body().outputs().get(0);
//     expect(depositOutput.amount().coin().to_str()).toEqual(
//       (10_000_000n + GWInstance.getParam("minLockAda")).toString(),
//     );
//     expect(depositOutput.amount().multiasset()).toBeUndefined();
//     expect(
//       Buffer.from(
//         depositOutput.datum()?.as_data()?.get()?.to_bytes() as Uint8Array,
//       ).toString("hex"),
//     ).toEqual(expectedDatum);
//   });

//   it("should correctly build a SUNDAE deposit transaction", async () => {
//     const expectedDatum =
//       "d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ff";
//     const deposit = await GWInstance.deposit({
//       assets: [PREVIEW_DATA.assets.tindy],
//     });

//     expect(deposit.datum).toEqual(expectedDatum);
//     expect(deposit.fees).toMatchObject<ITxBuilderFees>({
//       deposit: expect.objectContaining({
//         amount: GWInstance.getParam("minLockAda"),
//         metadata: ADA_METADATA,
//       }),
//       scooperFee: expect.objectContaining({
//         amount: 0n,
//         metadata: ADA_METADATA,
//       }),
//     });

//     const { builtTx } = await deposit.build();
//     const depositOutput = builtTx.txComplete.body().outputs().get(0);

//     // Should include minLockAda
//     expect(depositOutput.amount().coin().to_str()).toEqual(
//       GWInstance.getParam("minLockAda").toString(),
//     );

//     // Should include the deposited asset.
//     const [policyId, assetName] =
//       PREVIEW_DATA.assets.tindy.metadata.assetId.split(".");
//     expect(
//       depositOutput
//         .amount()
//         .multiasset()
//         ?.get_asset(
//           C.ScriptHash.from_hex(policyId),
//           C.AssetName.new(Buffer.from(assetName, "hex")),
//         )
//         .to_str(),
//     ).toEqual(PREVIEW_DATA.assets.tindy.amount.toString());
//     expect(
//       Buffer.from(
//         depositOutput.datum()?.as_data()?.get()?.to_bytes() as Uint8Array,
//       ).toString("hex"),
//     ).toEqual(expectedDatum);
//   });
// });
