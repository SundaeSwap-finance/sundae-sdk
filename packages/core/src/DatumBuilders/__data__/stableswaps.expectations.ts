import { PREVIEW_DATA } from "../../TestUtilities/mockData.js";
import { IDatumBuilderMintStablePoolArgs } from "../DatumBuilder.Stableswaps.class.js";

const defaultMintPoolArgs: IDatumBuilderMintStablePoolArgs = {
  assetA: PREVIEW_DATA.assets.tada,
  assetB: PREVIEW_DATA.assets.tindy,
  fees: {
    bid: 5n,
    ask: 5n,
  },
  protocolFees: {
    bid: 5n,
    ask: 5n,
  },
  marketOpen: 123n,
  depositFee: 2_000_000n,
  seedUtxo: {
    txHash: "598d48e74d2aec716c1c8c889b34d77b9e0f5240dbee805c23267c2f1f97cc11",
    outputIndex: 1,
  },
  linearAmplification: 200n,
};

export const STABLESWAP_EXPECTATIONS = {
  buildMintPoolDatum: [
    {
      args: defaultMintPoolArgs,
      expectations: {
        calledWith: [1, defaultMintPoolArgs.seedUtxo],
        returnedWith: [
          1,
          "82f70fd1663b2b6f4250d6054fe4cac8c815d9eef8b38f68bbe22c92",
        ],
        buildLexicographicalAssetsDatumCalls: 1,
        inline:
          "d8799f581c82f70fd1663b2b6f4250d6054fe4cac8c815d9eef8b38f68bbe22c929f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a02625a009f0505ff9f0505ffd87a80187b9f1a001e84800000ff18c8c249022b1c8c1227a00000d87a80ff",
        hash: "3a5a2ebb9a9e5a525d2b9fcbec68e86b136d9695460238ad0126e8ca7a88843c",
        sumInvariant: 40000000000000000000n,
      },
    },
  ],
  protocolFeesFromSettingsDatum: [
    {
      settingsDatum:
        "d8799fd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd8799fd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd87a80ffd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd8799fd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd87a80ff9f010affd8799f9f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffff9fd87a9f581ccc27980a8557fe9db2c9ac0a2677f4d1306dbf10689983758f0b8dbeffd8799f581cbc10fe312acd69e2e12cbc2cca05aa0e432e3dee65d5a9498344e4aaffff1a000510e01a000290401a0002904000a100d8799f9f0505ffffff",
      expectations: {
        protocolFees: {
          bid: 5n,
          ask: 5n,
        },
      },
    },
  ],
};
