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
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import { ADA_METADATA, ORDER_DEPOSIT_DEFAULT } from "../constants.js";
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
 * `TxBuilderLucidV1` is a class extending `TxBuilder` to support transaction construction
 * for Lucid against the V1 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
 * such as swaps, cancellations, updates, deposits, withdrawals, zaps, and liquidity migrations to
 * the V3 contracts (it is recommended to utilize V3 contracts if possible: {@link Lucid.TxBuilderLucidV3}).
 *
 * @implements {TxBuilder}
 */
export class TxBuilderLucidV1 extends TxBuilder {
  network: TSupportedNetworks;
  static MAX_SCOOPER_FEE: bigint = 2_500_000n;

  /**
   * @param {Lucid} lucid A configured Lucid instance to use.
   * @param {DatumBuilderLucidV1} datumBuilder A valid V1 DatumBuilder class that will build valid datums.
   */
  constructor(public lucid: Lucid, public datumBuilder: DatumBuilderLucidV1) {
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
      pool: { ident, assetA, assetB },
      orderAddresses,
      suppliedAsset,
      minReceivable,
      referralFee,
    } = config.buildArgs();

    const txInstance = this.newTxInstance(referralFee);

    const { ORDER_SCRIPT_V1 } = SundaeUtils.getParams(this.network);

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
      scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
    });

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
    });

    txInstance.payToContract(ORDER_SCRIPT_V1, cbor, payment);
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

    const {
      CANCEL_REDEEMER_V1: ESCROW_CANCEL_REDEEMER_V1,
      SCRIPT_VALIDATOR_V1: ESCROW_SCRIPT_VALIDATOR_V1,
    } = SundaeUtils.getParams(this.network);

    try {
      tx.collectFrom(utxoToSpend, ESCROW_CANCEL_REDEEMER_V1)
        .addSignerKey(signerKey)
        .attachSpendingValidator({
          type: "PlutusV1",
          script: ESCROW_SCRIPT_VALIDATOR_V1,
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
    const { ORDER_SCRIPT_V1 } = SundaeUtils.getParams(this.network);

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
      scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
    });

    if (!swapDatum) {
      throw new Error("Swap datum is required.");
    }

    cancelTx.payToContract(
      ORDER_SCRIPT_V1,
      swapDatum.inline,
      SundaeUtils.accumulateSuppliedAssets({
        suppliedAssets: [suppliedAsset],
        scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
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
      scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
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
      scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
    });

    tx.payToContract(
      SundaeUtils.getParams(this.network).ORDER_SCRIPT_V1,
      cbor,
      payment
    );
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
      scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
    });

    const { inline: cbor } = this.datumBuilder.buildWithdrawDatum({
      ident: pool.ident,
      orderAddresses: orderAddresses,
      suppliedLPAsset: suppliedLPAsset,
      scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
    });

    tx.payToContract(
      SundaeUtils.getParams(this.network).ORDER_SCRIPT_V1,
      cbor,
      payment
    );
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

    const { ORDER_SCRIPT_V1 } = SundaeUtils.getParams(this.network);
    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      // Add another scooper fee requirement since we are executing two orders.
      scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE * 2n,
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
        scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
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
          address: ORDER_SCRIPT_V1,
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
      scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
    });

    tx.attachMetadataWithConversion(103251, {
      [`0x${depositHash}`]: SundaeUtils.splitMetadataString(
        depositInline,
        "0x"
      ),
    });

    tx.payToContract(ORDER_SCRIPT_V1, swapData.inline, payment);
    return this.completeTx({
      tx,
      datum: swapData.inline,
      deposit: undefined,
      scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE * 2n,
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
    const { ORDER_SCRIPT_V1, ORDER_SCRIPT_V3 } = SundaeUtils.getParams(
      this.network
    );

    const finalTx = this.lucid.newTx();
    let totalScooper = 0n;
    let totalDeposit = 0n;
    let totalReferralFees = new AssetAmount(0n, ADA_METADATA);
    const metadataDatums: Record<string, string[]> = {};

    migrations.forEach(({ withdrawConfig, depositPool }) => {
      const withdrawArgs = new WithdrawConfig(withdrawConfig).buildArgs();

      const tx = this.newTxInstance(withdrawArgs.referralFee);

      const payment = SundaeUtils.accumulateSuppliedAssets({
        suppliedAssets: [withdrawArgs.suppliedLPAsset],
        // Add another scooper fee requirement since we are executing two orders.
        scooperFee:
          TxBuilderLucidV1.MAX_SCOOPER_FEE + TxBuilderLucidV3.MAX_SCOOPER_FEE,
      });

      totalDeposit += ORDER_DEPOSIT_DEFAULT;
      totalScooper +=
        TxBuilderLucidV1.MAX_SCOOPER_FEE + TxBuilderLucidV3.MAX_SCOOPER_FEE;
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
          scooperFee: TxBuilderLucidV3.MAX_SCOOPER_FEE,
        });

      const { inline: withdrawInline } = this.datumBuilder.buildWithdrawDatum({
        ident: withdrawArgs.pool.ident,
        orderAddresses: {
          DestinationAddress: {
            address: ORDER_SCRIPT_V3,
            datum: {
              type: EDatumType.HASH,
              value: depositHash,
            },
          },
          AlternateAddress:
            withdrawArgs.orderAddresses.DestinationAddress.address,
        },
        scooperFee: TxBuilderLucidV1.MAX_SCOOPER_FEE,
        suppliedLPAsset: withdrawArgs.suppliedLPAsset,
      });

      metadataDatums[`0x${depositHash}`] = SundaeUtils.splitMetadataString(
        depositInline,
        "0x"
      );
      tx.payToContract(ORDER_SCRIPT_V1, withdrawInline, payment);

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
        scooperFee ?? TxBuilderLucidV1.MAX_SCOOPER_FEE,
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
