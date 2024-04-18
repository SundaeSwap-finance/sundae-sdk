import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";
import fetchMock from "jest-fetch-mock";
import { C, Lucid, Tx } from "lucid-cardano";

import { EDatumType, ESwapType, ITxBuilderFees } from "../../@types/index.js";
import { DatumBuilderLucidV3 } from "../../DatumBuilders/DatumBuilder.Lucid.V3.class.js";
import { QueryProviderSundaeSwap } from "../../QueryProviders/QueryProviderSundaeSwap.js";
import { ADA_METADATA, ORDER_DEPOSIT_DEFAULT } from "../../constants.js";
import { PREVIEW_DATA, setupLucid } from "../../exports/testing.js";
import { TxBuilderLucidV3 } from "../TxBuilder.Lucid.V3.class.js";
import {
  mockBlockfrostEvaluateResponse,
  params,
  referenceUtxos,
  settingsUtxos,
} from "./data/mockData.js";

jest
  .spyOn(QueryProviderSundaeSwap.prototype, "getProtocolParamsWithScriptHashes")
  .mockResolvedValue(params);

jest
  .spyOn(QueryProviderSundaeSwap.prototype, "getProtocolParamsWithScripts")
  .mockResolvedValue(params);

let builder: TxBuilderLucidV3;
let datumBuilder: DatumBuilderLucidV3;

const TEST_REFERRAL_DEST = PREVIEW_DATA.addresses.alternatives[0];

/**
 * Utility method to get the payment address. V3 contracts append the DestinationAddress
 * staking key to the order contract, so the user can still earn rewards.
 * @param output
 * @returns
 */
const getPaymentAddressFromOutput = (output: C.TransactionOutput) => {
  const scriptCredential = output.address().as_base()?.payment_cred();
  const paymentAddress = C.EnterpriseAddress.new(
    0,
    scriptCredential as C.StakeCredential
  )
    .to_address()
    .to_bech32("addr_test");

  return paymentAddress;
};

