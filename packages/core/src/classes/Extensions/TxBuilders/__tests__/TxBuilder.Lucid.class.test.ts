/**
 * @jest-environment node
 **/

import { TEST_TxBuilder } from "../../../../testing/TxBuilder";
import { setupGlobalCardano } from "../../../../testing/cardano";
import { TxBuilderLucid } from "../TxBuilder.Lucid.class";
import { QueryProviderSundaeSwap } from "../../QueryProviders/QueryProvider.SundaeSwap";

setupGlobalCardano();

TEST_TxBuilder(
  () =>
    new TxBuilderLucid(
      {
        network: "preview",
        wallet: "eternl",
      },
      new QueryProviderSundaeSwap("preview")
    )
);
