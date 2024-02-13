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
import { ADA_METADATA, ORDER_DEPOSIT_DEFAULT } from "../constants.js";

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
 * `TxBuilderLucidV3` is a class extending `TxBuilder` to support transaction construction
 * for Lucid against the V3 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
 * such as swaps, cancellations, updates, deposits, withdrawals, and zaps.
 *
 * @implements {TxBuilder}
 */
export class TxBuilderLucidV3 extends TxBuilder {
  network: TSupportedNetworks;
  static MAX_SCOOPER_FEE: bigint = 1_100_000n;

  /**
   * @param {Lucid} lucid A configured Lucid instance to use.
   * @param {DatumBuilderLucidV3} datumBuilder A valid V3 DatumBuilder class that will build valid datums.
   */
  constructor(public lucid: Lucid, public datumBuilder: DatumBuilderLucidV3) {
    super();
    this.network = lucid.network === "Mainnet" ? "mainnet" : "preview";
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
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
    });

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
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

    const { CANCEL_REDEEMER_V3, SCRIPT_VALIDATOR_V3 } = SundaeUtils.getParams(
      this.network
    );

    try {
      tx.collectFrom(utxosToSpend, CANCEL_REDEEMER_V3).attachSpendingValidator({
        script: SCRIPT_VALIDATOR_V3,
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
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
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
        scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
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
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
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
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
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
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
    });

    const { inline } = this.datumBuilder.buildWithdrawDatum({
      ident: pool.ident,
      destinationAddress: orderAddresses.DestinationAddress,
      order: {
        lpToken: suppliedLPAsset,
      },
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
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
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE * 2n,
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
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
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
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
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
      scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE * 2n,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Merges the user's staking key to the contract payment address if present.
   * @param ownerAddress
   * @returns
   */
  private getContractAddressWithStakingKey(ownerAddress: string): string {
    const orderAddress = SundaeUtils.getParams(this.network).ORDER_SCRIPT_V3;
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
        scooperFee ?? TxBuilderLucidV3.MAX_SCOOPER_FEE,
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