setupLucid((lucid) => {
  datumBuilder = new DatumBuilderLucidV3("preview");
  builder = new TxBuilderLucidV3(lucid, datumBuilder);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("TxBuilderLucidV3", () => {
  it("should have the correct settings", () => {
    expect(builder.network).toEqual("preview");
    expect(builder.lucid).toBeInstanceOf(Lucid);
  });

  it("should have the correct parameters", () => {
    expect(TxBuilderLucidV3.getParam("cancelRedeemer", "preview")).toEqual(
      "d87a80"
    );
    expect(TxBuilderLucidV3.getParam("cancelRedeemer", "mainnet")).toEqual(
      "d87a80"
    );
    expect(TxBuilderLucidV3.getParam("maxScooperFee", "preview")).toEqual(
      1_000_000n
    );
    expect(TxBuilderLucidV3.getParam("maxScooperFee", "mainnet")).toEqual(
      1_000_000n
    );
  });

  it("should create a new transaction instance correctly", async () => {
    expect(builder.newTxInstance()).toBeInstanceOf(Tx);

    const txWithReferralAndLabel = builder.newTxInstance({
      destination: TEST_REFERRAL_DEST,
      payment: new AssetAmount(1_500_000n, ADA_METADATA),
      feeLabel: "Test Label",
    });

    const { txComplete } = await txWithReferralAndLabel.complete();
    const metadata = txComplete.auxiliary_data()?.metadata();

    expect(metadata).not.toBeUndefined();
    expect(metadata?.get(C.BigNum.from_str("674"))?.as_text()).toEqual(
      "Test Label: 1.5 ADA"
    );

    let referralAddressOutput: C.TransactionOutput | undefined;
    [...Array(txComplete.body().outputs().len()).keys()].forEach((index) => {
      const output = txComplete.body().outputs().get(index);
      if (
        output.address().to_bech32("addr_test") === TEST_REFERRAL_DEST &&
        output.amount().coin().to_str() === "1500000"
      ) {
        referralAddressOutput = output;
      }
    });

    expect(referralAddressOutput).not.toBeUndefined();
    expect(referralAddressOutput?.address().to_bech32("addr_test")).toEqual(
      TEST_REFERRAL_DEST
    );

    const txWithReferral = builder.newTxInstance({
      destination: TEST_REFERRAL_DEST,
      payment: new AssetAmount(1_300_000n, ADA_METADATA),
    });

    const { txComplete: txComplete2 } = await txWithReferral.complete();
    expect(txComplete2.auxiliary_data()?.metadata()).toBeUndefined();

    let referralAddressOutput2: C.TransactionOutput | undefined;
    [...Array(txComplete2.body().outputs().len()).keys()].forEach((index) => {
      const output = txComplete2.body().outputs().get(index);
      if (
        output.address().to_bech32("addr_test") === TEST_REFERRAL_DEST &&
        output.amount().coin().to_str() === "1300000"
      ) {
        referralAddressOutput2 = output;
      }
    });

    expect(referralAddressOutput2).not.toBeUndefined();
    expect(referralAddressOutput2?.address().to_bech32("addr_test")).toEqual(
      TEST_REFERRAL_DEST
    );

    const txWithoutReferral = builder.newTxInstance();
    const { txComplete: txComplete3 } = await txWithoutReferral.complete();

    expect(txComplete3.auxiliary_data()?.metadata()).toBeUndefined();

    let referralAddressOutput3: C.TransactionOutput | undefined;
    [...Array(txComplete3.body().outputs().len()).keys()].forEach((index) => {
      const output = txComplete3.body().outputs().get(index);
      if (output.address().to_bech32("addr_test") === TEST_REFERRAL_DEST) {
        referralAddressOutput3 = output;
      }
    });

    expect(referralAddressOutput3).toBeUndefined();
  });

  test("swap()", async () => {
    const spiedNewTx = jest.spyOn(builder, "newTxInstance");
    const spiedBuildSwapDatum = jest.spyOn(datumBuilder, "buildSwapDatum");

    // Ensure that our tests are running at a consistent date due to decaying fees.
    const spiedDate = jest.spyOn(Date, "now");
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
      })
    );

    expect(datum).toEqual(
      "d8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a42470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87a9f9f40401a01312d00ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a010cd3b9ffffd87980ff"
    );
    expect(fees).toMatchObject<ITxBuilderFees>({
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

    let depositOutput: C.TransactionOutput | undefined;
    [...Array(builtTx.txComplete.body().outputs().len()).keys()].forEach(
      (index) => {
        const output = builtTx.txComplete.body().outputs().get(index);

        if (
          getPaymentAddressFromOutput(output) ===
            "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe" &&
          // Supplied asset (20) + deposit (2) + scooper fee (1) = 23
          output.amount().coin().to_str() === "23000000"
        ) {
          depositOutput = output;
        }
      }
    );

    expect(depositOutput).not.toBeUndefined();
    expect(depositOutput?.datum()?.as_data_hash()?.to_hex()).toBeUndefined();
    expect(
      builtTx.txComplete.witness_set().plutus_data()?.get(0).to_bytes()
    ).toBeUndefined();

    const inlineDatum = depositOutput?.datum()?.as_data()?.get().to_bytes();
    expect(inlineDatum).not.toBeUndefined();
    expect(Buffer.from(inlineDatum as Uint8Array).toString("hex")).toEqual(
      datum
    );
  });

  test("swap() with incorrect idents should throw", async () => {
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
      expect((e as Error).message).toEqual(
        DatumBuilderLucidV3.INVALID_POOL_IDENT
      );
    }
  });

  test("deposit()", async () => {
    const spiedNewTx = jest.spyOn(builder, "newTxInstance");
    const spiedBuildDepositDatum = jest.spyOn(
      datumBuilder,
      "buildDepositDatum"
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
      })
    );

    expect(datum).toEqual(
      "d8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a42470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87b9f9f9f40401a01312d00ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a01312d00ffffffd87980ff"
    );
    expect(fees).toMatchObject<ITxBuilderFees>({
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

    let depositOutput: C.TransactionOutput | undefined;
    [...Array(builtTx.txComplete.body().outputs().len()).keys()].forEach(
      (index) => {
        const output = builtTx.txComplete.body().outputs().get(index);
        if (
          getPaymentAddressFromOutput(output) ===
            "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe" &&
          // Supplied asset (20) + deposit (2) + scooper fee (1) = 23
          output.amount().coin().to_str() === "23000000" &&
          output.amount().multiasset() &&
          output.amount().multiasset()?.to_js_value()[
            "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183"
          ]["74494e4459"] === "20000000"
        ) {
          depositOutput = output;
        }
      }
    );

    expect(depositOutput).not.toBeUndefined();
    expect(depositOutput?.datum()?.as_data_hash()?.to_hex()).toBeUndefined();
    expect(
      builtTx.txComplete.witness_set().plutus_data()?.get(0).to_bytes()
    ).toBeUndefined();

    const inlineDatum = depositOutput?.datum()?.as_data()?.get().to_bytes();
    expect(inlineDatum).not.toBeUndefined();
    expect(Buffer.from(inlineDatum as Uint8Array).toString("hex")).toEqual(
      datum
    );
  });

  test("deposit() incorrect idents throw", async () => {
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
      expect((e as Error).message).toEqual(
        DatumBuilderLucidV3.INVALID_POOL_IDENT
      );
    }
  });

  test("withdraw()", async () => {
    const spiedNewTx = jest.spyOn(builder, "newTxInstance");
    const spiedBuildWithdrawDatum = jest.spyOn(
      datumBuilder,
      "buildWithdrawDatum"
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
      pool: PREVIEW_DATA.pools.v3,
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
      })
    );

    expect(datum).toEqual(
      "d8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a42470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87980ffd87c9f9f581c633a136877ed6ad0ab33e69a22611319673474c8bd0a79a4c76d928958200014df10a933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e21a05f5e100ffffd87980ff"
    );
    expect(fees).toMatchObject<ITxBuilderFees>({
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

    let withdrawOutput: C.TransactionOutput | undefined;
    [...Array(builtTx.txComplete.body().outputs().len()).keys()].forEach(
      (index) => {
        const output = builtTx.txComplete.body().outputs().get(index);
        if (
          getPaymentAddressFromOutput(output) ===
            "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe" &&
          // deposit (2) + scooper fee (1) = 3
          output.amount().coin().to_str() === "3000000" &&
          output.amount().multiasset() &&
          output.amount().multiasset()?.to_js_value()[
            PREVIEW_DATA.assets.v3LpToken.metadata.assetId.split(".")[0]
          ][PREVIEW_DATA.assets.v3LpToken.metadata.assetId.split(".")[1]] ===
            PREVIEW_DATA.assets.v3LpToken.amount.toString()
        ) {
          withdrawOutput = output;
        }
      }
    );

    expect(withdrawOutput).not.toBeUndefined();
    expect(withdrawOutput?.datum()?.as_data_hash()?.to_hex()).toBeUndefined();
    expect(
      builtTx.txComplete.witness_set().plutus_data()?.get(0).to_bytes()
    ).toBeUndefined();

    const inlineDatum = withdrawOutput?.datum()?.as_data()?.get().to_bytes();
    expect(inlineDatum).not.toBeUndefined();
    expect(Buffer.from(inlineDatum as Uint8Array).toString("hex")).toEqual(
      datum
    );
  });

  test("withdraw() incorrect idents throw", async () => {
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
        pool: {
          ...PREVIEW_DATA.pools.v3,
          ident: "00",
        },
        suppliedLPAsset: PREVIEW_DATA.assets.v3LpToken,
      });
    } catch (e) {
      expect((e as Error).message).toEqual(
        DatumBuilderLucidV3.INVALID_POOL_IDENT
      );
    }
  });

  test("mintPool() should build a transaction correctly when including ADA", async () => {
    jest
      .spyOn(TxBuilderLucidV3.prototype, "getAllSettingsUtxos")
      .mockResolvedValue(settingsUtxos);
    jest
      .spyOn(TxBuilderLucidV3.prototype, "getAllReferenceUtxos")
      .mockResolvedValue(referenceUtxos);

    fetchMock.enableMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockBlockfrostEvaluateResponse));

    const { fees, build } = await builder.mintPool({
      assetA: PREVIEW_DATA.assets.tada,
      assetB: PREVIEW_DATA.assets.tindy,
      fees: [5n, 5n],
      marketTimings: [5, 10_000n],
      ownerAddress: PREVIEW_DATA.addresses.current,
    });

    // Since we are depositing ADA, we only need ADA for the metadata and settings utxos.
    expect(fees.deposit.amount.toString()).toEqual(
      (ORDER_DEPOSIT_DEFAULT * 2n).toString()
    );

    const { builtTx } = await build();

    const mintingDatum = builtTx.txComplete.witness_set().plutus_data()?.get(0);
    const poolBalanceDatum = builtTx.txComplete
      .witness_set()
      .redeemers()
      ?.get(0);
    expect(mintingDatum).not.toBeUndefined();
    expect(poolBalanceDatum).not.toBeUndefined();
    expect(
      Buffer.from(mintingDatum?.to_bytes() as Uint8Array).toString("hex")
    ).toEqual(
      "d8799fd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd8799fd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd87a80ffd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd8799fd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd87a80ff9f010affd8799f9f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73b581cb1d4b4ab243033062144fe0203e88f0110ebf3f5bcb48d3a72f304e7581c9710db5182cf46c20ccaad5f1493a2e8e2543a5e51bb7fe1a5da082e581c7b6ffb5623865a4b4c624191aaf58cd9027007590e2c4eea11958e6b581c4a45875de978e14f5e6da323cea33d4f3dc8af113ce13e8a72a03288ffff9fd8799f581c2b8d75e72875efc8dd8ee3f17b3a96b8ff3b07ce6d84dc29d2517e08ffff1a000510e01a000a31601a000f42400000ff"
    );
    expect(
      Buffer.from(poolBalanceDatum?.to_bytes() as Uint8Array).toString("hex")
    ).toEqual(
      "840100d87a9f9f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff0001ff821a000b4af51a121ba48c"
    );

    /**
     * The pool output should be the first in the outputs.
     */
    const poolOutput = builtTx.txComplete.body().outputs().get(0);
    expect(
      Buffer.from(poolOutput.address().to_bytes()).toString("hex")
    ).toEqual("708140c4b89428fc264e90b10c71c53a4c3f9ce52b676bf1d9b51eb9ca");
    const poolDepositAssets = poolOutput.amount().multiasset()?.to_js_value();
    const poolDepositedAssetA = poolOutput.amount().coin().to_str();
    const poolDepositedAssetB =
      poolDepositAssets[
        PREVIEW_DATA.assets.tindy.metadata.assetId.split(".")[0]
      ][PREVIEW_DATA.assets.tindy.metadata.assetId.split(".")[1]];
    const poolDepositedNFT =
      poolDepositAssets[
        "8140c4b89428fc264e90b10c71c53a4c3f9ce52b676bf1d9b51eb9ca"
      ]["000de1409e67cc006063ea055629552650664979d7c92d47e342e5340ef77550"];

    [poolDepositedAssetA, poolDepositedAssetB, poolDepositedNFT].forEach(
      (val) => expect(val).not.toBeUndefined()
    );
    // Should deposit assets without additional ADA.
    expect(poolDepositedAssetA).toEqual(
      PREVIEW_DATA.assets.tada.amount.toString()
    );
    expect(poolDepositedAssetB).toEqual("20000000");
    expect(poolDepositedNFT).toEqual("1");
    // Should have datum attached.
    expect(
      Buffer.from(
        poolOutput.datum()?.as_data()?.to_bytes() as Uint8Array
      ).toString("hex")
    ).toEqual(
      "d8185863d8799f581c9e67cc006063ea055629552650664979d7c92d47e342e5340ef775509f9f4040ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d009f0505ff9f0505ffd87a800519271000ff"
    );

    /**
     * The metadata output should be the second in the outputs.
     */
    const metadataOutput = builtTx.txComplete.body().outputs().get(1);
    expect(
      Buffer.from(metadataOutput.address().to_bytes()).toString("hex")
    ).toEqual("60035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73b");
    const metadataDepositAssets = metadataOutput
      .amount()
      .multiasset()
      ?.to_js_value();
    const metadataDepositedAssetA = metadataOutput.amount().coin().to_str();
    const metadataDepositedNFT =
      metadataDepositAssets[params.blueprint.validators[1].hash][
        "000643b09e67cc006063ea055629552650664979d7c92d47e342e5340ef77550"
      ];

    [metadataDepositedAssetA, metadataDepositedNFT].forEach((val) =>
      expect(val).not.toBeUndefined()
    );
    expect(metadataDepositedAssetA).toEqual("2000000");
    expect(metadataDepositedNFT).toEqual("1");

    /**
     * The lp tokens output should be the third in the outputs.
     */
    const lpTokensOutput = builtTx.txComplete.body().outputs().get(2);
    expect(
      Buffer.from(lpTokensOutput.address().to_bytes()).toString("hex")
    ).toEqual(
      "00c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0"
    );
    const lpTokensDepositAssets = lpTokensOutput
      .amount()
      .multiasset()
      ?.to_js_value();
    const lpTokensReturnedADA = lpTokensOutput.amount().coin().to_str();
    const lpTokensReturned =
      lpTokensDepositAssets[params.blueprint.validators[1].hash][
        "0014df109e67cc006063ea055629552650664979d7c92d47e342e5340ef77550"
      ];

    [lpTokensReturnedADA, lpTokensReturned].forEach((val) =>
      expect(val).not.toBeUndefined()
    );
    expect(lpTokensReturnedADA).toEqual("2000000");
    expect(lpTokensReturned).toEqual("20000000");

    fetchMock.disableMocks();
  });

  test("mintPool() should build a transaction correctly when using exotic pairs", async () => {
    jest
      .spyOn(TxBuilderLucidV3.prototype, "getAllSettingsUtxos")
      .mockResolvedValue(settingsUtxos);
    jest
      .spyOn(TxBuilderLucidV3.prototype, "getAllReferenceUtxos")
      .mockResolvedValue(referenceUtxos);

    fetchMock.enableMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockBlockfrostEvaluateResponse));

    const { fees, build } = await builder.mintPool({
      assetA: PREVIEW_DATA.assets.tindy,
      assetB: PREVIEW_DATA.assets.usdc,
      fees: [5n, 5n],
      marketTimings: [5, 10_000n],
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

    const mintingDatum = builtTx.txComplete.witness_set().plutus_data()?.get(0);
    const poolBalanceDatum = builtTx.txComplete
      .witness_set()
      .redeemers()
      ?.get(0);
    expect(mintingDatum).not.toBeUndefined();
    expect(poolBalanceDatum).not.toBeUndefined();
    expect(
      Buffer.from(mintingDatum?.to_bytes() as Uint8Array).toString("hex")
    ).toEqual(
      "d8799fd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd8799fd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd87a80ffd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd8799fd8799f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73bffd87a80ff9f010affd8799f9f581c035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73b581cb1d4b4ab243033062144fe0203e88f0110ebf3f5bcb48d3a72f304e7581c9710db5182cf46c20ccaad5f1493a2e8e2543a5e51bb7fe1a5da082e581c7b6ffb5623865a4b4c624191aaf58cd9027007590e2c4eea11958e6b581c4a45875de978e14f5e6da323cea33d4f3dc8af113ce13e8a72a03288ffff9fd8799f581c2b8d75e72875efc8dd8ee3f17b3a96b8ff3b07ce6d84dc29d2517e08ffff1a000510e01a000a31601a000f42400000ff"
    );
    expect(
      Buffer.from(poolBalanceDatum?.to_bytes() as Uint8Array).toString("hex")
    ).toEqual(
      "840100d87a9f9f9f581c99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e154455534443ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff0001ff821a000b4af51a121ba48c"
    );

    /**
     * The pool output should be the first in the outputs.
     */
    const poolOutput = builtTx.txComplete.body().outputs().get(0);
    expect(
      Buffer.from(poolOutput.address().to_bytes()).toString("hex")
    ).toEqual("708140c4b89428fc264e90b10c71c53a4c3f9ce52b676bf1d9b51eb9ca");
    const poolDepositAssets = poolOutput.amount().multiasset()?.to_js_value();
    // const poolDepositedAssetA = poolOutput.amount().coin().to_str();
    const poolDepositedAssetA =
      poolDepositAssets[
        PREVIEW_DATA.assets.usdc.metadata.assetId.split(".")[0]
      ][PREVIEW_DATA.assets.usdc.metadata.assetId.split(".")[1]];
    const poolDepositedAssetB =
      poolDepositAssets[
        PREVIEW_DATA.assets.tindy.metadata.assetId.split(".")[0]
      ][PREVIEW_DATA.assets.tindy.metadata.assetId.split(".")[1]];
    const poolDepositedNFT =
      poolDepositAssets[
        "8140c4b89428fc264e90b10c71c53a4c3f9ce52b676bf1d9b51eb9ca"
      ]["000de1409e67cc006063ea055629552650664979d7c92d47e342e5340ef77550"];

    [poolDepositedAssetA, poolDepositedAssetB, poolDepositedNFT].forEach(
      (val) => expect(val).not.toBeUndefined()
    );
    // Should deposit assets without additional ADA deposit.
    expect(poolDepositedAssetA).toEqual(
      PREVIEW_DATA.assets.tada.amount.toString()
    );
    expect(poolDepositedAssetB).toEqual("20000000");
    expect(poolDepositedNFT).toEqual("1");
    // Should have datum attached.
    expect(
      Buffer.from(
        poolOutput.datum()?.as_data()?.to_bytes() as Uint8Array
      ).toString("hex")
    ).toEqual(
      "d8185888d8799f581c9e67cc006063ea055629552650664979d7c92d47e342e5340ef775509f9f581c99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e154455534443ff9f581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a3515351834574494e4459ffff1a01312d009f0505ff9f0505ffd87a80051927101a001e8480ff"
    );

    /**
     * The metadata output should be the second in the outputs.
     */
    const metadataOutput = builtTx.txComplete.body().outputs().get(1);
    expect(
      Buffer.from(metadataOutput.address().to_bytes()).toString("hex")
    ).toEqual("60035dee66d57cc271697711d63c8c35ffa0b6c4468a6a98024feac73b");
    const metadataDepositAssets = metadataOutput
      .amount()
      .multiasset()
      ?.to_js_value();
    const metadataDepositedAssetA = metadataOutput.amount().coin().to_str();
    const metadataDepositedNFT =
      metadataDepositAssets[params.blueprint.validators[1].hash][
        "000643b09e67cc006063ea055629552650664979d7c92d47e342e5340ef77550"
      ];

    [metadataDepositedAssetA, metadataDepositedNFT].forEach((val) =>
      expect(val).not.toBeUndefined()
    );
    expect(metadataDepositedAssetA).toEqual("2000000");
    expect(metadataDepositedNFT).toEqual("1");

    /**
     * The lp tokens output should be the third in the outputs.
     */
    const lpTokensOutput = builtTx.txComplete.body().outputs().get(2);
    expect(
      Buffer.from(lpTokensOutput.address().to_bytes()).toString("hex")
    ).toEqual(
      "00c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0"
    );
    const lpTokensDepositAssets = lpTokensOutput
      .amount()
      .multiasset()
      ?.to_js_value();
    const lpTokensReturnedADA = lpTokensOutput.amount().coin().to_str();
    const lpTokensReturned =
      lpTokensDepositAssets[params.blueprint.validators[1].hash][
        "0014df109e67cc006063ea055629552650664979d7c92d47e342e5340ef77550"
      ];

    [lpTokensReturnedADA, lpTokensReturned].forEach((val) =>
      expect(val).not.toBeUndefined()
    );
    expect(lpTokensReturnedADA).toEqual("2000000");
    expect(lpTokensReturned).toEqual("20000000");

    fetchMock.disableMocks();
  });

  test("mintPool() should throw an error when the ADA provided is less than the min required", async () => {
    jest
      .spyOn(TxBuilderLucidV3.prototype, "getAllSettingsUtxos")
      .mockResolvedValue(settingsUtxos);
    jest
      .spyOn(TxBuilderLucidV3.prototype, "getAllReferenceUtxos")
      .mockResolvedValue(referenceUtxos);

    fetchMock.enableMocks();
    fetchMock.mockResponseOnce(JSON.stringify(mockBlockfrostEvaluateResponse));

    try {
      await builder.mintPool({
        assetA: PREVIEW_DATA.assets.tada.withAmount(500_000n),
        assetB: PREVIEW_DATA.assets.usdc,
        fees: [5n, 5n],
        marketTimings: [5, 10_000n],
        ownerAddress: PREVIEW_DATA.addresses.current,
      });
    } catch (e) {
      expect((e as Error).message).toEqual(
        TxBuilderLucidV3.MIN_ADA_POOL_MINT_ERROR
      );
    }
  });

  it("should fail when trying to mint a pool with decaying values", async () => {
    try {
      await builder.mintPool({
        assetA: PREVIEW_DATA.assets.tada,
        assetB: PREVIEW_DATA.assets.tindy,
        fees: [5n, 10n],
        marketTimings: [5, 10_000n],
        ownerAddress: PREVIEW_DATA.addresses.current,
      });
    } catch (e) {
      expect((e as Error).message).toEqual(
        "Decaying fees are currently not supported in the scoopers. For now, use the same fee for both start and end values."
      );
    }
  });
});
