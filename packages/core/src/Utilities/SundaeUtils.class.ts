import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { getSwapOutput } from "@sundaeswap/cpp";
import { Fraction } from "@sundaeswap/fraction";

import type {
  EContractVersion,
  EPoolCoin,
  ICurrentFeeFromDecayingFeeArgs,
  IPoolData,
  IProtocolParams,
  ISundaeProtocolParams,
  TFee,
  TSupportedNetworks,
} from "../@types/index.js";
import {
  ADA_ASSET_DECIMAL,
  ORDER_DEPOSIT_DEFAULT,
  V3_POOL_IDENT_LENGTH,
  VOID_REDEEMER,
} from "../constants.js";

export class SundaeUtils {
  static ADA_ASSET_IDS = [
    "",
    ".",
    "ada.lovelace",
    "cardano.ada",
    "616461.6c6f76656c616365",
  ];
  static MAINNET_OFFSET = 1591566291;
  static PREVIEW_OFFSET = 1666656000;

  /**
   * Helper function to check if an asset is ADA.
   * @param {IAssetAmountMetadata} asset The asset metadata.
   * @returns {boolean}
   */
  static isAdaAsset(asset?: IAssetAmountMetadata) {
    if (
      !asset ||
      !SundaeUtils.ADA_ASSET_IDS.includes(asset.assetId) ||
      asset.decimals !== ADA_ASSET_DECIMAL
    ) {
      return false;
    }

    return true;
  }

  /**
   * Helper function to check if a pool identifier is a valid V3 pool identifier.
   * @param poolIdent The pool identifier to be checked.
   * @returns {boolean} Returns true if the pool identifier is a valid V3 pool identifier, otherwise false.
   */
  static isV3PoolIdent(poolIdent: string) {
    return poolIdent.length === V3_POOL_IDENT_LENGTH;
  }

  /**
   * Determines if a given asset is a Liquidity Pool (LP) asset based on its policy ID, associated protocols, and version.
   * This method checks whether the asset's policy ID matches the hash of the 'pool.mint' validator in the specified protocol version.
   *
   * @static
   * @param {Object} params - The parameters for the method.
   * @param {string} params.assetPolicyId - The policy ID of the asset to be checked.
   * @param {IProtocol[]} params.protocols - An array of protocol objects, where each protocol corresponds to a different contract version.
   * @param {EContractVersion} params.version - The version of the contract to be used for validating the asset.
   * @returns {boolean} Returns true if the asset's policy ID matches the 'pool.mint' validator hash in the specified protocol version, otherwise false.
   */
  static isLPAsset({
    assetPolicyId,
    protocols,
    version,
  }: {
    assetPolicyId: string;
    protocols: ISundaeProtocolParams[];
    version: EContractVersion;
  }) {
    const protocol = protocols.find((p) => p.version === version);
    const validator = protocol?.blueprint.validators.find(
      (v) => v.title === "pool.mint"
    );
    return validator?.hash === assetPolicyId;
  }

