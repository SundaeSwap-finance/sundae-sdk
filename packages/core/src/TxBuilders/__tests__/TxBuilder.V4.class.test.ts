import { parse, serialize } from "@blaze-cardano/data";
import { Core, makeValue } from "@blaze-cardano/sdk";
import { AssetAmount } from "@sundaeswap/asset";
import { afterAll, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

import { Blaze, Provider, Wallet } from "@blaze-cardano/sdk";

import { EContractVersion } from "../../@types/index.js";
import { EDatumType } from "../../@types/datumbuilder.js";
import { ADA_METADATA } from "../../constants.js";
import { V4Types } from "../../DatumBuilders/ContractTypes/index.js";
import {
  DatumBuilderV4,
  EV4BasicConstraint,
} from "../../DatumBuilders/DatumBuilder.V4.class.js";
import { QueryProviderSundaeSwap } from "../../QueryProviders/QueryProviderSundaeSwap.js";
import { SundaeSDK } from "../../SundaeSDK.class.js";
import { setupBlaze } from "../../TestUtilities/setupBlaze.js";
import { TxBuilderV4, V4_VALIDATORS } from "../TxBuilder.V4.class.js";

const OWNER =
  "addr1qxt2wmg0z7djtl6aypp4auynxcd8he3u55ztr930su3awsv9fw8fnewskjvp0hg0yk89g5gq4c57nlz3tktjxy3avezqejdfyn";
const ORDER_HASH = "11".repeat(28);
const SWAP_HASH = "22".repeat(28);
const BASIC_HASH = "33".repeat(28);
const ROUTE_HASH = "44".repeat(28);
const FAIRNESS_HASH = "55".repeat(28);
const STRATEGY_HASH = "56".repeat(28);
// Pool-creation module hashes.
const POOL_HASH = "66".repeat(28);
const POOL_MINT_HASH = "77".repeat(28);
const CS_HASH = "88".repeat(28);
const FEESPLIT_HASH = "99".repeat(28);
const FAIRNESS_MOD_HASH = "aa".repeat(28);

// A 32-byte tx id for the order UTxO being cancelled, and one for the order
// reference-script UTxO cancel/update read from.
const ORDER_UTXO_HASH = "ab".repeat(32);
const ORDER_REF_HASH = "cd".repeat(32);

const TOKEN = new AssetAmount(1_000_000n, {
  assetId:
    "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77.534e454b",
  decimals: 0,
});
const ADA = new AssetAmount(2_000_000n, ADA_METADATA);

let builder: TxBuilderV4;
let blazeInstance: Blaze<Provider, Wallet>;

// Resolve deployment hashes without a live protocol query.
spyOn(TxBuilderV4.prototype, "getValidatorScript").mockImplementation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (async (name: string) => {
    const hash = {
      [V4_VALIDATORS.order]: ORDER_HASH,
      [V4_VALIDATORS.swapConstraint]: SWAP_HASH,
      [V4_VALIDATORS.basicConstraint]: BASIC_HASH,
      [V4_VALIDATORS.routeConstraint]: ROUTE_HASH,
      [V4_VALIDATORS.fairnessConstraint]: FAIRNESS_HASH,
      [V4_VALIDATORS.strategyConstraint]: STRATEGY_HASH,
      [V4_VALIDATORS.pool]: POOL_HASH,
      [V4_VALIDATORS.poolMint]: POOL_MINT_HASH,
      [V4_VALIDATORS.constantSum]: CS_HASH,
      [V4_VALIDATORS.feeSplit]: FEESPLIT_HASH,
      [V4_VALIDATORS.fairnessModule]: FAIRNESS_MOD_HASH,
    }[name];
    return { hash, title: name, compiledCode: "" };
  }) as any,
);

