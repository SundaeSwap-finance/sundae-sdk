import { parse, serialize } from "@blaze-cardano/data";
import { Core } from "@blaze-cardano/sdk";
import { AssetAmount } from "@sundaeswap/asset";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { ADA_METADATA } from "../../../constants.js";
import { EDatumType } from "../../../@types/datumbuilder.js";
import { V4Types } from "../../ContractTypes/index.js";
import {
  DatumBuilderV4,
  EV4BasicConstraint,
} from "../../DatumBuilder.V4.class.js";

/** offered = policy aaaa / name aa; ask = policy bbbb / name bb. */
const OFFERED = new AssetAmount(1_000_000n, { assetId: "aaaa.aa", decimals: 0 });
const ASK = new AssetAmount(900_000n, { assetId: "bbbb.bb", decimals: 0 });

/**
 * Preview sample addresses (shared with the v3 test fixtures).
 */
const ADDRESSES = {
  // payment (VerificationKey) + stake
  withStake:
    "addr_test1qrlnzzc89s5p5nhsustx5q8emft3cjvce4tmhytkfhaae7qdxw2hcpavmh0vexyzg476ytc9urgcnalujkcewtnd2yzs2pf294",
  // enterprise, payment (VerificationKey) only
  enterprise: "addr_test1vz5ykwgmrejk3mdw0u3cewqx375qkjwnv5n4mhgjwap4n4qrymjhv",
  // script address
  script: "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
};

let builder: DatumBuilderV4;

beforeEach(() => {
  builder = new DatumBuilderV4("preview");
});

afterEach(() => {
  mock.restore();
});

