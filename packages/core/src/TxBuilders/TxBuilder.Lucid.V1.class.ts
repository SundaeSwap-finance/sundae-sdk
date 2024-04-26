import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { getTokensForLp } from "@sundaeswap/cpp";
import type { Assets, Datum, Lucid, Tx, TxComplete } from "lucid-cardano";
import { getAddressDetails } from "lucid-cardano";

import {
  EDatumType,
  ICancelConfigArgs,
  IComposedTx,
  IDepositConfigArgs,
  IPoolData,
  ISwapConfigArgs,
  ITxBuilderFees,
  ITxBuilderReferralFee,
  IWithdrawConfigArgs,
  IZapConfigArgs,
  TDepositMixed,
  TSupportedNetworks,
} from "../@types/index.js";
import { TxBuilder } from "../Abstracts/TxBuilder.abstract.class.js";
import { CancelConfig } from "../Configs/CancelConfig.class.js";
import { DepositConfig } from "../Configs/DepositConfig.class.js";
import { SwapConfig } from "../Configs/SwapConfig.class.js";
import { WithdrawConfig } from "../Configs/WithdrawConfig.class.js";
import { ZapConfig } from "../Configs/ZapConfig.class.js";
import { DatumBuilderLucidV1 } from "../DatumBuilders/DatumBuilder.Lucid.V1.class.js";
import { DatumBuilderLucidV3 } from "../DatumBuilders/DatumBuilder.Lucid.V3.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import {
  ADA_METADATA,
  ORDER_DEPOSIT_DEFAULT,
  VOID_REDEEMER,
} from "../constants.js";
import { TxBuilderLucidV3 } from "./TxBuilder.Lucid.V3.class.js";

/**
 * Object arguments for completing a transaction.
 */
export interface ITxBuilderLucidCompleteTxArgs {
  tx: Tx;
  referralFee?: AssetAmount<IAssetAmountMetadata>;
  datum?: string;
  deposit?: bigint;
  scooperFee?: bigint;
  coinSelection?: boolean;
}

/**
 * Interface describing the parameter names for the transaction builder.
 */
export interface ITxBuilderV1Params {
  scriptAddress: string;
  scriptValidator: string;
  cancelRedeemer: string;
  maxScooperFee: bigint;
}

/**
 * `TxBuilderLucidV1` is a class extending `TxBuilder` to support transaction construction
 * for Lucid against the V1 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
 * such as swaps, cancellations, updates, deposits, withdrawals, zaps, and liquidity migrations to
 * the V3 contracts (it is recommended to utilize V3 contracts if possible: {@link Lucid.TxBuilderLucidV3}).
 *
 * @implements {TxBuilder}
 */
export class TxBuilderLucidV1 extends TxBuilder {
  queryProvider: QueryProviderSundaeSwap;
  network: TSupportedNetworks;

