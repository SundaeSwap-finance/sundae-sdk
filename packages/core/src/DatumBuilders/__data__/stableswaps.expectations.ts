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
          "d8799f581c82f70fd1663b2b6f4250d6054fe4cac8c815d9eef8b38f68bbe22c929f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d009f0505ff9f0505ffd87a80187b9f1a001e84800000ff18c8c249022b1c8c1227a00000d87a80ff",
        hash: "e5997302ef96c7c2b9175875e368a73508ae186d5d4816b5ab152358f7001994",
        sumInvariant: 40000000000000000000n,
      },
    },
  ],
};
