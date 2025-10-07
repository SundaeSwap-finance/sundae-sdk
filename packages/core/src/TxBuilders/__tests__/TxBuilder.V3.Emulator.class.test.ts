import { hardCodedProtocolParams } from "@blaze-cardano/core";
import { Emulator } from "@blaze-cardano/emulator";
import { makeValue } from "@blaze-cardano/sdk";
import { describe, it, spyOn } from "bun:test";

import { EDatumType, ESwapType } from "../../@types";
import { QueryProviderSundaeSwap } from "../../QueryProviders";
import { PREVIEW_DATA } from "../../TestUtilities/mockData";
import {
  params,
  referenceUtxosBlaze,
  settingsUtxosBlaze,
} from "../__data__/mockData.V3";
import { TxBuilderV3 } from "../TxBuilder.V3.class";

spyOn(
  QueryProviderSundaeSwap.prototype,
  "getProtocolParamsWithScriptHashes",
).mockResolvedValue(params);

spyOn(
  QueryProviderSundaeSwap.prototype,
  "getProtocolParamsWithScripts",
).mockResolvedValue(params);

spyOn(TxBuilderV3.prototype, "getSettingsUtxo").mockResolvedValue(
  settingsUtxosBlaze[0],
);

spyOn(TxBuilderV3.prototype, "getAllReferenceUtxos").mockResolvedValue(
  referenceUtxosBlaze,
);

describe("TxBuilderV3", () => {
  let emulator: Emulator;

  beforeAll(() => {
    emulator = new Emulator([], hardCodedProtocolParams);
    emulator.register("Wallet One", makeValue(10_000_000n));
  });

  it("should allow you to update a swap", async () => {
    await emulator.as("Wallet One", async (blaze) => {
      const builder = new TxBuilderV3(blaze);

      const { build, fees, datum } = await builder.swap({
        orderAddresses: {
          DestinationAddress: {
            address: PREVIEW_DATA.addresses.current,
            datum: {
              type: EDatumType.NONE,
            },
          },
        },
        swapType: {
          type: ESwapType.MARKET,
          slippage: 0.03,
        },
        pool: PREVIEW_DATA.pools.v3,
        suppliedAsset: PREVIEW_DATA.assets.tada,
      });

      const result = await build();
      console.log(result.cbor);
      // const signed = await result.sign();
    });
  });
});