  static getParams(network: TSupportedNetworks): IProtocolParams {
    const params: Record<TSupportedNetworks, IProtocolParams> = {
      mainnet: {
        ORDER_SCRIPT_V1:
          "addr1wxaptpmxcxawvr3pzlhgnpmzz3ql43n2tc8mn3av5kx0yzs09tqh8",
        ORDER_SCRIPT_V3: "",
        CANCEL_REDEEMER_V1: VOID_REDEEMER,
        CANCEL_REDEEMER_V3: VOID_REDEEMER,
        SCRIPT_VALIDATOR_V1:
          "59084601000033233322232332232333222323332223322323332223233223233223332223333222233322233223322332233223332223322332233322232323232322222325335300b001103c13503d35303b3357389201035054350003c498ccc888c8c8c94cd4c05c0144d4c0680188888cd4c04c480048d4c0ed40188888888888cd4c078480048ccd5cd19b8f375c0020180440420066a6040006446a6048004446a605000444666aa60302400244a66a6a07c0044266a08c0020042002a0886466a002a088a08a2446600466a609000846a0820024a0806600400e00226a606ca002444444444466a6032240024646464666ae68cdc399991119191800802990009aa82c1119a9a826000a4000446a6aa08a00444a66a6050666ae68cdc78010048150148980380089803001990009aa82b9119a9a825800a4000446a6aa08800444a66a604e666ae68cdc7801003814814080089803001999aa81e3ae335503c75ceb4d4c084cccd5cd19b8735573aa006900011998119aba1500335742a00466a080eb8d5d09aba2500223505135304f33573892010350543100050499262220020183371491010270200035302801422220044800808007c4d5d1280089aab9e500113754002012264a66a6a070601a6aae78dd50008a81a910a99a9a81d0008a81b910a99a9a81e0008a81c910a99a9a81f0008a81d910a99a9a8200008a81e910a99a9a8210008a81f910a99a9a8220008a820910a99a9a8230008a821910a99a9a8240008a822910a99a9a8250008a823910a99a9a82600089999999999825981000a18100090080071810006181000500418100031810002001110a8259a980a1999ab9a3370e6aae754009200023301635742a0046ae84d5d1280111a8211a982019ab9c490103505431000414992622002135573ca00226ea8004cd40148c8c8c8c8cccd5cd19b8735573aa00890001199980d9bae35742a0086464646666ae68cdc39aab9d5002480008cc88cc08c008004c8c8c8cccd5cd19b8735573aa004900011991198148010009919191999ab9a3370e6aae754009200023302d304735742a00466a07a4646464646666ae68cdc3a800a4004466606a6eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d4009200023037304e357426aae7940188d4154d4c14ccd5ce2490350543100054499264984d55cea80189aba25001135573ca00226ea8004d5d09aba2500223504e35304c335738921035054310004d49926135573ca00226ea8004d5d0a80119a81cbae357426ae8940088d4128d4c120cd5ce249035054310004949926135573ca00226ea8004d5d0a80119a81abae357426ae8940088d4118d4c110cd5ce249035054310004549926135573ca00226ea8004d5d0a8019bad35742a00464646464646666ae68cdc3a800a40084605c646464646666ae68cdc3a800a40044606c6464646666ae68cdc39aab9d5002480008cc88cd40f8008004dd69aba15002375a6ae84d5d1280111a8289a982799ab9c491035054310005049926135573ca00226ea8004d5d09aab9e500423333573466e1d40092000233036304b35742a0086eb4d5d09aba2500423504e35304c335738921035054310004d499264984d55cea80109aab9e5001137540026ae84d55cf280291999ab9a3370ea0049001118169bad357426aae7940188cccd5cd19b875003480008ccc0bcc11cd5d0a8031bad35742a00a66a072eb4d5d09aba2500523504a353048335738920103505431000494992649926135573aa00626ae8940044d55cf280089baa001357426ae8940088d4108d4c100cd5ce249035054310004149926135744a00226ae8940044d55cf280089baa0010033350052323333573466e1d40052002201623333573466e1d40092000201623504035303e335738921035054310003f499264984d55ce9baa001002335005200100112001230023758002640026aa072446666aae7c004940c08cd40bcd5d080118019aba2002498c8004d540e088448894cd4d40bc0044008884cc014008ccd54c01c48004014010004c8004d540dc884894cd4d40b400440188854cd4c01cc01000840244cd4c01848004010004488008488004800488848ccc00401000c00880048848cc00400c00880044880084880048004888848cccc00401401000c00880048848cc00400c00880048848cc00400c00880048848cc00400c00880048488c00800c888488ccc00401401000c800484888c00c0108884888ccc00801801401084888c00401080048488c00800c88488cc00401000c800448848cc00400c008480044488c88c008dd5800990009aa80d11191999aab9f0022501223350113355008300635573aa004600a6aae794008c010d5d100180c09aba10011122123300100300211200112232323333573466e1d400520002350083005357426aae79400c8cccd5cd19b87500248008940208d405cd4c054cd5ce24810350543100016499264984d55cea80089baa00112122300200311220011200113500d35300b3357389211f556e6578706563746564205478496e666f20636f6e737472756374696f6e2e0000c498888888888848cccccccccc00402c02802402001c01801401000c00880044488008488488cc00401000c480048c8c8cccd5cd19b875001480088c018dd71aba135573ca00646666ae68cdc3a80124000460106eb8d5d09aab9e500423500c35300a3357389201035054310000b499264984d55cea80089baa001212230020032122300100320012323333573466e1d40052002200823333573466e1d40092000200a2350073530053357389210350543100006499264984d55ce9baa0011200120011261220021220012001112323001001223300330020020014891c0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b9130001",
        SCRIPT_VALIDATOR_V3: "",
        YF_STAKE_KEYHASH:
          "d7244b4a8777b7dc6909f4640cf02ea4757a557a99fb483b05f87dfe",
        YF_PAYMENT_SCRIPTHASH:
          "73275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c",
        YF_REFERENCE_INPUT:
          "006ddd85cfc2e2d8b7238daa37b37a5db2ac63de2df35884a5e501667981e1e3#0",
      },
      preview: {
        ORDER_SCRIPT_V1:
          "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
        ORDER_SCRIPT_V3:
          "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe",
        CANCEL_REDEEMER_V1: VOID_REDEEMER,
        CANCEL_REDEEMER_V3: VOID_REDEEMER,
        SCRIPT_VALIDATOR_V1:
          "5906f501000033233223232323232323322323233223232323222323232322322323232325335001101d13263201d335738921035054350001d32325335001133530121200123353013120012333573466e3cdd700080100b00a9aa8021111111111001991a800911a80111199aa980b0900091299a8011099a8138008010800a81299a8121a8011119a80111a8100009280f99a812001a8129a8011111001899a9809090009191919199ab9a3370e646464646002008640026aa0504466a0029000111a80111299a999ab9a3371e0040360420402600e0022600c006640026aa04e4466a0029000111a80111299a999ab9a3371e00400e04003e20022600c00666e292201027020003500722220043335501975c66aa032eb9d69a9999ab9a3370e6aae75400d200023332221233300100400300235742a0066ae854008cd406dd71aba135744a004464c6404666ae7008008c0848880092002018017135744a00226aae7940044dd50009aa80191111111110049999ab9a3370ea00c9001109100111999ab9a3370ea00e9000109100091931900f99ab9c01c01f01d01c3333573466e1cd55cea8052400046666444424666600200a0080060046eb8d5d0a8051919191999ab9a3370e6aae754009200023232123300100300233501a75c6ae84d5d128019919191999ab9a3370e6aae754009200023232123300100300233501e75c6ae84d5d128019919191999ab9a3370e6aae7540092000233221233001003002302435742a00466a0424646464646666ae68cdc3a800a4004466644424466600200a0080066eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d400920002321223002003302b357426aae7940188c98c80c0cd5ce01681801701689aab9d5003135744a00226aae7940044dd50009aba135744a004464c6405266ae700980a409c4d55cf280089baa00135742a004464c6404a66ae7008809408c4d55cf280089baa00135742a004464c6404266ae7007808407c4d55cf280089baa00135742a0126eb4d5d0a80419191919191999ab9a3370ea002900211909111801802191919191999ab9a3370ea002900111909118010019919191999ab9a3370e6aae7540092000232321233001003002375a6ae84d5d128019bad35742a004464c6405866ae700a40b00a84d55cf280089baa001357426aae7940108cccd5cd19b875002480008cc88488cc00401000cc094d5d0a8021bad357426ae8940108c98c80a4cd5ce01301481381309aab9d5002135573ca00226ea8004d5d09aab9e500523333573466e1d4009200223212223001004375a6ae84d55cf280311999ab9a3370ea00690001199911091119980100300280218109aba15006375a6ae854014cd4075d69aba135744a00a464c6404a66ae7008809408c0880844d55cea80189aba25001135573ca00226ea8004d5d09aba2500823263201d33573803403a036264a66a601c6aae78dd50008980d24c442a66a0022603893110a99a8008980f24c442a66a0022604093110a99a8008981124c442a66a0022604893110a99a8008981324c442a66a0022605093110a99a8008981524c442a66a0022605893110a99a800899999991111109199999999980080380300b80a802802007801801004981080a18108091810806181080518108031810802110981824c6a6666ae68cdc39aab9d5002480008cc8848cc00400c008d5d0a8011aba135744a004464c6403866ae70064070068880084d55cf280089baa001135573a6ea80044d5d1280089aba25001135573ca00226ea80048c008dd6000990009aa808911999aab9f0012501323350123574200460066ae8800803cc8004d5404088448894cd40044008884cc014008ccd54c01c48004014010004c8004d5403c884894cd400440148854cd4c01000840204cd4c018480040100044880084880044488c88c008dd5800990009aa80711191999aab9f00225011233501033221233001003002300635573aa004600a6aae794008c010d5d100180709aba100112232323333573466e1d400520002350073005357426aae79400c8cccd5cd19b875002480089401c8c98c8038cd5ce00580700600589aab9d5001137540022424460040062244002464646666ae68cdc3a800a400446424460020066eb8d5d09aab9e500323333573466e1d400920002321223002003375c6ae84d55cf280211931900519ab9c00700a008007135573aa00226ea80048c8cccd5cd19b8750014800884880048cccd5cd19b8750024800084880088c98c8020cd5ce00280400300289aab9d375400292103505431002326320033357389211f556e6578706563746564205478496e666f20636f6e737472756374696f6e2e00003498480044488008488488cc00401000c448c8c00400488cc00cc00800800522011c4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c90001",
        SCRIPT_VALIDATOR_V3:
          "59081f010000332323232323232322322223253330093232533300b3370e90010010991919991119198008008021119299980999b87480000044c8c8cc00400401c894ccc06400452809919299980c19b8f00200514a226600800800260380046eb8c068004dd7180b98088010a99980999b87480080044c8c8c8cc004004008894ccc06800452889919299980c998048048010998020020008a50301d002301b0013758603000260220042a66602666e1d200400113232323300100100222533301a00114a026464a6660326601201200429444cc010010004c074008c06c004dd6180c00098088010a99980999b87480180044c8c8c8c8cdc48019919980080080124000444a66603a00420022666006006603e00464a66603666016016002266e0000920021002301e0023758603400260340046eb4c060004c04400854ccc04ccdc3a4010002264646464a66602e66e1d20020011323253330193370e9001180d1baa300d3017300d301700a13371200200a266e20004014dd6980e000980a8010a503015001300b301330093013006375a60300026022004264646464a66602e66e1d20020011323253330193370e9001180d1baa300d3017300f301700a13371200a002266e20014004dd6980e000980a8010a503015001300b3013300b3013006375a603000260220046022002600260160106eb0c044c048c048c048c048c048c048c048c048c02cc00cc02c018c044c048c048c048c048c048c048c048c02cc00cc02c0188c044c048004c8c8c8c8c94ccc040cdc3a40000022646464646464646464646464a66603e60420042646464649319299981019b87480000044c8c94ccc094c09c00852616375c604a002603c00e2a66604066e1d20020011323232325333027302900213232498c8c8c8c8c94ccc0b4c0bc00852616375a605a002605a0046eb8c0ac004c0ac00cdd718148011919191919299981618170010a4c2c6eb4c0b0004c0b0008dd7181500098150021bae3028003163758604e002604e0046eb0c094004c07801c54ccc080cdc3a400800226464a66604a604e004264931919191919191919299981698178010a4c2c6eb4c0b4004c0b4008dd7181580098158019bae30290023232323232533302c302e002149858dd6981600098160011bae302a001302a003375c60500046eb0c094008dd618118008b1919bb03026001302630270013758604a002603c00e2a66604066e1d20060011323253330253027002132498c8c8c8c8c94ccc0a8c0b000852616375a605400260540046eb8c0a0004c0a0008dd718130008b1bac3025001301e007153330203370e9004000899192999812981380109924c6464646464646464a66605a605e0042930b1bad302d001302d002375c605600260560066eb8c0a4008c8c8c8c8c94ccc0b0c0b800852616375a605800260580046eb8c0a8004c0a800cdd718140011bac3025002375860460022c6466ec0c098004c098c09c004dd61812800980f0038b180f00319299980f99b87480000044c8c8c8c94ccc098c0a00084c8c9263253330253370e90000008a99981418118018a4c2c2a66604a66e1d200200113232533302a302c002149858dd7181500098118018a99981299b87480100044c8c94ccc0a8c0b000852616302a00130230031630230023253330243370e9000000899191919299981598168010991924c64a66605466e1d200000113232533302f3031002132498c94ccc0b4cdc3a400000226464a66606460680042649318120008b181900098158010a99981699b87480080044c8c8c8c8c8c94ccc0d8c0e000852616375a606c002606c0046eb4c0d0004c0d0008dd6981900098158010b18158008b181780098140018a99981519b874800800454ccc0b4c0a000c52616163028002301d00316302b001302b0023029001302200416302200316302600130260023024001301d00816301d007300f00a32533301d3370e900000089919299981118120010a4c2c6eb8c088004c06c03054ccc074cdc3a40040022a66604060360182930b0b180d8058b180f800980f801180e800980e801180d800980d8011bad30190013019002301700130170023015001300e00b16300e00a3001001223253330103370e900000089919299980a980b8010a4c2c6eb8c054004c03800854ccc040cdc3a400400226464a66602a602e00426493198030009198030030008b1bac3015001300e002153330103370e900200089919299980a980b80109924c6600c00246600c00c0022c6eb0c054004c03800854ccc040cdc3a400c002264646464a66602e603200426493198040009198040040008b1bac30170013017002375a602a002601c0042a66602066e1d20080011323253330153017002149858dd6980a80098070010a99980819b87480280044c8c94ccc054c05c00852616375a602a002601c0042c601c00244646600200200644a66602600229309919801801980b0011801980a000919299980699b87480000044c8c94ccc048c05000852616375c602400260160042a66601a66e1d20020011323253330123014002149858dd7180900098058010b1805800899192999808180900109919299980799b8748000c0380084c8c94ccc044cdc3a40046020002266e3cdd7180a9807800806801980a00098068010008a50300e0011630100013756601e6020602060206020602060206012600260120084601e002601000629309b2b19299980499b874800000454ccc030c01c00c52616153330093370e90010008a99980618038018a4c2c2c600e0046eb80048c014dd5000918019baa0015734aae7555cf2ab9f5742ae893011e581c6ed8ba08a3a0ab1cdc63079fb057f84ff43f87dc4792f6f09b94e8030001",
        YF_STAKE_KEYHASH:
          "045d47cac5067ce697478c11051deb935a152e0773a5d7430a11baa8",
        YF_PAYMENT_SCRIPTHASH:
          "73275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c",
        YF_REFERENCE_INPUT:
          "e08869946b5d3b6f32d11bac15d99ce68a993d5853980e4fca302825c02df94f#0",
      },
    };

    return params[network];
  }

