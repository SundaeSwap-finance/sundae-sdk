import { ADA_METADATA, IPoolData } from "@sundaeswap/core";
import { PREVIEW_DATA } from "@sundaeswap/core/testing";

export const V3_CONTRACT_POOL_TINDY: IPoolData = PREVIEW_DATA.pools.v3;
export const V3_CONTRACT_POOL_RBERRY: IPoolData = {
  assetA: ADA_METADATA,
  assetB: {
    assetId:
      "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
    decimals: 0,
  },
  assetLP: {
    assetId:
      "633a136877ed6ad0ab33e69a22611319673474c8bd0a79a4c76d9289.000de1408325cc036806d513016fa259750194ba71b7748f3a23566e68fbe4d6",
    decimals: 0,
  },
  currentFee: 0.005,
  ident: "8325cc036806d513016fa259750194ba71b7748f3a23566e68fbe4d6",
  liquidity: {
    aReserve: 1_002_000_000n,
    bReserve: 1_000_000_000n,
    lpTotal: 0n,
  },
  version: "V3",
};
