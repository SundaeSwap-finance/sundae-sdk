import { parse } from "@blaze-cardano/data";
import { Core } from "@blaze-cardano/sdk";
import { AssetAmount } from "@sundaeswap/asset";
import { afterAll, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

import { Blaze, Provider, Wallet } from "@blaze-cardano/sdk";

import { EContractVersion } from "../../@types/index.js";
import { ADA_METADATA } from "../../constants.js";
import { V4Types } from "../../DatumBuilders/ContractTypes/index.js";
import { EV4BasicConstraint } from "../../DatumBuilders/DatumBuilder.V4.class.js";
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
    }[name];
    return { hash, title: name, compiledCode: "" };
  }) as any,
);

setupBlaze(
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
  });

  describe("SundaeSDK facade", () => {
    it("exposes the V4 builder via sdk.builder(EContractVersion.V4)", () => {
      const sdk = SundaeSDK.new({ blazeInstance });
      expect(sdk.builder(EContractVersion.V4)).toBeInstanceOf(TxBuilderV4);
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

    it("defaults the destination to the owner address, and budget/shareBatcher to protocol defaults", async () => {
      const composed = await builder.swap({
        ownerAddress: OWNER,
        offered: TOKEN,
        minReceived: ADA,
        configToken: "aabb",
      });
      const datum = await datumOf(composed);
      expect(datum.destination).toHaveProperty("Fixed");
      expect(datum.budget).toEqual(3_000_000n);
      expect(datum.share_batcher).toEqual(10_000n);
    });
  });

  describe("basic() / deposit() / withdraw()", () => {
    it("deposit emits [basic(Constr0), fairness(Void)] — no route constraint", async () => {
      const composed = await builder.deposit({
        ownerAddress: OWNER,
        offered: [TOKEN],
        minReceived: [ADA],
        configToken: "aabb",
      });
      const datum = await datumOf(composed);
      expect(datum.constraints.map((c) => c[0])).toEqual([
        BASIC_HASH,
        FAIRNESS_HASH,
      ]);
      expect(datum.constraints[0][1].toCbor().startsWith("d879")).toBe(true);
      expect(datum.constraints[1][1].toCbor()).toEqual(Core.HexBlob("d87980"));
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
});