  static sortSwapAssetsWithAmounts(
    assets: [
      AssetAmount<IAssetAmountMetadata>,
      AssetAmount<IAssetAmountMetadata>
    ]
  ) {
    return assets.sort((a, b) => {
      const isASpecial = SundaeUtils.isAdaAsset(a.metadata);
      const isBSpecial = SundaeUtils.isAdaAsset(b.metadata);

      if (isASpecial && !isBSpecial) {
        return -1;
      }

      if (!isASpecial && isBSpecial) {
        return 1;
      }

      return a.metadata.assetId.localeCompare(b.metadata.assetId);
    });
  }

  static getAssetSwapDirection(
    asset: IAssetAmountMetadata,
    assets: [IAssetAmountMetadata, IAssetAmountMetadata]
  ): EPoolCoin {
    const sorted = SundaeUtils.sortSwapAssetsWithAmounts([
      new AssetAmount<IAssetAmountMetadata>(0n, assets[0]),
      new AssetAmount<IAssetAmountMetadata>(0n, assets[1]),
    ]);

    if (
      SundaeUtils.isAssetIdsEqual(sorted[1]?.metadata.assetId, asset.assetId)
    ) {
      return 1;
    }

    return 0;
  }

  /**
   * Subtracts the pool fee percentage from the asset amount.
   *
   * @param {AssetAmount<IAssetAmountMetadata>} amount The amount we are subtracting from.
   * @param {TFee} fee The fee percentage, represented as a tuple: [numerator, denominator].
   * @returns
   */
  static subtractPoolFeeFromAmount(
    amount: AssetAmount<IAssetAmountMetadata>,
    fee: TFee
  ): number {
    const percent = new Fraction(fee[0], fee[1]).toNumber();
    return Number(amount.amount) * (1 - percent);
  }

