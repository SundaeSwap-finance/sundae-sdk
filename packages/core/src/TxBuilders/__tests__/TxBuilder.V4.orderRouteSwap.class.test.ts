import { parse } from "@blaze-cardano/data";
import { Blaze, Core, Provider, Wallet } from "@blaze-cardano/sdk";
import { AssetAmount } from "@sundaeswap/asset";
import { afterAll, describe, expect, it, mock, spyOn } from "bun:test";

import { ESwapType } from "../../@types/configs.js";
import { EDatumType } from "../../@types/datumbuilder.js";
import {
  EContractVersion,
  ISundaeProtocolValidatorFull,
  TChainLeg,
} from "../../@types/index.js";
import { SwapConfig } from "../../Configs/SwapConfig.class.js";
import { V3Types, V4Types } from "../../DatumBuilders/ContractTypes/index.js";
import { DatumBuilderV3 } from "../../DatumBuilders/DatumBuilder.V3.class.js";
import { QueryProviderSundaeSwap } from "../../QueryProviders/QueryProviderSundaeSwap.js";
import { setupBlaze } from "../../TestUtilities/setupBlaze.js";
import { BlazeHelper } from "../../Utilities/BlazeHelper.class.js";
import { ADA_METADATA } from "../../constants.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { TxBuilderV3 } from "../TxBuilder.V3.class.js";
import {
  TV4ChainFirstLeg,
  TxBuilderV4,
  V4_VALIDATORS,
} from "../TxBuilder.V4.class.js";
import {
  params,
  referenceUtxosBlaze,
  settingsUtxosBlaze,
} from "../__data__/mockData.V3.js";

// The orders after the v4 one are built by the v3 and stableswap builders,
// which read the v3 deployment from these.
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

// Resolve the v4 deployment hashes locally. Only `hash` is read on this path,
// so the rest of the validator record is left out.
const V4_ORDER_HASH = "11".repeat(28);
spyOn(TxBuilderV4.prototype, "getValidatorScript").mockImplementation(
  async (name: string) =>
    ({
      hash: name === V4_VALIDATORS.order ? V4_ORDER_HASH : "22".repeat(28),
      blueprint: { validators: [] },
    }) as unknown as ISundaeProtocolValidatorFull,
);
// No indexed v4 settings, so nothing reaches the live API. Every v4 order
// here names its config token, budget and fee cap, which is all the settings
// would supply.
spyOn(
  QueryProviderSundaeSwap.prototype,
  "getProtocolSettings",
).mockResolvedValue([]);

let blaze: Blaze<Provider, Wallet>;
setupBlaze(async (instance) => {
  blaze = instance;
});

afterAll(() => {
  mock.restore();
});

const owner = PREVIEW_DATA.addresses.current;
const REFERRAL_DEST = PREVIEW_DATA.addresses.alternatives[0];
const V3_ORDER_HASH =
  "484969d936f484c45f143d911f81636fe925048e205048ee1fe412aa";
const TINDY = PREVIEW_DATA.assets.tindy.metadata.assetId;

// A v4 order buying 20,000,000 tINDY, then the v3 ADA/tINDY pool.
const v4First: TV4ChainFirstLeg = {
  offered: new AssetAmount(25_000_000n, ADA_METADATA),
  minReceived: PREVIEW_DATA.assets.tindy,
  budget: 3_000_000n,
  maxPerExecution: 2_000_000n,
  configToken: "aabb",
};
const v3Leg = {
  swapType: { type: ESwapType.MARKET as const, slippage: 0.03 },
  pool: PREVIEW_DATA.pools.v3,
};
const v4Last: TChainLeg = {
  contractVersion: EContractVersion.V4,
  minReceived: new AssetAmount(1_000_000n, {
    assetId:
      "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69425443",
    decimals: 6,
  }),
  budget: 3_000_000n,
  maxPerExecution: 2_000_000n,
  configToken: "aabb",
};

