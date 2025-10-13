import { hardCodedProtocolParams } from "@blaze-cardano/core";
import { Emulator } from "@blaze-cardano/emulator";
import { makeValue } from "@blaze-cardano/sdk";
import { beforeAll, describe, expect, it, spyOn } from "bun:test";

import { ESwapType } from "../../@types/configs.js";
import { EDatumType } from "../../@types/datumbuilder.js";
import { QueryProviderSundaeSwap } from "../../QueryProviders/QueryProviderSundaeSwap.js";
import { PREVIEW_DATA } from "../../TestUtilities/mockData.js";
import {
  params,
  referenceUtxosBlaze,
  settingsUtxosBlaze,
} from "../__data__/mockData.V3.js";
import { TxBuilderV3 } from "../TxBuilder.V3.class.js";

let builder: TxBuilderV3;

spyOn(
  QueryProviderSundaeSwap.prototype,
  "getProtocolParamsWithScriptHashes",
).mockResolvedValue(params);

spyOn(
  QueryProviderSundaeSwap.prototype,
  "getProtocolParamsWithScripts",
).mockResolvedValue(params);

describe.skip("TxBuilderV3", () => {
  let emulator: Emulator;

  beforeAll(() => {
    emulator = new Emulator(
      [
        settingsUtxosBlaze[0].output(),
        ...referenceUtxosBlaze.map((utxo) => utxo.output()),
      ],
      hardCodedProtocolParams,
    );
    emulator.register("Wallet One", makeValue(10_000_000n));
  });

  it("should pass", () => {
    expect(true).toBeTruthy();
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
      const signed = await result.sign();
    });
  });
});
