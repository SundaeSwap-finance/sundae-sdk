import {
  Blaze,
  TxBuilder as BlazeTx,
  Core,
  makeValue,
} from "@blaze-cardano/sdk";
import { afterAll, describe, expect, it, mock, spyOn } from "bun:test";

import { parse, Void } from "@blaze-cardano/data";
import { ESwapType } from "../../@types/configs.js";
import { EDatumType, EDestinationType } from "../../@types/datumbuilder.js";
import { IComposedTx, ITxBuilderFees } from "../../@types/txbuilders.js";
import {
  V1Types,
  V3Types,
  V4Types,
} from "../../DatumBuilders/ContractTypes/index.js";
import { DatumBuilderV3 } from "../../DatumBuilders/DatumBuilder.V3.class.js";
import { DatumBuilderV4 } from "../../DatumBuilders/DatumBuilder.V4.class.js";
import { QueryProviderSundaeSwap } from "../../QueryProviders/QueryProviderSundaeSwap.js";
import { setupBlaze } from "../../TestUtilities/setupBlaze.js";
import { BlazeHelper } from "../../Utilities/BlazeHelper.class.js";
import {
  ADA_METADATA,
  ORDER_DEPOSIT_DEFAULT,
  POOL_MIN_FEE,
} from "../../constants.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { TxBuilderV1 } from "../TxBuilder.V1.class.js";
import { TxBuilderV3 } from "../TxBuilder.V3.class.js";
import { TxBuilderV4, V4_VALIDATORS } from "../TxBuilder.V4.class.js";
import { EContractVersion } from "../../@types/index.js";
import { AssetAmount } from "@sundaeswap/asset";
import {
  mockOrderToCancel,
  params,
  referenceUtxosBlaze,
  settingsUtxosBlaze,
} from "../__data__/mockData.V3.js";

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

let builder: TxBuilderV3;

const TEST_REFERRAL_DEST = PREVIEW_DATA.addresses.alternatives[0];

/**
 * Utility method to get the payment address. V3 contracts append the DestinationAddress
 * staking key to the order contract, so the user can still earn rewards.
 * @param output
 * @returns
 */
const getPaymentAddressFromOutput = (output: Core.TransactionOutput) => {
  const credential = output.address().asBase()?.getPaymentCredential();
  if (!credential) {
    throw new Error("No payment credential found.");
  }

  return Core.addressFromCredential(0, Core.Credential.fromCore(credential));
};

/** Leg A's payout in a chained swap: the next leg's address and inline datum. */
const getNextLeg = (datum: string) => {
  const { destination } = parse(
    V3Types.OrderDatum,
    Core.PlutusData.fromCbor(Core.HexBlob(datum)),
  );
  const next = destination === "Self" ? undefined : destination.Fixed;
  if (typeof next?.datum !== "object" || !("InlineDatum" in next.datum)) {
    throw new Error("Expected leg A to carry the next leg's datum inline.");
  }
  return { address: next.address, datum: next.datum.InlineDatum[0] };
};

const { getUtxosByOutRefMock, resolveDatumMock } = setupBlaze(async (blaze) => {
  builder = new TxBuilderV3(blaze);
});

// A v3 -> v4 chain asks the v4 builder for its order address and datum, which
// needs the v4 deployment hashes. Resolve them locally, as the v4 suite does.
const V4_ORDER_HASH = "11".repeat(28);
spyOn(TxBuilderV4.prototype, "getValidatorScript").mockImplementation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (async (name: string) => {
    const hash = name === V4_VALIDATORS.order ? V4_ORDER_HASH : "22".repeat(28);
    return { hash, blueprint: { validators: [] } };
  }) as any,
);

afterAll(() => {
  mock.restore();
});