/** The v4 order's payout: the next order's script hash and datum. */
const getV4NextLeg = (datum: string) => {
  const { destination } = parse(
    V4Types.OrderDatum,
    Core.PlutusData.fromCbor(Core.HexBlob(datum)),
  );
  if (destination === "Self" || !destination.Fixed.datum) {
    throw new Error("Expected the v4 order to carry the next leg's datum.");
  }
  return {
    paymentCredential: destination.Fixed.address.payment_credential,
    datum: destination.Fixed.datum as Core.PlutusData,
  };
};

/** A v3 order's payout: the next order's address and inline datum. */
const getV3NextLeg = (datum: Core.PlutusData) => {
  const { destination } = parse(V3Types.OrderDatum, datum);
  const next = destination === "Self" ? undefined : destination.Fixed;
  if (typeof next?.datum !== "object" || !("InlineDatum" in next.datum)) {
    throw new Error("Expected the v3 order to carry the next leg's datum.");
  }
  return {
    paymentCredential: next.address.paymentCredential,
    datum: next.datum.InlineDatum[0] as Core.PlutusData,
  };
};

/** The least a v3 order on `v3Leg`'s pool delivers when offered `supplied`. */
const v3Floor = (supplied: AssetAmount) =>
  new SwapConfig({
    ...v3Leg,
    suppliedAsset: supplied,
    ownerAddress: owner,
    orderAddresses: {
      DestinationAddress: { address: owner, datum: { type: EDatumType.NONE } },
    },
  }).buildArgs().minReceivable;

/** The v4 order output's lovelace, from the built transaction. */
const v4OrderLovelace = async (
  build: () => Promise<{ builtTx: Core.Transaction }>,
) => {
  const { builtTx } = await build();
  return builtTx
    .body()
    .outputs()
    .find(
      (out) =>
        out.address().asBase()?.getPaymentCredential().hash === V4_ORDER_HASH,
    )
    ?.amount()
    .coin();
};

/** The single referral output and the 674 label of a built transaction. */
const referralPaid = async (
  build: () => Promise<{ builtTx: Core.Transaction }>,
) => {
  const { builtTx } = await build();
  const outputs = builtTx
    .body()
    .outputs()
    .filter((out) => out.address().toBech32() === REFERRAL_DEST);
  expect(outputs).toHaveLength(1);
  return {
    amount: outputs[0].amount(),
    label: builtTx.auxiliaryData()?.metadata()?.metadata()?.get(674n)?.asText(),
  };
};

