import { AssetAmount } from "@sundaeswap/asset";
import { PREVIEW_DATA } from "@sundaeswap/core/testing";
import { beforeEach, describe, expect, it } from "bun:test";

import {
  ESwapType,
  ISwapConfigArgs,
  SwapConfig,
} from "../../../configs/SwapConfig.js";
import { SerializationLucidV3 } from "../../../serialization/lucid/Serialization.Lucid.V3.class.js";
import { BuilderLucidV3 } from "../Builder.Lucid.V3.class.js";

let instance: BuilderLucidV3;

beforeEach(() => {
  instance = new BuilderLucidV3();
});

describe("BuilderLucidV3", () => {
  it("should construct with a Lucid V3 Serializer", () => {
    expect(instance.serializationLibrary).toBeInstanceOf(SerializationLucidV3);
  });

  describe("Swap", () => {
    it("should accept a swap config", async () => {
      const args: ISwapConfigArgs = {
        pool: PREVIEW_DATA.pools.v1,
        suppliedAsset: new AssetAmount(10000000n, PREVIEW_DATA.pools.v1.assetA),
        swapType: {
          type: ESwapType.MARKET,
          slippage: 0.03,
        },
      };

      const config = new SwapConfig(args);
      expect(config.getArgs()).toMatchObject(args);

      expect(() => instance.swap(config)).not.toThrow();
    });

    it("should accept a function swap config", () => {
      let secondSwapOffer = "";
      let secondSwapMinReceived = "";

      expect(() =>
        instance
          .swap(
            new SwapConfig({
              pool: PREVIEW_DATA.pools.v1,
              suppliedAsset: new AssetAmount(
                10000000n,
                PREVIEW_DATA.pools.v1.assetA,
              ),
              swapType: {
                type: ESwapType.MARKET,
                slippage: 0.03,
              },
            }),
          )
          .swap((previousDatum) => {
            secondSwapMinReceived = previousDatum.minReceived[2].toString();
            secondSwapOffer = previousDatum.offer[2].toString();

            const config = new SwapConfig({
              pool: PREVIEW_DATA.pools.v1,
              suppliedAsset: new AssetAmount(
                previousDatum.minReceived[2],
                PREVIEW_DATA.pools.v1.assetB,
              ),
              swapType: {
                type: ESwapType.MARKET,
                slippage: 0.03,
              },
            });

            return config;
          }),
      ).not.toThrow();

      expect(secondSwapOffer).toEqual("10000000");
      expect(secondSwapMinReceived).toEqual("4708276");
      expect(instance.getTasks()).toBeArrayOfSize(2);
    });
  });
});