describe("TxBuilderBlazeV3", () => {
  it("should have the correct settings", () => {
    expect(builder.network).toEqual("preview");
    expect(builder.blaze).toBeInstanceOf(Blaze);
  });

  it("should get the correct maxScooperFee", async () => {
    const result = await builder.getMaxScooperFeeAmount();
    expect(result.toString()).toEqual("1000000");
  });

  it("should respect a max scooper fee override", async () => {
    const result = await builder.getMaxScooperFeeAmount();
    expect(result.toString()).toEqual("1000000");
    builder.setMaxScooperFee(2_000_000n);
    const newResult = await builder.getMaxScooperFeeAmount();
    expect(newResult.toString()).toEqual("2000000");
    builder.resetMaxScooperFee();
    const finalResult = await builder.getMaxScooperFeeAmount();
    expect(finalResult.toString()).toEqual("1000000");
  });

  it("should create a new transaction instance correctly", async () => {
    expect(builder.newTxInstance()).toBeInstanceOf(BlazeTx);

    const txWithReferralAndLabel = builder.newTxInstance({
      destination: TEST_REFERRAL_DEST,
      payment: new Core.Value(1_500_000n),
      feeLabel: "Test Label",
    });

    const txComplete = await txWithReferralAndLabel.complete();
    const metadata = txComplete.auxiliaryData()?.metadata()?.metadata();

    expect(metadata).not.toBeUndefined();
    expect(metadata?.get(674n)?.asText()).toEqual("Test Label");

    let referralAddressOutput: Core.TransactionOutput | undefined;
    [...Array(txComplete.body().outputs().length).keys()].forEach((index) => {
      const output = txComplete.body().outputs()[index];
      if (
        output.address().toBech32() === TEST_REFERRAL_DEST &&
        output.amount().coin().toString() === "1500000"
      ) {
        referralAddressOutput = output;
      }
    });

    expect(referralAddressOutput).not.toBeUndefined();
    expect(referralAddressOutput?.address().toBech32()).toEqual(
      Core.PaymentAddress(TEST_REFERRAL_DEST),
    );

    const txWithReferral = builder.newTxInstance({
      destination: TEST_REFERRAL_DEST,
      payment: new Core.Value(1_300_000n),
    });

    const txComplete2 = await txWithReferral.complete();
    expect(txComplete2.auxiliaryData()?.metadata()?.metadata()).toBeUndefined();

    let referralAddressOutput2: Core.TransactionOutput | undefined;
    [...Array(txComplete2.body().outputs().length).keys()].forEach((index) => {
      const output = txComplete2.body().outputs()[index];
      if (
        output.address().toBech32() === TEST_REFERRAL_DEST &&
        output.amount().coin().toString() === "1300000"
      ) {
        referralAddressOutput2 = output;
      }
    });

    expect(referralAddressOutput2).not.toBeUndefined();
    expect(referralAddressOutput2?.address().toBech32()).toEqual(
      Core.PaymentAddress(TEST_REFERRAL_DEST),
    );

    const txWithoutReferral = builder.newTxInstance();
    const txComplete3 = await txWithoutReferral.complete();

    expect(txComplete3.auxiliaryData()?.metadata()?.metadata()).toBeUndefined();

    let referralAddressOutput3: Core.TransactionOutput | undefined;
    [...Array(txComplete3.body().outputs().length).keys()].forEach((index) => {
      const output = txComplete3.body().outputs()[index];
      if (output.address().toBech32() === TEST_REFERRAL_DEST) {
        referralAddressOutput3 = output;
      }
    });

    expect(referralAddressOutput3).toBeUndefined();
  });

  it("should allow you to cancel an order", async () => {
    getUtxosByOutRefMock.mockResolvedValue([
      ...mockOrderToCancel.map((i) =>
        Core.TransactionUnspentOutput.fromCore([
          new Core.TransactionInput(
            Core.TransactionId(i.txHash),
            BigInt(i.outputIndex),
          ).toCore(),
          Core.TransactionOutput.fromCore({
            address: Core.getPaymentAddress(Core.Address.fromBech32(i.address)),
            value: makeValue(
              i.assets.lovelace,
              ...Object.entries(i.assets).filter(([key]) => key !== "lovelace"),
            ).toCore(),
            datum: Core.PlutusData.fromCbor(
              Core.HexBlob(i.datum as string),
            ).toCore(),
          }).toCore(),
        ]),
      ),
      ...referenceUtxosBlaze,
    ]);

    const spiedGetSignerKeyFromDatum = spyOn(
      DatumBuilderV3,
      "getSignerKeyFromDatum",
    );

    const { build, fees } = await builder.cancel({
      utxo: {
        hash: "b18feb718648b33ef4900519b76f72f46723577ebad46191e2f8e1076c2b632c",
        index: 0,
      },
    });

    expect(spiedGetSignerKeyFromDatum).toHaveReturnedTimes(1);

    expect(fees.deposit.amount).toEqual(0n);
    expect(fees.scooperFee.amount).toEqual(0n);
    expect(fees.referral).toBeUndefined();
    expect(fees.cardanoTxFee).toBeUndefined();

    const { builtTx } = await build();
    const txFee = builtTx.body().fee();
    expect(builtTx.body().inputs().size()).toEqual(1);
    expect(builtTx.body().inputs().values()[0].transactionId()).toEqual(
      Core.TransactionId(
        "b18feb718648b33ef4900519b76f72f46723577ebad46191e2f8e1076c2b632c",
      ),
    );
    expect(builtTx.body().inputs().values()[0].index().toString()).toEqual("0");
    expect(builtTx.body().outputs().length).toEqual(1);
    expect(
      Number(builtTx.body().outputs()[0].amount().coin()),
    ).toBeGreaterThanOrEqual(
      Number(mockOrderToCancel[0].assets.lovelace - txFee),
    );
    for (const [id, amt] of Object.entries(mockOrderToCancel[0].assets)) {
      if (id === "lovelace") {
        continue;
      }

      const outputAmount = builtTx
        .body()
        .outputs()[0]
        .amount()
        .multiasset()
        ?.get(Core.AssetId(id));
      expect(outputAmount).not.toBeUndefined();
      expect(outputAmount?.toString()).toEqual(amt.toString());
    }
    expect(fees.cardanoTxFee?.amount.toString()).toEqual(txFee.toString());
  });

  it("cancel() v1 order", async () => {
    const spiedOnV1Cancel = spyOn(TxBuilderV1.prototype, "cancel");
    getUtxosByOutRefMock.mockResolvedValue([
      Core.TransactionUnspentOutput.fromCore([
        new Core.TransactionInput(
          Core.TransactionId(
            PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.txHash,
          ),
          BigInt(PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.outputIndex),
        ).toCore(),
        Core.TransactionOutput.fromCore({
          address: Core.getPaymentAddress(
            Core.Address.fromBech32(
              PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.address,
            ),
          ),
          value: makeValue(
            PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.assets.lovelace,
            ...Object.entries(
              PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.assets,
            ).filter(([key]) => key !== "lovelace"),
          ).toCore(),
          datumHash: Core.DatumHash(
            PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.datumHash as string,
          ),
        }).toCore(),
      ]),
    ]);

    resolveDatumMock.mockResolvedValueOnce(
      Core.PlutusData.fromCbor(
        Core.HexBlob(
          PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.datum as string,
        ),
      ),
    );

    // Don't care to mock v3 so it will throw.
    try {
      await builder.cancel({
        utxo: {
          hash: PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.txHash,
          index: PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.outputIndex,
        },
      });
    } catch (e) {
      expect(spiedOnV1Cancel).toHaveBeenCalledTimes(1);
    }
  });

  it("swap()", async () => {
    const spiedNewTx = spyOn(builder, "newTxInstance");
    const spiedBuildSwapDatum = spyOn(builder.datumBuilder, "buildSwapDatum");

    // Ensure that our tests are running at a consistent date due to decaying fees.
    const spiedDate = spyOn(Date, "now");
    spiedDate.mockImplementation(() => new Date("2023-12-10").getTime());

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

    expect(spiedNewTx).toHaveBeenNthCalledWith(1, undefined);
    expect(spiedBuildSwapDatum).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ident: PREVIEW_DATA.pools.v3.ident,
        order: expect.objectContaining({
          offered: expect.objectContaining({
            amount: PREVIEW_DATA.assets.tada.amount,
          }),
        }),
      }),
    );

    expect(datum).toEqual(
      "d8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87a9f9f40401a01312d00ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a010cd3b9ffff43d87980ff",
    );
    expect(fees).toMatchObject({
      deposit: expect.objectContaining({
        amount: ORDER_DEPOSIT_DEFAULT,
        metadata: ADA_METADATA,
      }),
      scooperFee: expect.objectContaining({
        amount: 1_000_000n,
        metadata: ADA_METADATA,
      }),
    } as ITxBuilderFees);

    const { builtTx } = await build();
    expect(fees.cardanoTxFee).not.toBeUndefined();

    let depositOutput: Core.TransactionOutput | undefined;
    [...Array(builtTx.body().outputs().length).keys()].forEach((index) => {
      const output = builtTx.body().outputs()[index];

      if (
        getPaymentAddressFromOutput(output).toBech32() ===
          "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe" &&
        // Supplied asset (20) + deposit (2) + scooper fee (1) = 23
        output.amount().coin().toString() === "23000000"
      ) {
        depositOutput = output;
      }
    });

    expect(depositOutput).not.toBeUndefined();
    expect(depositOutput?.datum()?.asDataHash()).toBeUndefined();
    expect(builtTx.witnessSet().plutusData()?.values()?.[0]).toBeUndefined();

    const inlineDatum = depositOutput?.datum()?.asInlineData()?.toCbor();
    expect(inlineDatum).not.toBeUndefined();
    expect(inlineDatum).toEqual(datum as Core.HexBlob);
  });

  it("swap() with feePadding adds to order deposit", async () => {
    const spiedDate = spyOn(Date, "now");
    spiedDate.mockImplementation(() => new Date("2023-12-10").getTime());

    const { build, fees } = await builder.swap({
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
      feePadding: 1_000_000n,
    });

    expect(fees.deposit.amount).toEqual(ORDER_DEPOSIT_DEFAULT + 1_000_000n);
    expect(fees.deposit.amount).toEqual(3_000_000n);

    const { builtTx } = await build();
    let depositOutput: Core.TransactionOutput | undefined;
    [...Array(builtTx.body().outputs().length).keys()].forEach((index) => {
      const output = builtTx.body().outputs()[index];
      if (
        getPaymentAddressFromOutput(output).toBech32() ===
          "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe" &&
        output.amount().coin().toString() === "24000000"
      ) {
        depositOutput = output;
      }
    });
    expect(depositOutput).not.toBeUndefined();
  });

  it("swap() with incorrect idents should throw", async () => {
    try {
      await builder.swap({
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
        pool: {
          ...PREVIEW_DATA.pools.v3,
          ident: "00",
        },
        suppliedAsset: PREVIEW_DATA.assets.tada,
      });
    } catch (e) {
      expect((e as Error).message).toEqual(DatumBuilderV3.INVALID_POOL_IDENT);
    }
  });

  it("orderRouteSwap() - v3 to v4 chains into a v4 intent", async () => {
    // The v4 tail is ONE pool-agnostic intent, so a route whose tail spans
    // several v4 pools is still a single chain leg. Leg A is a v3 swap whose
    // payout destination is the v4 order address, carrying the v4 datum.
    const { fees } = await builder.orderRouteSwap({
      ownerAddress: PREVIEW_DATA.addresses.current,
      swapA: {
        swapType: { type: ESwapType.MARKET, slippage: 0.03 },
        pool: PREVIEW_DATA.pools.v3,
        suppliedAsset: PREVIEW_DATA.assets.tindy,
      },
      swapB: {
        contractVersion: EContractVersion.V4,
        minReceived: new AssetAmount(1_000_000n, {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69425443",
          decimals: 6,
        }),
        // Hex asset name, explicit so the test does not depend on the query.
        budget: 3_000_000n,
        configToken: "aabb",
      },
    });

    // v3's own 1 ADA plus the v4 leg's 3 ADA budget, which leg A forwards so
    // the v4 order arrives already funded.
    expect(fees.scooperFee.amount.toString()).toEqual("4000000");
  });

  it("orderRouteSwap() - a v4 leg may be offered more than the previous leg guarantees", async () => {
    // A chained leg's datum is fixed before the previous leg fills, so by
    // default it can only name that leg's MINIMUM. Anything won above it
    // arrives unclaimed and comes back unconverted. A v4 order's `offered` is
    // an upper bound (the validator checks `consumed <= offered`), and the
    // scooper consumes at most the tokens the order holds, so a caller may
    // name the expected token fill and have all of it converted.
    const intent = spyOn(TxBuilderV4.prototype, "swapIntent");
    // swapA sells 20 ADA for tINDY, guaranteeing well under 25,000,000.
    const expected = PREVIEW_DATA.assets.tindy.withAmount(25_000_000n);

    await builder.orderRouteSwap({
      ownerAddress: PREVIEW_DATA.addresses.current,
      swapA: {
        swapType: { type: ESwapType.MARKET, slippage: 0.03 },
        pool: PREVIEW_DATA.pools.v3,
        suppliedAsset: PREVIEW_DATA.assets.tada,
      },
      swapB: {
        contractVersion: EContractVersion.V4,
        minReceived: new AssetAmount(1_000_000n, ADA_METADATA),
        offered: expected,
        budget: 3_000_000n,
        configToken: "aabb",
      },
    });

    expect(intent).toHaveBeenCalled();
    const [args] = intent.mock.calls[0] as [{ offered: AssetAmount }];
    expect(args.offered.amount).toBe(expected.amount);
    intent.mockRestore();
  });

  it("orderRouteSwap() - a v4 leg cannot be offered more ADA than the previous leg guarantees", async () => {
    // The scooper spends the full offered lovelace, so an ADA offer above
    // what arrives eats the order's deposit and budget, then stops it filling.
    await expect(
      builder.orderRouteSwap({
        ownerAddress: PREVIEW_DATA.addresses.current,
        swapA: {
          swapType: { type: ESwapType.MARKET, slippage: 0.03 },
          pool: PREVIEW_DATA.pools.v3,
          // Sells 20,000,000 tINDY, guaranteeing well under 25 ADA.
          suppliedAsset: PREVIEW_DATA.assets.tindy,
        },
        swapB: {
          contractVersion: EContractVersion.V4,
          minReceived: PREVIEW_DATA.assets.usdc,
          offered: new AssetAmount(25_000_000n, ADA_METADATA),
          budget: 3_000_000n,
          configToken: "aabb",
        },
      }),
    ).rejects.toThrow(/cannot offer 25000000 lovelace/);
  });

  it("orderRouteSwap() - a v4 leg's offered must be the asset the previous leg delivers", async () => {
    await expect(
      builder.orderRouteSwap({
        ownerAddress: PREVIEW_DATA.addresses.current,
        swapA: {
          swapType: { type: ESwapType.MARKET, slippage: 0.03 },
          pool: PREVIEW_DATA.pools.v3,
          // Sells tINDY, so swapA delivers ADA.
          suppliedAsset: PREVIEW_DATA.assets.tindy,
        },
        swapB: {
          contractVersion: EContractVersion.V4,
          minReceived: new AssetAmount(1_000_000n, ADA_METADATA),
          offered: PREVIEW_DATA.assets.usdc,
          budget: 3_000_000n,
          configToken: "aabb",
        },
      }),
    ).rejects.toThrow(/must be the asset the order before it delivers/);
  });

  it("orderRouteSwap() - a v4 leg defaults to what the previous leg guarantees", async () => {
    // Without an expectation there is nothing better to name than the
    // minimum, which is always present and so always fillable.
    const intent = spyOn(TxBuilderV4.prototype, "swapIntent");

    await builder.orderRouteSwap({
      ownerAddress: PREVIEW_DATA.addresses.current,
      swapA: {
        swapType: { type: ESwapType.MARKET, slippage: 0.03 },
        pool: PREVIEW_DATA.pools.v3,
        suppliedAsset: PREVIEW_DATA.assets.tindy,
      },
      swapB: {
        contractVersion: EContractVersion.V4,
        minReceived: new AssetAmount(1_000_000n, ADA_METADATA),
        budget: 3_000_000n,
        configToken: "aabb",
      },
    });

    const [args] = intent.mock.calls[0] as [{ offered: AssetAmount }];
    // swapA's minReceivable, not an arbitrary figure.
    expect(args.offered.amount).toBeGreaterThan(0n);
    intent.mockRestore();
  });

  it("orderRouteSwap() - v3 to v4 pays out to a custom destination", async () => {
    const owner = PREVIEW_DATA.addresses.current;
    const destination = {
      address: PREVIEW_DATA.addresses.alternatives[0],
      datum: { type: EDatumType.NONE as const },
    };

    const { datum } = await builder.orderRouteSwap({
      ownerAddress: owner,
      destination,
      swapA: {
        swapType: { type: ESwapType.MARKET, slippage: 0.03 },
        pool: PREVIEW_DATA.pools.v3,
        suppliedAsset: PREVIEW_DATA.assets.tindy,
      },
      swapB: {
        contractVersion: EContractVersion.V4,
        minReceived: new AssetAmount(1_000_000n, ADA_METADATA),
        budget: 3_000_000n,
        configToken: "aabb",
      },
    });

    // Leg A pays into the v4 order script.
    const next = getNextLeg(datum as string);
    expect(next.address.paymentCredential).toEqual({
      ScriptCredential: [V4_ORDER_HASH],
    });

    const legB = parse(V4Types.OrderDatum, next.datum);
    const v4 = new DatumBuilderV4("preview");
    expect(legB.destination).toEqual(
      v4.buildDestinationAddresses(destination).schema,
    );
    expect(legB.owner).toEqual(v4.buildOwnerDatum(owner).schema);
  });

  it("orderRouteSwap() - v1 refuses to chain into v4", async () => {
    // A v1 order names its destination datum by hash; a v4 order needs an
    // inline datum to be spendable. Building it would place a UTxO at the v4
    // order address that no scooper can spend, so this must throw.
    const v1 = new TxBuilderV1(builder.blaze);
    await expect(
      v1.orderRouteSwap({
        ownerAddress: PREVIEW_DATA.addresses.current,
        swapA: {
          swapType: { type: ESwapType.MARKET, slippage: 0.03 },
          pool: PREVIEW_DATA.pools.v1,
          suppliedAsset: PREVIEW_DATA.assets.tindy,
        },
        swapB: {
          contractVersion: EContractVersion.V4,
          minReceived: new AssetAmount(1_000_000n, ADA_METADATA),
        },
      }),
    ).rejects.toThrow(/cannot chain into v4/);
  });

  it("orderRouteSwap() - v3 to v3", async () => {
    const { build, fees, datum } = await builder.orderRouteSwap({
      ownerAddress: PREVIEW_DATA.addresses.current,
      swapA: {
        swapType: {
          type: ESwapType.MARKET,
          slippage: 0.03,
        },
        pool: PREVIEW_DATA.pools.v3,
        suppliedAsset: PREVIEW_DATA.assets.tindy,
      },
      swapB: {
        swapType: {
          type: ESwapType.MARKET,
          slippage: 0.03,
        },
        pool: {
          ...PREVIEW_DATA.pools.v3,
          assetB: {
            ...PREVIEW_DATA.pools.v3.assetB,
            assetId:
              // iBTC
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69425443",
          },
          assetLP: {
            ...PREVIEW_DATA.pools.v3.assetLP,
            assetId:
              "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702004",
          },
        },
      },
    });

    // Deposit carried over = 3 ADA
    expect(fees.deposit.amount.toString()).toEqual("3000000");

    // Two swaps = 1 + 1
    expect(fees.scooperFee.amount.toString()).toEqual("2000000");

    const { builtTx } = await build();

    let swapOutput: Core.TransactionOutput | undefined;
    [...Array(builtTx.body().outputs().length).keys()].forEach((index) => {
      const output = builtTx.body().outputs()[index];
      const paymentHex = output.address().asBase()?.getPaymentCredential().hash;
      const stakingHex = output.address().asBase()?.getStakeCredential().hash;
      const outputHex = `10${paymentHex}${stakingHex}`;

      if (
        outputHex ===
          "10484969d936f484c45f143d911f81636fe925048e205048ee1fe412aa121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0" &&
        output
          .amount()
          .multiasset()
          ?.get(
            Core.AssetId(
              PREVIEW_DATA.assets.tindy.metadata.assetId.replace(".", ""),
            ),
          )
          ?.toString() === "20000000" &&
        // deposit (3) + v3 scooper fee (1) + v3 scooper fee (1)
        output.amount().coin().toString() === "5000000"
      ) {
        swapOutput = output;
      }
    });

    expect(swapOutput).not.toBeUndefined();
    expect(swapOutput).not.toBeUndefined();
    const inlineDatum = swapOutput?.datum()?.asInlineData()?.toCbor();

    expect(inlineDatum).not.toBeUndefined();
    expect(inlineDatum).toEqual(
      Core.HexBlob(
        "d8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87b9fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87a9f9f40401a011b5ec7ff9f581c2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb544694254431a00f9f216ffff43d87980ffffffd87a9f9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a01312d00ff9f40401a011b5ec7ffff43d87980ff",
      ),
    );
  });

  it("orderRouteSwap() - v3 to v3 pays out to a custom destination", async () => {
    const destination = PREVIEW_DATA.addresses.alternatives[0];
    const { datum } = await builder.orderRouteSwap({
      ownerAddress: PREVIEW_DATA.addresses.current,
      destination: { address: destination, datum: { type: EDatumType.NONE } },
      swapA: {
        swapType: { type: ESwapType.MARKET, slippage: 0.03 },
        pool: PREVIEW_DATA.pools.v3,
        suppliedAsset: PREVIEW_DATA.assets.tindy,
      },
      swapB: {
        swapType: { type: ESwapType.MARKET, slippage: 0.03 },
        pool: {
          ...PREVIEW_DATA.pools.v3,
          assetB: {
            ...PREVIEW_DATA.pools.v3.assetB,
            assetId:
              // iBTC
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69425443",
          },
          assetLP: {
            ...PREVIEW_DATA.pools.v3.assetLP,
            assetId:
              "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702004",
          },
        },
      },
    });

    const legB = getNextLeg(datum as string).datum.toCbor();

    expect(DatumBuilderV3.getDestinationAddressesFromDatum(legB)).toEqual({
      paymentKeyHash: BlazeHelper.getPaymentHashFromBech32(destination),
      stakingKeyHash: BlazeHelper.getStakingHashFromBech32(destination),
    });
    // Leg B keeps the original owner.
    const owner = DatumBuilderV3.getSignerKeyFromDatum(datum as string);
    expect(owner).toBeDefined();
    expect(DatumBuilderV3.getSignerKeyFromDatum(legB)).toEqual(owner as string);
  });

  it("orderRouteSwap() - v3 to v1", async () => {
    const { build, fees } = await builder.orderRouteSwap({
      ownerAddress: PREVIEW_DATA.addresses.current,
      swapA: {
        swapType: {
          type: ESwapType.MARKET,
          slippage: 0.03,
        },
        suppliedAsset: PREVIEW_DATA.assets.tindy,
        pool: PREVIEW_DATA.pools.v3,
      },
      swapB: {
        swapType: {
          type: ESwapType.MARKET,
          slippage: 0.03,
        },
        pool: {
          ...PREVIEW_DATA.pools.v1,
          ident: "04",
          assetB: {
            ...PREVIEW_DATA.pools.v3.assetB,
            assetId:
              // iBTC
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69425443",
          },
          assetLP: {
            ...PREVIEW_DATA.pools.v3.assetLP,
            assetId:
              "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702004",
          },
        },
      },
    });

    // Deposit carried over = 3 ADA
    expect(fees.deposit.amount.toString()).toEqual("3000000");

    // Two swaps = 1 + 2.5
    expect(fees.scooperFee.amount.toString()).toEqual("3500000");

    const { builtTx } = await build();

    let swapOutput: Core.TransactionOutput | undefined;
    [...Array(builtTx.body().outputs().length).keys()].forEach((index) => {
      const output = builtTx.body().outputs()[index];
      const paymentHex = output.address().asBase()?.getPaymentCredential().hash;
      const stakingHex = output.address().asBase()?.getStakeCredential().hash;
      const outputHex = `10${paymentHex}${stakingHex}`;

      if (
        outputHex ===
          "10484969d936f484c45f143d911f81636fe925048e205048ee1fe412aa121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0" &&
        output
          .amount()
          .multiasset()
          ?.get(
            Core.AssetId(
              PREVIEW_DATA.assets.tindy.metadata.assetId.replace(".", ""),
            ),
          )
          ?.toString() === "20000000" &&
        // deposit (3) + v3 scooper fee (1) + v1 scooper fee (2.5) = 5
        output.amount().coin().toString() === "6500000"
      ) {
        swapOutput = output;
      }
    });

    expect(swapOutput).not.toBeUndefined();
    expect(swapOutput).not.toBeUndefined();
    const inlineDatum = swapOutput?.datum()?.asInlineData()?.toCbor();

    expect(inlineDatum).not.toBeUndefined();
    expect(inlineDatum).toEqual(
      Core.HexBlob(
        "d8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd87a9f581c730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977effd87a80ffd87a9f58208d35dd309d5025e51844f3c8b6d6f4e93ec55bf4a85b5c3610860500efc1e9fbffffd87a9f9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a01312d00ff9f40401a011b5ec7ffff43d87980ff",
      ),
    );

    const transactionMetadata = builtTx
      .auxiliaryData()
      ?.metadata()
      ?.metadata()
      ?.get(103251n);

    expect(transactionMetadata).not.toBeUndefined();
    expect(transactionMetadata?.toCbor()).toEqual(
      Core.HexBlob(
        "a158208d35dd309d5025e51844f3c8b6d6f4e93ec55bf4a85b5c3610860500efc1e9fb85581fd8799f4104d8799fd8799fd8799fd8799f581cc279a3fb3b4e62bbc78e2887581f83b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd2581f2e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a581f80ffd87a80ff1a002625a0d8799fd879801a011b5ec7d8799f1a00833c12ff42ffff",
      ),
    );
  });

  it("orderRouteSwap() - v3 to v1 names an inline destination datum by hash", async () => {
    // A v1 scoop can't pay out an inline datum, so leg A publishes it.
    const unitDatum = "d87980";
    const unitDatumHash =
      "923918e403bf43c34b4ef6b48eb2ee04babed17320d8d1b9ff9ad086e86f44ec";
    const legBSwap = spyOn(TxBuilderV1.prototype, "swap");

    const { build } = await builder.orderRouteSwap({
      ownerAddress: PREVIEW_DATA.addresses.current,
      destination: {
        // A script that isn't a SundaeSwap order script.
        address: Core.addressFromCredential(
          0,
          Core.Credential.fromCore({
            hash: Core.Hash28ByteBase16(
              "e6c8a314ae942401619460f00c69de3d1b996db588d4042243a4b259",
            ),
            type: Core.CredentialType.ScriptHash,
          }),
        ).toBech32(),
        datum: { type: EDatumType.INLINE, value: unitDatum },
      },
      swapA: {
        swapType: { type: ESwapType.MARKET, slippage: 0.03 },
        suppliedAsset: PREVIEW_DATA.assets.tindy,
        pool: PREVIEW_DATA.pools.v3,
      },
      swapB: {
        swapType: { type: ESwapType.MARKET, slippage: 0.03 },
        pool: { ...PREVIEW_DATA.pools.v1, ident: "04" },
      },
    });

    const { datum: legB } = (await legBSwap.mock.results[0].value) as {
      datum: string;
    };
    legBSwap.mockRestore();
    const { orderAddresses } = parse(
      V1Types.SwapOrder,
      Core.PlutusData.fromCbor(Core.HexBlob(legB)),
    );
    expect(orderAddresses.destination.datum).toEqual(unitDatumHash);

    const { builtTx } = await build();
    const published = builtTx
      .auxiliaryData()
      ?.metadata()
      ?.metadata()
      ?.get(103251n)
      ?.toCbor();
    expect(published).toEqual(
      BlazeHelper.buildDatumMetadatum([legB, unitDatum]).toCbor(),
    );
    expect(published).toContain(`5820${unitDatumHash}8143${unitDatum}`);
  });

  it("deposit()", async () => {
    const spiedNewTx = spyOn(builder, "newTxInstance");
    const spiedBuildDepositDatum = spyOn(
      builder.datumBuilder,
      "buildDepositDatum",
    );

    const { build, fees, datum } = await builder.deposit({
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      },
      pool: PREVIEW_DATA.pools.v3,
      suppliedAssets: [PREVIEW_DATA.assets.tada, PREVIEW_DATA.assets.tindy],
    });

    expect(spiedNewTx).toHaveBeenNthCalledWith(1, undefined);
    expect(spiedBuildDepositDatum).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ident: PREVIEW_DATA.pools.v3.ident,
        order: expect.objectContaining({
          assetA: expect.objectContaining({
            amount: PREVIEW_DATA.assets.tada.amount,
          }),
          assetB: expect.objectContaining({
            amount: PREVIEW_DATA.assets.tindy.amount,
          }),
        }),
      }),
    );

    expect(datum).toEqual(
      "d8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87b9f9f9f40401a01312d00ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a01312d00ffffff43d87980ff",
    );
    expect(fees).toMatchObject({
      deposit: expect.objectContaining({
        amount: ORDER_DEPOSIT_DEFAULT,
        metadata: ADA_METADATA,
      }),
      scooperFee: expect.objectContaining({
        amount: 1_000_000n,
        metadata: ADA_METADATA,
      }),
    } as ITxBuilderFees);

    const { builtTx } = await build();
    expect(fees.cardanoTxFee).not.toBeUndefined();

    let depositOutput: Core.TransactionOutput | undefined;
    [...Array(builtTx.body().outputs().length).keys()].forEach((index) => {
      const output = builtTx.body().outputs()[index];
      if (
        getPaymentAddressFromOutput(output).toBech32() ===
          "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe" &&
        // Supplied asset (20) + deposit (2) + scooper fee (1) = 23
        output.amount().coin().toString() === "23000000" &&
        output.amount().multiasset() &&
        output
          .amount()
          .multiasset()
          ?.get(
            Core.AssetId(
              "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459",
            ),
          )
          ?.toString() === "20000000"
      ) {
        depositOutput = output;
      }
    });

    expect(depositOutput).not.toBeUndefined();
    expect(depositOutput?.datum()?.asDataHash()).toBeUndefined();
    expect(builtTx.witnessSet().plutusData()?.values()?.[0]).toBeUndefined();

    const inlineDatum = depositOutput?.datum()?.asInlineData()?.toCbor();
    expect(inlineDatum).not.toBeUndefined();
    expect(inlineDatum).toEqual(datum as Core.HexBlob);
  });

  it("deposit() incorrect idents throw", async () => {
    try {
      await builder.deposit({
        orderAddresses: {
          DestinationAddress: {
            address: PREVIEW_DATA.addresses.current,
            datum: {
              type: EDatumType.NONE,
            },
          },
        },
        pool: {
          ...PREVIEW_DATA.pools.v3,
          ident: "00",
        },
        suppliedAssets: [PREVIEW_DATA.assets.tada, PREVIEW_DATA.assets.tindy],
      });
    } catch (e) {
      expect((e as Error).message).toEqual(DatumBuilderV3.INVALID_POOL_IDENT);
    }
  });

  it("withdraw()", async () => {
    const spiedNewTx = spyOn(builder, "newTxInstance");
    const spiedBuildWithdrawDatum = spyOn(
      builder.datumBuilder,
      "buildWithdrawDatum",
    );

    const { build, fees, datum } = await builder.withdraw({
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      },
      suppliedLPAsset: PREVIEW_DATA.assets.v3LpToken,
    });

    expect(spiedNewTx).toHaveBeenNthCalledWith(1, undefined);
    expect(spiedBuildWithdrawDatum).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ident: PREVIEW_DATA.pools.v3.ident,
        order: expect.objectContaining({
          lpToken: expect.objectContaining({
            amount: 100_000_000n,
          }),
        }),
      }),
    );

    expect(datum).toEqual(
      "d8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87c9f9f581c633a136877ed6ad0ab33e69a22611319673474c8bd0a79a4c76d928958200014df10a933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e21a05f5e100ffff43d87980ff",
    );
    expect(fees).toMatchObject({
      deposit: expect.objectContaining({
        amount: ORDER_DEPOSIT_DEFAULT,
        metadata: ADA_METADATA,
      }),
      scooperFee: expect.objectContaining({
        amount: 1_000_000n,
        metadata: ADA_METADATA,
      }),
    } as ITxBuilderFees);

    const { builtTx } = await build();
    expect(fees.cardanoTxFee).not.toBeUndefined();

    let withdrawOutput: Core.TransactionOutput | undefined;
    [...Array(builtTx.body().outputs().length).keys()].forEach((index) => {
      const output = builtTx.body().outputs()[index];
      if (
        getPaymentAddressFromOutput(output).toBech32() ===
          "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe" &&
        // deposit (2) + scooper fee (1) = 3
        output.amount().coin().toString() === "3000000" &&
        output.amount().multiasset() &&
        output
          .amount()
          .multiasset()
          ?.get(
            Core.AssetId(
              PREVIEW_DATA.assets.v3LpToken.metadata.assetId.replace(".", ""),
            ),
          )
          ?.toString() === PREVIEW_DATA.assets.v3LpToken.amount.toString()
      ) {
        withdrawOutput = output;
      }
    });

    expect(withdrawOutput).not.toBeUndefined();
    expect(withdrawOutput?.datum()?.asDataHash()).toBeUndefined();
    expect(builtTx.witnessSet().plutusData()?.values()?.[0]).toBeUndefined();

    const inlineDatum = withdrawOutput?.datum()?.asInlineData()?.toCbor();
    expect(inlineDatum).not.toBeUndefined();
    expect(inlineDatum).toEqual(datum as Core.HexBlob);
  });

  it("withdraw() incorrect idents throw", async () => {
    try {
      await builder.withdraw({
        orderAddresses: {
          DestinationAddress: {
            address: PREVIEW_DATA.addresses.current,
            datum: {
              type: EDatumType.NONE,
            },
          },
        },
        suppliedLPAsset: PREVIEW_DATA.assets.v3LpToken,
      });
    } catch (e) {
      expect((e as Error).message).toEqual(DatumBuilderV3.INVALID_POOL_IDENT);
    }
  });

  it("strategy()", async () => {
    const spiedNewTx = spyOn(builder, "newTxInstance");
    const spiedBuildStrategyDatum = spyOn(
      builder.datumBuilder,
      "buildStrategyDatum",
    );

    const { build, fees, datum } = await builder.strategy({
      destination: {
        type: EDestinationType.SELF,
      },
      ownerAddress: PREVIEW_DATA.addresses.current,
      pool: PREVIEW_DATA.pools.v3,
      authSigner: "cafebabe",
      suppliedAsset: PREVIEW_DATA.assets.tada,
    });

    expect(spiedNewTx).toHaveBeenNthCalledWith(1, undefined);
    expect(spiedBuildStrategyDatum).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ident: PREVIEW_DATA.pools.v3.ident,
        order: {
          signer: "cafebabe",
        },
      }),
    );

    expect(datum).toEqual(
      "d8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d87a80d8799fd8799f44cafebabeffff43d87980ff",
    );
    expect(fees).toMatchObject({
      deposit: expect.objectContaining({
        amount: ORDER_DEPOSIT_DEFAULT,
        metadata: ADA_METADATA,
      }),
      scooperFee: expect.objectContaining({
        amount: 1_000_000n,
        metadata: ADA_METADATA,
      }),
    });

    const { builtTx } = await build();
    expect(fees.cardanoTxFee).not.toBeUndefined();

    let strategyOutput: Core.TransactionOutput | undefined;
    builtTx
      .body()
      .outputs()
      .forEach((output) => {
        if (
          getPaymentAddressFromOutput(output).toBech32() ===
            "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe" &&
          output.amount().coin().toString() === "23000000"
        ) {
          strategyOutput = output;
        }
      });

    expect(strategyOutput).not.toBeUndefined();
    expect(strategyOutput?.datum()?.asDataHash()).toBeUndefined();
    expect(builtTx.witnessSet().plutusData()?.values()?.[0]).toBeUndefined();

    const inlineDatum = strategyOutput?.datum()?.asInlineData()?.toCbor();
    expect(inlineDatum).not.toBeUndefined();
    expect(inlineDatum).toEqual(datum as Core.HexBlob);
  });

  it("mintPool() should build a transaction correctly when including ADA", async () => {
    const { fees, build } = await builder.mintPool({
      assetA: PREVIEW_DATA.assets.tada,
      assetB: PREVIEW_DATA.assets.tindy,
      fees: 5n,
      marketOpen: 5n,
      ownerAddress: PREVIEW_DATA.addresses.current,
    });

    // Since we are depositing ADA, we only need ADA for the metadata and settings utxos.
    expect(fees.deposit.amount.toString()).toEqual(
      (ORDER_DEPOSIT_DEFAULT * 2n).toString(),
    );

    const { builtTx } = await build();

    const poolBalanceDatum = builtTx.witnessSet().redeemers()?.values()?.[0];

    expect(poolBalanceDatum).not.toBeUndefined();
    expect(poolBalanceDatum?.toCbor()).toEqual(
      Core.HexBlob(
        "840100d87a9f9f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff0001ff821a0009c4751a0cc6b896",
      ),
    );

    /**
     * The pool output should be the first in the outputs.
     */
    const poolOutput = builtTx.body().outputs()[0];
    expect(poolOutput.toCbor()).toEqual(
      Core.HexBlob(
        "a30058393044a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a1104147467ae52afc8e9f5603c9265e7ce24853863a34f6b12d12a098f880801821a015ef3c0a2581c44a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a110414a15820000de140f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc601581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e44591a01312d00028201d818585ed8799f581cf6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc69f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d000505d87a80051a002dc6c0ff",
      ),
    );
    const poolDepositAssets = poolOutput.amount().multiasset();
    const poolDepositedAssetA = poolOutput.amount().coin().toString();
    const poolDepositedAssetB = poolDepositAssets?.get(
      Core.AssetId(PREVIEW_DATA.assets.tindy.metadata.assetId.replace(".", "")),
    );
    const poolDepositedNFT = poolDepositAssets?.get(
      Core.AssetId(
        `${
          params.blueprint.validators[1].hash
        }000de140f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc6`,
      ),
    );

    [poolDepositedAssetA, poolDepositedAssetB, poolDepositedNFT].forEach(
      (val) => expect(val).not.toBeUndefined(),
    );

    // Should deposit assets without additional ADA.
    expect(poolDepositedAssetA).toEqual(
      (PREVIEW_DATA.assets.tada.amount + POOL_MIN_FEE).toString(),
    );
    expect(poolDepositedAssetB?.toString()).toEqual("20000000");
    expect(poolDepositedNFT?.toString()).toEqual("1");
    // Should have datum attached.
    expect(poolOutput.datum()?.asInlineData()?.toCbor()).toEqual(
      Core.HexBlob(
        "d8799f581cf6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc69f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d000505d87a80051a002dc6c0ff",
      ),
    );

    /**
     * The metadata output should be the second in the outputs.
     */
    const metadataOutput = builtTx.body().outputs()[1];
    expect(
      metadataOutput.address().asEnterprise()?.getPaymentCredential().hash,
    ).toEqual(
      Core.Hash28ByteBase16(
        "035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73b",
      ),
    );
    const metadataDepositAssets = metadataOutput.amount().multiasset();
    const metadataDepositedAssetA = metadataOutput.amount().coin().toString();
    const metadataDepositedNFT = metadataDepositAssets?.get(
      Core.AssetId(
        `${
          params.blueprint.validators[1].hash
        }000643b0f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc6`,
      ),
    );

    [metadataDepositedAssetA, metadataDepositedNFT].forEach((val) =>
      expect(val).not.toBeUndefined(),
    );
    expect(metadataDepositedAssetA.toString()).toEqual("2000000");
    expect(metadataDepositedNFT?.toString()).toEqual("1");

    /**
     * The lp tokens output should be the third in the outputs.
     */
    const lpTokensOutput = builtTx.body().outputs()[2];
    const lpTokensOutputPayment = lpTokensOutput
      .address()
      .asBase()
      ?.getPaymentCredential().hash;
    const lpTokensOutputStaking = lpTokensOutput
      .address()
      .asBase()
      ?.getStakeCredential().hash;
    const lpTokensOutputHex = `00${lpTokensOutputPayment}${lpTokensOutputStaking}`;
    expect(lpTokensOutputHex).toEqual(
      "00c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
    );
    const lpTokensDepositAssets = lpTokensOutput.amount().multiasset();
    const lpTokensReturnedADA = lpTokensOutput.amount().coin().toString();
    const lpTokensReturned = lpTokensDepositAssets?.get(
      Core.AssetId(
        `${
          params.blueprint.validators[1].hash
        }0014df10f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc6`,
      ),
    );

    [lpTokensReturnedADA, lpTokensReturned].forEach((val) =>
      expect(val).not.toBeUndefined(),
    );
    expect(lpTokensReturnedADA.toString()).toEqual("2000000");
    expect(lpTokensReturned?.toString()).toEqual("20000000");
  });

  it("mintPool() should build a transaction correctly when including ADA and donating Treasury", async () => {
    const { fees, build } = await builder.mintPool({
      assetA: PREVIEW_DATA.assets.tada,
      assetB: PREVIEW_DATA.assets.tindy,
      fees: 5n,
      marketOpen: 5n,
      ownerAddress: PREVIEW_DATA.addresses.current,
      donateToTreasury: 100n,
    });

    // Since we are depositing ADA, we only need ADA for the metadata and settings utxos.
    expect(fees.deposit.amount.toString()).toEqual(
      (ORDER_DEPOSIT_DEFAULT * 2n).toString(),
    );

    const { builtTx } = await build();

    const poolBalanceDatum = builtTx.witnessSet().redeemers()?.values()?.[0];
    expect(poolBalanceDatum).not.toBeUndefined();
    expect(poolBalanceDatum?.toCbor()).toEqual(
      Core.HexBlob(
        "840100d87a9f9f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff0001ff821a0009c4751a0cc6b896",
      ),
    );

    /**
     * The pool output should be the first in the outputs.
     */
    const poolOutput = builtTx.body().outputs()[0];
    const poolOutputPaymentHash = poolOutput
      .address()
      .asBase()
      ?.getPaymentCredential().hash;
    const poolOutputStakeHash = poolOutput
      .address()
      .asBase()
      ?.getStakeCredential().hash;
    const poolOutputAddressHex = `30${poolOutputPaymentHash}${poolOutputStakeHash}`;
    expect(poolOutputAddressHex).toEqual(
      "3044a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a1104147467ae52afc8e9f5603c9265e7ce24853863a34f6b12d12a098f8808",
    );
    const poolDepositAssets = poolOutput.amount().multiasset();
    const poolDepositedAssetA = poolOutput.amount().coin().toString();
    const poolDepositedAssetB = poolDepositAssets?.get(
      Core.AssetId(PREVIEW_DATA.assets.tindy.metadata.assetId.replace(".", "")),
    );
    const poolDepositedNFT = poolDepositAssets?.get(
      Core.AssetId(
        "44a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a110414000de140f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc6",
      ),
    );

    [poolDepositedAssetA, poolDepositedAssetB, poolDepositedNFT].forEach(
      (val) => expect(val).not.toBeUndefined(),
    );
    // Should deposit assets without additional ADA.
    expect(poolDepositedAssetA).toEqual(
      (PREVIEW_DATA.assets.tada.amount + POOL_MIN_FEE).toString(),
    );
    expect(poolDepositedAssetB?.toString()).toEqual("20000000");
    expect(poolDepositedNFT?.toString()).toEqual("1");
    // Should have datum attached.
    expect(poolOutput.datum()?.asInlineData()?.toCbor()).toEqual(
      Core.HexBlob(
        "d8799f581cf6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc69f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d000505d87a80051a002dc6c0ff",
      ),
    );

    /**
     * The metadata output should be the second in the outputs.
     */
    const metadataOutput = builtTx.body().outputs()[1];
    const metadataOutputPaymentHash = metadataOutput
      .address()
      .asEnterprise()
      ?.getPaymentCredential().hash;
    expect(metadataOutputPaymentHash).toEqual(
      Core.Hash28ByteBase16(
        "035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73b",
      ),
    );
    const metadataDepositAssets = metadataOutput.amount().multiasset();
    const metadataDepositedAssetA = metadataOutput.amount().coin().toString();
    const metadataDepositedNFT = metadataDepositAssets?.get(
      Core.AssetId(
        `${
          params.blueprint.validators[1].hash
        }000643b0f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc6`,
      ),
    );

    [metadataDepositedAssetA, metadataDepositedNFT].forEach((val) =>
      expect(val).not.toBeUndefined(),
    );
    expect(metadataDepositedAssetA.toString()).toEqual("2000000");
    expect(metadataDepositedNFT?.toString()).toEqual("1");

    /**
     * The lp tokens output should be the third in the outputs.
     */
    const lpTokensOutput = builtTx.body().outputs()[2];
    const lpTokensOutputPaymentHash = lpTokensOutput
      .address()
      .asEnterprise()
      ?.getPaymentCredential().hash;
    expect(lpTokensOutputPaymentHash).toEqual(
      Core.Hash28ByteBase16(
        "035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73b",
      ),
    );
    expect(lpTokensOutput.datum()?.asInlineData()?.toCbor()).toEqual(
      Void().toCbor(),
    );
    const lpTokensDepositAssets = lpTokensOutput.amount().multiasset();
    const lpTokensReturnedADA = lpTokensOutput.amount().coin().toString();
    const lpTokensReturned = lpTokensDepositAssets?.get(
      Core.AssetId(
        `${
          params.blueprint.validators[1].hash
        }0014df10f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc6`,
      ),
    );

    [lpTokensReturnedADA, lpTokensReturned].forEach((val) =>
      expect(val).not.toBeUndefined(),
    );
    expect(lpTokensReturnedADA.toString()).toEqual("2000000");
    expect(lpTokensReturned?.toString()).toEqual("20000000");
  });

  it("mintPool() should build a transaction correctly when including ADA and donating a percentage to the Treasury", async () => {
    const { fees, build } = await builder.mintPool({
      assetA: PREVIEW_DATA.assets.tada,
      assetB: PREVIEW_DATA.assets.tindy,
      fees: 5n,
      marketOpen: 5n,
      ownerAddress: PREVIEW_DATA.addresses.current,
      donateToTreasury: 43n,
    });

    // Since we are depositing ADA, we only need ADA for the metadata and settings utxos.
    expect(fees.deposit.amount.toString()).toEqual(
      (ORDER_DEPOSIT_DEFAULT * 2n).toString(),
    );

    const { builtTx } = await build();

    const poolBalanceDatum = builtTx.witnessSet().redeemers()?.values()?.[0];
    expect(poolBalanceDatum).not.toBeUndefined();
    expect(poolBalanceDatum?.toCbor()).toEqual(
      Core.HexBlob(
        "840100d87a9f9f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff0001ff821a0009c4751a0cc6b896",
      ),
    );

    /**
     * The pool output should be the first in the outputs.
     */
    const poolOutput = builtTx.body().outputs()[0];
    expect(poolOutput.toCbor()).toEqual(
      Core.HexBlob(
        "a30058393044a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a1104147467ae52afc8e9f5603c9265e7ce24853863a34f6b12d12a098f880801821a015ef3c0a2581c44a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a110414a15820000de140f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc601581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e44591a01312d00028201d818585ed8799f581cf6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc69f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d000505d87a80051a002dc6c0ff",
      ),
    );
    const poolDepositAssets = poolOutput.amount().multiasset();
    const poolDepositedAssetA = poolOutput.amount().coin().toString();
    const poolDepositedAssetB = poolDepositAssets
      ?.get(
        Core.AssetId(
          PREVIEW_DATA.assets.tindy.metadata.assetId.replace(".", ""),
        ),
      )
      ?.toString();
    const poolDepositedNFT = poolDepositAssets
      ?.get(
        Core.AssetId(
          `44a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a110414000de140f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc6`,
        ),
      )
      ?.toString();

    expect(poolDepositedAssetA).not.toBeUndefined();
    expect(poolDepositedAssetB).not.toBeUndefined();
    expect(poolDepositedNFT).not.toBeUndefined();

    // Should deposit assets without additional ADA.
    expect(poolDepositedAssetA).toEqual(
      (PREVIEW_DATA.assets.tada.amount + POOL_MIN_FEE).toString(),
    );
    expect(poolDepositedAssetB).toEqual("20000000");
    expect(poolDepositedNFT).toEqual("1");
    // Should have datum attached.
    expect(poolOutput.datum()?.asInlineData()?.toCbor()).toEqual(
      Core.HexBlob(
        "d8799f581cf6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc69f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d000505d87a80051a002dc6c0ff",
      ),
    );

    /**
     * The metadata output should be the second in the outputs.
     */
    const metadataOutput = builtTx.body().outputs()[1];
    expect(metadataOutput.toCbor()).toEqual(
      Core.HexBlob(
        "a300581d60035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73b01821a001e8480a1581c44a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a110414a15820000643b0f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc601028201d81843d87980",
      ),
    );
    const metadataDepositAssets = metadataOutput.amount().multiasset();
    const metadataDepositedAssetA = metadataOutput.amount().coin().toString();
    const metadataDepositedNFT = metadataDepositAssets
      ?.get(
        Core.AssetId(
          `${params.blueprint.validators[1].hash}000643b0f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc6`,
        ),
      )
      ?.toString();

    expect(metadataDepositedAssetA).not.toBeUndefined();
    expect(metadataDepositedNFT).not.toBeUndefined();
    expect(metadataDepositedAssetA).toEqual("2000000");
    expect(metadataDepositedNFT).toEqual("1");

    /**
     * The lp tokens donation output should be the third in the outputs.
     */
    const lpTokensDonation = builtTx.body().outputs()[2];
    expect(lpTokensDonation.toCbor()).toEqual(
      Core.HexBlob(
        "a300581d60035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73b01821a001e8480a1581c44a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a110414a158200014df10f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc61a008339c0028201d81843d87980",
      ),
    );
    expect(lpTokensDonation.datum()?.asInlineData()).toEqual(Void());
    const lpTokensDonationAssets = lpTokensDonation.amount().multiasset();
    const lpTokensDonatedADA = lpTokensDonation.amount().coin().toString();
    const lpTokensDonated = lpTokensDonationAssets
      ?.get(
        Core.AssetId(
          `${params.blueprint.validators[1].hash}0014df10f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc6`,
        ),
      )
      ?.toString();

    expect(lpTokensDonatedADA).not.toBeUndefined();
    expect(lpTokensDonated).not.toBeUndefined();
    expect(lpTokensDonatedADA).toEqual("2000000");
    expect(lpTokensDonated).toEqual("8600000");

    /**
     * The lp tokens returned output should be the fourth in the outputs.
     */
    const lpTokensOutput = builtTx.body().outputs()[3];
    expect(lpTokensOutput.toCbor()).toEqual(
      Core.HexBlob(
        "82583900c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0821a001e8480a1581c44a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a110414a158200014df10f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc61a00adf340",
      ),
    );
    const lpTokensDepositAssets = lpTokensOutput.amount().multiasset();
    const lpTokensReturnedADA = lpTokensOutput.amount().coin().toString();
    const lpTokensReturned = lpTokensDepositAssets
      ?.get(
        Core.AssetId.fromParts(
          Core.PolicyId(params.blueprint.validators[1].hash),
          Core.AssetName(
            "0014df10f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc6",
          ),
        ),
      )
      ?.toString();

    expect(lpTokensReturnedADA).not.toBeUndefined();
    expect(lpTokensReturned).not.toBeUndefined();
    expect(lpTokensReturnedADA).toEqual("2000000");
    expect(lpTokensReturned).toEqual("11400000");
  });

  it("mintPool() should build a transaction correctly when using exotic pairs", async () => {
    const { fees, build } = await builder.mintPool({
      assetA: PREVIEW_DATA.assets.tindy,
      assetB: PREVIEW_DATA.assets.usdc,
      fees: 5n,
      marketOpen: 5n,
      ownerAddress: PREVIEW_DATA.addresses.current,
    });

    /**
     * Since we're depositing exotic assets, we expect:
     * - 2 minAda required for exotic pair
     * - 2 ADA for metadata ref token
     * - 2 ADA for sending back LP tokens
     */
    expect(fees.deposit.amount.toString()).toEqual("6000000");

    const { builtTx } = await build();

    const poolBalanceDatum = builtTx.witnessSet().redeemers()?.values()?.[0];
    expect(poolBalanceDatum).not.toBeUndefined();
    expect(poolBalanceDatum?.toCbor()).toEqual(
      Core.HexBlob(
        "840100d87a9f9f9f581c99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e154455534443ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff0001ff821a000a93d71a0dc084ba",
      ),
    );

    /**
     * The pool output should be the first in the outputs.
     */
    const poolOutput = builtTx.body().outputs()[0];
    expect(poolOutput.toCbor()).toEqual(
      Core.HexBlob(
        "a30058393044a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a1104147467ae52afc8e9f5603c9265e7ce24853863a34f6b12d12a098f880801821a002dc6c0a3581c44a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a110414a15820000de140f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc601581c99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15a144555344431a01312d00581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e44591a01312d00028201d818587fd8799f581cf6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc69f9f581c99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e154455534443ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d000505d87a80051a002dc6c0ff",
      ),
    );

    // /**
    //  * The metadata output should be the second in the outputs.
    //  */
    const metadataOutput = builtTx.body().outputs()[1];
    expect(metadataOutput.toCbor()).toEqual(
      Core.HexBlob(
        "a300581d60035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73b01821a001e8480a1581c44a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a110414a15820000643b0f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc601028201d81843d87980",
      ),
    );

    // /**
    //  * The lp tokens output should be the third in the outputs.
    //  */
    const lpTokensOutput = builtTx.body().outputs()[2];
    expect(lpTokensOutput.toCbor()).toEqual(
      Core.HexBlob(
        "82583900c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0821a001e8480a1581c44a1eb2d9f58add4eb1932bd0048e6a1947e85e3fe4f32956a110414a158200014df10f6a207f7eb0b2aca50c96d0b83b7b6cf0cb2161aa73648e8161ddcc61a01312d00",
      ),
    );
  });

  it("mintPool() should throw an error when the ADA provided is less than the min required", async () => {
    try {
      await builder.mintPool({
        assetA: PREVIEW_DATA.assets.tada.withAmount(500_000n),
        assetB: PREVIEW_DATA.assets.usdc,
        fees: 5n,
        marketOpen: 5n,
        ownerAddress: PREVIEW_DATA.addresses.current,
      });
    } catch (e) {
      expect((e as Error).message).toEqual(TxBuilderV3.MIN_ADA_POOL_MINT_ERROR);
    }
  });

  it("should fail when trying to mint a pool with decaying values", async () => {
    try {
      await builder.mintPool({
        assetA: PREVIEW_DATA.assets.tada,
        assetB: PREVIEW_DATA.assets.tindy,
        fees: 5n,
        marketOpen: 5n,
        ownerAddress: PREVIEW_DATA.addresses.current,
      });
    } catch (e) {
      expect((e as Error).message).toEqual(
        "Decaying fees are currently not supported in the scoopers. For now, use the same fee for both start and end values.",
      );
    }
  });
});

type SubmitResultOf<Composed> = Composed extends {
  build: () => Promise<{
    sign: () => Promise<{ submit: () => Promise<infer Result> }>;
  }>;
}
  ? Result
  : never;

// True only when A and B are the same type; `typecheck` fails otherwise.
type IsExactly<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

describe("submit() result type", () => {
  it("is the transaction hash for every builder's orders", () => {
    const v1: IsExactly<
      SubmitResultOf<Awaited<ReturnType<TxBuilderV1["swap"]>>>,
      string
    > = true;
    const v3: IsExactly<
      SubmitResultOf<Awaited<ReturnType<TxBuilderV3["swap"]>>>,
      string
    > = true;
    const v4: IsExactly<
      SubmitResultOf<Awaited<ReturnType<TxBuilderV4["swapIntent"]>>>,
      string
    > = true;
    expect([v1, v3, v4]).toEqual([true, true, true]);
  });

  it("follows the composed transaction's declared result", () => {
    type Result = { txHash: string; extra: number };

    const declared: IsExactly<
      SubmitResultOf<
        IComposedTx<BlazeTx, Core.Transaction, string, object, Result>
      >,
      Result
    > = true;
    expect(declared).toBe(true);
  });
});
