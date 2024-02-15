import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  C,
  type Assets,
  type Datum,
  type Lucid,
  type Tx,
  type TxComplete,
} from "lucid-cardano";

import {
  EDatumType,
  ICancelConfigArgs,
  IComposedTx,
  IDepositConfigArgs,
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
import { DatumBuilderLucidV3 } from "../DatumBuilders/DatumBuilder.Lucid.V3.class.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import {
  ADA_METADATA,
  ORDER_DEPOSIT_DEFAULT,
  VOID_REDEEMER,
} from "../constants.js";

/**
 * Object arguments for completing a transaction.
 */
interface ITxBuilderLucidCompleteTxArgs {
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
export interface ITxBuilderV3Params {
  scriptAddress: string;
  scriptValidator: string;
  cancelRedeemer: string;
  maxScooperFee: bigint;
}

/**
 * `TxBuilderLucidV3` is a class extending `TxBuilder` to support transaction construction
 * for Lucid against the V3 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
 * such as swaps, cancellations, updates, deposits, withdrawals, and zaps.
 *
 * @implements {TxBuilder}
 */
export class TxBuilderLucidV3 extends TxBuilder {
  network: TSupportedNetworks;
  static PARAMS: Record<TSupportedNetworks, ITxBuilderV3Params> = {
    mainnet: {
      scriptAddress: "",
      scriptValidator: "",
      cancelRedeemer: VOID_REDEEMER,
      maxScooperFee: 1_000_000n,
    },
    preview: {
      scriptAddress:
        "addr_test1wpyyj6wexm6gf3zlzs7ez8upvdh7jfgy3cs9qj8wrljp92su9hpfe",
      scriptValidator:
        "59081f010000332323232323232322322223253330093232533300b3370e90010010991919991119198008008021119299980999b87480000044c8c8cc00400401c894ccc06400452809919299980c19b8f00200514a226600800800260380046eb8c068004dd7180b98088010a99980999b87480080044c8c8c8cc004004008894ccc06800452889919299980c998048048010998020020008a50301d002301b0013758603000260220042a66602666e1d200400113232323300100100222533301a00114a026464a6660326601201200429444cc010010004c074008c06c004dd6180c00098088010a99980999b87480180044c8c8c8c8cdc48019919980080080124000444a66603a00420022666006006603e00464a66603666016016002266e0000920021002301e0023758603400260340046eb4c060004c04400854ccc04ccdc3a4010002264646464a66602e66e1d20020011323253330193370e9001180d1baa300d3017300d301700a13371200200a266e20004014dd6980e000980a8010a503015001300b301330093013006375a60300026022004264646464a66602e66e1d20020011323253330193370e9001180d1baa300d3017300f301700a13371200a002266e20014004dd6980e000980a8010a503015001300b3013300b3013006375a603000260220046022002600260160106eb0c044c048c048c048c048c048c048c048c048c02cc00cc02c018c044c048c048c048c048c048c048c048c02cc00cc02c0188c044c048004c8c8c8c8c94ccc040cdc3a40000022646464646464646464646464a66603e60420042646464649319299981019b87480000044c8c94ccc094c09c00852616375c604a002603c00e2a66604066e1d20020011323232325333027302900213232498c8c8c8c8c94ccc0b4c0bc00852616375a605a002605a0046eb8c0ac004c0ac00cdd718148011919191919299981618170010a4c2c6eb4c0b0004c0b0008dd7181500098150021bae3028003163758604e002604e0046eb0c094004c07801c54ccc080cdc3a400800226464a66604a604e004264931919191919191919299981698178010a4c2c6eb4c0b4004c0b4008dd7181580098158019bae30290023232323232533302c302e002149858dd6981600098160011bae302a001302a003375c60500046eb0c094008dd618118008b1919bb03026001302630270013758604a002603c00e2a66604066e1d20060011323253330253027002132498c8c8c8c8c94ccc0a8c0b000852616375a605400260540046eb8c0a0004c0a0008dd718130008b1bac3025001301e007153330203370e9004000899192999812981380109924c6464646464646464a66605a605e0042930b1bad302d001302d002375c605600260560066eb8c0a4008c8c8c8c8c94ccc0b0c0b800852616375a605800260580046eb8c0a8004c0a800cdd718140011bac3025002375860460022c6466ec0c098004c098c09c004dd61812800980f0038b180f00319299980f99b87480000044c8c8c8c94ccc098c0a00084c8c9263253330253370e90000008a99981418118018a4c2c2a66604a66e1d200200113232533302a302c002149858dd7181500098118018a99981299b87480100044c8c94ccc0a8c0b000852616302a00130230031630230023253330243370e9000000899191919299981598168010991924c64a66605466e1d200000113232533302f3031002132498c94ccc0b4cdc3a400000226464a66606460680042649318120008b181900098158010a99981699b87480080044c8c8c8c8c8c94ccc0d8c0e000852616375a606c002606c0046eb4c0d0004c0d0008dd6981900098158010b18158008b181780098140018a99981519b874800800454ccc0b4c0a000c52616163028002301d00316302b001302b0023029001302200416302200316302600130260023024001301d00816301d007300f00a32533301d3370e900000089919299981118120010a4c2c6eb8c088004c06c03054ccc074cdc3a40040022a66604060360182930b0b180d8058b180f800980f801180e800980e801180d800980d8011bad30190013019002301700130170023015001300e00b16300e00a3001001223253330103370e900000089919299980a980b8010a4c2c6eb8c054004c03800854ccc040cdc3a400400226464a66602a602e00426493198030009198030030008b1bac3015001300e002153330103370e900200089919299980a980b80109924c6600c00246600c00c0022c6eb0c054004c03800854ccc040cdc3a400c002264646464a66602e603200426493198040009198040040008b1bac30170013017002375a602a002601c0042a66602066e1d20080011323253330153017002149858dd6980a80098070010a99980819b87480280044c8c94ccc054c05c00852616375a602a002601c0042c601c00244646600200200644a66602600229309919801801980b0011801980a000919299980699b87480000044c8c94ccc048c05000852616375c602400260160042a66601a66e1d20020011323253330123014002149858dd7180900098058010b1805800899192999808180900109919299980799b8748000c0380084c8c94ccc044cdc3a40046020002266e3cdd7180a9807800806801980a00098068010008a50300e0011630100013756601e6020602060206020602060206012600260120084601e002601000629309b2b19299980499b874800000454ccc030c01c00c52616153330093370e90010008a99980618038018a4c2c2c600e0046eb80048c014dd5000918019baa0015734aae7555cf2ab9f5742ae893011e581c6ed8ba08a3a0ab1cdc63079fb057f84ff43f87dc4792f6f09b94e8030001",
      cancelRedeemer: VOID_REDEEMER,
      maxScooperFee: 1_000_000n,
    },
  };