describe("DatumBuilderV4", () => {
  /**
   * The strongest guarantee: our ported ContractTypes must encode the
   * `OrderDatum` shell byte-for-byte identically to the compiled contract.
   * This CBOR was emitted by sundae-v4's own Aiken test
   * `validators/tests/examples/datums.ak :: example_simple_order_datum_fixed`
   * (with `print_examples = True`). If the on-chain type layout changes and
   * this port drifts, this test fails.
   */
  describe("OrderDatum shell — on-chain vector", () => {
    it("serializes byte-identically to the contract's canonical CBOR", () => {
      const admin_key = "aabbccdd00112233445566778899aabb";
      const module_hash_cs =
        "0011223344556677889900aabbccddeeff00112233445566778899aabb";

      const pd = Core.PlutusData;
      const list = () => new Core.PlutusList();
      const assetInt = (policy: string, name: string, amt: bigint) => {
        const ac = list();
        ac.add(pd.newBytes(Buffer.from(policy, "hex")));
        ac.add(pd.newBytes(Buffer.from(name, "hex")));
        const tup = list();
        tup.add(pd.newConstrPlutusData(new Core.ConstrPlutusData(0n, ac)));
        tup.add(pd.newInteger(amt));
        return pd.newList(tup);
      };
      const offered = list();
      offered.add(assetInt("aaaa", "aa", 1_000_000n));
      const minReceived = list();
      minReceived.add(assetInt("bbbb", "bb", 900_000n));
      const swapFields = list();
      swapFields.add(pd.newList(offered));
      swapFields.add(pd.newList(minReceived));
      const constraintData = pd.newConstrPlutusData(
        new Core.ConstrPlutusData(0n, swapFields),
      );

      const datum: V4Types.OrderDatum = {
        owner: { Signature: { key_hash: admin_key } },
        destination: {
          Fixed: {
            address: {
              payment_credential: {
                VerificationKey: ["aabb0011223344556677889900112233"],
              },
              stake_credential: undefined,
            },
            datum: undefined,
          },
        },
        budget: 1_500_000n,
        share_batcher: 500n,
        config_token: "aabb",
        constraints: [[module_hash_cs, constraintData]],
        extension: DatumBuilderV4.buildVoidData(),
      };

      const canonical =
        "d8799fd8799f50aabbccdd00112233445566778899aabbffd8799fd8799fd8799f50aabb0011223344556677889900112233ffd87a80ffd87a80ff1a0016e3601901f442aabb9f9f581d0011223344556677889900aabbccddeeff00112233445566778899aabbd8799f9f9fd8799f42aaaa41aaff1a000f4240ffff9f9fd8799f42bbbb41bbff1a000dbba0ffffffffffd87980ff";

      expect(serialize(V4Types.OrderDatum, datum).toCbor()).toEqual(Core.HexBlob(canonical));
    });
  });

  /**
   * Golden CBOR emitted by the sundae-v4 CLI's `kernel/datums.ts`
   * (`plutusSwapConstraints` / `plutusBasicConstraints`), the current
   * post-PR-#11 reference. offered aaaa/aa 1_000_000, remaining 750_000,
   * min-received bbbb/bb 900_000.
   */
  describe("constraint data — golden CLI vectors", () => {
    it("swap constraint is Constr 2 and matches the CLI byte-for-byte", () => {
      const data = builder.buildSwapConstraintData({
        offered: OFFERED,
        originalOffered: 1_000_000n,
        remainingOffered: 750_000n,
        minReceived: [ASK],
      });
      expect(data.toCbor()).toEqual(
        Core.HexBlob(
          "d87b9fd8799f42aaaa41aaff1a000f42401a000b71b09f9fd8799f42bbbb41bbff1a000dbba0ffffff",
        ),
      );
    });

    it("deposit constraint is Constr 0 and matches the CLI", () => {
      const data = builder.buildBasicConstraintData({
        type: EV4BasicConstraint.Deposit,
        offered: [OFFERED],
        minReceived: [ASK],
      });
      expect(data.toCbor()).toEqual(
        Core.HexBlob(
          "d8799f9f9fd8799f42aaaa41aaff1a000f4240ffff9f9fd8799f42bbbb41bbff1a000dbba0ffffff",
        ),
      );
    });

    it("withdraw constraint is Constr 1 and matches the CLI", () => {
      const data = builder.buildBasicConstraintData({
        type: EV4BasicConstraint.Withdraw,
        offered: [OFFERED],
        minReceived: [ASK],
      });
      expect(data.toCbor()).toEqual(
        Core.HexBlob(
          "d87a9f9f9fd8799f42aaaa41aaff1a000f4240ffff9f9fd8799f42bbbb41bbff1a000dbba0ffffff",
        ),
      );
    });

    it("claim constraint uses Constr 3", () => {
      const data = builder.buildBasicConstraintData({
        type: EV4BasicConstraint.Claim,
        offered: [OFFERED],
        minReceived: [ASK],
      });
      // d87b = Constr 2; Constr 3 = d87c
      expect(data.toCbor().startsWith("d87c")).toBe(true);
    });
  });

  describe("buildConstantSumConfigDatum()", () => {
    it("matches the blueprint's 4-field CS config byte-for-byte", () => {
      const { inline, schema } = builder.buildConstantSumConfigDatum({
        prices: [1n, 1n],
        fee: { num: 1n, den: 10n },
      });
      expect(schema.bounty_k).toEqual({ num: 0n, den: 1n });
      expect(schema.waive_fee_on_claim).toEqual(false);
      // Golden CBOR from sundae-v4 blueprint serialize(ConstantSumConfig, …).
      expect(inline).toEqual("d8799f9f0101ffd8799f010affd8799f0001ffd87980ff");
    });
  });

  describe("buildPoolDatum() + hashModuleConfig()", () => {
    it("matches the blueprint's PoolDatum byte-for-byte", () => {
      const swapMod = "11".repeat(28);
      const feeMod = "22".repeat(28);
      const fairMod = "33".repeat(28);

      const csConfig = builder.buildConstantSumConfigDatum({
        prices: [1n, 1n],
        fee: { num: 1n, den: 10n },
      });
      const csStateHash = DatumBuilderV4.hashModuleConfig(csConfig.inline);
      // blake2b_256 of the CS config CBOR (verified against sundae-v4).
      expect(csStateHash).toEqual(
        "1000fdabb5fe420325e8c9bf815eef8fd18f32b131bc5c9c62f568bdabc66621",
      );

      const { inline } = builder.buildPoolDatum({
        assets: [
          new AssetAmount(1000n, { assetId: "aaaa.aa", decimals: 0 }),
          new AssetAmount(1000n, { assetId: "bbbb.bb", decimals: 0 }),
        ],
        totalLp: 1000n,
        circulatingLp: 0n,
        premintedLp: 1000n,
        identifier: "deadbeef",
        actions: [{ tag: 100n, enabled: true, modules: [swapMod, feeMod, fairMod] }],
        moduleState: [
          [swapMod, csStateHash],
          [feeMod, "aabbccdd"],
          [fairMod, "80"],
        ],
      });

      expect(inline).toEqual(
        "d8799f9f9fd8799f42aaaa41aaff1903e8ff9fd8799f42bbbb41bbff1903e8ffff1903e8001903e844deadbeef9fd8799f1864d87a809f581c11111111111111111111111111111111111111111111111111111111581c22222222222222222222222222222222222222222222222222222222581c33333333333333333333333333333333333333333333333333333333ffffff9f9f581c1111111111111111111111111111111111111111111111111111111158201000fdabb5fe420325e8c9bf815eef8fd18f32b131bc5c9c62f568bdabc66621ff9f581c2222222222222222222222222222222222222222222222222222222244aabbccddff9f581c333333333333333333333333333333333333333333333333333333334180ffffff",
      );
    });
  });

  describe("buildVoidData()", () => {
    it("is the constructor-0 empty value (d87980)", () => {
      expect(DatumBuilderV4.buildVoidData().toCbor()).toEqual(Core.HexBlob("d87980"));
    });
  });

  describe("buildOwnerDatum()", () => {
    it("builds a Signature owner from a verification-key address", () => {
      const { schema, inline } = builder.buildOwnerDatum(ADDRESSES.enterprise);
      expect(schema).toHaveProperty("Signature");
      // round-trips
      expect(
        serialize(
          V4Types.MultisigScript,
          parse(V4Types.MultisigScript, Core.PlutusData.fromCbor(Core.HexBlob(inline))),
        ).toCbor(),
      ).toEqual(Core.HexBlob(inline));
    });

    it("builds a Script owner from a script address", () => {
      const { schema } = builder.buildOwnerDatum(ADDRESSES.script);
      expect(schema).toHaveProperty("Script");
    });

    it("keys the Signature on the staking hash when present", () => {
      const { schema } = builder.buildOwnerDatum(ADDRESSES.withStake);
      expect(schema).toHaveProperty("Signature");
    });
  });

  describe("buildDestinationAddresses()", () => {
    it("builds a Fixed destination with an inline stake credential", () => {
      const { schema, inline } = builder.buildDestinationAddresses({
        address: ADDRESSES.withStake,
        datum: { type: EDatumType.NONE },
      });
      expect(schema).not.toEqual("Self");
      if (schema !== "Self") {
        expect(schema.Fixed.address.stake_credential).toBeDefined();
        expect(schema.Fixed.datum).toBeUndefined();
      }
      // round-trips
      expect(
        serialize(
          V4Types.Destination,
          parse(V4Types.Destination, Core.PlutusData.fromCbor(Core.HexBlob(inline))),
        ).toCbor(),
      ).toEqual(Core.HexBlob(inline));
    });

    it("omits the stake credential for an enterprise address", () => {
      const { schema } = builder.buildDestinationAddresses({
        address: ADDRESSES.enterprise,
        datum: { type: EDatumType.NONE },
      });
      if (schema !== "Self") {
        expect(schema.Fixed.address.stake_credential).toBeUndefined();
      }
    });

    it("attaches an inline datum when provided", () => {
      const { schema } = builder.buildDestinationAddresses({
        address: ADDRESSES.enterprise,
        datum: { type: EDatumType.INLINE, value: "d87980" },
      });
      if (schema !== "Self") {
        expect(schema.Fixed.datum).toBeDefined();
      }
    });

    it("rejects a datum-hash destination (v4 has no hash variant)", () => {
      expect(() =>
        builder.buildDestinationAddresses({
          address: ADDRESSES.enterprise,
          datum: { type: EDatumType.HASH, value: "de".repeat(32) },
        }),
      ).toThrow(/inline datum only/);
    });
  });

  describe("buildSelfDestination()", () => {
    it("is the constructor-1 empty value (d87a80)", () => {
      expect(builder.buildSelfDestination().inline).toEqual("d87a80");
    });
  });

  describe("buildAssetClassDatum()", () => {
    it("canonicalises ADA to empty policy / empty name", () => {
      const { schema } = builder.buildAssetClassDatum(
        new AssetAmount(100n, ADA_METADATA),
      );
      expect(schema).toEqual({ policy: "", name: "" });
    });

    it("splits an alt-coin assetId into policy / name", () => {
      const policy = "fa".repeat(28);
      const name = "544f4b454e";
      const { schema } = builder.buildAssetClassDatum(
        new AssetAmount(100n, { assetId: `${policy}.${name}`, decimals: 0 }),
      );
      expect(schema).toEqual({ policy, name });
    });
  });

  describe("buildOrderDatum()", () => {
    it("assembles and round-trips the shell from an address owner", () => {
      const { inline, schema } = builder.buildOrderDatum({
        owner: ADDRESSES.enterprise,
        destination: {
          address: ADDRESSES.withStake,
          datum: { type: EDatumType.NONE },
        },
        budget: 1_500_000n,
        shareBatcher: 500n,
        configToken: "aabb",
        constraints: [["11".repeat(28), DatumBuilderV4.buildVoidData()]],
      });

      expect(schema.owner).toHaveProperty("Signature");
      expect(schema.budget).toEqual(1_500_000n);
      expect(schema.constraints.length).toEqual(1);

      const reparsed = parse(
        V4Types.OrderDatum,
        Core.PlutusData.fromCbor(Core.HexBlob(inline)),
      );
      expect(serialize(V4Types.OrderDatum, reparsed).toCbor()).toEqual(Core.HexBlob(inline));
      expect(reparsed.config_token).toEqual("aabb");
      expect(reparsed.share_batcher).toEqual(500n);
    });

    it("supports a Self destination and an explicit multisig owner", () => {
      const owner: V4Types.MultisigScript = {
        AtLeast: {
          required: 2n,
          scripts: [
            { Signature: { key_hash: "aa".repeat(28) } },
            { Signature: { key_hash: "bb".repeat(28) } },
            { Signature: { key_hash: "cc".repeat(28) } },
          ],
        },
      };
      const { schema } = builder.buildOrderDatum({
        owner,
        destination: "Self",
        budget: 1_000_000n,
        shareBatcher: 500n,
        configToken: "aabb",
        constraints: [],
      });
      expect(schema.owner).toHaveProperty("AtLeast");
      expect(schema.destination).toEqual("Self");
    });
  });
});
