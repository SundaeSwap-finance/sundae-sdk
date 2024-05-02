import { PREVIEW_DATA } from "@sundaeswap/core/testing";
import { UTxO } from "lucid-cardano";

export const NO_MIGRATION_ASSETS_UTXO: UTxO = {
  address:
    "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
  assets: {
    lovelace: 5000000n,
    "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e1555534443":
      40000000n,
  },
  outputIndex: 0,
  datumHash: "ae02f4c4c993de87d8cfbf6b870326a97a0f4f674ff66ed895af257ff572c311",
  datum:
    "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff",
  txHash: "f28d6c3105a8a72f83e2cff9c9c042eb8e0449a6b5ab38b26ff899ab61be997e",
};

export const MIGRATION_ASSETS_UTXO: UTxO = {
  address:
    "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
  assets: {
    lovelace: 5000000n,
    "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e1555534443":
      40000000n,
    [PREVIEW_DATA.pools.v1.assetLP.assetId.replace(".", "")]: 500_000_000_000n,
  },
  outputIndex: 0,
  datumHash: "ae02f4c4c993de87d8cfbf6b870326a97a0f4f674ff66ed895af257ff572c311",
  datum:
    "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff",
  txHash: "f28d6c3105a8a72f83e2cff9c9c042eb8e0449a6b5ab38b26ff899ab61be997e",
};