  /**
   * @param {Lucid} lucid A configured Lucid instance to use.
   * @param {DatumBuilderLucidV3} datumBuilder A valid V3 DatumBuilder class that will build valid datums.
   */
  constructor(public lucid: Lucid, public datumBuilder: DatumBuilderLucidV3) {
    super();
    this.network = lucid.network === "Mainnet" ? "mainnet" : "preview";
  }

  /**
   * Helper method to get a specific parameter of the transaction builder.
   *
   * @template K - A generic type parameter that extends the keys of `ITxBuilderV3Params`.
   * @param {K} param - The name of the parameter to retrieve. Must be a key of `ITxBuilderV3Params`.
   * @param {TSupportedNetworks} network - The network for which to retrieve the parameter. Determines the set of parameters to use.
   * @returns {ITxBuilderV3Params[K]} - The value of the requested parameter, with the type corresponding to the key `param`.
   */
  static getParam<K extends keyof ITxBuilderV3Params>(
    param: K,
    network: TSupportedNetworks
  ): ITxBuilderV3Params[K] {
    return TxBuilderLucidV3.PARAMS[network][param];
  }

  /**
   * An internal shortcut method to avoid having to pass in the network all the time.
   *
   * @param param The parameter you want to retrieve.
   */
  private __getParam<K extends keyof ITxBuilderV3Params>(param: K) {
    return TxBuilderLucidV3.getParam(param, this.network);
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
      pool: { ident },
      orderAddresses,
      suppliedAsset,
      minReceivable,
      referralFee,
    } = config.buildArgs();

    const txInstance = this.newTxInstance(referralFee);