  static PARAMS: Record<TSupportedNetworks, ITxBuilderV1Params> = {
    mainnet: {
      scriptAddress:
        "addr1wxaptpmxcxawvr3pzlhgnpmzz3ql43n2tc8mn3av5kx0yzs09tqh8",
      scriptValidator:
        "59084601000033233322232332232333222323332223322323332223233223233223332223333222233322233223322332233223332223322332233322232323232322222325335300b001103c13503d35303b3357389201035054350003c498ccc888c8c8c94cd4c05c0144d4c0680188888cd4c04c480048d4c0ed40188888888888cd4c078480048ccd5cd19b8f375c0020180440420066a6040006446a6048004446a605000444666aa60302400244a66a6a07c0044266a08c0020042002a0886466a002a088a08a2446600466a609000846a0820024a0806600400e00226a606ca002444444444466a6032240024646464666ae68cdc399991119191800802990009aa82c1119a9a826000a4000446a6aa08a00444a66a6050666ae68cdc78010048150148980380089803001990009aa82b9119a9a825800a4000446a6aa08800444a66a604e666ae68cdc7801003814814080089803001999aa81e3ae335503c75ceb4d4c084cccd5cd19b8735573aa006900011998119aba1500335742a00466a080eb8d5d09aba2500223505135304f33573892010350543100050499262220020183371491010270200035302801422220044800808007c4d5d1280089aab9e500113754002012264a66a6a070601a6aae78dd50008a81a910a99a9a81d0008a81b910a99a9a81e0008a81c910a99a9a81f0008a81d910a99a9a8200008a81e910a99a9a8210008a81f910a99a9a8220008a820910a99a9a8230008a821910a99a9a8240008a822910a99a9a8250008a823910a99a9a82600089999999999825981000a18100090080071810006181000500418100031810002001110a8259a980a1999ab9a3370e6aae754009200023301635742a0046ae84d5d1280111a8211a982019ab9c490103505431000414992622002135573ca00226ea8004cd40148c8c8c8c8cccd5cd19b8735573aa00890001199980d9bae35742a0086464646666ae68cdc39aab9d5002480008cc88cc08c008004c8c8c8cccd5cd19b8735573aa004900011991198148010009919191999ab9a3370e6aae754009200023302d304735742a00466a07a4646464646666ae68cdc3a800a4004466606a6eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d4009200023037304e357426aae7940188d4154d4c14ccd5ce2490350543100054499264984d55cea80189aba25001135573ca00226ea8004d5d09aba2500223504e35304c335738921035054310004d49926135573ca00226ea8004d5d0a80119a81cbae357426ae8940088d4128d4c120cd5ce249035054310004949926135573ca00226ea8004d5d0a80119a81abae357426ae8940088d4118d4c110cd5ce249035054310004549926135573ca00226ea8004d5d0a8019bad35742a00464646464646666ae68cdc3a800a40084605c646464646666ae68cdc3a800a40044606c6464646666ae68cdc39aab9d5002480008cc88cd40f8008004dd69aba15002375a6ae84d5d1280111a8289a982799ab9c491035054310005049926135573ca00226ea8004d5d09aab9e500423333573466e1d40092000233036304b35742a0086eb4d5d09aba2500423504e35304c335738921035054310004d499264984d55cea80109aab9e5001137540026ae84d55cf280291999ab9a3370ea0049001118169bad357426aae7940188cccd5cd19b875003480008ccc0bcc11cd5d0a8031bad35742a00a66a072eb4d5d09aba2500523504a353048335738920103505431000494992649926135573aa00626ae8940044d55cf280089baa001357426ae8940088d4108d4c100cd5ce249035054310004149926135744a00226ae8940044d55cf280089baa0010033350052323333573466e1d40052002201623333573466e1d40092000201623504035303e335738921035054310003f499264984d55ce9baa001002335005200100112001230023758002640026aa072446666aae7c004940c08cd40bcd5d080118019aba2002498c8004d540e088448894cd4d40bc0044008884cc014008ccd54c01c48004014010004c8004d540dc884894cd4d40b400440188854cd4c01cc01000840244cd4c01848004010004488008488004800488848ccc00401000c00880048848cc00400c00880044880084880048004888848cccc00401401000c00880048848cc00400c00880048848cc00400c00880048848cc00400c00880048488c00800c888488ccc00401401000c800484888c00c0108884888ccc00801801401084888c00401080048488c00800c88488cc00401000c800448848cc00400c008480044488c88c008dd5800990009aa80d11191999aab9f0022501223350113355008300635573aa004600a6aae794008c010d5d100180c09aba10011122123300100300211200112232323333573466e1d400520002350083005357426aae79400c8cccd5cd19b87500248008940208d405cd4c054cd5ce24810350543100016499264984d55cea80089baa00112122300200311220011200113500d35300b3357389211f556e6578706563746564205478496e666f20636f6e737472756374696f6e2e0000c498888888888848cccccccccc00402c02802402001c01801401000c00880044488008488488cc00401000c480048c8c8cccd5cd19b875001480088c018dd71aba135573ca00646666ae68cdc3a80124000460106eb8d5d09aab9e500423500c35300a3357389201035054310000b499264984d55cea80089baa001212230020032122300100320012323333573466e1d40052002200823333573466e1d40092000200a2350073530053357389210350543100006499264984d55ce9baa0011200120011261220021220012001112323001001223300330020020014891c0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b9130001",
      cancelRedeemer: VOID_REDEEMER,
      maxScooperFee: 2_500_000n,
    },
    preview: {
      scriptAddress:
        "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
      scriptValidator:
        "5906f501000033233223232323232323322323233223232323222323232322322323232325335001101d13263201d335738921035054350001d32325335001133530121200123353013120012333573466e3cdd700080100b00a9aa8021111111111001991a800911a80111199aa980b0900091299a8011099a8138008010800a81299a8121a8011119a80111a8100009280f99a812001a8129a8011111001899a9809090009191919199ab9a3370e646464646002008640026aa0504466a0029000111a80111299a999ab9a3371e0040360420402600e0022600c006640026aa04e4466a0029000111a80111299a999ab9a3371e00400e04003e20022600c00666e292201027020003500722220043335501975c66aa032eb9d69a9999ab9a3370e6aae75400d200023332221233300100400300235742a0066ae854008cd406dd71aba135744a004464c6404666ae7008008c0848880092002018017135744a00226aae7940044dd50009aa80191111111110049999ab9a3370ea00c9001109100111999ab9a3370ea00e9000109100091931900f99ab9c01c01f01d01c3333573466e1cd55cea8052400046666444424666600200a0080060046eb8d5d0a8051919191999ab9a3370e6aae754009200023232123300100300233501a75c6ae84d5d128019919191999ab9a3370e6aae754009200023232123300100300233501e75c6ae84d5d128019919191999ab9a3370e6aae7540092000233221233001003002302435742a00466a0424646464646666ae68cdc3a800a4004466644424466600200a0080066eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d400920002321223002003302b357426aae7940188c98c80c0cd5ce01681801701689aab9d5003135744a00226aae7940044dd50009aba135744a004464c6405266ae700980a409c4d55cf280089baa00135742a004464c6404a66ae7008809408c4d55cf280089baa00135742a004464c6404266ae7007808407c4d55cf280089baa00135742a0126eb4d5d0a80419191919191999ab9a3370ea002900211909111801802191919191999ab9a3370ea002900111909118010019919191999ab9a3370e6aae7540092000232321233001003002375a6ae84d5d128019bad35742a004464c6405866ae700a40b00a84d55cf280089baa001357426aae7940108cccd5cd19b875002480008cc88488cc00401000cc094d5d0a8021bad357426ae8940108c98c80a4cd5ce01301481381309aab9d5002135573ca00226ea8004d5d09aab9e500523333573466e1d4009200223212223001004375a6ae84d55cf280311999ab9a3370ea00690001199911091119980100300280218109aba15006375a6ae854014cd4075d69aba135744a00a464c6404a66ae7008809408c0880844d55cea80189aba25001135573ca00226ea8004d5d09aba2500823263201d33573803403a036264a66a601c6aae78dd50008980d24c442a66a0022603893110a99a8008980f24c442a66a0022604093110a99a8008981124c442a66a0022604893110a99a8008981324c442a66a0022605093110a99a8008981524c442a66a0022605893110a99a800899999991111109199999999980080380300b80a802802007801801004981080a18108091810806181080518108031810802110981824c6a6666ae68cdc39aab9d5002480008cc8848cc00400c008d5d0a8011aba135744a004464c6403866ae70064070068880084d55cf280089baa001135573a6ea80044d5d1280089aba25001135573ca00226ea80048c008dd6000990009aa808911999aab9f0012501323350123574200460066ae8800803cc8004d5404088448894cd40044008884cc014008ccd54c01c48004014010004c8004d5403c884894cd400440148854cd4c01000840204cd4c018480040100044880084880044488c88c008dd5800990009aa80711191999aab9f00225011233501033221233001003002300635573aa004600a6aae794008c010d5d100180709aba100112232323333573466e1d400520002350073005357426aae79400c8cccd5cd19b875002480089401c8c98c8038cd5ce00580700600589aab9d5001137540022424460040062244002464646666ae68cdc3a800a400446424460020066eb8d5d09aab9e500323333573466e1d400920002321223002003375c6ae84d55cf280211931900519ab9c00700a008007135573aa00226ea80048c8cccd5cd19b8750014800884880048cccd5cd19b8750024800084880088c98c8020cd5ce00280400300289aab9d375400292103505431002326320033357389211f556e6578706563746564205478496e666f20636f6e737472756374696f6e2e00003498480044488008488488cc00401000c448c8c00400488cc00cc00800800522011c4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c90001",
      cancelRedeemer: VOID_REDEEMER,
      maxScooperFee: 2_500_000n,
    },
  };

