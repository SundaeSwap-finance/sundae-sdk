import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";
import { C, Lucid, Tx } from "lucid-cardano";

import { DatumBuilderLucidV1 } from "../../DatumBuilders/DatumBuilder.Lucid.V1.class.js";
import { setupLucid } from "../../TestUtilities/setupLucid.js";
import { ADA_METADATA, ORDER_DEPOSIT_DEFAULT } from "../../constants.js";
import {
  EContractVersion,
  EDatumType,
  ESwapType,
  IPoolData,
  ITxBuilderFees,
  QueryProviderSundaeSwap,
} from "../../exports/core.js";
import { PREVIEW_DATA } from "../../exports/testing.js";
import { TxBuilderLucidV1 } from "../TxBuilder.Lucid.V1.class.js";
import { TxBuilderLucidV3 } from "../TxBuilder.Lucid.V3.class.js";
import { params, settingsUtxosLucid } from "../__data__/mockData.js";

let builder: TxBuilderLucidV1;

const { getUtxosByOutRefMock } = setupLucid(async (lucid) => {
  builder = new TxBuilderLucidV1(lucid, "preview");
});

const TEST_REFERRAL_DEST = PREVIEW_DATA.addresses.alternatives[0];

jest
  .spyOn(QueryProviderSundaeSwap.prototype, "getProtocolParamsWithScriptHashes")
  .mockResolvedValue(params);
jest
  .spyOn(QueryProviderSundaeSwap.prototype, "getProtocolParamsWithScripts")
  .mockResolvedValue(params);
jest
  .spyOn(TxBuilderLucidV3.prototype, "getAllSettingsUtxos")
  .mockResolvedValue(settingsUtxosLucid);