    const { inline } = this.datumBuilder.buildSwapDatum({
      ident,
      destinationAddress: orderAddresses.DestinationAddress,
      order: {
        minReceived: minReceivable,
        offered: suppliedAsset,
      },
      scooperFee: this.__getParam("maxScooperFee"),
    });

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee: this.__getParam("maxScooperFee"),
    });

    txInstance.payToContract(
      this.getContractAddressWithStakingKey(
        orderAddresses.DestinationAddress.address
      ),
      { inline },
      payment
    );
    return this.completeTx({
      tx: txInstance,
      datum: inline,
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
    const { utxo, referralFee } = new CancelConfig(cancelArgs).buildArgs();

    const tx = this.newTxInstance(referralFee);
    const utxosToSpend = await this.lucid.provider.getUtxosByOutRef([
      { outputIndex: utxo.index, txHash: utxo.hash },
    ]);

    const orderUtxo = utxosToSpend.find(
      ({ txHash, outputIndex }) =>
        utxo.hash === txHash && utxo.index === outputIndex
    );

    if (!orderUtxo) {
      throw new Error(
        `UTXO data was not found with the following parameters: ${JSON.stringify(
          utxo
        )}`
      );
    }

    if (!orderUtxo.datum) {
      throw new Error(
        `There was no datum attached to the order UTXO: ${JSON.stringify({
          txHash: orderUtxo.txHash,
          index: orderUtxo.outputIndex,
        })}`
      );
    }

    try {
      tx.collectFrom(
        utxosToSpend,
        this.__getParam("cancelRedeemer")
      ).attachSpendingValidator({
        script: this.__getParam("scriptValidator"),
        type: "PlutusV2",
      });

      tx.addSignerKey(
        DatumBuilderLucidV3.getSignerKeyFromDatum(orderUtxo.datum)
      );
    } catch (e) {
      throw e;
    }

    return this.completeTx({
      tx,
      datum: orderUtxo.datum as string,
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
      pool: { ident },
      orderAddresses,
      suppliedAsset,
      minReceivable,
    } = new SwapConfig(swapArgs).buildArgs();
    const swapDatum = this.datumBuilder.buildSwapDatum({
      ident,
      destinationAddress: orderAddresses.DestinationAddress,
      order: {
        offered: suppliedAsset,
        minReceived: minReceivable,
      },
      scooperFee: this.__getParam("maxScooperFee"),
    });

    if (!swapDatum) {
      throw new Error("Swap datum is required.");
    }

    cancelTx.payToContract(
      this.getContractAddressWithStakingKey(
        orderAddresses.DestinationAddress.address
      ),
      { inline: swapDatum.inline },
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

  deposit(depositArgs: IDepositConfigArgs) {
    const { suppliedAssets, pool, orderAddresses, referralFee } =
      new DepositConfig(depositArgs).buildArgs();

    const tx = this.newTxInstance(referralFee);

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets,
      scooperFee: this.__getParam("maxScooperFee"),
    });
    const [coinA, coinB] =
      SundaeUtils.sortSwapAssetsWithAmounts(suppliedAssets);

    const { inline } = this.datumBuilder.buildDepositDatum({
      destinationAddress: orderAddresses.DestinationAddress,
      ident: pool.ident,
      order: {
        assetA: coinA,
        assetB: coinB,
      },
      scooperFee: this.__getParam("maxScooperFee"),
    });

    tx.payToContract(
      this.getContractAddressWithStakingKey(
        orderAddresses.DestinationAddress.address
      ),
      { inline },
      payment
    );
    return this.completeTx({
      tx,
      datum: inline,
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

    const { inline } = this.datumBuilder.buildWithdrawDatum({
      ident: pool.ident,
      destinationAddress: orderAddresses.DestinationAddress,
      order: {
        lpToken: suppliedLPAsset,
      },
      scooperFee: this.__getParam("maxScooperFee"),
    });

    tx.payToContract(
      this.getContractAddressWithStakingKey(
        orderAddresses.DestinationAddress.address
      ),
      { inline },
      payment
    );
    return this.completeTx({
      tx,
      datum: inline,
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
      swapSlippage ?? 0.3
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
    const depositData = this.datumBuilder.buildDepositDatum({
      destinationAddress: orderAddresses.DestinationAddress,
      ident: pool.ident,
      order: {
        assetA: depositPair.CoinAAmount,
        assetB: depositPair.CoinBAmount,
      },
      scooperFee: this.__getParam("maxScooperFee"),
    });

    if (!depositData?.hash) {
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
    const { inline } = this.datumBuilder.buildSwapDatum({
      ident: pool.ident,
      destinationAddress: {
        address: this.getContractAddressWithStakingKey(
          orderAddresses.DestinationAddress.address
        ),
        /**
         * @TODO
         * Assuming that we can use inline datums in the V3 Scooper,
         * adjust this to use that and get rid of the metadata below.
         */
        datum: {
          type: EDatumType.HASH,
          value: depositData.hash,
        },
      },
      ownerAddress: orderAddresses.DestinationAddress.address,
      order: {
        offered: halfSuppliedAmount,
        minReceived: minReceivable,
      },
      scooperFee: this.__getParam("maxScooperFee"),
    });

    tx.attachMetadataWithConversion(103251, {
      [`0x${depositData.hash}`]: SundaeUtils.splitMetadataString(
        depositData.inline,
        "0x"
      ),
    });

    tx.payToContract(
      this.getContractAddressWithStakingKey(
        orderAddresses.DestinationAddress.address
      ),
      { inline },
      payment
    );

    return this.completeTx({
      tx,
      datum: inline,
      deposit: undefined,
      scooperFee: this.__getParam("maxScooperFee") * 2n,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Merges the user's staking key to the contract payment address if present.
   * @param ownerAddress
   * @returns
   */
  private getContractAddressWithStakingKey(ownerAddress: string): string {
    const orderAddress = this.__getParam("scriptAddress");
    const paymentCred = C.Address.from_bech32(orderAddress)
      .as_enterprise()
      ?.payment_cred();
    const stakeCred = C.Address.from_bech32(ownerAddress)
      .as_base()
      ?.stake_cred();

    if (!stakeCred || !paymentCred) {
      return orderAddress;
    }

    const newAddress = C.BaseAddress.new(
      this.network === "mainnet" ? 1 : 0,
      paymentCred,
      stakeCred
    ).to_address();

    return newAddress.to_bech32(
      this.network === "mainnet" ? "addr" : "addr_test"
    );
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
              submit: async () => {
                try {
                  return await signedTx.submit();
                } catch (e) {
                  console.log(
                    `Could not submit order. Signed transaction CBOR: ${Buffer.from(
                      signedTx.txSigned.body().to_bytes()
                    ).toString("hex")}`
                  );
                  throw e;
                }
              },
            };
          },
        };
      },
    };

    return thisTx;
  }
}