  /**
   * @param {Lucid} lucid A configured Lucid instance to use.
   * @param {DatumBuilderLucidV1} datumBuilder A valid V1 DatumBuilder class that will build valid datums.
   */
  constructor(
    public lucid: Lucid,
    public datumBuilder: DatumBuilderLucidV1,
    queryProvider?: QueryProviderSundaeSwap
  ) {
    super();
    this.network = lucid.network === "Mainnet" ? "mainnet" : "preview";
    this.queryProvider =
      queryProvider ?? new QueryProviderSundaeSwap(this.network);
  }

  /**
   * Helper method to get a specific parameter of the transaction builder.
   *
   * @param {K extends keyof ITxBuilderV1Params} param The parameter you want to retrieve.
   * @param {TSupportedNetworks} network The protocol network.
   * @returns {ITxBuilderV1Params[K]}
   */
  static getParam<K extends keyof ITxBuilderV1Params>(
    param: K,
    network: TSupportedNetworks
  ): ITxBuilderV1Params[K] {
    return TxBuilderLucidV1.PARAMS[network][param];
  }

  /**
   * An internal shortcut method to avoid having to pass in the network all the time.
   *
   * @param param The parameter you want to retrieve.
   * @returns {ITxBuilderV1Params}
   */
  public __getParam<K extends keyof ITxBuilderV1Params>(
    param: K
  ): ITxBuilderV1Params[K] {
    return TxBuilderLucidV1.getParam(param, this.network);
  }

