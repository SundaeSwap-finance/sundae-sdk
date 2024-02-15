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
    expect(TxBuilderLucidV1.getParam("scriptAddress", "preview")).toEqual(
      "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0"
    );
    expect(TxBuilderLucidV1.getParam("scriptAddress", "mainnet")).toEqual(
      "addr1wxaptpmxcxawvr3pzlhgnpmzz3ql43n2tc8mn3av5kx0yzs09tqh8"
    );
    expect(TxBuilderLucidV1.getParam("scriptValidator", "preview")).toEqual(
      "5906f501000033233223232323232323322323233223232323222323232322322323232325335001101d13263201d335738921035054350001d32325335001133530121200123353013120012333573466e3cdd700080100b00a9aa8021111111111001991a800911a80111199aa980b0900091299a8011099a8138008010800a81299a8121a8011119a80111a8100009280f99a812001a8129a8011111001899a9809090009191919199ab9a3370e646464646002008640026aa0504466a0029000111a80111299a999ab9a3371e0040360420402600e0022600c006640026aa04e4466a0029000111a80111299a999ab9a3371e00400e04003e20022600c00666e292201027020003500722220043335501975c66aa032eb9d69a9999ab9a3370e6aae75400d200023332221233300100400300235742a0066ae854008cd406dd71aba135744a004464c6404666ae7008008c0848880092002018017135744a00226aae7940044dd50009aa80191111111110049999ab9a3370ea00c9001109100111999ab9a3370ea00e9000109100091931900f99ab9c01c01f01d01c3333573466e1cd55cea8052400046666444424666600200a0080060046eb8d5d0a8051919191999ab9a3370e6aae754009200023232123300100300233501a75c6ae84d5d128019919191999ab9a3370e6aae754009200023232123300100300233501e75c6ae84d5d128019919191999ab9a3370e6aae7540092000233221233001003002302435742a00466a0424646464646666ae68cdc3a800a4004466644424466600200a0080066eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d400920002321223002003302b357426aae7940188c98c80c0cd5ce01681801701689aab9d5003135744a00226aae7940044dd50009aba135744a004464c6405266ae700980a409c4d55cf280089baa00135742a004464c6404a66ae7008809408c4d55cf280089baa00135742a004464c6404266ae7007808407c4d55cf280089baa00135742a0126eb4d5d0a80419191919191999ab9a3370ea002900211909111801802191919191999ab9a3370ea002900111909118010019919191999ab9a3370e6aae7540092000232321233001003002375a6ae84d5d128019bad35742a004464c6405866ae700a40b00a84d55cf280089baa001357426aae7940108cccd5cd19b875002480008cc88488cc00401000cc094d5d0a8021bad357426ae8940108c98c80a4cd5ce01301481381309aab9d5002135573ca00226ea8004d5d09aab9e500523333573466e1d4009200223212223001004375a6ae84d55cf280311999ab9a3370ea00690001199911091119980100300280218109aba15006375a6ae854014cd4075d69aba135744a00a464c6404a66ae7008809408c0880844d55cea80189aba25001135573ca00226ea8004d5d09aba2500823263201d33573803403a036264a66a601c6aae78dd50008980d24c442a66a0022603893110a99a8008980f24c442a66a0022604093110a99a8008981124c442a66a0022604893110a99a8008981324c442a66a0022605093110a99a8008981524c442a66a0022605893110a99a800899999991111109199999999980080380300b80a802802007801801004981080a18108091810806181080518108031810802110981824c6a6666ae68cdc39aab9d5002480008cc8848cc00400c008d5d0a8011aba135744a004464c6403866ae70064070068880084d55cf280089baa001135573a6ea80044d5d1280089aba25001135573ca00226ea80048c008dd6000990009aa808911999aab9f0012501323350123574200460066ae8800803cc8004d5404088448894cd40044008884cc014008ccd54c01c48004014010004c8004d5403c884894cd400440148854cd4c01000840204cd4c018480040100044880084880044488c88c008dd5800990009aa80711191999aab9f00225011233501033221233001003002300635573aa004600a6aae794008c010d5d100180709aba100112232323333573466e1d400520002350073005357426aae79400c8cccd5cd19b875002480089401c8c98c8038cd5ce00580700600589aab9d5001137540022424460040062244002464646666ae68cdc3a800a400446424460020066eb8d5d09aab9e500323333573466e1d400920002321223002003375c6ae84d55cf280211931900519ab9c00700a008007135573aa00226ea80048c8cccd5cd19b8750014800884880048cccd5cd19b8750024800084880088c98c8020cd5ce00280400300289aab9d375400292103505431002326320033357389211f556e6578706563746564205478496e666f20636f6e737472756374696f6e2e00003498480044488008488488cc00401000c448c8c00400488cc00cc00800800522011c4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c90001"
    );
    expect(TxBuilderLucidV1.getParam("scriptValidator", "mainnet")).toEqual(
      "59084601000033233322232332232333222323332223322323332223233223233223332223333222233322233223322332233223332223322332233322232323232322222325335300b001103c13503d35303b3357389201035054350003c498ccc888c8c8c94cd4c05c0144d4c0680188888cd4c04c480048d4c0ed40188888888888cd4c078480048ccd5cd19b8f375c0020180440420066a6040006446a6048004446a605000444666aa60302400244a66a6a07c0044266a08c0020042002a0886466a002a088a08a2446600466a609000846a0820024a0806600400e00226a606ca002444444444466a6032240024646464666ae68cdc399991119191800802990009aa82c1119a9a826000a4000446a6aa08a00444a66a6050666ae68cdc78010048150148980380089803001990009aa82b9119a9a825800a4000446a6aa08800444a66a604e666ae68cdc7801003814814080089803001999aa81e3ae335503c75ceb4d4c084cccd5cd19b8735573aa006900011998119aba1500335742a00466a080eb8d5d09aba2500223505135304f33573892010350543100050499262220020183371491010270200035302801422220044800808007c4d5d1280089aab9e500113754002012264a66a6a070601a6aae78dd50008a81a910a99a9a81d0008a81b910a99a9a81e0008a81c910a99a9a81f0008a81d910a99a9a8200008a81e910a99a9a8210008a81f910a99a9a8220008a820910a99a9a8230008a821910a99a9a8240008a822910a99a9a8250008a823910a99a9a82600089999999999825981000a18100090080071810006181000500418100031810002001110a8259a980a1999ab9a3370e6aae754009200023301635742a0046ae84d5d1280111a8211a982019ab9c490103505431000414992622002135573ca00226ea8004cd40148c8c8c8c8cccd5cd19b8735573aa00890001199980d9bae35742a0086464646666ae68cdc39aab9d5002480008cc88cc08c008004c8c8c8cccd5cd19b8735573aa004900011991198148010009919191999ab9a3370e6aae754009200023302d304735742a00466a07a4646464646666ae68cdc3a800a4004466606a6eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d4009200023037304e357426aae7940188d4154d4c14ccd5ce2490350543100054499264984d55cea80189aba25001135573ca00226ea8004d5d09aba2500223504e35304c335738921035054310004d49926135573ca00226ea8004d5d0a80119a81cbae357426ae8940088d4128d4c120cd5ce249035054310004949926135573ca00226ea8004d5d0a80119a81abae357426ae8940088d4118d4c110cd5ce249035054310004549926135573ca00226ea8004d5d0a8019bad35742a00464646464646666ae68cdc3a800a40084605c646464646666ae68cdc3a800a40044606c6464646666ae68cdc39aab9d5002480008cc88cd40f8008004dd69aba15002375a6ae84d5d1280111a8289a982799ab9c491035054310005049926135573ca00226ea8004d5d09aab9e500423333573466e1d40092000233036304b35742a0086eb4d5d09aba2500423504e35304c335738921035054310004d499264984d55cea80109aab9e5001137540026ae84d55cf280291999ab9a3370ea0049001118169bad357426aae7940188cccd5cd19b875003480008ccc0bcc11cd5d0a8031bad35742a00a66a072eb4d5d09aba2500523504a353048335738920103505431000494992649926135573aa00626ae8940044d55cf280089baa001357426ae8940088d4108d4c100cd5ce249035054310004149926135744a00226ae8940044d55cf280089baa0010033350052323333573466e1d40052002201623333573466e1d40092000201623504035303e335738921035054310003f499264984d55ce9baa001002335005200100112001230023758002640026aa072446666aae7c004940c08cd40bcd5d080118019aba2002498c8004d540e088448894cd4d40bc0044008884cc014008ccd54c01c48004014010004c8004d540dc884894cd4d40b400440188854cd4c01cc01000840244cd4c01848004010004488008488004800488848ccc00401000c00880048848cc00400c00880044880084880048004888848cccc00401401000c00880048848cc00400c00880048848cc00400c00880048848cc00400c00880048488c00800c888488ccc00401401000c800484888c00c0108884888ccc00801801401084888c00401080048488c00800c88488cc00401000c800448848cc00400c008480044488c88c008dd5800990009aa80d11191999aab9f0022501223350113355008300635573aa004600a6aae794008c010d5d100180c09aba10011122123300100300211200112232323333573466e1d400520002350083005357426aae79400c8cccd5cd19b87500248008940208d405cd4c054cd5ce24810350543100016499264984d55cea80089baa00112122300200311220011200113500d35300b3357389211f556e6578706563746564205478496e666f20636f6e737472756374696f6e2e0000c498888888888848cccccccccc00402c02802402001c01801401000c00880044488008488488cc00401000c480048c8c8cccd5cd19b875001480088c018dd71aba135573ca00646666ae68cdc3a80124000460106eb8d5d09aab9e500423500c35300a3357389201035054310000b499264984d55cea80089baa001212230020032122300100320012323333573466e1d40052002200823333573466e1d40092000200a2350073530053357389210350543100006499264984d55ce9baa0011200120011261220021220012001112323001001223300330020020014891c0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b9130001"
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
        if (
          output.address().to_bech32("addr_test") ===
            TxBuilderLucidV1.getParam("scriptAddress", "preview") &&
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
        amount: 3_500_000n,
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
            TxBuilderLucidV1.getParam("scriptAddress", "preview") &&
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
      "46a3e400f06b34a0edd5c6ec2a7062974628cbff4591f2ea04b205b93c86848f"
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
      "a15820d651799866cf8ff8edd92b85bc65ad38ff25ba8e39cc8cab30100ae531d0b2ef88581fd8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a4581f2470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a086deb2cff9f581cfa3eff2047fdf9581f293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a0436f54896ffffffd87980ff"
    );

    const datumBytes = builtTx.txComplete
      .witness_set()
      .plutus_data()
      ?.get(0)
      .to_bytes();
    expect(datumBytes).not.toBeUndefined();
    expect(Buffer.from(datumBytes as Uint8Array).toString("hex")).toEqual(
      "d8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f5820d651799866cf8ff8edd92b85bc65ad38ff25ba8e39cc8cab30100ae531d0b2efffffd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affff1a002625a0d87a9f1a05f5e100ffff"
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
        amount: 7_000_000n,
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
          TxBuilderLucidV1.getParam("scriptAddress", "preview") &&
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
      "46a3e400f06b34a0edd5c6ec2a7062974628cbff4591f2ea04b205b93c86848f"
    );
    expect(withdrawOutput2?.datum()?.as_data_hash()?.to_hex()).toEqual(
      "357bcac6276a55110008cdb8fbc5e12d6af38554c44fb28d9c75ed129e34fb7a"
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
      "a2582062e04d37ba38feceeeaaefed6e4bd8836868f3f9ec18ed23e30ed44400c1ba3688581fd8799fd8799f581ca933477ea168013e2b5af4a9e029e36d26738eb6dfe382581fe1f3eab3e2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a07c18281ff9f581cd441227553a0f1581fa965fee7d60a0f724b368dd1bddbc208730fccebcf465242455252591a049449ec31ffffffd87980ff5820d651799866cf8ff8edd92b85bc65ad38ff25ba8e39cc8cab30100ae531d0b2ef88581fd8799fd8799f581c8bf66e915c450ad94866abb02802821b599e32f43536a4581f2470b21ea2ffd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f521581f8b40691eea4514d0ff1a000f4240d8799fd8799fd8799f581cc279a3fb3b4e581f62bbc78e288783b58045d4ae82a18867d8352d02775affd8799fd8799fd879581f9f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0581fffffffffd87980ffd87b9f9f9f40401a086deb2cff9f581cfa3eff2047fdf9581f293c5feef4dc85ce58097ea1c6da4845a3515351834574494e44591a0436f54896ffffffd87980ff"
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
      "d8799f4100d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f582062e04d37ba38feceeeaaefed6e4bd8836868f3f9ec18ed23e30ed44400c1ba36ffffd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affff1a002625a0d87a9f1a05f5e100ffff"
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
      "d8799f4106d8799fd8799fd8799fd87a9f581c484969d936f484c45f143d911f81636fe925048e205048ee1fe412aaffd87a80ffd8799f5820d651799866cf8ff8edd92b85bc65ad38ff25ba8e39cc8cab30100ae531d0b2efffffd8799f581cc279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775affff1a002625a0d87a9f1a05f5e100ffff"
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
            TxBuilderLucidV1.getParam("scriptAddress", "preview") &&
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