describe("TxBuilderV4.orderRouteSwap()", () => {
  it("v4 to v3: the v3 order offers exactly the v4 floor and pays the owner", async () => {
    const { datum, fees, build } = await new TxBuilderV4(blaze).orderRouteSwap({
      ownerAddress: owner,
      legs: [v4First, v3Leg],
    });

    const next = getV4NextLeg(datum as string);
    expect(next.paymentCredential).toEqual({ Script: [V3_ORDER_HASH] });
    expect(parse(V3Types.OrderDatum, next.datum).details).toMatchObject({
      Swap: { offer: [...TINDY.split("."), 20_000_000n] },
    });
    expect(
      DatumBuilderV3.getDestinationAddressesFromDatum(next.datum.toCbor()),
    ).toEqual({
      paymentKeyHash: BlazeHelper.getPaymentHashFromBech32(owner),
      stakingKeyHash: BlazeHelper.getStakingHashFromBech32(owner),
    });

    // The v4 budget (3) plus the v3 order's fee (1), which the v4 order
    // carries through so the v3 order arrives funded.
    expect(fees.scooperFee.amount).toEqual(4_000_000n);
    // Offered 25 + deposit 2 + budget 3 + forwarded v3 fee 1.
    expect(await v4OrderLovelace(build)).toEqual(31_000_000n);
  });

  it("v4 to v3: the last order pays out to a custom destination", async () => {
    const destination = PREVIEW_DATA.addresses.alternatives[0];
    const { datum } = await new TxBuilderV4(blaze).orderRouteSwap({
      ownerAddress: owner,
      destination: { address: destination, datum: { type: EDatumType.NONE } },
      legs: [v4First, v3Leg],
    });

    const legB = getV4NextLeg(datum as string).datum;
    expect(
      DatumBuilderV3.getDestinationAddressesFromDatum(legB.toCbor()),
    ).toEqual({
      paymentKeyHash: BlazeHelper.getPaymentHashFromBech32(destination),
      stakingKeyHash: BlazeHelper.getStakingHashFromBech32(destination),
    });
  });

  it("v4 to stableswap: the stableswap order offers exactly the v4 floor", async () => {
    const { datum, fees } = await new TxBuilderV4(blaze).orderRouteSwap({
      ownerAddress: owner,
      legs: [
        v4First,
        {
          ...v3Leg,
          pool: {
            ...PREVIEW_DATA.pools.v3,
            linearAmplificationFactor: 500n,
            version: EContractVersion.Stableswaps,
          },
        },
      ],
    });

    const legB = parse(V3Types.OrderDatum, getV4NextLeg(datum as string).datum);
    expect(legB.details).toMatchObject({
      Swap: { offer: [...TINDY.split("."), 20_000_000n] },
    });
    // The v4 budget (3) plus the stableswap order's fee (1).
    expect(fees.scooperFee.amount).toEqual(4_000_000n);
  });

  it("v4 to v3 to v4: the v3 order pays into a v4 order offered its floor", async () => {
    const intent = spyOn(TxBuilderV4.prototype, "swapIntent");
    try {
      const { datum, fees, build } = await new TxBuilderV4(
        blaze,
      ).orderRouteSwap({ ownerAddress: owner, legs: [v4First, v3Leg, v4Last] });

      const legB = getV4NextLeg(datum as string).datum;
      expect(getV3NextLeg(legB).paymentCredential).toEqual({
        ScriptCredential: [V4_ORDER_HASH],
      });

      expect(intent).toHaveBeenCalledTimes(1);
      const [legC] = intent.mock.calls[0] as [{ offered: AssetAmount }];
      expect(legC.offered.metadata.assetId).toEqual(ADA_METADATA.assetId);
      expect(legC.offered.amount).toEqual(
        v3Floor(PREVIEW_DATA.assets.tindy).amount,
      );

      // v4 budget 3 + v3 fee 1 + the last order's budget 3 + the routed
      // deposit's extra 1 ADA over the v4 order's own deposit.
      expect(fees.scooperFee.amount).toEqual(8_000_000n);
      expect(await v4OrderLovelace(build)).toEqual(35_000_000n);
    } finally {
      intent.mockRestore();
    }
  });

  it("v4 to v3 to v3 to v3: each v3 order pays into the next, offered the one before's floor", async () => {
    const { datum, fees } = await new TxBuilderV4(blaze).orderRouteSwap({
      ownerAddress: owner,
      // tINDY -> ADA -> tINDY -> ADA on the same v3 pool.
      legs: [v4First, v3Leg, v3Leg, v3Leg],
    });

    const second = getV4NextLeg(datum as string).datum;
    const third = getV3NextLeg(second);
    const fourth = getV3NextLeg(third.datum);
    for (const next of [third, fourth]) {
      expect(next.paymentCredential).toEqual({
        ScriptCredential: [V3_ORDER_HASH],
      });
    }

    const secondFloor = v3Floor(PREVIEW_DATA.assets.tindy);
    const thirdFloor = v3Floor(secondFloor);
    expect(parse(V3Types.OrderDatum, third.datum).details).toMatchObject({
      Swap: { offer: ["", "", secondFloor.amount] },
    });
    expect(parse(V3Types.OrderDatum, fourth.datum).details).toMatchObject({
      Swap: { offer: [...TINDY.split("."), thirdFloor.amount] },
    });

    // v4 budget 3 + three v3 fees + the routed deposit's extra 1 ADA, added
    // once: each deposit passes on to the next order with its fill.
    expect(fees.scooperFee.amount).toEqual(7_000_000n);
  });

  it("an ADA floor under an alias id still sells ADA on the v3 order", async () => {
    const intent = spyOn(TxBuilderV4.prototype, "swapIntent");
    try {
      await new TxBuilderV4(blaze).orderRouteSwap({
        ownerAddress: owner,
        legs: [
          {
            ...v4First,
            offered: PREVIEW_DATA.assets.tindy,
            minReceived: new AssetAmount(25_000_000n, {
              ...ADA_METADATA,
              assetId: "",
            }),
          },
          v3Leg,
          v4Last,
        ],
      });
      const [legC] = intent.mock.calls[0] as [{ offered: AssetAmount }];
      expect(legC.offered.metadata.assetId).toEqual(TINDY);
    } finally {
      intent.mockRestore();
    }
  });

  it("refuses to chain into v1, which cannot read an inline datum", async () => {
    const v1Leg = { ...v3Leg, pool: PREVIEW_DATA.pools.v1 };
    const v4 = new TxBuilderV4(blaze);
    await expect(
      v4.orderRouteSwap({ ownerAddress: owner, legs: [v4First, v1Leg] }),
    ).rejects.toThrow(/cannot chain into v1/);
    await expect(
      v4.orderRouteSwap({
        ownerAddress: owner,
        legs: [v4First, v3Leg, v1Leg],
      }),
    ).rejects.toThrow(/cannot chain into v1/);
  });

  it("refuses two v4 orders in a row, and a v4 order before the last", async () => {
    const v4 = new TxBuilderV4(blaze);
    await expect(
      v4.orderRouteSwap({ ownerAddress: owner, legs: [v4First, v4Last] }),
    ).rejects.toThrow(/two v4 orders in a row/);
    await expect(
      v4.orderRouteSwap({
        ownerAddress: owner,
        legs: [v4First, v3Leg, v4Last, v3Leg],
      }),
    ).rejects.toThrow(/only places a later v4 order as the last order/);
  });

  it("sums token referral fees from every order into one output", async () => {
    const tindy = Core.AssetId(TINDY.replace(".", ""));
    const referral = (amount: bigint) => ({
      destination: REFERRAL_DEST,
      payment: new Core.Value(1_000_000n, new Map([[tindy, amount]])),
    });
    const { build } = await new TxBuilderV4(blaze).orderRouteSwap({
      ownerAddress: owner,
      legs: [
        { ...v4First, referralFee: referral(5n) },
        { ...v3Leg, referralFee: referral(7n) },
      ],
    });

    const { amount } = await referralPaid(build);
    expect(amount.coin()).toEqual(2_000_000n);
    expect(amount.multiasset()?.get(tindy)).toEqual(12n);
  });

  it("publishes the first referral label in legs order", async () => {
    const referral = (feeLabel: string) => ({
      destination: REFERRAL_DEST,
      payment: new Core.Value(1_000_000n),
      feeLabel,
    });
    const labelled = (labels: (string | undefined)[]) =>
      new TxBuilderV4(blaze).orderRouteSwap({
        ownerAddress: owner,
        legs: [
          {
            ...v4First,
            ...(labels[0] ? { referralFee: referral(labels[0]) } : {}),
          },
          { ...v3Leg, referralFee: referral(labels[1] as string) },
          { ...v3Leg, referralFee: referral(labels[2] as string) },
        ],
      });

    const all = await labelled(["Leg 1", "Leg 2", "Leg 3"]);
    expect((await referralPaid(all.build)).label).toEqual("Leg 1");

    // Without one on the v4 order, the second order's label wins over the
    // third's, although the third order is built first.
    const later = await labelled([undefined, "Leg 2", "Leg 3"]);
    const { amount, label } = await referralPaid(later.build);
    expect(label).toEqual("Leg 2");
    expect(amount.coin()).toEqual(2_000_000n);
  });

  it("refuses referral fees that name different destinations", async () => {
    await expect(
      new TxBuilderV4(blaze).orderRouteSwap({
        ownerAddress: owner,
        legs: [
          {
            ...v4First,
            referralFee: {
              destination: REFERRAL_DEST,
              payment: new Core.Value(1_000_000n),
            },
          },
          {
            ...v3Leg,
            referralFee: {
              destination: PREVIEW_DATA.addresses.alternatives[1],
              payment: new Core.Value(1_000_000n),
            },
          },
        ],
      }),
    ).rejects.toThrow(/must name the same destination/);
  });
});