  static getCurrentFeeFromDecayingFee({
    endFee,
    endSlot,
    network,
    startFee,
    startSlot,
  }: ICurrentFeeFromDecayingFeeArgs): number {
    const currentUnix = Math.floor(Date.now() / 1000);
    const poolOpen = SundaeUtils.slotToUnix(startSlot, network);
    const feesFinalized = SundaeUtils.slotToUnix(endSlot, network);

    const openingFee = new Fraction(...startFee);
    const finalFee = new Fraction(...endFee);

    if (currentUnix <= poolOpen) {
      return openingFee.toNumber();
    }

    if (currentUnix > feesFinalized) {
      return finalFee.toNumber();
    }

    const totalDuration = feesFinalized - poolOpen;
    const elapsedDuration = currentUnix - poolOpen;
    const feeRange = elapsedDuration / totalDuration;

    const interpolatedFee = Fraction.asFraction(
      openingFee.toNumber() +
        feeRange * (finalFee.toNumber() - openingFee.toNumber())
    );

    return interpolatedFee.toNumber();
  }

  /**
   * Calculates the current fee based on a decaying fee structure between a start and an end point in time.
   * The fee decays linearly from the start fee to the end fee over the period from the start slot to the end slot.
   *
   * @param {ICurrentFeeFromDecayingFeeArgs} args - An object containing necessary arguments:
   *   @param {number[]} args.endFee - The fee percentage at the end of the decay period, represented as a Fraction.
   *   @param {number} args.endSlot - The slot number representing the end of the fee decay period.
   *   @param {TSupportedNetworks} args.network - The network identifier to be used for slot to Unix time conversion.
   *   @param {number[]} args.startFee - The starting fee percentage at the beginning of the decay period, represented as a Fraction.
   *   @param {number} args.startSlot - The slot number representing the start of the fee decay period.
   *
   * @returns {number} The interpolated fee percentage as a number, based on the current time within the decay period.
   *
   * @example
   * ```ts
   * const currentFee = getCurrentFeeFromDecayingFee({
   *   endFee: [1, 100], // 1%
   *   endSlot: 12345678,
   *   network: 'preview',
   *   startFee: [2, 100], // 2%
   *   startSlot: 12345600
   * });
   * console.log(currentFee); // Outputs the current fee percentage based on the current time
   * ```
   */
  static getMinReceivableFromSlippage(
    pool: IPoolData,
    suppliedAsset: AssetAmount<IAssetAmountMetadata>,
    slippage: number
  ): AssetAmount<IAssetAmountMetadata> {
    const supplyingPoolAssetA = SundaeUtils.isAssetIdsEqual(
      pool.assetA.assetId,
      suppliedAsset.metadata.assetId
    );

    const output = getSwapOutput(
      suppliedAsset.amount,
      supplyingPoolAssetA ? pool.liquidity.aReserve : pool.liquidity.bReserve,
      supplyingPoolAssetA ? pool.liquidity.bReserve : pool.liquidity.aReserve,
      pool.currentFee,
      false
    );

    if (
      !SundaeUtils.isAssetIdsEqual(
        pool.assetA.assetId,
        suppliedAsset.metadata.assetId
      ) &&
      !SundaeUtils.isAssetIdsEqual(
        pool.assetB.assetId,
        suppliedAsset.metadata.assetId
      )
    ) {
      throw new Error(
        `The supplied asset ID does not match either assets within the supplied pool data. ${JSON.stringify(
          {
            suppliedAssetID: suppliedAsset.metadata.assetId,
            poolAssetIDs: [pool.assetA.assetId, pool.assetB.assetId],
          }
        )}`
      );
    }

    const receivableAssetMetadata = supplyingPoolAssetA
      ? pool.assetB
      : pool.assetA;

    return new AssetAmount<IAssetAmountMetadata>(
      BigInt(Math.ceil(Number(output.output) * (1 - slippage))),
      receivableAssetMetadata
    );
  }