// A PoolConfig datum for a constant-sum pool: {tag 3, [cs, fee-split, fairness]}.
const CS_POOL_CONFIG_DATUM = serialize(V4Types.PoolConfig, {
  pool_validator: POOL_HASH,
  actions: [
    {
      tag: 3n,
      enabled: true,
      modules: [CS_HASH, FEESPLIT_HASH, FAIRNESS_MOD_HASH],
    },
  ],
}).toCbor();

// Published Create configs for the non-curve modules (curve config comes from
// the caller). Fairness is config-less (null).
const POOL_MODULE_CONFIGS = {
  [FEESPLIT_HASH]: { configCbor: "d87980" },
  [FAIRNESS_MOD_HASH]: { configCbor: null },
};

// Protocol validators + references, keyed so mintPool can resolve modules by
// hash → title → reference.
const MODULE_HASHES: Record<string, string> = {
  pool: POOL_HASH,
  "pool-mint": POOL_MINT_HASH,
  "constant-sum": CS_HASH,
  "fee-split": FEESPLIT_HASH,
  fairness: FAIRNESS_MOD_HASH,
};
const refHashFor = (key: string) =>
  Buffer.from(`ref-${key}`.padEnd(32, "_")).toString("hex").slice(0, 64);
spyOn(TxBuilderV4.prototype, "getProtocolParams").mockResolvedValue({
  blueprint: {
    validators: Object.entries(MODULE_HASHES).map(([title, hash]) => ({
      title,
      hash,
      compiledCode: "",
    })),
  },
  references: Object.keys(MODULE_HASHES).map((key) => ({
    key,
    txIn: { hash: refHashFor(key), index: 0 },
  })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

// Resolve reference scripts without a live protocol query — a distinct ref
// UTxO per module key (matching how each module deploys its own reference).
spyOn(TxBuilderV4.prototype, "getReferenceScript").mockImplementation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (async (key: string) => {
    const hash =
      key === V4_VALIDATORS.order
        ? ORDER_REF_HASH
        : Buffer.from(key.padEnd(32, "_")).toString("hex").slice(0, 64);
    return { key, txIn: { hash, index: 0 } };
  }) as any,
);

const SWAP_CONFIG_TOKEN = "000d039b";
const BASIC_CONFIG_TOKEN = "00073714";

// Resolve indexed settings without a live protocol query.
spyOn(
  QueryProviderSundaeSwap.prototype,
  "getProtocolSettings",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
).mockResolvedValue([
  { label: "settings", txIn: { hash: "aa", index: 0 }, datum: "d8", values: { minShareBatcher: "100" } },
  { label: "swap-order", txIn: { hash: "bb", index: 0 }, datum: "d8", values: { token: SWAP_CONFIG_TOKEN, requiredConstraints: [] } },
  { label: "basic-order", txIn: { hash: "cc", index: 0 }, datum: "d8", values: { token: BASIC_CONFIG_TOKEN, requiredConstraints: [] } },
  { label: "strategy-order", txIn: { hash: "ce", index: 0 }, datum: "d8", values: { token: "00d5ea9b", requiredConstraints: [] } },
  { label: "pool", txIn: { hash: "dd".repeat(32), index: 0 }, datum: CS_POOL_CONFIG_DATUM, values: { moduleConfigs: POOL_MODULE_CONFIGS } },
] as any);

const { getUtxosByOutRefMock, getUtxosMock } = setupBlaze(
  async (blaze) => {
    blazeInstance = blaze;
    builder = new TxBuilderV4(blaze);
  },
  { network: Core.NetworkId.Mainnet, walletAddress: OWNER },
);

afterAll(() => {
  mock.restore();
});

const datumOf = async (
  composed: Awaited<ReturnType<TxBuilderV4["swap"]>>,
): Promise<V4Types.OrderDatum> =>
  parse(
    V4Types.OrderDatum,
    Core.PlutusData.fromCbor(Core.HexBlob(composed.datum as string)),
  );

describe("TxBuilderV4", () => {
  beforeEach(() => {
    builder.protocolParams = undefined;
    builder.settings = undefined;
  });

  describe("SundaeSDK facade", () => {
    it("exposes the V4 builder via sdk.builder(EContractVersion.V4)", () => {
      const sdk = SundaeSDK.new({ blazeInstance });
      expect(sdk.builder(EContractVersion.V4)).toBeInstanceOf(TxBuilderV4);
    });
  });

  describe("getSettings()", () => {
    it("does not cache an undefined (transient) result — retries on the next call", async () => {
      // Queue one transient miss; subsequent calls fall back to the module-level
      // mock (the real settings). Don't restore — that would drop the shared mock.
      spyOn(
        QueryProviderSundaeSwap.prototype,
        "getProtocolSettings",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ).mockResolvedValueOnce(undefined as any);

      const first = await builder.getSettings();
      expect(first).toEqual([]); // transient miss returns [] …
      expect(builder.settings).toBeUndefined(); // … but is not cached
      const second = await builder.getSettings();
      expect(second.length).toBeGreaterThan(0); // next call retries and succeeds
    });
  });

  describe("getOrderScriptAddress()", () => {
    it("derives a script address carrying the owner's stake credential", async () => {
      const addr = await builder.getOrderScriptAddress(OWNER);
      const parsed = Core.addressFromBech32(addr);
      // payment credential is the order validator script hash
      expect(String(parsed.asBase()!.getPaymentCredential().hash)).toEqual(
        ORDER_HASH,
      );
      // stake credential comes from the owner
      expect(String(parsed.asBase()!.getStakeCredential().hash)).toEqual(
        String(Core.addressFromBech32(OWNER).asBase()!.getStakeCredential().hash),
      );
    });
  });

  describe("swap()", () => {
    it("emits the full swap constraint set [swap(Constr2), route([]), fairness(Void)] in order", async () => {
      const composed = await builder.swap({
        ownerAddress: OWNER,
        offered: TOKEN,
        minReceived: ADA,
        budget: 3_000_000n,
        shareBatcher: 500n,
        configToken: "aabb",
      });

      const datum = await datumOf(composed);

      expect(datum.owner).toHaveProperty("Signature");
      expect(datum.budget).toEqual(3_000_000n);
      expect(datum.share_batcher).toEqual(500n);
      expect(datum.config_token).toEqual("aabb");

      // three constraints in the OrderConfig-required order
      expect(datum.constraints.map((c) => c[0])).toEqual([
        SWAP_HASH,
        ROUTE_HASH,
        FAIRNESS_HASH,
      ]);
      expect(datum.constraints[0][1].toCbor().startsWith("d87b")).toBe(true); // Swap = Constr 2
      expect(datum.constraints[1][1].toCbor()).toEqual(Core.HexBlob("80")); // route = empty list
      expect(datum.constraints[2][1].toCbor()).toEqual(Core.HexBlob("d87980")); // fairness = Void
    });

    it("defaults the destination to the owner, budget to 3 ADA, and shareBatcher to settings.minShareBatcher", async () => {
      const composed = await builder.swap({
        ownerAddress: OWNER,
        offered: TOKEN,
        minReceived: ADA,
        configToken: "aabb",
      });
      const datum = await datumOf(composed);
      expect(datum.destination).toHaveProperty("Fixed");
      expect(datum.budget).toEqual(3_000_000n);
      // shareBatcher is the protocol's minShareBatcher from settings (mock = 100).
      expect(datum.share_batcher).toEqual(100n);
      // and the reserved budget is surfaced as the composed scooperFee.
      expect(composed.fees.scooperFee.amount).toEqual(3_000_000n);
    });

    it("resolves config_token from the indexed settings when omitted (swap-order)", async () => {
      const composed = await builder.swap({
        ownerAddress: OWNER,
        offered: TOKEN,
        minReceived: ADA,
      });
      const datum = await datumOf(composed);
      expect(datum.config_token).toEqual(SWAP_CONFIG_TOKEN);
    });
  });

  describe("basic() / deposit() / withdraw()", () => {
    it("deposit emits [basic(Constr0), fairness(Void)] — no route constraint — and resolves the basic config_token", async () => {
      const composed = await builder.deposit({
        ownerAddress: OWNER,
        offered: [TOKEN],
        minReceived: [ADA],
      });
      const datum = await datumOf(composed);
      expect(datum.constraints.map((c) => c[0])).toEqual([
        BASIC_HASH,
        FAIRNESS_HASH,
      ]);
      expect(datum.constraints[0][1].toCbor().startsWith("d879")).toBe(true);
      expect(datum.constraints[1][1].toCbor()).toEqual(Core.HexBlob("d87980"));
      // config_token resolved from the "basic-order" settings entry
      expect(datum.config_token).toEqual(BASIC_CONFIG_TOKEN);
    });

    it("withdraw uses a Constr-1 basic constraint", async () => {
      const composed = await builder.withdraw({
        ownerAddress: OWNER,
        offered: [TOKEN],
        minReceived: [ADA],
        configToken: "aabb",
      });
      const datum = await datumOf(composed);
      expect(datum.constraints[0][1].toCbor().startsWith("d87a")).toBe(true);
    });

    it("basic(Claim) uses a Constr-3 basic constraint", async () => {
      const composed = await builder.basic({
        type: EV4BasicConstraint.Claim,
        ownerAddress: OWNER,
        offered: [TOKEN],
        minReceived: [ADA],
        configToken: "aabb",
      });
      const datum = await datumOf(composed);
      expect(datum.constraints[0][1].toCbor().startsWith("d87c")).toBe(true);
    });
  });

  describe("strategy()", () => {
    it("emits [strategy, route([]), fairness(Void)] and resolves the strategy config_token", async () => {
      const composed = await builder.strategy({
        ownerAddress: OWNER,
        offered: [TOKEN],
        authSigner: OWNER,
      });
      const datum = await datumOf(composed);
      expect(datum.constraints.map((c) => c[0])).toEqual([
        STRATEGY_HASH,
        ROUTE_HASH,
        FAIRNESS_HASH,
      ]);
      // strategy constraint = Constr 0 [auth, final_destinations].
      expect(datum.constraints[0][1].toCbor().startsWith("d8799f")).toBe(true);
      expect(datum.constraints[1][1].toCbor()).toEqual(Core.HexBlob("80"));
      expect(datum.constraints[2][1].toCbor()).toEqual(Core.HexBlob("d87980"));
      // config_token resolved from the "strategy-order" settings entry.
      expect(datum.config_token).toEqual("00d5ea9b");
    });

    it("carries the strategist auth + final destinations in the constraint", async () => {
      const composed = await builder.strategy({
        ownerAddress: OWNER,
        offered: [TOKEN],
        authSigner: OWNER,
        finalDestinations: [
          { address: OWNER, datum: { type: EDatumType.NONE } },
        ],
        configToken: "aabb",
      });
      const datum = await datumOf(composed);
      const strat = parse(
        V4Types.StrategyConstraints,
        datum.constraints[0][1],
      );
      expect(strat.auth).toHaveProperty("Signature");
      expect(strat.final_destinations.length).toEqual(1);
    });
  });

  describe("getPoolByIdent()", () => {
    it("decodes a pool UTxO into reserves + LP/NFT asset ids", async () => {
      const ident = "ab".repeat(14); // 28-byte ident
      const { nft, lp } = DatumBuilderV4.cip68Names(ident);
      const poolDatum = builder.datumBuilder.buildPoolDatum({
        assets: [TOKEN, TOKEN],
        totalLp: 2_000_000n,
        circulatingLp: 2_000_000n,
        premintedLp: 2_000_000n,
        identifier: ident,
        actions: [{ tag: 3n, enabled: true, modules: [CS_HASH] }],
        moduleState: [[CS_HASH, "80"]],
      });
      const poolUtxo = Core.TransactionUnspentOutput.fromCore([
        new Core.TransactionInput(
          Core.TransactionId("fa".repeat(32)),
          0n,
        ).toCore(),
        Core.TransactionOutput.fromCore({
          address: Core.getPaymentAddress(Core.addressFromBech32(OWNER)),
          value: makeValue(3_000_000n, [POOL_MINT_HASH + nft, 1n]).toCore(),
          datum: Core.PlutusData.fromCbor(
            Core.HexBlob(poolDatum.inline),
          ).toCore(),
        }).toCore(),
      ]);
      const nftSpy = spyOn(
        blazeInstance.provider,
        "getUnspentOutputByNFT",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ).mockResolvedValue(poolUtxo as any);

      const pool = await builder.getPoolByIdent(ident);
      expect(pool.ident).toEqual(ident);
      expect(pool.assets.length).toEqual(2);
      expect(pool.totalLp).toEqual(2_000_000n);
      expect(pool.lpAssetId).toEqual(`${POOL_MINT_HASH}.${lp}`);
      expect(pool.nftAssetId).toEqual(`${POOL_MINT_HASH}.${nft}`);
      nftSpy.mockRestore();
    });
  });

  /**
   * Builds an order UTxO carrying `orderDatumCbor` at the order script address,
   * and wires `resolveUnspentOutputs` to return it for the order input and a
   * bare reference UTxO for the order reference-script input.
   */
  const mockOrderAndRefUtxos = async (orderDatumCbor: string) => {
    const orderScriptAddr = await builder.getOrderScriptAddress();
    const orderUtxo = Core.TransactionUnspentOutput.fromCore([
      new Core.TransactionInput(
        Core.TransactionId(ORDER_UTXO_HASH),
        0n,
      ).toCore(),
      Core.TransactionOutput.fromCore({
        address: Core.PaymentAddress(orderScriptAddr),
        value: makeValue(5_000_000n, [
          TOKEN.metadata.assetId,
          TOKEN.amount,
        ]).toCore(),
        datum: Core.PlutusData.fromCbor(Core.HexBlob(orderDatumCbor)).toCore(),
      }).toCore(),
    ]);
    const refUtxo = Core.TransactionUnspentOutput.fromCore([
      new Core.TransactionInput(Core.TransactionId(ORDER_REF_HASH), 0n).toCore(),
      Core.TransactionOutput.fromCore({
        address: Core.getPaymentAddress(Core.addressFromBech32(OWNER)),
        value: makeValue(5_000_000n).toCore(),
      }).toCore(),
    ]);

    getUtxosByOutRefMock.mockImplementation(async (inputs) => {
      const id = String(inputs[0].transactionId());
      if (id === ORDER_UTXO_HASH) return [orderUtxo];
      if (id === ORDER_REF_HASH) return [refUtxo];
      return [];
    });

    return orderScriptAddr;
  };

  describe("getSignerKeyFromDatum()", () => {
    it("extracts the owner's key hash from a v4 order datum", async () => {
      const composed = await builder.swap({
        ownerAddress: OWNER,
        offered: TOKEN,
        minReceived: ADA,
        configToken: "aabb",
      });
      const expected = String(
        Core.addressFromBech32(OWNER).asBase()!.getStakeCredential().hash,
      );
      expect(
        DatumBuilderV4.getSignerKeyFromDatum(composed.datum as string),
      ).toEqual(expected);
    });
  });

  describe("cancel()", () => {
    it("spends the order UTxO with the Cancel redeemer and adds the owner signer", async () => {
      const order = await builder.swap({
        ownerAddress: OWNER,
        offered: TOKEN,
        minReceived: ADA,
        configToken: "aabb",
      });
      const orderDatumCbor = order.datum as string;
      await mockOrderAndRefUtxos(orderDatumCbor);

      const signerSpy = spyOn(DatumBuilderV4, "getSignerKeyFromDatum");

      const composed = await builder.cancel({
        utxo: { hash: ORDER_UTXO_HASH, index: 0 },
      });

      // The returned datum is the spent order's datum, and no deposit is taken.
      expect(composed.datum).toEqual(orderDatumCbor);
      expect(composed.fees.deposit.amount).toEqual(0n);
      expect(composed.fees.scooperFee.amount).toEqual(0n);
      expect(signerSpy).toHaveReturnedTimes(1);
      expect(signerSpy.mock.results[0]?.value).toEqual(
        String(Core.addressFromBech32(OWNER).asBase()!.getStakeCredential().hash),
      );

      signerSpy.mockRestore();
    });
  });

  describe("update()", () => {
    it("cancels the old order and locks a fresh swap order in one tx", async () => {
      const old = await builder.swap({
        ownerAddress: OWNER,
        offered: TOKEN,
        minReceived: ADA,
        configToken: "aabb",
      });
      await mockOrderAndRefUtxos(old.datum as string);

      const composed = await builder.update({
        cancelUtxo: { hash: ORDER_UTXO_HASH, index: 0 },
        order: {
          kind: "swap",
          ownerAddress: OWNER,
          offered: TOKEN,
          minReceived: ADA,
          configToken: "ccdd",
        },
      });

      // The composed datum is the NEW order, carrying the full swap set.
      const datum = await datumOf(composed);
      expect(datum.config_token).toEqual("ccdd");
      expect(datum.constraints.map((c) => c[0])).toEqual([
        SWAP_HASH,
        ROUTE_HASH,
        FAIRNESS_HASH,
      ]);
      expect(composed.fees.deposit.amount).toBeGreaterThan(0n);
    });

    it("supports replacing with a basic order", async () => {
      const old = await builder.swap({
        ownerAddress: OWNER,
        offered: TOKEN,
        minReceived: ADA,
        configToken: "aabb",
      });
      await mockOrderAndRefUtxos(old.datum as string);

      const composed = await builder.update({
        cancelUtxo: { hash: ORDER_UTXO_HASH, index: 0 },
        order: {
          kind: "basic",
          type: EV4BasicConstraint.Deposit,
          ownerAddress: OWNER,
          offered: [TOKEN],
          minReceived: [ADA],
          configToken: "ccdd",
        },
      });

      const datum = await datumOf(composed);
      expect(datum.constraints.map((c) => c[0])).toEqual([
        BASIC_HASH,
        FAIRNESS_HASH,
      ]);
    });
  });

  describe("mintPool()", () => {
    const SEED_TX = "ef".repeat(32);
    const TOKEN_B = new AssetAmount(1_000_000n, {
      assetId: `${"cc".repeat(28)}.744f4b454e42`,
      decimals: 0,
    });

    const dummyUtxo = (txHash: string, index: number) =>
      Core.TransactionUnspentOutput.fromCore([
        new Core.TransactionInput(
          Core.TransactionId(txHash),
          BigInt(index),
        ).toCore(),
        Core.TransactionOutput.fromCore({
          address: Core.getPaymentAddress(Core.addressFromBech32(OWNER)),
          value: makeValue(5_000_000n).toCore(),
        }).toCore(),
      ]);

    const wireMints = () => {
      // Seed UTxO for the pool ident.
      getUtxosMock.mockResolvedValue([dummyUtxo(SEED_TX, 0)]);
      // Every reference-input lookup resolves to a bare UTxO echoing its txid.
      getUtxosByOutRefMock.mockImplementation(async (inputs) => [
        dummyUtxo(String(inputs[0].transactionId()), Number(inputs[0].index())),
      ]);
    };

    it("supports a multi-asset (3-asset) constant-sum pool", async () => {
      wireMints();
      const TOKEN_C = new AssetAmount(1_000_000n, {
        assetId: `${"ee".repeat(28)}.744f4b454e43`,
        decimals: 0,
      });
      const composed = await builder.mintPool({
        assets: [TOKEN, TOKEN_B, TOKEN_C],
        curve: { kind: "constantSum", fee: { num: 1n, den: 1000n } },
        ownerAddress: OWNER,
      });
      const datum = parse(
        V4Types.PoolDatum,
        Core.PlutusData.fromCbor(Core.HexBlob(composed.datum as string)),
      );
      expect(datum.assets.length).toEqual(3);
      // Σ price·reserve with default prices [1,1,1] = 3 * 1e6.
      expect(datum.total_lp).toEqual(3_000_000n);
    });

    it("builds a constant-sum PoolDatum mirroring the settings config", async () => {
      wireMints();
      const composed = await builder.mintPool({
        assets: [TOKEN, TOKEN_B],
        curve: { kind: "constantSum", fee: { num: 1n, den: 1000n } },
        ownerAddress: OWNER,
      });

      const datum = parse(
        V4Types.PoolDatum,
        Core.PlutusData.fromCbor(Core.HexBlob(composed.datum as string)),
      );

      // LP: Σ price·reserve = 1e6 + 1e6 (prices default 1); premint equal.
      expect(datum.total_lp).toEqual(2_000_000n);
      expect(datum.circulating_lp).toEqual(2_000_000n);
      expect(datum.preminted_lp).toEqual(2_000_000n);
      // identifier is 28 bytes (56 hex).
      expect(datum.identifier.length).toEqual(56);
      // actions mirror the settings PoolConfig exactly.
      expect(datum.actions.length).toEqual(1);
      expect(datum.actions[0].tag).toEqual(3n);
      expect(datum.actions[0].modules).toEqual([
        CS_HASH,
        FEESPLIT_HASH,
        FAIRNESS_MOD_HASH,
      ]);
      // module_state: cs + fee-split committed, fairness = "80".
      expect(datum.module_state.map((m) => m[0])).toEqual([
        CS_HASH,
        FEESPLIT_HASH,
        FAIRNESS_MOD_HASH,
      ]);
      expect(datum.module_state[2][1]).toEqual("80");
      expect(datum.module_state[0][1].length).toEqual(64); // blake2b-256 hex
    });

    it("rejects a non-constant-sum curve", async () => {
      await expect(
        builder.mintPool({
          assets: [TOKEN, TOKEN_B],
          // @ts-expect-error — only constantSum is wired today
          curve: { kind: "constantProduct", fee: { num: 1n, den: 1000n } },
          ownerAddress: OWNER,
        }),
      ).rejects.toThrow(/only the "constantSum" curve/);
    });

    it("errors when the settings PoolConfig references an unknown module", async () => {
      const GOV_HASH = "bb".repeat(28);
      const configWithGov = serialize(V4Types.PoolConfig, {
        pool_validator: POOL_HASH,
        actions: [
          { tag: 3n, enabled: true, modules: [CS_HASH, FEESPLIT_HASH, FAIRNESS_MOD_HASH] },
          { tag: 1n, enabled: true, modules: [GOV_HASH] },
        ],
      }).toCbor();

      spyOn(
        QueryProviderSundaeSwap.prototype,
        "getProtocolSettings",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ).mockResolvedValueOnce([
        { label: "pool", txIn: { hash: "dd".repeat(32), index: 0 }, datum: configWithGov, values: { moduleConfigs: POOL_MODULE_CONFIGS } },
      ] as any);
      wireMints();

      await expect(
        builder.mintPool({
          assets: [TOKEN, TOKEN_B],
          curve: { kind: "constantSum", fee: { num: 1n, den: 1000n } },
          ownerAddress: OWNER,
        }),
      ).rejects.toThrow(new RegExp(GOV_HASH));
    });
  });
});
