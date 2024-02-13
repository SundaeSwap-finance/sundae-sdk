import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";
import { C, Lucid, Tx } from "lucid-cardano";

import { DatumBuilderLucidV1 } from "../../DatumBuilders/DatumBuilder.Lucid.V1.class.js";
import { ADA_METADATA, ORDER_DEPOSIT_DEFAULT } from "../../constants.js";
import {
  EContractVersion,
  EDatumType,
  ESwapType,
  IPoolData,
  ITxBuilderFees,
} from "../../exports/core.js";
import { PREVIEW_DATA, setupLucid } from "../../exports/testing.js";
import { TxBuilderLucidV1 } from "../TxBuilder.Lucid.V1.class.js";

let builder: TxBuilderLucidV1;
let datumBuilder: DatumBuilderLucidV1;

const { getUtxosByOutRefMock } = setupLucid((lucid) => {
  datumBuilder = new DatumBuilderLucidV1("preview");
  builder = new TxBuilderLucidV1(lucid, datumBuilder);
});

const TEST_REFERRAL_DEST = PREVIEW_DATA.addresses.alternatives[0];

describe("TxBuilderLucidV1", () => {
  it("should have the correct settings", () => {
    expect(builder.network).toEqual("preview");
    expect(builder.lucid).toBeInstanceOf(Lucid);
  });

  test("newTxInstance()", async () => {
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
      pool: PREVIEW_DATA.pools.v1,
      suppliedAsset: PREVIEW_DATA.assets.tada,
    });

    expect(spiedNewTx).toHaveBeenNthCalledWith(1, undefined);
    expect(spiedBuildSwapDatum).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ident: PREVIEW_DATA.pools.v1.ident,
        fundedAsset: expect.objectContaining({
          amount: PREVIEW_DATA.assets.tada.amount,
        }),
      })
    );

    expect(datum).toEqual(
      "d8799f4106d8799fd8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a80ffd87a80ff1a002625a0d8799fd879801a01312d00d8799f1a008cf2d7ffffff"
    );
    expect(fees).toMatchObject<ITxBuilderFees>({
      deposit: expect.objectContaining({
        amount: ORDER_DEPOSIT_DEFAULT,
        metadata: ADA_METADATA,
      }),
      scooperFee: expect.objectContaining({
        amount: 2_500_000n,
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
          output.address().to_bech32("addr_test") ===
            PREVIEW_DATA.addresses.contracts.ORDER_SCRIPT_V1 &&
          // Supplied asset (20) + deposit (2) + scooper fee (2.5) = 24.5
          output.amount().coin().to_str() === "24500000"
        ) {
          depositOutput = output;
        }
      }
    );

    expect(depositOutput).not.toBeUndefined();
    const inlineDatum = depositOutput?.datum()?.as_data()?.get().to_bytes();

    expect(inlineDatum).toBeUndefined();
    expect(depositOutput?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "98e1eb989d74f122c29502f3dda5c68416dae1cd4f4f69a31d49534ebfab4d9c"
    );

    const datumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(0)
      .to_bytes();
    expect(datumBytes).not.toBeUndefined();
    expect(Buffer.from(datumBytes as Uint8Array).toString("hex")).toEqual(
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
          ...PREVIEW_DATA.pools.v1,
          ident: PREVIEW_DATA.pools.v3.ident,
        },
        suppliedAsset: PREVIEW_DATA.assets.tada,
      });
    } catch (e) {
      expect((e as Error).message).toEqual(
        DatumBuilderLucidV1.INVALID_POOL_IDENT
      );
    }
  });

  test("migrateLiquidityToV3() - single migration", async () => {
    const { build, datum, fees } = await builder.migrateLiquidityToV3([
      {
        withdrawConfig: {
          orderAddresses: {
            DestinationAddress: {
              address: PREVIEW_DATA.addresses.current,
              datum: {
                type: EDatumType.NONE,
              },
            },
          },
          pool: PREVIEW_DATA.pools.v1,
          suppliedLPAsset: new AssetAmount(
            100_000_000n,
            PREVIEW_DATA.pools.v1.assetLP
          ),
        },
        depositPool: PREVIEW_DATA.pools.v3,
      },
    ]);

    expect(datum).toBeUndefined();

    expect(fees.cardanoTxFee).toBeUndefined();
    expect(fees).toMatchObject<ITxBuilderFees>({
      deposit: expect.objectContaining({
        amount: ORDER_DEPOSIT_DEFAULT,
        metadata: ADA_METADATA,
      }),
      scooperFee: expect.objectContaining({
        amount: 3_600_000n,
        metadata: ADA_METADATA,
      }),
    });

    const { builtTx } = await build();

    let withdrawOutput: C.TransactionOutput | undefined;
    [...Array(builtTx.txComplete.body().outputs().len()).keys()].forEach(
      (index) => {
        const output = builtTx.txComplete.body().outputs().get(index);
        if (
          output.address().to_bech32("addr_test") ===
            PREVIEW_DATA.addresses.contracts.ORDER_SCRIPT_V1 &&
          output.amount().multiasset()?.to_js_value()[
            PREVIEW_DATA.pools.v1.assetLP.assetId.split(".")[0]
          ][PREVIEW_DATA.pools.v1.assetLP.assetId.split(".")[1]] ===
            "100000000" &&
          // deposit (2) + v1 scooper fee (2.5) + v3 scooper fee (1.1) +  = 5.6
          output.amount().coin().to_str() === "5600000"
        ) {
          withdrawOutput = output;
        }
      }
    );

    expect(withdrawOutput).not.toBeUndefined();
    const inlineDatum = withdrawOutput?.datum()?.as_data()?.get().to_bytes();

    expect(inlineDatum).toBeUndefined();
    expect(withdrawOutput?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "a56e43ea89f6a233b8a10546cd4562b55e9f2596a8316e7b547e12f8167031a2"
    );

    const depositMetadata = builtTx.txComplete
      .auxiliary_data()
      ?.metadata()
      ?.get(C.BigNum.from_str("103251"))
      ?.as_map();

    expect(depositMetadata).not.toBeUndefined();
    expect(
      Buffer.from(depositMetadata?.to_bytes() as Uint8Array).toString("hex")
    ).toEqual(
      "a1582076cb94caf308854de7511037fb9e54709a2afc5b0f4f1767c88b0da50d5421fe88581fd8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a4581f2470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a0010c8e0d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a086deb2cff9f581cfa3eff2047fdf9581f293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a0436f54896ffffffd87980ff"
    );

    const datumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(0)
      .to_bytes();
    expect(datumBytes).not.toBeUndefined();
    expect(Buffer.from(datumBytes as Uint8Array).toString("hex")).toEqual(
      "d8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f582076cb94caf308854de7511037fb9e54709a2afc5b0f4f1767c88b0da50d5421feffffd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affff1a002625a0d87a9f1a05f5e100ffff"
    );

    expect(fees.cardanoTxFee?.amount).not.toBeUndefined();
  });

  test("migrateLiquidityToV3() - multi migration", async () => {
    const RBERRY_V1_POOL: IPoolData = {
      assetA: ADA_METADATA,
      assetB: {
        assetId:
          "d441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf.524245525259",
        decimals: 0,
      },
      assetLP: {
        assetId:
          "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702000",
        decimals: 0,
      },
      currentFee: 0.005,
      liquidity: {
        aReserve: 136144306042n,
        bReserve: 80426064002n,
        lpTotal: 104627902594n,
      },
      ident: "00",
      version: EContractVersion.V1,
    };

    const RBERRY_V3_POOL: IPoolData = {
      assetA: ADA_METADATA,
      assetB: {
        assetId:
          "d441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf.524245525259",
        decimals: 0,
      },
      assetLP: {
        assetId:
          "633a136877ed6ad0ab33e69a22611319673474c8bd0a79a4c76d9289.0014df10a933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2",
        decimals: 0,
      },
      currentFee: 0.005,
      liquidity: {
        aReserve: 1018800000n,
        bReserve: 992067448n,
        lpTotal: 1005344874n,
      },
      ident: "a933477ea168013e2b5af4a9e029e36d26738eb6dfe382e1f3eab3e2",
      version: EContractVersion.V3,
    };

    const { build, datum, fees } = await builder.migrateLiquidityToV3([
      {
        withdrawConfig: {
          orderAddresses: {
            DestinationAddress: {
              address: PREVIEW_DATA.addresses.current,
              datum: {
                type: EDatumType.NONE,
              },
            },
          },
          pool: PREVIEW_DATA.pools.v1,
          suppliedLPAsset: new AssetAmount(
            100_000_000n,
            PREVIEW_DATA.pools.v1.assetLP
          ),
        },
        depositPool: PREVIEW_DATA.pools.v3,
      },
      {
        withdrawConfig: {
          orderAddresses: {
            DestinationAddress: {
              address: PREVIEW_DATA.addresses.current,
              datum: {
                type: EDatumType.NONE,
              },
            },
          },
          pool: RBERRY_V1_POOL,
          suppliedLPAsset: new AssetAmount(
            100_000_000n,
            RBERRY_V1_POOL.assetLP
          ),
        },
        depositPool: RBERRY_V3_POOL,
      },
    ]);

    expect(datum).toBeUndefined();

    expect(fees.cardanoTxFee).toBeUndefined();
    expect(fees).toMatchObject<ITxBuilderFees>({
      deposit: expect.objectContaining({
        amount: 4_000_000n,
        metadata: ADA_METADATA,
      }),
      scooperFee: expect.objectContaining({
        amount: 7_200_000n,
        metadata: ADA_METADATA,
      }),
    });

    const { builtTx } = await build();

    let withdrawOutput1: C.TransactionOutput | undefined;
    let withdrawOutput2: C.TransactionOutput | undefined;

    for (
      let index = 0;
      index < builtTx.txComplete.body().outputs().len();
      index++
    ) {
      const output = builtTx.txComplete.body().outputs().get(index);
      if (
        output.address().to_bech32("addr_test") ===
          PREVIEW_DATA.addresses.contracts.ORDER_SCRIPT_V1 &&
        output.amount().multiasset()?.to_js_value()[
          PREVIEW_DATA.pools.v1.assetLP.assetId.split(".")[0]
        ][PREVIEW_DATA.pools.v1.assetLP.assetId.split(".")[1]] ===
          "100000000" &&
        // deposit (2) + v1 scooper fee (2.5) + v3 scooper fee (1.1) +  = 5.6
        output.amount().coin().to_str() === "5600000"
      ) {
        withdrawOutput1 = output;
        withdrawOutput2 = builtTx.txComplete
          .body()
          .outputs()
          .get(index + 1);
        break;
      }
    }

    expect(withdrawOutput1).not.toBeUndefined();
    expect(withdrawOutput2).not.toBeUndefined();

    expect(
      withdrawOutput1?.datum()?.as_data()?.get().to_bytes()
    ).toBeUndefined();
    expect(withdrawOutput1?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "a56e43ea89f6a233b8a10546cd4562b55e9f2596a8316e7b547e12f8167031a2"
    );
    expect(withdrawOutput2?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "97c8093fb8fe77046f09faf34c684bfd3c8572ad7e8bcb2f19a3619e1968673a"
    );

    const transactionMetadata = builtTx.txComplete
      .auxiliary_data()
      ?.metadata()
      ?.get(C.BigNum.from_str("103251"))
      ?.as_map();

    expect(transactionMetadata).not.toBeUndefined();
    expect(
      Buffer.from(transactionMetadata?.to_bytes() as Uint8Array).toString("hex")
    ).toEqual(
      "a2582046ce747bf706414fa8abab441ce8d285c65f3dff54e7a219c4820f9e7b0b2f4088581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a0010c8e0d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a07c18281ff9f581cd441227553a0f1581fa965fee7d60a0f724b368dd1bddbc208730fccebcf465242455252591a049449ec31ffffffd87980ff582076cb94caf308854de7511037fb9e54709a2afc5b0f4f1767c88b0da50d5421fe88581fd8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a4581f2470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a0010c8e0d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a086deb2cff9f581cfa3eff2047fdf9581f293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a0436f54896ffffffd87980ff"
    );

    const firstMigrationDatumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(0)
      .to_bytes();
    expect(firstMigrationDatumBytes).not.toBeUndefined();
    expect(
      Buffer.from(firstMigrationDatumBytes as Uint8Array).toString("hex")
    ).toEqual(
      "d8799f4100d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f582046ce747bf706414fa8abab441ce8d285c65f3dff54e7a219c4820f9e7b0b2f40ffffd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affff1a002625a0d87a9f1a05f5e100ffff"
    );

    const secondMigrationDatumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(1)
      .to_bytes();
    expect(secondMigrationDatumBytes).not.toBeUndefined();
    expect(
      Buffer.from(secondMigrationDatumBytes as Uint8Array).toString("hex")
    ).toEqual(
      "d8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f582076cb94caf308854de7511037fb9e54709a2afc5b0f4f1767c88b0da50d5421feffffd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affff1a002625a0d87a9f1a05f5e100ffff"
    );

    expect(fees.cardanoTxFee?.amount).not.toBeUndefined();
  });

  test("cancel()", async () => {
    getUtxosByOutRefMock.mockResolvedValueOnce([
      PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1,
    ]);

    const { datum, fees } = await builder.cancel({
      ownerAddress: PREVIEW_DATA.addresses.current,
      utxo: {
        hash: PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.txHash,
        index: PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.outputIndex,
      },
    });

    expect(datum).toEqual(PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.datum);
    expect(fees).toMatchObject<ITxBuilderFees>({
      deposit: expect.objectContaining({
        amount: 0n,
      }),
      scooperFee: expect.objectContaining({
        amount: 0n,
      }),
    });

    /**
     * @TODO Fix this.
     */
    // const { cbor } = await build();
    // console.log(cbor);
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
      pool: PREVIEW_DATA.pools.v1,
      suppliedLPAsset: PREVIEW_DATA.assets.v1LpToken,
    });

    expect(spiedNewTx).toHaveBeenNthCalledWith(1, undefined);
    expect(spiedBuildWithdrawDatum).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ident: PREVIEW_DATA.pools.v1.ident,
        suppliedLPAsset: expect.objectContaining({
          amount: 100_000_000n,
        }),
      })
    );

    expect(datum).toEqual(
      "d8799f4106d8799fd8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a80ffd87a80ff1a002625a0d87a9f1a05f5e100ffff"
    );
    expect(fees).toMatchObject<ITxBuilderFees>({
      deposit: expect.objectContaining({
        amount: ORDER_DEPOSIT_DEFAULT,
        metadata: ADA_METADATA,
      }),
      scooperFee: expect.objectContaining({
        amount: 2_500_000n,
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
          output.address().to_bech32("addr_test") ===
            PREVIEW_DATA.addresses.contracts.ORDER_SCRIPT_V1 &&
          // deposit (2) + scooper fee (2.5) = 4.5
          output.amount().coin().to_str() === "4500000" &&
          output.amount().multiasset() &&
          output.amount().multiasset()?.to_js_value()[
            PREVIEW_DATA.assets.v1LpToken.metadata.assetId.split(".")[0]
          ][PREVIEW_DATA.assets.v1LpToken.metadata.assetId.split(".")[1]] ===
            PREVIEW_DATA.assets.v1LpToken.amount.toString()
        ) {
          withdrawOutput = output;
        }
      }
    );

    expect(withdrawOutput).not.toBeUndefined();
    const inlineDatum = withdrawOutput?.datum()?.as_data()?.get().to_bytes();

    expect(inlineDatum).toBeUndefined();
    expect(withdrawOutput?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "cfc0f78bf969f77692696fc06c20e605187e7c77a13168e42c8ec121e79e51bd"
    );

    const datumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(0)
      .to_bytes();
    expect(datumBytes).not.toBeUndefined();
    expect(Buffer.from(datumBytes as Uint8Array).toString("hex")).toEqual(
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
          ...PREVIEW_DATA.pools.v1,
          ident: PREVIEW_DATA.pools.v3.ident,
        },
        suppliedLPAsset: PREVIEW_DATA.assets.v3LpToken,
      });
    } catch (e) {
      expect((e as Error).message).toEqual(
        DatumBuilderLucidV1.INVALID_POOL_IDENT
      );
    }
  });
});