  /**
   * Helper function to test equality of asset ids. This is necessary
   * because of inconsistent naming conventions across the industry for
   * the asset id of the native Cardano token ADA. The function also
   * normalizes the asset ids by ensuring they follow a standard format
   * before comparing them. If an asset id does not contain a '.', it is
   * normalized by appending a '.' at the end. This normalization step
   * ensures consistent comparisons regardless of slight variations in
   * the asset id format.
   *
   * @param {string} aId The first asset's assetId (both policy and asset name IDs).
   * @param {string} bId The second asset's assetId (both policy and asset name IDs).
   * @returns {boolean}
   */
  static isAssetIdsEqual(aId: string, bId: string) {
    if (
      SundaeUtils.ADA_ASSET_IDS.includes(aId) &&
      SundaeUtils.ADA_ASSET_IDS.includes(bId)
    ) {
      return true;
    }
    const normalizedAId = aId.includes(".") ? aId : `${aId}.`;
    const normalizedBId = bId.includes(".") ? bId : `${bId}.`;
    return normalizedAId === normalizedBId;
  }

  /**
   * Takes an array of {@link IAsset} and aggregates them into an object of amounts.
   * This is useful for when you are supplying an asset that is both for the payment and
   * the Order.
   *
   * @param suppliedAssets
   */
  static accumulateSuppliedAssets({
    scooperFee,
    suppliedAssets,
    orderDeposit,
  }: {
    orderDeposit?: bigint;
    suppliedAssets: AssetAmount<IAssetAmountMetadata>[];
    scooperFee: bigint;
  }): Record<
    /** The PolicyID and the AssetName concatenated together with no period. */
    string | "lovelace",
    /** The amount as a bigint (no decimals) */
    bigint
  > {
    const assets: Record<string, bigint> = {};

    const aggregatedAssets = suppliedAssets.reduce((acc, curr) => {
      const existingAssetIndex = acc.findIndex(({ metadata }) =>
        SundaeUtils.isAssetIdsEqual(curr.metadata.assetId, metadata.assetId)
      );
      if (existingAssetIndex !== -1) {
        acc[existingAssetIndex] = acc[existingAssetIndex].add(curr);

        return acc;
      }

      return [...acc, curr];
    }, [] as AssetAmount<IAssetAmountMetadata>[]);

    // Set the minimum ADA amount.
    assets.lovelace = scooperFee + (orderDeposit ?? ORDER_DEPOSIT_DEFAULT);

    aggregatedAssets.forEach((suppliedAsset) => {
      if (SundaeUtils.isAdaAsset(suppliedAsset.metadata)) {
        assets.lovelace += suppliedAsset.amount;
      } else {
        assets[suppliedAsset.metadata.assetId.replace(".", "")] =
          suppliedAsset.amount;
      }
    });

    return assets;
  }