  /**
   * Returns a new Tx instance from Lucid. Throws an error if not ready.
   * @returns
   */
  newTxInstance(fee?: ITxBuilderReferralFee): Tx {
    const instance = this.lucid.newTx();

    if (fee) {
      const payment: Assets = {};
      payment[
        SundaeUtils.isAdaAsset(fee.payment.metadata)
          ? "lovelace"
          : fee.payment.metadata.assetId
      ] = fee.payment.amount;
      instance.payToAddress(fee.destination, payment);

      if (fee?.feeLabel) {
        instance.attachMetadataWithConversion(
          674,
          `${fee.feeLabel}: ${fee.payment.value.toString()} ${
            !SundaeUtils.isAdaAsset(fee.payment.metadata)
              ? Buffer.from(
                  fee.payment.metadata.assetId.split(".")[1],
                  "hex"
                ).toString("utf-8")
              : "ADA"
          }`
        );
      }
    }

    return instance;
  }

  /**
   * Executes a swap transaction based on the provided swap configuration.
   * It constructs the necessary arguments for the swap, builds the transaction instance,
   * and completes the transaction by paying to the contract and finalizing the transaction details.
   *
   * @param {ISwapConfigArgs} swapArgs - The configuration arguments for the swap.
   * @returns {Promise<TransactionResult>} A promise that resolves to the result of the completed transaction.
   *
   * @async
   * @example
   * ```ts
   * const txHash = await sdk.builder().swap({
   *   ...args
   * })
   *   .then(({ sign }) => sign())
   *   .then(({ submit }) => submit())
   * ```
   */
  async swap(swapArgs: ISwapConfigArgs) {
    const config = new SwapConfig(swapArgs);

    const {
      pool: { ident, assetA, assetB },
      orderAddresses,
      suppliedAsset,
      minReceivable,
      referralFee,
    } = config.buildArgs();

    const txInstance = this.newTxInstance(referralFee);

    const { inline: cbor } = this.datumBuilder.buildSwapDatum({
      ident,
      swap: {
        SuppliedCoin: SundaeUtils.getAssetSwapDirection(
          suppliedAsset.metadata,
          [assetA, assetB]
        ),
        MinimumReceivable: minReceivable,
      },
      orderAddresses,
      fundedAsset: suppliedAsset,
      scooperFee: this.__getParam("maxScooperFee"),
    });

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee: this.__getParam("maxScooperFee"),
    });

    txInstance.payToContract(this.__getParam("scriptAddress"), cbor, payment);
    return this.completeTx({
      tx: txInstance,
      datum: cbor,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Executes a cancel transaction based on the provided configuration arguments.
   * Validates the datum and datumHash, retrieves the necessary UTXO data,
   * sets up the transaction, and completes it.
   *
   * @param {ICancelConfigArgs} cancelArgs - The configuration arguments for the cancel transaction.
   * @returns {Promise<TransactionResult>} A promise that resolves to the result of the cancel transaction.
   *
   * @async
   * @example
   * ```ts
   * const txHash = await sdk.builder().cancel({
   *   ...args
   * })
   *   .then(({ sign }) => sign())
   *   .then(({ submit }) => submit());
   * ```
   */
  async cancel(cancelArgs: ICancelConfigArgs) {
    const { utxo, referralFee, ownerAddress } = new CancelConfig(
      cancelArgs
    ).buildArgs();

    const tx = this.newTxInstance(referralFee);
    const utxoToSpend = await this.lucid.provider.getUtxosByOutRef([
      { outputIndex: utxo.index, txHash: utxo.hash },
    ]);

    if (!utxoToSpend) {
      throw new Error(
        `UTXO data was not found with the following parameters: ${JSON.stringify(
          utxo
        )}`
      );
    }

    // TODO: parse from datum instead
    const details = getAddressDetails(ownerAddress);
    const signerKey = details.paymentCredential?.hash;
    if (!signerKey) {
      throw new Error(
        `Could not get payment keyhash from fetched UTXO details: ${JSON.stringify(
          utxo
        )}`
      );
    }

    try {
      tx.collectFrom(utxoToSpend, this.__getParam("cancelRedeemer"))
        .addSignerKey(signerKey)
        .attachSpendingValidator({
          type: "PlutusV1",
          script: this.__getParam("scriptValidator"),
        });
    } catch (e) {
      throw e;
    }

    return this.completeTx({
      tx,
      datum: utxoToSpend[0]?.datum as string,
      deposit: 0n,
      scooperFee: 0n,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Updates a transaction by first executing a cancel transaction, spending that back into the
   * contract, and then attaching a swap datum. It handles referral fees and ensures the correct
   * accumulation of assets for the transaction.
   *
   * @param {{ cancelArgs: ICancelConfigArgs, swapArgs: ISwapConfigArgs }}
   *        The arguments for cancel and swap configurations.
   * @returns {Promise<TransactionResult>} A promise that resolves to the result of the updated transaction.
   *
   * @throws
   * @async
   * @example
   * ```ts
   * const txHash = await sdk.builder().update({
   *   cancelArgs: {
   *     ...args
   *   },
   *   swapArgs: {
   *     ...args
   *   }
   * })
   *   .then(({ sign }) => sign())
   *   .then(({ submit }) => submit());
   * ```
   */
  async update({
    cancelArgs,
    swapArgs,
  }: {
    cancelArgs: ICancelConfigArgs;
    swapArgs: ISwapConfigArgs;
  }) {
    /**
     * First, build the cancel transaction.
     */
    const { tx: cancelTx } = await this.cancel(cancelArgs);

    /**
     * Then, build the swap datum to attach to the cancel transaction.
     */
    const {
      pool: { ident, assetA, assetB },
      orderAddresses,
      suppliedAsset,
      minReceivable,
    } = new SwapConfig(swapArgs).buildArgs();
    const swapDatum = this.datumBuilder.buildSwapDatum({
      ident,
      swap: {
        SuppliedCoin: SundaeUtils.getAssetSwapDirection(
          suppliedAsset.metadata,
          [assetA, assetB]
        ),
        MinimumReceivable: minReceivable,
      },
      orderAddresses,
      fundedAsset: suppliedAsset,
      scooperFee: this.__getParam("maxScooperFee"),
    });

    if (!swapDatum) {
      throw new Error("Swap datum is required.");
    }

    cancelTx.payToContract(
      this.__getParam("scriptAddress"),
      swapDatum.inline,
      SundaeUtils.accumulateSuppliedAssets({
        suppliedAssets: [suppliedAsset],
        scooperFee: this.__getParam("maxScooperFee"),
      })
    );

    /**
     * Accumulate any referral fees.
     */
    let accumulatedReferralFee: AssetAmount<IAssetAmountMetadata> | undefined;
    if (cancelArgs?.referralFee) {
      accumulatedReferralFee = cancelArgs?.referralFee?.payment;
    }
    if (swapArgs?.referralFee) {
      // Add the accumulation.
      if (accumulatedReferralFee) {
        accumulatedReferralFee.add(swapArgs?.referralFee?.payment);
      } else {
        accumulatedReferralFee = swapArgs?.referralFee?.payment;
      }

      // Add to the transaction.
      cancelTx.payToAddress(swapArgs.referralFee.destination, {
        [SundaeUtils.isAdaAsset(swapArgs.referralFee.payment.metadata)
          ? "lovelace"
          : swapArgs.referralFee.payment.metadata.assetId]:
          swapArgs.referralFee.payment.amount,
      });
    }

    return this.completeTx({
      tx: cancelTx,
      datum: swapDatum.inline,
      referralFee: accumulatedReferralFee,
    });
  }

  async deposit(depositArgs: IDepositConfigArgs) {
    const { suppliedAssets, pool, orderAddresses, referralFee } =
      new DepositConfig(depositArgs).buildArgs();

    const tx = this.newTxInstance(referralFee);

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets,
      scooperFee: this.__getParam("maxScooperFee"),
    });
    const [coinA, coinB] =
      SundaeUtils.sortSwapAssetsWithAmounts(suppliedAssets);

    const { inline: cbor } = this.datumBuilder.buildDepositDatum({
      ident: pool.ident,
      orderAddresses: orderAddresses,
      deposit: {
        CoinAAmount: coinA,
        CoinBAmount: coinB,
      },
      scooperFee: this.__getParam("maxScooperFee"),
    });

    tx.payToContract(this.__getParam("scriptAddress"), cbor, payment);
    return this.completeTx({
      tx,
      datum: cbor,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Executes a withdrawal transaction using the provided withdrawal configuration arguments.
   * The method builds the withdrawal transaction, including the necessary accumulation of LP tokens
   * and datum, and then completes the transaction to remove liquidity from a pool.
   *
   * @param {IWithdrawConfigArgs} withdrawArgs - The configuration arguments for the withdrawal.
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} A promise that resolves to the composed transaction object.
   *
   * @async
   * @example
   * ```ts
   * const txHash = await sdk.builder().withdraw({
   *   ..args
   * })
   *   .then(({ sign }) => sign())
   *   .then(({ submit }) => submit());
   * ```
   */
  async withdraw(
    withdrawArgs: IWithdrawConfigArgs
  ): Promise<IComposedTx<Tx, TxComplete>> {
    const { suppliedLPAsset, pool, orderAddresses, referralFee } =
      new WithdrawConfig(withdrawArgs).buildArgs();

    const tx = this.newTxInstance(referralFee);

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedLPAsset],
      scooperFee: this.__getParam("maxScooperFee"),
    });

    const { inline: cbor } = this.datumBuilder.buildWithdrawDatum({
      ident: pool.ident,
      orderAddresses: orderAddresses,
      suppliedLPAsset: suppliedLPAsset,
      scooperFee: this.__getParam("maxScooperFee"),
    });

    tx.payToContract(this.__getParam("scriptAddress"), cbor, payment);
    return this.completeTx({
      tx,
      datum: cbor,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Executes a zap transaction which combines a swap and a deposit into a single operation.
   * It determines the swap direction, builds the necessary arguments, sets up the transaction,
   * and then completes it by attaching the required metadata and making payments.
   *
   * @param {Omit<IZapConfigArgs, "zapDirection">} zapArgs - The configuration arguments for the zap, excluding the zap direction.
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} A promise that resolves to the composed transaction object resulting from the zap operation.
   *
   * @async
   * @example
   * ```ts
   * const txHash = await sdk.builder().zap({
   *   ...args
   * })
   *   .then(({ sign }) => sign())
   *   .then(({ submit }) => submit());
   * ```
   */
  async zap(
    zapArgs: Omit<IZapConfigArgs, "zapDirection">
  ): Promise<IComposedTx<Tx, TxComplete>> {
    const zapDirection = SundaeUtils.getAssetSwapDirection(
      zapArgs.suppliedAsset.metadata,
      [zapArgs.pool.assetA, zapArgs.pool.assetB]
    );
    const { pool, suppliedAsset, orderAddresses, swapSlippage, referralFee } =
      new ZapConfig({
        ...zapArgs,
        zapDirection,
      }).buildArgs();

    const tx = this.newTxInstance(referralFee);

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      // Add another scooper fee requirement since we are executing two orders.
      scooperFee: this.__getParam("maxScooperFee") * 2n,
    });

    /**
     * To accurately determine the altReceivable, we need to swap only half the supplied asset.
     */
    const halfSuppliedAmount = new AssetAmount(
      Math.ceil(Number(suppliedAsset.amount) / 2),
      suppliedAsset.metadata
    );

    const minReceivable = SundaeUtils.getMinReceivableFromSlippage(
      pool,
      halfSuppliedAmount,
      swapSlippage
    );

    let depositPair: TDepositMixed;
    if (
      SundaeUtils.isAssetIdsEqual(
        pool.assetA.assetId,
        suppliedAsset.metadata.assetId
      )
    ) {
      depositPair = {
        CoinAAmount: suppliedAsset.subtract(halfSuppliedAmount),
        CoinBAmount: minReceivable,
      };
    } else {
      depositPair = {
        CoinAAmount: minReceivable,
        CoinBAmount: suppliedAsset.subtract(halfSuppliedAmount),
      };
    }

    /**
     * We first build the deposit datum based on an estimated 50% swap result.
     * This is because we need to attach this datum to the initial swap transaction.
     */
    const { hash: depositHash, inline: depositInline } =
      this.datumBuilder.buildDepositDatum({
        ident: pool.ident,
        orderAddresses,
        deposit: depositPair,
        scooperFee: this.__getParam("maxScooperFee"),
      });

    if (!depositHash) {
      throw new Error(
        "A datum hash for a deposit transaction is required to build a chained Zap operation."
      );
    }

    /**
     * We then build the swap datum based using 50% of the supplied asset. A few things
     * to note here:
     *
     * 1. We spend the full supplied amount to fund both the swap and the deposit order.
     * 2. We set the alternate address to the receiver address so that they can cancel
     * the chained order at any time during the process.
     */
    const swapData = this.datumBuilder.buildSwapDatum({
      ident: pool.ident,
      fundedAsset: halfSuppliedAmount,
      orderAddresses: {
        DestinationAddress: {
          address: this.__getParam("scriptAddress"),
          datum: {
            type: EDatumType.HASH,
            value: depositHash,
          },
        },
        AlternateAddress: orderAddresses.DestinationAddress.address,
      },
      swap: {
        SuppliedCoin: SundaeUtils.getAssetSwapDirection(
          suppliedAsset.metadata,
          [pool.assetA, pool.assetB]
        ),
        MinimumReceivable: minReceivable,
      },
      scooperFee: this.__getParam("maxScooperFee"),
    });

    tx.attachMetadataWithConversion(103251, {
      [`0x${depositHash}`]: SundaeUtils.splitMetadataString(
        depositInline,
        "0x"
      ),
    });

    tx.payToContract(
      this.__getParam("scriptAddress"),
      swapData.inline,
      payment
    );
    return this.completeTx({
      tx,
      datum: swapData.inline,
      deposit: undefined,
      scooperFee: this.__getParam("maxScooperFee") * 2n,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Migrates liquidity from V1 to version V3 pools in a batch process. This asynchronous function
   * iterates through an array of migration configurations, each specifying the withdrawal configuration
   * from a V1 pool and the deposit details into a V3 pool. For each migration, it constructs a withdrawal
   * datum for the V1 pool and a deposit datum for the V3 pool, calculates required fees, and constructs
   * the transaction metadata. It accumulates the total scooper fees, deposit amounts, and referral fees
   * across all migrations. The function concludes by composing a final transaction that encompasses all
   * individual migrations and returns the completed transaction along with the total fees and deposits.
   *
   * @param {Array<{ withdrawConfig: IWithdrawConfigArgs; depositPool: IPoolData; }>} migrations - An array of objects, each containing the withdrawal configuration for a V1 pool and the deposit pool data for a V3 pool.
   * @returns {Promise<TTransactionResult>} A promise that resolves to the transaction result, including the final transaction, total deposit, scooper fees, and referral fees.
   *
   * @example
   * ```typescript
   * const migrationResult = await sdk.builder().migrateLiquidityToV3([
   *   {
   *     withdrawConfig: {
   *       pool: { ident: 'pool1', liquidity: { ... } },
   *       suppliedLPAsset: { ... },
   *       referralFee: { ... },
   *     },
   *     depositPool: {
   *       ident: 'poolV3_1',
   *       assetA: { ... },
   *       assetB: { ... },
   *     },
   *   },
   *   {
   *     withdrawConfig: {
   *       pool: { ident: 'pool2', liquidity: { ... } },
   *       suppliedLPAsset: { ... },
   *       referralFee: { ... },
   *     },
   *     depositPool: {
   *       ident: 'poolV3_2',
   *       assetA: { ... },
   *       assetB: { ... },
   *     },
   *   },
   * ]);
   * ```
   */
  async migrateLiquidityToV3(
    migrations: {
      withdrawConfig: IWithdrawConfigArgs;
      depositPool: IPoolData;
    }[]
  ) {
    const finalTx = this.lucid.newTx();
    let totalScooper = 0n;
    let totalDeposit = 0n;
    let totalReferralFees = new AssetAmount(0n, ADA_METADATA);
    const metadataDatums: Record<string, string[]> = {};
    const v3TxBuilderInstance = new TxBuilderLucidV3(
      this.lucid,
      new DatumBuilderLucidV3(this.network),
      this.queryProvider
    );
    const v3OrderScriptAddress =
      await v3TxBuilderInstance.generateScriptAddress("order.spend");

    migrations.forEach(({ withdrawConfig, depositPool }) => {
      const withdrawArgs = new WithdrawConfig(withdrawConfig).buildArgs();

      const tx = this.newTxInstance(withdrawArgs.referralFee);

      const payment = SundaeUtils.accumulateSuppliedAssets({
        suppliedAssets: [withdrawArgs.suppliedLPAsset],
        // Add another scooper fee requirement since we are executing two orders.
        scooperFee:
          this.__getParam("maxScooperFee") +
          v3TxBuilderInstance.__getParam("maxScooperFee"),
      });

      totalDeposit += ORDER_DEPOSIT_DEFAULT;
      totalScooper +=
        this.__getParam("maxScooperFee") +
        v3TxBuilderInstance.__getParam("maxScooperFee");
      withdrawArgs.referralFee?.payment &&
        totalReferralFees.add(withdrawArgs.referralFee.payment);

      const [coinA, coinB] = getTokensForLp(
        withdrawArgs.suppliedLPAsset.amount,
        withdrawArgs.pool.liquidity.aReserve,
        withdrawArgs.pool.liquidity.bReserve,
        withdrawArgs.pool.liquidity.lpTotal
      );

      const v3DatumBuilder = new DatumBuilderLucidV3(this.network);
      const { hash: depositHash, inline: depositInline } =
        v3DatumBuilder.buildDepositDatum({
          destinationAddress: withdrawArgs.orderAddresses.DestinationAddress,
          ident: depositPool.ident,
          order: {
            assetA: new AssetAmount<IAssetAmountMetadata>(
              coinA,
              depositPool.assetA
            ),
            assetB: new AssetAmount<IAssetAmountMetadata>(
              coinB,
              depositPool.assetB
            ),
          },
          scooperFee: v3TxBuilderInstance.__getParam("maxScooperFee"),
        });

      const { inline: withdrawInline } = this.datumBuilder.buildWithdrawDatum({
        ident: withdrawArgs.pool.ident,
        orderAddresses: {
          DestinationAddress: {
            address: v3OrderScriptAddress,
            datum: {
              type: EDatumType.HASH,
              value: depositHash,
            },
          },
          AlternateAddress:
            withdrawArgs.orderAddresses.DestinationAddress.address,
        },
        scooperFee: this.__getParam("maxScooperFee"),
        suppliedLPAsset: withdrawArgs.suppliedLPAsset,
      });

      metadataDatums[`0x${depositHash}`] = SundaeUtils.splitMetadataString(
        depositInline,
        "0x"
      );
      tx.payToContract(
        this.__getParam("scriptAddress"),
        withdrawInline,
        payment
      );

      finalTx.compose(tx);
    });

    finalTx.attachMetadataWithConversion(103251, metadataDatums);

    return this.completeTx({
      tx: finalTx,
      deposit: totalDeposit,
      scooperFee: totalScooper,
      referralFee: totalReferralFees,
    });
  }

  private async completeTx({
    tx,
    datum,
    referralFee,
    deposit,
    scooperFee,
    coinSelection,
  }: ITxBuilderLucidCompleteTxArgs): Promise<
    IComposedTx<Tx, TxComplete, Datum | undefined>
  > {
    const baseFees: Omit<ITxBuilderFees, "cardanoTxFee"> = {
      deposit: new AssetAmount(deposit ?? ORDER_DEPOSIT_DEFAULT, ADA_METADATA),
      scooperFee: new AssetAmount(
        scooperFee ?? this.__getParam("maxScooperFee"),
        ADA_METADATA
      ),
      referral: referralFee,
    };

    const txFee = tx.txBuilder.get_fee_if_set();
    let finishedTx: TxComplete | undefined;

    const thisTx: IComposedTx<Tx, TxComplete, Datum | undefined> = {
      tx,
      datum,
      fees: baseFees,
      async build() {
        if (!finishedTx) {
          finishedTx = await tx.complete({ coinSelection });
          thisTx.fees.cardanoTxFee = new AssetAmount(
            BigInt(txFee?.to_str() ?? finishedTx?.fee?.toString() ?? "0"),
            ADA_METADATA
          );
        }

        return {
          cbor: Buffer.from(finishedTx.txComplete.to_bytes()).toString("hex"),
          builtTx: finishedTx,
          sign: async () => {
            const signedTx = await (finishedTx as TxComplete).sign().complete();
            return {
              cbor: Buffer.from(signedTx.txSigned.to_bytes()).toString("hex"),
              submit: async () => await signedTx.submit(),
            };
          },
        };
      },
    };

    return thisTx;
  }
}
