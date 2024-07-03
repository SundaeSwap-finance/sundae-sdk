import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";

import {
  EContractVersion,
  EPoolCoin,
  IPoolData,
  ISundaeProtocolParams,
} from "../../@types/index.js";
import { ADA_METADATA, ORDER_DEPOSIT_DEFAULT } from "../../constants.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { SundaeUtils } from "../SundaeUtils.class.js";

const mockedProtocols: ISundaeProtocolParams[] = [
  {
    blueprint: {
      validators: [
        {
          hash: "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9",
          title: "pool.mint",
        },
      ],
    },
    references: [],
    version: EContractVersion.V1,
  },
];

jest.useFakeTimers();

describe("SundaeUtils class", () => {
  it("getMinReceivableFromSlippage", () => {
    const resultA = SundaeUtils.getMinReceivableFromSlippage(
      PREVIEW_DATA.pools.v1,
      PREVIEW_DATA.assets.tada,
      0.1
    );

    expect(resultA).toBeInstanceOf(AssetAmount);
    expect(resultA).toMatchObject(
      expect.objectContaining({
        amount: 8570604n,
        decimals: 0,
      })
    );

    const resultB = SundaeUtils.getMinReceivableFromSlippage(
      PREVIEW_DATA.pools.v1,
      PREVIEW_DATA.assets.tindy,
      0.01
    );

    expect(resultB).toBeInstanceOf(AssetAmount);
    expect(resultB).toMatchObject(
      expect.objectContaining({
        amount: 36326909n,
        decimals: 6,
      })
    );

    expect(() =>
      SundaeUtils.getMinReceivableFromSlippage(
        PREVIEW_DATA.pools.v1,
        new AssetAmount(10n, { assetId: "not in the pool", decimals: 0 }),
        0.1
      )
    ).toThrowError(
      `The supplied asset ID does not match either assets within the supplied pool data. {\"suppliedAssetID\":\"not in the pool\",\"poolAssetIDs\":[\"ada.lovelace\",\"fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459\"]}`
    );

    /**
     * We set a high spread between ratios to ensure that a very low bid
     * will result in at least a single token from the opposing side, especially
     * if it's a 0 decimal place asset.
     */
    const mockPoolData: IPoolData = {
      ...PREVIEW_DATA.pools.v1,
      liquidity: {
        ...PREVIEW_DATA.pools.v1.liquidity,
        aReserve: 10000000000n,
        bReserve: 209n,
      },
      assetB: {
        ...PREVIEW_DATA.pools.v1.assetB,
        decimals: 0,
      },
    };

    const mockSuppliedAsset = new AssetAmount(
      80000000n,
      PREVIEW_DATA.assets.tada.metadata
    );

    // Default 3% slippage.
    expect(
      SundaeUtils.getMinReceivableFromSlippage(
        mockPoolData,
        mockSuppliedAsset,
        0.3
      )
    ).toMatchObject(
      expect.objectContaining({
        amount: 1n,
        decimals: 0,
      })
    );

    // Even a 99% slippage should be at least a single token.
    expect(
      SundaeUtils.getMinReceivableFromSlippage(
        mockPoolData,
        mockSuppliedAsset,
        0.99
      )
    ).toMatchObject(
      expect.objectContaining({
        amount: 1n,
        decimals: 0,
      })
    );

    // Only a 100% slippage will be okay with 0 assets received.
    expect(
      SundaeUtils.getMinReceivableFromSlippage(
        mockPoolData,
        mockSuppliedAsset,
        1
      )
    ).toMatchObject(
      expect.objectContaining({
        amount: 0n,
        decimals: 0,
      })
    );

    /**
     * It should throw if the calculated minReceivable is less than 0.
     */
    try {
      SundaeUtils.getMinReceivableFromSlippage(
        mockPoolData,
        mockSuppliedAsset,
        2
      );
    } catch (e) {
      expect((e as Error).message).toStrictEqual(
        "Cannot have a negative minimum receivable amount."
      );
    }
  });

  it("getSwapDirection()", () => {
    // Ensure that ADA ids always come first.
    SundaeUtils.ADA_ASSET_IDS.forEach((id) => {
      expect(
        SundaeUtils.getAssetSwapDirection(
          {
            ...PREVIEW_DATA.assets.tada.metadata,
            assetId: id,
          },
          [PREVIEW_DATA.pools.v1.assetA, PREVIEW_DATA.pools.v1.assetB]
        )
      ).toEqual(EPoolCoin.A);
    });

    expect(
      SundaeUtils.getAssetSwapDirection(PREVIEW_DATA.assets.tindy.metadata, [
        PREVIEW_DATA.pools.v1.assetA,
        PREVIEW_DATA.pools.v1.assetB,
      ])
    ).toEqual(EPoolCoin.B);
  });

  it("should accurately accumulate suppliedAssets", () => {
    const aggregate = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [
        PREVIEW_DATA.assets.tada,
        new AssetAmount(25_000_000n, ADA_METADATA),
        PREVIEW_DATA.assets.tindy,
      ],
      scooperFee: 2_300_000n,
    });

    expect(aggregate).toMatchObject({
      lovelace: 45_000_000n + 2_300_000n + ORDER_DEPOSIT_DEFAULT,
      fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459:
        20000000n,
    });
  });

  it("should accurately sort a pair of assets", () => {
    const result = SundaeUtils.sortSwapAssetsWithAmounts([
      PREVIEW_DATA.assets.tindy,
      PREVIEW_DATA.assets.tada,
    ]);
    expect(result[0]).toStrictEqual(PREVIEW_DATA.assets.tada);
    expect(result[1]).toStrictEqual(PREVIEW_DATA.assets.tindy);

    const assetShouldBeFirst = new AssetAmount(20000000n, {
      decimals: 0,
      assetId: "abcd",
    });
    const result2 = SundaeUtils.sortSwapAssetsWithAmounts([
      PREVIEW_DATA.assets.tindy,
      assetShouldBeFirst,
    ]);
    expect(result2[0]).toStrictEqual(assetShouldBeFirst);
    expect(result2[1]).toStrictEqual(PREVIEW_DATA.assets.tindy);
  });

  it("should accurately get the swap direction", () => {
    const result = SundaeUtils.getAssetSwapDirection(
      PREVIEW_DATA.pools.v1.assetA,
      [PREVIEW_DATA.pools.v1.assetA, PREVIEW_DATA.pools.v1.assetB]
    );
    expect(result).toStrictEqual(0);

    const result2 = SundaeUtils.getAssetSwapDirection(
      PREVIEW_DATA.assets.tindy.metadata,
      [PREVIEW_DATA.pools.v1.assetA, PREVIEW_DATA.pools.v1.assetB]
    );
    expect(result2).toStrictEqual(1);
  });

  it("should convert a long string to a chunked array correctly", () => {
    const str =
      "d8799f4102d8799fd8799fd8799fd8799f581c8692a239eeae24067fb6ead1d4f636ae47fa2b5494884261dd768c4cffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd87a80ff1a002625a0d87b9fd87a9fd8799f1a004c4b401a002fa0ebffffffff";
    const result = SundaeUtils.splitMetadataString(str);
    expect(result).toStrictEqual([
      "d8799f4102d8799fd8799fd8799fd8799f581c8692a239eeae24067fb6ead1d4",
      "f636ae47fa2b5494884261dd768c4cffd8799fd8799fd8799f581c0d33957c07",
      "acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8",
      "7a80ff1a002625a0d87b9fd87a9fd8799f1a004c4b401a002fa0ebffffffff",
    ]);
    expect(result[0].length).toStrictEqual(64);
    expect(result[1].length).toStrictEqual(64);
    expect(result[2].length).toStrictEqual(64);
    expect(result[3].length).toStrictEqual(62);

    const result2 = SundaeUtils.splitMetadataString(str, "0x");
    expect(result2).toStrictEqual([
      "0xd8799f4102d8799fd8799fd8799fd8799f581c8692a239eeae24067fb6ead1",
      "0xd4f636ae47fa2b5494884261dd768c4cffd8799fd8799fd8799f581c0d3395",
      "0x7c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a",
      "0x80ffd87a80ff1a002625a0d87b9fd87a9fd8799f1a004c4b401a002fa0ebff",
      "0xffffff",
    ]);
    expect(result2[0].length).toStrictEqual(64);
    expect(result2[1].length).toStrictEqual(64);
    expect(result2[2].length).toStrictEqual(64);
    expect(result2[3].length).toStrictEqual(64);
    expect(result2[4].length).toStrictEqual(8);
  });

  it("should correctly convert a decaying pool fee to a Fraction", () => {
    jest.setSystemTime(
      SundaeUtils.slotToUnix(1702941926 + 200, "preview") * 1000
    );
    expect(
      SundaeUtils.getCurrentFeeFromDecayingFee({
        endFee: [1n, 100n],
        endSlot: "1702941979",
        startFee: [1n, 100n],
        startSlot: "1702941926",
        network: "preview",
      })
    ).toEqual(0.01);

    jest.setSystemTime(
      SundaeUtils.slotToUnix(1702941926 + 1000000, "preview") * 1000
    );
    expect(
      SundaeUtils.getCurrentFeeFromDecayingFee({
        endFee: [5n, 100n],
        endSlot: "1712941979",
        startFee: [5n, 1000n],
        startSlot: "1702941926",
        network: "preview",
      })
    ).toEqual(0.009499976150126405);

    jest.setSystemTime(SundaeUtils.slotToUnix(1702941926, "preview") * 1000);
    expect(
      SundaeUtils.getCurrentFeeFromDecayingFee({
        endFee: [5n, 100n],
        endSlot: "1702941979",
        startFee: [5n, 1000n],
        startSlot: "1702941926",
        network: "preview",
      })
    ).toEqual(0.005);

    jest.setSystemTime(SundaeUtils.slotToUnix(1702941979, "preview") * 1000);
    expect(
      SundaeUtils.getCurrentFeeFromDecayingFee({
        endFee: [5n, 100n],
        endSlot: "1702941979",
        startFee: [5n, 1000n],
        startSlot: "1702941926",
        network: "preview",
      })
    ).toEqual(0.05);
  });

  it("should correctly test an assetId as ADA", () => {
    expect(SundaeUtils.isAdaAsset(PREVIEW_DATA.pools.v1.assetA)).toBeTruthy();
    expect(SundaeUtils.isAdaAsset(PREVIEW_DATA.pools.v3.assetA)).toBeTruthy();
    expect(SundaeUtils.isAdaAsset({ assetId: "", decimals: 6 })).toBeTruthy();
    expect(SundaeUtils.isAdaAsset({ assetId: ".", decimals: 6 })).toBeTruthy();
    expect(
      SundaeUtils.isAdaAsset({ assetId: "ada.lovelace", decimals: 6 })
    ).toBeTruthy();
    expect(
      SundaeUtils.isAdaAsset({ assetId: "cardano.ada", decimals: 6 })
    ).toBeTruthy();
    expect(
      SundaeUtils.isAdaAsset({ assetId: "ada.lovelace", decimals: 4 })
    ).toBeFalsy();
    expect(SundaeUtils.isAdaAsset(PREVIEW_DATA.pools.v1.assetB)).toBeFalsy();
    expect(SundaeUtils.isAdaAsset(PREVIEW_DATA.pools.v3.assetB)).toBeFalsy();
  });

  it("should return the pool with the best swap outcome", () => {
    const given = new AssetAmount(1000000n, PREVIEW_DATA.assets.tada.metadata);
    const taken = new AssetAmount(2000000n, PREVIEW_DATA.assets.tindy.metadata);

    const mockPools = [PREVIEW_DATA.pools.v1, PREVIEW_DATA.pools.v3];

    const bestPool = SundaeUtils.getBestPoolBySwapOutcome({
      availablePools: mockPools,
      given,
      taken,
    });
    expect(bestPool?.ident).toEqual(PREVIEW_DATA.pools.v3.ident);

    expect(
      SundaeUtils.getBestPoolBySwapOutcome({
        availablePools: [],
        given,
        taken,
      })
    ).toBeUndefined();
  });

  it("should return the pool with the best swap outcome from the ada pair", () => {
    const given = new AssetAmount(1000000n, PREVIEW_DATA.assets.tindy.metadata);
    const taken = new AssetAmount(2000000n, PREVIEW_DATA.assets.tada.metadata);

    const mockPools = [PREVIEW_DATA.pools.v1, PREVIEW_DATA.pools.v3];

    const bestPool = SundaeUtils.getBestPoolBySwapOutcome({
      availablePools: mockPools,
      given,
      taken,
    });
    expect(bestPool?.ident).toEqual(PREVIEW_DATA.pools.v3.ident);

    expect(
      SundaeUtils.getBestPoolBySwapOutcome({
        availablePools: [],
        given,
        taken,
      })
    ).toBeUndefined();
  });

  describe("isLPAsset", () => {
    it("should return true for a matching LP asset policy ID", () => {
      const result = SundaeUtils.isLPAsset({
        assetPolicyId:
          "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9",
        protocols: mockedProtocols,
        version: EContractVersion.V1,
      });
      expect(result).toBe(true);
    });

    it("should return false for a non-matching LP asset policy ID", () => {
      const result = SundaeUtils.isLPAsset({
        assetPolicyId: "123",
        protocols: mockedProtocols,
        version: EContractVersion.V1,
      });
      expect(result).toBe(false);
    });
  });

  describe("isAssetIdsEqual", () => {
    const adaAssetId1 = "ada.lovelace";
    const adaAssetId2 = "cardano.ada";
    const nonAdaAssetId1 = "nonAdaAssetId1";
    const nonAdaAssetId2 = "nonAdaAssetId2";

    it("should return true for equal ADA asset IDs", () => {
      expect(SundaeUtils.isAssetIdsEqual(adaAssetId1, adaAssetId1)).toBe(true);
    });

    it("should return true for different ADA asset IDs", () => {
      expect(SundaeUtils.isAssetIdsEqual(adaAssetId1, adaAssetId2)).toBe(true);
    });

    it("should return true for equal non-ADA asset IDs with periods", () => {
      expect(SundaeUtils.isAssetIdsEqual("asset.id", "asset.id")).toBe(true);
    });

    it("should return true for equal non-ADA asset IDs without periods", () => {
      expect(SundaeUtils.isAssetIdsEqual(nonAdaAssetId1, nonAdaAssetId1)).toBe(
        true
      );
    });

    it("should return false for different non-ADA asset IDs", () => {
      expect(SundaeUtils.isAssetIdsEqual(nonAdaAssetId1, nonAdaAssetId2)).toBe(
        false
      );
    });

    it("should return true for equal non-ADA asset IDs where one contains a period", () => {
      expect(
        SundaeUtils.isAssetIdsEqual(nonAdaAssetId1, `${nonAdaAssetId1}.`)
      ).toBe(true);
    });

    it("should handle empty strings correctly", () => {
      expect(SundaeUtils.isAssetIdsEqual("", "")).toBe(true);
      expect(SundaeUtils.isAssetIdsEqual("", "anyId")).toBe(false);
      expect(SundaeUtils.isAssetIdsEqual("anyId", "")).toBe(false);
    });
  });

  describe("isV3PoolIdent", () => {
    it("should return true for a v3 pool ident", () => {
      const result = SundaeUtils.isV3PoolIdent(PREVIEW_DATA.pools.v3.ident);
      expect(result).toBe(true);
    });

    it("should return false for a v1 pool ident", () => {
      const result = SundaeUtils.isV3PoolIdent(PREVIEW_DATA.pools.v1.ident);
      expect(result).toBe(false);
    });
  });
});
