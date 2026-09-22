import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";

import { EPoolCurve } from "../../@types/index.js";
import { QueryProviderSundaeSwap } from "../QueryProviderSundaeSwap.js";

// A v4 stableswap pool as the API returns it, trimmed to the fields the
// provider selects. The figures are a live preview pool,
// ac8d4b1b5fcadb3ac0247f7134ca08b061ee41b0c742dd4edf4c6244.
const STABLESWAP_POOL = {
  id: "ac8d4b1b5fcadb3ac0247f7134ca08b061ee41b0c742dd4edf4c6244",
  assetA: { assetId: "aa.55534472", decimals: 6 },
  assetB: { assetId: "bb.7355534472", decimals: 0 },
  assetLP: { assetId: "cc.6c70", decimals: 0 },
  finalFee: [25, 10000],
  openingFee: [25, 10000],
  feesFinalized: { slot: 0 },
  marketOpen: { slot: 0 },
  current: {
    quantityA: { quantity: "10794901263" },
    quantityB: { quantity: "10186281970" },
    quantityLP: { quantity: "20980202970303189" },
  },
  linearAmplificationFactor: "200",
  modules: [{ kind: "invariant", identifier: "stableswap" }],
  prices: [],
  sqrtPrices: [],
  rates: ["1000000", "1001000"],
  protocolAskFee: [0, 10000],
  version: "V4",
};

const sentQueries: string[] = [];

const mockFetch = (payload: unknown) =>
  spyOn(global, "fetch").mockImplementation((async (
    _url: string,
    init: { body: string },
  ) => {
    sentQueries.push(JSON.parse(init.body).query as string);
    return { json: async () => payload };
  }) as never);

afterEach(() => {
  sentQueries.length = 0;
  mock.restore();
});

describe("QueryProviderSundaeSwap curve data", () => {
  // The bug this guards against has now appeared three times in different
  // repositories: a pool query that omits a field the estimator REQUIRES. The
  // symptom is never an error at the fetch — it is a pool that silently cannot
  // be priced, surfacing much later as "Unsupported v4 pool curve: undefined".
  const CURVE_FIELDS = ["modules", "prices", "sqrtPrices", "rates"];

  it("selects every curve field on the ident query", async () => {
    mockFetch({ data: { pools: { byId: STABLESWAP_POOL } } });
    await new QueryProviderSundaeSwap("preview").findPoolDataByIdent({
      ident: STABLESWAP_POOL.id,
    });
    expect(sentQueries).toHaveLength(1);
    for (const field of CURVE_FIELDS) {
      expect(sentQueries[0]).toContain(field);
    }
  });

  it("selects every curve field on the pair query, minimal and full alike", async () => {
    // `minimal` trims the fee-decay and decimals plumbing. It must not trim the
    // curve config: a pool that cannot be priced is not a cheaper pool.
    for (const minimal of [true, false]) {
      mockFetch({ data: { pools: { byPair: [STABLESWAP_POOL] } } });
      await new QueryProviderSundaeSwap("preview").findPoolDataByAssetPair(
        "aa.55534472",
        "bb.7355534472",
        minimal,
      );
      for (const field of CURVE_FIELDS) {
        expect(sentQueries[sentQueries.length - 1]).toContain(field);
      }
    }
  });

  it("selects every curve field on the asset and search queries", async () => {
    for (const minimal of [true, false]) {
      mockFetch({ data: { pools: { byAsset: [STABLESWAP_POOL] } } });
      await new QueryProviderSundaeSwap("preview").findPoolDataByAssetId(
        "aa.55534472",
        minimal,
      );
      mockFetch({ data: { pools: { search: [STABLESWAP_POOL] } } });
      await new QueryProviderSundaeSwap("preview").findPoolDataBySearchTerm(
        "USDr",
        minimal,
      );
    }
    expect(sentQueries).toHaveLength(4);
    for (const query of sentQueries) {
      for (const field of CURVE_FIELDS) {
        expect(query).toContain(field);
      }
    }
  });

  it("maps a stableswap pool into a shape the estimator can quote", async () => {
    mockFetch({ data: { pools: { byId: STABLESWAP_POOL } } });
    const pool = await new QueryProviderSundaeSwap("preview").findPoolDataByIdent(
      { ident: STABLESWAP_POOL.id },
    );
    expect(pool.curve).toBe(EPoolCurve.V4Stableswap);
    expect(pool.rates).toEqual([1_000_000n, 1_001_000n]);
    // Both halves of the config: the rates above and the amplification, which
    // is the same field the v3 Stableswaps contract uses.
    expect(pool.linearAmplificationFactor).toBe(200n);
    // Empty arrays belong to other curves and must not become [0n, 0n].
    expect(pool.prices).toBeUndefined();
    expect(pool.sqrtPrices).toBeUndefined();
  });

  it("maps the sibling curves' config too", async () => {
    mockFetch({
      data: {
        pools: {
          byId: {
            ...STABLESWAP_POOL,
            modules: [{ kind: "invariant", identifier: "constant_sum" }],
            prices: ["1000000", "1000000"],
            rates: [],
          },
        },
      },
    });
    const cs = await new QueryProviderSundaeSwap("preview").findPoolDataByIdent({
      ident: STABLESWAP_POOL.id,
    });
    expect(cs.curve).toBe(EPoolCurve.ConstantSum);
    expect(cs.prices).toEqual([1_000_000n, 1_000_000n]);
    expect(cs.rates).toBeUndefined();

    mockFetch({
      data: {
        pools: {
          byId: {
            ...STABLESWAP_POOL,
            modules: [{ kind: "invariant", identifier: "concentrated_liquidity" }],
            rates: [],
            sqrtPrices: ["1", "2", "2", "1"],
          },
        },
      },
    });
    const cl = await new QueryProviderSundaeSwap("preview").findPoolDataByIdent({
      ident: STABLESWAP_POOL.id,
    });
    expect(cl.curve).toBe(EPoolCurve.ConcentratedLiquidity);
    expect(cl.sqrtPrices).toEqual([
      [1n, 2n],
      [2n, 1n],
    ]);
  });

  it("leaves a pre-v4 pool with no curve at all", async () => {
    mockFetch({
      data: {
        pools: {
          byId: { ...STABLESWAP_POOL, version: "V3", modules: [], rates: [] },
        },
      },
    });
    const pool = await new QueryProviderSundaeSwap("preview").findPoolDataByIdent(
      { ident: STABLESWAP_POOL.id },
    );
    expect(pool.curve).toBeUndefined();
  });
});