  /**
   * Calculates the best liquidity pool for a given swap based on the available pools,
   * the given asset, and the taken asset. It determines the best pool by
   * finding the one that provides the highest output for a fixed input amount.
   *
   * @param {IPoolData[]} availablePools - An array of available liquidity pools for the selected pair.
   * @param {AssetAmount<IAssetAmountMetadata>} [given] - The asset amount and metadata of the given asset.
   * @param {AssetAmount<IAssetAmountMetadata>} [taken] - The asset amount and metadata of the taken asset.
   * @returns {IPoolData | undefined} The liquidity pool that offers the best swap outcome, or undefined if no suitable pool is found.
   */
  static getBestPoolBySwapOutcome({
    availablePools,
    given,
    taken,
  }: {
    availablePools: IPoolData[];
    given?: AssetAmount<IAssetAmountMetadata>;
    taken?: AssetAmount<IAssetAmountMetadata>;
  }) {
    let bestPool;
    let bestOutcome;

    const [resolvedGiven, resolvedTaken] = SundaeUtils.isAdaAsset(
      given?.metadata
    )
      ? [given, taken]
      : [taken, given];

    if (availablePools && resolvedGiven?.metadata && resolvedTaken?.metadata) {
      const givenDecimals = resolvedGiven.metadata.decimals;
      const hundredGiven = BigInt(10 ** givenDecimals) * 100n;

      for (const pool of availablePools) {
        const givenReserve = SundaeUtils.isAssetIdsEqual(
          pool.assetA.assetId,
          resolvedGiven.metadata.assetId
        )
          ? pool.liquidity.aReserve
          : pool.liquidity.bReserve;
        const takenReserve = SundaeUtils.isAssetIdsEqual(
          pool.assetB.assetId,
          resolvedTaken.metadata.assetId
        )
          ? pool.liquidity.bReserve
          : pool.liquidity.aReserve;

        const swapOutcome = getSwapOutput(
          hundredGiven,
          givenReserve,
          takenReserve,
          pool.currentFee
        );

        if (!bestOutcome || swapOutcome.output > bestOutcome.output) {
          bestOutcome = swapOutcome;
          bestPool = pool;
        }
      }
    }

    if (bestPool) {
      return bestPool;
    }
  }