describe("TxBuilderLucidV1", () => {
  it("should have the correct settings", () => {
    expect(builder.network).toEqual("preview");
    expect(builder.lucid).toBeInstanceOf(Lucid);
  });

  it("should have the correct parameters", () => {
    expect(TxBuilderLucidV1.getParam("cancelRedeemer", "preview")).toEqual(
      "d87a80"
    );
    expect(TxBuilderLucidV1.getParam("cancelRedeemer", "mainnet")).toEqual(
      "d87a80"
    );
    expect(
      TxBuilderLucidV1.getParam("maxScooperFee", "preview").toString()
    ).toEqual("2500000");
    expect(
      TxBuilderLucidV1.getParam("maxScooperFee", "mainnet").toString()
    ).toEqual("2500000");
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
    const spiedBuildSwapDatum = jest.spyOn(
      builder.datumBuilder,
      "buildSwapDatum"
    );

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
        const outputHex = output
          .address()
          .as_enterprise()
          ?.payment_cred()
          .to_scripthash()
          ?.to_hex();

        if (
          outputHex ===
            "730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977e" &&
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

  test("orderRouteSwap() - v1 to v1", async () => {
    const { build, datum, fees } = await builder.orderRouteSwap({
      ownerAddress: PREVIEW_DATA.addresses.current,
      swapA: {
        swapType: {
          type: ESwapType.MARKET,
          slippage: 0.03,
        },
        pool: PREVIEW_DATA.pools.v1,
        suppliedAsset: PREVIEW_DATA.assets.tindy,
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
            ...PREVIEW_DATA.pools.v1.assetB,
            assetId:
              // iBTC
              "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69425443",
          },
          assetLP: {
            ...PREVIEW_DATA.pools.v1.assetLP,
            assetId:
              "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702004",
          },
        },
      },
    });

    // Deposit carried over = 2 ADA
    expect(fees.deposit.amount.toString()).toEqual("2000000");

    // Two swaps = 2.5 + 2.5
    expect(fees.scooperFee.amount.toString()).toEqual("5000000");

    const { builtTx } = await build();

    let swapOutput: C.TransactionOutput | undefined;
    [...Array(builtTx.txComplete.body().outputs().len()).keys()].forEach(
      (index) => {
        const output = builtTx.txComplete.body().outputs().get(index);
        const outputHex = output
          .address()
          .as_enterprise()
          ?.payment_cred()
          .to_scripthash()
          ?.to_hex();

        if (
          outputHex ===
            "730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977e" &&
          output.amount().multiasset()?.to_js_value()[
            PREVIEW_DATA.assets.tindy.metadata.assetId.split(".")[0]
          ][PREVIEW_DATA.assets.tindy.metadata.assetId.split(".")[1]] ===
            "20000000" &&
          // deposit (2) + v1 scooper fee (2.5) + v1 scooper fee (2.5) +  = 7
          output.amount().coin().to_str() === "7000000"
        ) {
          swapOutput = output;
        }
      }
    );

    expect(swapOutput).not.toBeUndefined();
    expect(swapOutput).not.toBeUndefined();
    const inlineDatum = swapOutput?.datum()?.as_data()?.get().to_bytes();

    expect(inlineDatum).toBeUndefined();
    expect(swapOutput?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "3043e2dc62f9e00a9374c71338c67bf3f55173cd11a713a31fa2f55e9a4ed428"
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

    const transactionMetadata = builtTx.txComplete
      .auxiliary_data()
      ?.metadata()
      ?.get(C.BigNum.from_str("103251"))
      ?.as_map();

    expect(transactionMetadata).not.toBeUndefined();
    expect(
      Buffer.from(transactionMetadata?.to_bytes() as Uint8Array).toString("hex")
    ).toEqual(
      "a158202f046e481ae60ba18b449cda20c7c0878be2aee90ca79bbf3528f21b5478019585581fd8799f4104d8799fd8799fd8799fd8799f581cc279a3fb3b4e62bbc78e2887581f83b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd2581f2e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a581f80ffd87a80ff1a002625a0d8799fd879801a021f1b48d8799f1a00f39ad2ff42ffff"
    );
  });

  test("orderRouteSwap() - v1 to v3", async () => {
    const { build, datum, fees } = await builder.orderRouteSwap({
      ownerAddress: PREVIEW_DATA.addresses.current,
      swapA: {
        swapType: {
          type: ESwapType.MARKET,
          slippage: 0.03,
        },
        pool: PREVIEW_DATA.pools.v1,
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

    // Deposit carried over = 2 ADA
    expect(fees.deposit.amount.toString()).toEqual("2000000");

    // Two swaps = 2.5 + 1
    expect(fees.scooperFee.amount.toString()).toEqual("3500000");

    const { builtTx } = await build();

    let swapOutput: C.TransactionOutput | undefined;
    [...Array(builtTx.txComplete.body().outputs().len()).keys()].forEach(
      (index) => {
        const output = builtTx.txComplete.body().outputs().get(index);
        const outputHex = output
          .address()
          .as_enterprise()
          ?.payment_cred()
          .to_scripthash()
          ?.to_hex();

        if (
          outputHex ===
            "730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977e" &&
          output.amount().multiasset()?.to_js_value()[
            PREVIEW_DATA.assets.tindy.metadata.assetId.split(".")[0]
          ][PREVIEW_DATA.assets.tindy.metadata.assetId.split(".")[1]] ===
            "20000000" &&
          // deposit (2) + v1 scooper fee (2.5) + v3 scooper fee (1) +  = 5.5
          output.amount().coin().to_str() === "5500000"
        ) {
          swapOutput = output;
        }
      }
    );

    expect(swapOutput).not.toBeUndefined();
    expect(swapOutput).not.toBeUndefined();
    const inlineDatum = swapOutput?.datum()?.as_data()?.get().to_bytes();

    const datumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(0)
      .to_bytes();
    expect(datumBytes).not.toBeUndefined();
    expect(Buffer.from(datumBytes as Uint8Array).toString("hex")).toEqual(
      datum
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
      "a15820411c9ab96dc0cad6dbd8909e09c30874a276f1e2876a00b9bcf09659b57461e488581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87a9f9f40401a021f1b48ff9f581c2fe3c3364b443194581fb10954771c95819b8d6ed464033c21f03f8facb544694254431a01d7af8aff46ff43d87980ff"
    );

    expect(inlineDatum).toBeUndefined();
    expect(swapOutput?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "4692e72b72f032bea9362b94473df5aea4899b359ecbe69a6b6e36f4fa5a614c"
    );
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
    expect(fees.deposit.amount).toEqual(ORDER_DEPOSIT_DEFAULT);
    expect(fees.scooperFee.amount.toString()).toEqual("3500000");

    const { builtTx } = await build();

    let withdrawOutput: C.TransactionOutput | undefined;
    [...Array(builtTx.txComplete.body().outputs().len()).keys()].forEach(
      (index) => {
        const output = builtTx.txComplete.body().outputs().get(index);
        const outputHex = output
          .address()
          .as_enterprise()
          ?.payment_cred()
          .to_scripthash()
          ?.to_hex();

        if (
          outputHex ===
            "730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977e" &&
          output.amount().multiasset()?.to_js_value()[
            PREVIEW_DATA.pools.v1.assetLP.assetId.split(".")[0]
          ][PREVIEW_DATA.pools.v1.assetLP.assetId.split(".")[1]] ===
            "100000000" &&
          // deposit (2) + v1 scooper fee (2.5) + v3 scooper fee (1) +  = 5.5
          output.amount().coin().to_str() === "5500000"
        ) {
          withdrawOutput = output;
        }
      }
    );

    expect(withdrawOutput).not.toBeUndefined();
    const inlineDatum = withdrawOutput?.datum()?.as_data()?.get().to_bytes();

    expect(inlineDatum).toBeUndefined();
    expect(withdrawOutput?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "446d687e99c9ccfee9900428416300efde800ae39bd4cc5245a442d00b913561"
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
      "a158201c47dcdca681d1bd3fa339606ed76fb05dd2697a76d71379f81e4fea0e0e427488581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a086deb2cff9f581cfa3eff2047fdf9581f293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a0436f54996ffffff43d87980ff"
    );

    const datumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(0)
      .to_bytes();
    expect(datumBytes).not.toBeUndefined();
    expect(Buffer.from(datumBytes as Uint8Array).toString("hex")).toEqual(
      "d8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f58201c47dcdca681d1bd3fa339606ed76fb05dd2697a76d71379f81e4fea0e0e4274ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
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
    expect(fees.deposit.amount.toString()).toEqual(
      (ORDER_DEPOSIT_DEFAULT * 2n).toString()
    );
    expect(fees.scooperFee.amount.toString()).toEqual(7_000_000n.toString());

    const { builtTx } = await build();

    let withdrawOutput1: C.TransactionOutput | undefined;
    let withdrawOutput2: C.TransactionOutput | undefined;

    for (
      let index = 0;
      index < builtTx.txComplete.body().outputs().len();
      index++
    ) {
      const output = builtTx.txComplete.body().outputs().get(index);
      const outputHex = output
        .address()
        .as_enterprise()
        ?.payment_cred()
        .to_scripthash()
        ?.to_hex();
      if (
        outputHex ===
          "730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977e" &&
        output.amount().multiasset()?.to_js_value()[
          PREVIEW_DATA.pools.v1.assetLP.assetId.split(".")[0]
        ][PREVIEW_DATA.pools.v1.assetLP.assetId.split(".")[1]] ===
          "100000000" &&
        // deposit (2) + v1 scooper fee (2.5) + v3 scooper fee (1) +  = 5.5
        output.amount().coin().to_str() === "5500000"
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
      "446d687e99c9ccfee9900428416300efde800ae39bd4cc5245a442d00b913561"
    );
    expect(withdrawOutput2?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "cf299e3c5791274292885e3f64dc38325c42cadd9275b121d28a3f790d7ef49a"
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
      "a258201c47dcdca681d1bd3fa339606ed76fb05dd2697a76d71379f81e4fea0e0e427488581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a086deb2cff9f581cfa3eff2047fdf9581f293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a0436f54996ffffff43d87980ff582032444e87d4c9524a0f26f494b40476d0e3738455f6cd25ce8ba1ea98a3cd8fd588581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a07c18281ff9f581cd441227553a0f1581fa965fee7d60a0f724b368dd1bddbc208730fccebcf465242455252591a04944aec31ffffff43d87980ff"
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
      "d8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f58201c47dcdca681d1bd3fa339606ed76fb05dd2697a76d71379f81e4fea0e0e4274ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
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
      "d8799f4100d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f582032444e87d4c9524a0f26f494b40476d0e3738455f6cd25ce8ba1ea98a3cd8fd5ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
    );

    expect(fees.cardanoTxFee?.amount).not.toBeUndefined();
  });

  test.only("migrateLiquidityToV3() - multi migration with yield farming", async () => {
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

    getUtxosByOutRefMock
      .mockResolvedValueOnce([
        {
          address:
            "addr_test1qzj89zakqu939ljqrpsu5r0eq8eysxsncs0jyylrcjxvn2eam2na4f9wm8yxqa9andqfvu80uykztpnkfj9ey6vxf95qz4nnaf",
          assets: {
            lovelace: 20_000_000n,
          },
          outputIndex: 0,
          txHash:
            "aaaf193b8418253f4169ab869b77dedd4ee3df4f2837c226cee3c2f7fa955189",
          scriptRef: {
            script:
              "5905df0100003232323232323232323232222325333009333323232323232323232300100122223253330163370e900000089919198070028009bae301c0013014004153330163370e90010008991919806000919998040040008030029bac301c0013014004153330163370e90020008991919804000919998040040008030029bac301c0013014004153330163370e900300089919191919b8900333300c00148000894ccc070cccc02c02c0080240204cdc0000a400420026eb0c078004c078008dd6980e000980a0020a99980b19b87480200044c8c8c8c94ccc068cdc3a400400226464a66603866e1d2002301e3754660306034660306034010900124004266e240040144cdc40008029bad3020001301800214a0603000266028602c66028602c0089001240006eb4c070004c0500104c8c8c8c94ccc068cdc3a400400226464a66603866e1d2002301e3754660306034660306034010900024004266e240140044cdc40028009bad3020001301800214a0603000266028602c66028602c0089000240006eb4c070004c050010c05000cc0040048894ccc05800852809919299980a18018010a51133300500500100330190033017002300100122225333015003100213232333300600600133003002004003301800430160033001001222533301200214a226464a6660206006004266600a00a0020062940c05400cc04c008c0040048894ccc04000852809919299980719b8f00200314a2266600a00a00200660260066eb8c044008cc014c01c005200037586600a600e6600a600e0049000240206600a600e6600a600e00490002401c2930b19002199191919119299980719b87480000044c8c8c8c94ccc058c0600084c926300700315330134901334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016301600130160023014001300c002153300f4912b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300c00130010012232533300d3370e9000000899192999809980a8010a4c2a66020921334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c602600260160042a66601a66e1d20020011323253330133015002132498cc0180048c9263300600600115330104901334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e20657870656374656400163758602600260160042a66601a66e1d20040011323253330133015002132498cc0180048c9263300600600115330104901334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e20657870656374656400163758602600260160042a66601a66e1d200600113232323253330153017002132498cc0200048c9263300800800115330124901334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e20657870656374656400163758602a002602a0046eb4c04c004c02c00854ccc034cdc3a401000226464a666026602a0042930a99808249334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375a602600260160042a66601a66e1d200a0011323253330133015002149854cc0412401334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375a602600260160042a6601c9212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300b0013001001222533300f00214984c8ccc010010c04800c008c004c04000800ccc0040052000222233330073370e0020060184666600a00a66e000112002300e001002002230063754002460086ea80055cd2b9c5573aaae7955cfaba157441",
            type: "PlutusV2",
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          address:
            "addr_test1zpejwku7yelajfalc9x0v57eqng48zkcs6fxp2mr30mn7hqyt4ru43gx0nnfw3uvzyz3m6untg2jupmn5ht5xzs3h25qyussyg",
          assets: {
            lovelace: 500_000_000n,
            [RBERRY_V3_POOL.assetLP.assetId.replace(".", "")]: 100_000_000n,
            [RBERRY_V1_POOL.assetLP.assetId.replace(".", "")]: 100_000_000_000n,
          },
          outputIndex: 0,
          txHash:
            "86124ca5d341877a57943a608c7d2175d87da8502b038fc0883559f76ea5e7ed",
          datumHash:
            "ae02f4c4c993de87d8cfbf6b870326a97a0f4f674ff66ed895af257ff572c311",
          datum:
            "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff",
        },
      ]);
    const { build, datum, fees } = await builder.migrateLiquidityToV3(
      [
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
      ],
      {
        migrations: [
          {
            depositPool: RBERRY_V3_POOL,
            withdrawPool: RBERRY_V1_POOL,
          },
        ],
        ownerAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
        existingPositions: [
          {
            hash: "86124ca5d341877a57943a608c7d2175d87da8502b038fc0883559f76ea5e7ed",
            index: 0,
          },
        ],
      }
    );

    expect(datum).toBeUndefined();

    expect(fees.cardanoTxFee).toBeUndefined();
    expect(fees.deposit.amount.toString()).toEqual(
      (ORDER_DEPOSIT_DEFAULT * 3n).toString()
    );

    // 3 scoops = 3x for 2.5 ADA v1 contract withdraw, and 1 ADA v3 contract deposit
    expect(fees.scooperFee.amount.toString()).toEqual("10500000");

    const { builtTx } = await build();

    let withdrawOutput1: C.TransactionOutput | undefined;
    let withdrawOutput2: C.TransactionOutput | undefined;
    let withdrawOutput3: C.TransactionOutput | undefined;

    for (
      let index = 0;
      index < builtTx.txComplete.body().outputs().len();
      index++
    ) {
      const output = builtTx.txComplete.body().outputs().get(index);
      const outputHex = output
        .address()
        .as_enterprise()
        ?.payment_cred()
        .to_scripthash()
        ?.to_hex();
      if (
        outputHex ===
          "730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977e" &&
        output.amount().multiasset()?.to_js_value()[
          PREVIEW_DATA.pools.v1.assetLP.assetId.split(".")[0]
        ][PREVIEW_DATA.pools.v1.assetLP.assetId.split(".")[1]] ===
          "100000000" &&
        // deposit (2) + v1 scooper fee (2.5) + v3 scooper fee (1) +  = 5.5
        output.amount().coin().to_str() === "5500000"
      ) {
        withdrawOutput1 = output;
        withdrawOutput2 = builtTx.txComplete
          .body()
          .outputs()
          .get(index + 1);
        withdrawOutput3 = builtTx.txComplete
          .body()
          .outputs()
          .get(index + 2);
        break;
      }
    }

    expect(withdrawOutput1).not.toBeUndefined();
    expect(withdrawOutput2).not.toBeUndefined();
    expect(withdrawOutput3).not.toBeUndefined();

    expect(withdrawOutput1?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "446d687e99c9ccfee9900428416300efde800ae39bd4cc5245a442d00b913561"
    );
    expect(withdrawOutput2?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "cf299e3c5791274292885e3f64dc38325c42cadd9275b121d28a3f790d7ef49a"
    );
    expect(withdrawOutput3?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "6586e08bbf1bbffb10ba2388f2fa8855d3b616c313b96eb144947cf22d9c2ed2"
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
      "a358201c47dcdca681d1bd3fa339606ed76fb05dd2697a76d71379f81e4fea0e0e427488581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a086deb2cff9f581cfa3eff2047fdf9581f293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a0436f54996ffffff43d87980ff582032444e87d4c9524a0f26f494b40476d0e3738455f6cd25ce8ba1ea98a3cd8fd588581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a07c18281ff9f581cd441227553a0f1581fa965fee7d60a0f724b368dd1bddbc208730fccebcf465242455252591a04944aec31ffffff43d87980ff5820ae0bdc3950b0fcb6359b38164cadc28d7be721146069884ac09a0f7cf8cda44689581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a000f4240d8799fd8799fd87a9f581c73275b9e267f581fd927bfc14cf653d904d1538ad8869260ab638bf73f5cffd8799fd8799fd879581f9f581c045d47cac5067ce697478c11051deb935a152e0773a5d7430a11baa8581fffffffffd87b9fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa077581f1919f5218b40691eea4514d0ff80ffffffd87b9f9f9f40401b0000001e4be5581fc9f7ff9f581cd441227553a0f1a965fee7d60a0f724b368dd1bddbc208730f581bccebcf465242455252591b00000011e5baa103ffffff43d87980ff"
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
      "d8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f58201c47dcdca681d1bd3fa339606ed76fb05dd2697a76d71379f81e4fea0e0e4274ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
    );

    const secondMigrationDatumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(3)
      .to_bytes();
    expect(secondMigrationDatumBytes).not.toBeUndefined();
    expect(
      Buffer.from(secondMigrationDatumBytes as Uint8Array).toString("hex")
    ).toEqual(
      "d8799f4100d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f582032444e87d4c9524a0f26f494b40476d0e3738455f6cd25ce8ba1ea98a3cd8fd5ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
    );

    const thirdMigrationDatumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(2)
      .to_bytes();
    expect(thirdMigrationDatumBytes).not.toBeUndefined();
    expect(
      Buffer.from(thirdMigrationDatumBytes as Uint8Array).toString("hex")
    ).toEqual(
      "d8799f4100d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f582032444e87d4c9524a0f26f494b40476d0e3738455f6cd25ce8ba1ea98a3cd8fd5ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
    );

    expect(fees.cardanoTxFee?.amount).not.toBeUndefined();
  });

  test("cancel()", async () => {
    getUtxosByOutRefMock.mockResolvedValueOnce([
      PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1,
    ]);

    const spiedOnGetDatum = jest.spyOn(builder.lucid.provider, "getDatum");
    spiedOnGetDatum.mockResolvedValueOnce(
      builder.datumBuilder.buildOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.addresses.current,
          datum: {
            type: EDatumType.NONE,
          },
        },
      }).inline
    );

    const { build, datum, fees } = await builder.cancel({
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

    const { builtTx } = await build();
    let utxoInput: C.TransactionInput | undefined;
    for (let i = 0; i < builtTx.txComplete.body().inputs().len(); i++) {
      const input = builtTx.txComplete.body().inputs().get(i);
      if (
        input.transaction_id().to_hex() ===
          PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.txHash &&
        input.index().to_str() ===
          PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.outputIndex.toString()
      ) {
        utxoInput = input;
      }
    }

    expect(utxoInput).not.toBeUndefined();
    const attachedDatum = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(0)
      .to_bytes();
    expect(attachedDatum).not.toBeUndefined();
    expect(Buffer.from(attachedDatum as Uint8Array).toString("hex")).toEqual(
      PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1.datum
    );
  });

  test("cancel() v3 order", async () => {
    const spiedOnV3Cancel = jest.spyOn(TxBuilderLucidV3.prototype, "cancel");
    getUtxosByOutRefMock.mockResolvedValue([
      PREVIEW_DATA.wallet.submittedOrderUtxos.swapV3,
    ]);

    // Don't care to mock v3 so it will throw.
    try {
      await builder.cancel({
        ownerAddress: PREVIEW_DATA.addresses.current,
        utxo: {
          hash: PREVIEW_DATA.wallet.submittedOrderUtxos.swapV3.txHash,
          index: PREVIEW_DATA.wallet.submittedOrderUtxos.swapV3.outputIndex,
        },
      });
    } catch (e) {
      expect(spiedOnV3Cancel).toHaveBeenCalledTimes(1);
    }
  });

  test("withdraw()", async () => {
    const spiedNewTx = jest.spyOn(builder, "newTxInstance");
    const spiedBuildWithdrawDatum = jest.spyOn(
      builder.datumBuilder,
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
        const outputHex = output
          .address()
          .as_enterprise()
          ?.payment_cred()
          .to_scripthash()
          ?.to_hex();

        if (
          outputHex ===
            "730e7d146ad7427a23a885d2141b245d3f8ccd416b5322a31719977e" &&
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
});
