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
  QueryProviderSundaeSwap,
} from "../../exports/core.js";
import { PREVIEW_DATA, setupLucid } from "../../exports/testing.js";
import { TxBuilderLucidV1 } from "../TxBuilder.Lucid.V1.class.js";
import { TxBuilderLucidV3 } from "../TxBuilder.Lucid.V3.class.js";
import { params, settingsUtxos } from "./data/mockData.js";

let builder: TxBuilderLucidV1;
let datumBuilder: DatumBuilderLucidV1;

const { getUtxosByOutRefMock } = setupLucid((lucid) => {
  datumBuilder = new DatumBuilderLucidV1("preview");
  builder = new TxBuilderLucidV1(lucid, datumBuilder);
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
  .mockResolvedValue(settingsUtxos);

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
    expect(TxBuilderLucidV1.getParam("maxScooperFee", "preview")).toEqual(
      2_500_000n
    );
    expect(TxBuilderLucidV1.getParam("maxScooperFee", "mainnet")).toEqual(
      2_500_000n
    );
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

    // Two swaps = 2.5 + .5
    expect(fees.scooperFee.amount.toString()).toEqual("3000000");

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
          // deposit (2) + v1 scooper fee (2.5) + v3 scooper fee (.5) +  = 5
          output.amount().coin().to_str() === "5000000"
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
      "c598c3b1db99083313fce5ae25a4a83b51c0515131f8938c887affdef0ff43d5"
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
      "a15820d165fd2d7150ccc49b8b2580ea4c3948d2538d5cb79e2e91a82d0d77a59e5ced88581fd8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a4581f2470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a0007a120d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87a9f9f40401a021f1b48ff9f581c2fe3c3364b443194581fb10954771c95819b8d6ed464033c21f03f8facb544694254431a01d7af8aff46ff43d87980ff"
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
    expect(fees.scooperFee.amount).toEqual(3_000_000n);

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
          // deposit (2) + v1 scooper fee (2.5) + v3 scooper fee (.5) +  = 5
          output.amount().coin().to_str() === "5000000"
        ) {
          withdrawOutput = output;
        }
      }
    );

    expect(withdrawOutput).not.toBeUndefined();
    const inlineDatum = withdrawOutput?.datum()?.as_data()?.get().to_bytes();

    expect(inlineDatum).toBeUndefined();
    expect(withdrawOutput?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "4fc95753e6a84e3601ca75c0b0455af86933a2901060afd5e57e5cfc6ad69b48"
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
      "a158204d4d325e63b5ca7158c4a6053526f5e4fc1d21c3582e9afd67c3855c29ea484988581fd8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a4581f2470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a0007a120d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a086deb2cff9f581cfa3eff2047fdf9581f293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a0436f54996ffffff43d87980ff"
    );

    const datumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(0)
      .to_bytes();
    expect(datumBytes).not.toBeUndefined();
    expect(Buffer.from(datumBytes as Uint8Array).toString("hex")).toEqual(
      "d8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f58204d4d325e63b5ca7158c4a6053526f5e4fc1d21c3582e9afd67c3855c29ea4849ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
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
    expect(fees.deposit.amount).toEqual(ORDER_DEPOSIT_DEFAULT * 2n);
    expect(fees.scooperFee.amount).toEqual(6_000_000n);

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
        // deposit (2) + v1 scooper fee (2.5) + v3 scooper fee (.5) +  = 5
        output.amount().coin().to_str() === "5000000"
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
      "4fc95753e6a84e3601ca75c0b0455af86933a2901060afd5e57e5cfc6ad69b48"
    );
    expect(withdrawOutput2?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "0535c4f11b0ef42e85108b57eb4348a3a0a61686592cc74c55d1580717934706"
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
      "a258204d4d325e63b5ca7158c4a6053526f5e4fc1d21c3582e9afd67c3855c29ea484988581fd8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a4581f2470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a0007a120d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a086deb2cff9f581cfa3eff2047fdf9581f293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a0436f54996ffffff43d87980ff582060098b625da105dba46b8c5abd55bf4cfa83ef8b4afb78a80f9e805eafbb097988581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a0007a120d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a07c18281ff9f581cd441227553a0f1581fa965fee7d60a0f724b368dd1bddbc208730fccebcf465242455252591a04944aec31ffffff43d87980ff"
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
      "d8799f4100d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f582060098b625da105dba46b8c5abd55bf4cfa83ef8b4afb78a80f9e805eafbb0979ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
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
      "d8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f58204d4d325e63b5ca7158c4a6053526f5e4fc1d21c3582e9afd67c3855c29ea4849ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
    );

    expect(fees.cardanoTxFee?.amount).not.toBeUndefined();
  });

  test("migrateLiquidityToV3() - multi migration with yield farming", async () => {
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

    // 3 scoops = 3x for 2.5 ADA v1 contract withdraw, and .5 ADA v3 contract deposit
    expect(fees.scooperFee.amount.toString()).toEqual("9000000");

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
        // deposit (2) + v1 scooper fee (2.5) + v3 scooper fee (.5) +  = 5
        output.amount().coin().to_str() === "5000000"
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
      "4fc95753e6a84e3601ca75c0b0455af86933a2901060afd5e57e5cfc6ad69b48"
    );
    expect(withdrawOutput2?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "0535c4f11b0ef42e85108b57eb4348a3a0a61686592cc74c55d1580717934706"
    );
    expect(withdrawOutput3?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "34dfb21ccd64f163b0a9bd02bc72002f00240d9f609a4cca2283c564f0ecf35e"
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
      "a35820264c9c9984af5f3bb7ccdfb8d4469660a7090c4384ff6cdfe87c638ae63e12c989581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a0007a120d8799fd8799fd87a9f581c73275b9e267f581fd927bfc14cf653d904d1538ad8869260ab638bf73f5cffd8799fd8799fd879581f9f581c045d47cac5067ce697478c11051deb935a152e0773a5d7430a11baa8581fffffffffd87b9fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa077581f1919f5218b40691eea4514d0ff80ffffffd87b9f9f9f40401b0000001e4be5581fc9f7ff9f581cd441227553a0f1a965fee7d60a0f724b368dd1bddbc208730f581bccebcf465242455252591b00000011e5baa103ffffff43d87980ff58204d4d325e63b5ca7158c4a6053526f5e4fc1d21c3582e9afd67c3855c29ea484988581fd8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a4581f2470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a0007a120d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a086deb2cff9f581cfa3eff2047fdf9581f293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a0436f54996ffffff43d87980ff582060098b625da105dba46b8c5abd55bf4cfa83ef8b4afb78a80f9e805eafbb097988581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a0007a120d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a07c18281ff9f581cd441227553a0f1581fa965fee7d60a0f724b368dd1bddbc208730fccebcf465242455252591a04944aec31ffffff43d87980ff"
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
      "d8799f4100d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f582060098b625da105dba46b8c5abd55bf4cfa83ef8b4afb78a80f9e805eafbb0979ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
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
      "d8799f4100d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f5820264c9c9984af5f3bb7ccdfb8d4469660a7090c4384ff6cdfe87c638ae63e12c9ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1b000000174876e800ffff"
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
      "d8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f58204d4d325e63b5ca7158c4a6053526f5e4fc1d21c3582e9afd67c3855c29ea4849ffffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffff1a002625a0d87a9f1a05f5e100ffff"
    );

    expect(fees.cardanoTxFee?.amount).not.toBeUndefined();
  });

  test("cancel()", async () => {
    getUtxosByOutRefMock.mockResolvedValueOnce([
      PREVIEW_DATA.wallet.submittedOrderUtxos.swapV1,
    ]);

    const spiedOnGetDatum = jest.spyOn(builder.lucid.provider, "getDatum");
    spiedOnGetDatum.mockResolvedValueOnce(
      datumBuilder.buildOrderAddresses({
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

    const { cbor } = await build();
    expect(cbor).toEqual(
      "84a800828258200264732a4c82c3f90af79f32b70cf0d108500be9160b3ae036ff21d3cf18079800825820fda5c685eaff5fbb2a7ecb250389fd24a7216128929a9da0ad95b72b586fab7001018182583900c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d01b00000003bf8fcec9021a000463080b582006246d1c00521dedd30d5e5323484ee367875909d668d2775ad8eb09b6514b3b0d81825820fda5c685eaff5fbb2a7ecb250389fd24a7216128929a9da0ad95b72b586fab70010e82581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a1082583900c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d01b00000003beb05ca5111a0006948ca303815906f85906f501000033233223232323232323322323233223232323222323232322322323232325335001101d13263201d335738921035054350001d32325335001133530121200123353013120012333573466e3cdd700080100b00a9aa8021111111111001991a800911a80111199aa980b0900091299a8011099a8138008010800a81299a8121a8011119a80111a8100009280f99a812001a8129a8011111001899a9809090009191919199ab9a3370e646464646002008640026aa0504466a0029000111a80111299a999ab9a3371e0040360420402600e0022600c006640026aa04e4466a0029000111a80111299a999ab9a3371e00400e04003e20022600c00666e292201027020003500722220043335501975c66aa032eb9d69a9999ab9a3370e6aae75400d200023332221233300100400300235742a0066ae854008cd406dd71aba135744a004464c6404666ae7008008c0848880092002018017135744a00226aae7940044dd50009aa80191111111110049999ab9a3370ea00c9001109100111999ab9a3370ea00e9000109100091931900f99ab9c01c01f01d01c3333573466e1cd55cea8052400046666444424666600200a0080060046eb8d5d0a8051919191999ab9a3370e6aae754009200023232123300100300233501a75c6ae84d5d128019919191999ab9a3370e6aae754009200023232123300100300233501e75c6ae84d5d128019919191999ab9a3370e6aae7540092000233221233001003002302435742a00466a0424646464646666ae68cdc3a800a4004466644424466600200a0080066eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d400920002321223002003302b357426aae7940188c98c80c0cd5ce01681801701689aab9d5003135744a00226aae7940044dd50009aba135744a004464c6405266ae700980a409c4d55cf280089baa00135742a004464c6404a66ae7008809408c4d55cf280089baa00135742a004464c6404266ae7007808407c4d55cf280089baa00135742a0126eb4d5d0a80419191919191999ab9a3370ea002900211909111801802191919191999ab9a3370ea002900111909118010019919191999ab9a3370e6aae7540092000232321233001003002375a6ae84d5d128019bad35742a004464c6405866ae700a40b00a84d55cf280089baa001357426aae7940108cccd5cd19b875002480008cc88488cc00401000cc094d5d0a8021bad357426ae8940108c98c80a4cd5ce01301481381309aab9d5002135573ca00226ea8004d5d09aab9e500523333573466e1d4009200223212223001004375a6ae84d55cf280311999ab9a3370ea00690001199911091119980100300280218109aba15006375a6ae854014cd4075d69aba135744a00a464c6404a66ae7008809408c0880844d55cea80189aba25001135573ca00226ea8004d5d09aba2500823263201d33573803403a036264a66a601c6aae78dd50008980d24c442a66a0022603893110a99a8008980f24c442a66a0022604093110a99a8008981124c442a66a0022604893110a99a8008981324c442a66a0022605093110a99a8008981524c442a66a0022605893110a99a800899999991111109199999999980080380300b80a802802007801801004981080a18108091810806181080518108031810802110981824c6a6666ae68cdc39aab9d5002480008cc8848cc00400c008d5d0a8011aba135744a004464c6403866ae70064070068880084d55cf280089baa001135573a6ea80044d5d1280089aba25001135573ca00226ea80048c008dd6000990009aa808911999aab9f0012501323350123574200460066ae8800803cc8004d5404088448894cd40044008884cc014008ccd54c01c48004014010004c8004d5403c884894cd400440148854cd4c01000840204cd4c018480040100044880084880044488c88c008dd5800990009aa80711191999aab9f00225011233501033221233001003002300635573aa004600a6aae794008c010d5d100180709aba100112232323333573466e1d400520002350073005357426aae79400c8cccd5cd19b875002480089401c8c98c8038cd5ce00580700600589aab9d5001137540022424460040062244002464646666ae68cdc3a800a400446424460020066eb8d5d09aab9e500323333573466e1d400920002321223002003375c6ae84d55cf280211931900519ab9c00700a008007135573aa00226ea80048c8cccd5cd19b8750014800884880048cccd5cd19b8750024800084880088c98c8020cd5ce00280400300289aab9d375400292103505431002326320033357389211f556e6578706563746564205478496e666f20636f6e737472756374696f6e2e00003498480044488008488488cc00401000c448c8c00400488cc00cc00800800522011c4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c90001049fd8799f4103d8799fd8799fd8799fd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ffffffffd87a80ffd87a80ff1a002625a0d8799fd879801a00989680d8799f1a00989680ffffffff0581840000d87a80821a000433821a04dba5fdf5f6"
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