  /**
   * Split a long string into an array of chunks for metadata.
   *
   * @param str Full string that you wish to split by chunks of 64.
   * @param prefix Optional prefix to add to each chunk. This is useful if your transaction builder has helper functions to convert strings to CBOR bytestrings (i.e. Lucid will convert strings with a `0x` prefix).
   */
  static splitMetadataString(str: string, prefix?: string): string[] {
    const result: string[] = [];
    const chunk = prefix ? 64 - prefix.length : 64;
    for (let i = 0; i < str.length; i += chunk) {
      const slicedStr = str.slice(i, i + chunk);
      result.push(`${prefix ?? ""}${slicedStr}`);
    }
    return result;
  }

  /**
   * Helper function to convert unix timestamp to slot
   * by subtracting the network's slot offset.
   *
   * @param {number} unix The time in seconds.
   * @param {TSupportedNetworks} network The network.
   * @returns {number}
   */
  static unixToSlot(
    unix: number | string,
    network: TSupportedNetworks
  ): number {
    return Math.floor(
      Math.trunc(Number(unix)) -
        (network === "mainnet"
          ? SundaeUtils.MAINNET_OFFSET
          : SundaeUtils.PREVIEW_OFFSET)
    );
  }

  /**
   * Helper function to convert slot to unix timestamp
   * by adding the network's slot offset.
   *
   * @param {number} unix The time in seconds.
   * @param {TSupportedNetworks} network The network.
   * @returns {number}
   */
  static slotToUnix(
    unix: number | string,
    network: TSupportedNetworks
  ): number {
    return Math.floor(
      Math.trunc(Number(unix)) +
        (network === "mainnet"
          ? SundaeUtils.MAINNET_OFFSET
          : SundaeUtils.PREVIEW_OFFSET)
    );
  }
}
