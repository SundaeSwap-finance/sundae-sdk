import { jest } from "@jest/globals";
import { AssetAmount } from "@sundaeswap/asset";
import { C, Lucid, Tx } from "lucid-cardano";

import {
  EContractVersion,
  EDatumType,
  ESwapType,
  ITxBuilderFees,
} from "../../@types/index.js";
import { DatumBuilderLucidV3 } from "../../DatumBuilders/DatumBuilder.Lucid.V3.class.js";
import { QueryProviderSundaeSwap } from "../../QueryProviders/QueryProviderSundaeSwap.js";
import { ADA_METADATA, ORDER_DEPOSIT_DEFAULT } from "../../constants.js";
import { PREVIEW_DATA, setupLucid } from "../../exports/testing.js";
import { TxBuilderLucidV3 } from "../TxBuilder.Lucid.V3.class.js";

let builder: TxBuilderLucidV3;
let datumBuilder: DatumBuilderLucidV3;

setupLucid((lucid) => {
  datumBuilder = new DatumBuilderLucidV3("preview");
  builder = new TxBuilderLucidV3(lucid, datumBuilder);
});

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

beforeAll(() => {
  const spiedQuery = jest.spyOn(
    QueryProviderSundaeSwap.prototype,
    "getProtocolBlueprints"
  );
  spiedQuery.mockResolvedValue({
    version: EContractVersion.V3,
    blueprint: {
      validators: [
        {
          title: "order.spend",
          hash: "484969d936f484c45f143d911f81636fe925048e205048ee1fe412aa",
          compiledCode:
            "59081f010000332323232323232322322223253330093232533300b3370e90010010991919991119198008008021119299980999b87480000044c8c8cc00400401c894ccc06400452809919299980c19b8f00200514a226600800800260380046eb8c068004dd7180b98088010a99980999b87480080044c8c8c8cc004004008894ccc06800452889919299980c998048048010998020020008a50301d002301b0013758603000260220042a66602666e1d200400113232323300100100222533301a00114a026464a6660326601201200429444cc010010004c074008c06c004dd6180c00098088010a99980999b87480180044c8c8c8c8cdc48019919980080080124000444a66603a00420022666006006603e00464a66603666016016002266e0000920021002301e0023758603400260340046eb4c060004c04400854ccc04ccdc3a4010002264646464a66602e66e1d20020011323253330193370e9001180d1baa300d3017300d301700a13371200200a266e20004014dd6980e000980a8010a503015001300b301330093013006375a60300026022004264646464a66602e66e1d20020011323253330193370e9001180d1baa300d3017300f301700a13371200a002266e20014004dd6980e000980a8010a503015001300b3013300b3013006375a603000260220046022002600260160106eb0c044c048c048c048c048c048c048c048c048c02cc00cc02c018c044c048c048c048c048c048c048c048c02cc00cc02c0188c044c048004c8c8c8c8c94ccc040cdc3a40000022646464646464646464646464a66603e60420042646464649319299981019b87480000044c8c94ccc094c09c00852616375c604a002603c00e2a66604066e1d20020011323232325333027302900213232498c8c8c8c8c94ccc0b4c0bc00852616375a605a002605a0046eb8c0ac004c0ac00cdd718148011919191919299981618170010a4c2c6eb4c0b0004c0b0008dd7181500098150021bae3028003163758604e002604e0046eb0c094004c07801c54ccc080cdc3a400800226464a66604a604e004264931919191919191919299981698178010a4c2c6eb4c0b4004c0b4008dd7181580098158019bae30290023232323232533302c302e002149858dd6981600098160011bae302a001302a003375c60500046eb0c094008dd618118008b1919bb03026001302630270013758604a002603c00e2a66604066e1d20060011323253330253027002132498c8c8c8c8c94ccc0a8c0b000852616375a605400260540046eb8c0a0004c0a0008dd718130008b1bac3025001301e007153330203370e9004000899192999812981380109924c6464646464646464a66605a605e0042930b1bad302d001302d002375c605600260560066eb8c0a4008c8c8c8c8c94ccc0b0c0b800852616375a605800260580046eb8c0a8004c0a800cdd718140011bac3025002375860460022c6466ec0c098004c098c09c004dd61812800980f0038b180f00319299980f99b87480000044c8c8c8c94ccc098c0a00084c8c9263253330253370e90000008a99981418118018a4c2c2a66604a66e1d200200113232533302a302c002149858dd7181500098118018a99981299b87480100044c8c94ccc0a8c0b000852616302a00130230031630230023253330243370e9000000899191919299981598168010991924c64a66605466e1d200000113232533302f3031002132498c94ccc0b4cdc3a400000226464a66606460680042649318120008b181900098158010a99981699b87480080044c8c8c8c8c8c94ccc0d8c0e000852616375a606c002606c0046eb4c0d0004c0d0008dd6981900098158010b18158008b181780098140018a99981519b874800800454ccc0b4c0a000c52616163028002301d00316302b001302b0023029001302200416302200316302600130260023024001301d00816301d007300f00a32533301d3370e900000089919299981118120010a4c2c6eb8c088004c06c03054ccc074cdc3a40040022a66604060360182930b0b180d8058b180f800980f801180e800980e801180d800980d8011bad30190013019002301700130170023015001300e00b16300e00a3001001223253330103370e900000089919299980a980b8010a4c2c6eb8c054004c03800854ccc040cdc3a400400226464a66602a602e00426493198030009198030030008b1bac3015001300e002153330103370e900200089919299980a980b80109924c6600c00246600c00c0022c6eb0c054004c03800854ccc040cdc3a400c002264646464a66602e603200426493198040009198040040008b1bac30170013017002375a602a002601c0042a66602066e1d20080011323253330153017002149858dd6980a80098070010a99980819b87480280044c8c94ccc054c05c00852616375a602a002601c0042c601c00244646600200200644a66602600229309919801801980b0011801980a000919299980699b87480000044c8c94ccc048c05000852616375c602400260160042a66601a66e1d20020011323253330123014002149858dd7180900098058010b1805800899192999808180900109919299980799b8748000c0380084c8c94ccc044cdc3a40046020002266e3cdd7180a9807800806801980a00098068010008a50300e0011630100013756601e6020602060206020602060206012600260120084601e002601000629309b2b19299980499b874800000454ccc030c01c00c52616153330093370e90010008a99980618038018a4c2c2c600e0046eb80048c014dd5000918019baa0015734aae7555cf2ab9f5742ae893011e581c6ed8ba08a3a0ab1cdc63079fb057f84ff43f87dc4792f6f09b94e8030001",
        },
      ],
    },
  });
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
});
