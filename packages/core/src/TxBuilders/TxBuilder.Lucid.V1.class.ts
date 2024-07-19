import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { getTokensForLp } from "@sundaeswap/cpp";
import type {
  Assets,
  Datum,
  Lucid,
  Script,
  Tx,
  TxComplete,
} from "lucid-cardano";
import { Data, getAddressDetails } from "lucid-cardano";

import {
  EContractVersion,
  EDatumType,
  ESwapType,
  ICancelConfigArgs,
  IComposedTx,
  IDepositConfigArgs,
  IMigrateLiquidityConfig,
  IMigrateYieldFarmingLiquidityConfig,
  IOrderRouteSwapArgs,
  ISundaeProtocolParamsFull,
  ISundaeProtocolValidatorFull,
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
import { OrderDatum } from "../DatumBuilders/contracts/contracts.v3.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { LucidHelper } from "../Utilities/LucidHelper.class.js";
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
  protocolParams: ISundaeProtocolParamsFull | undefined;

  static PARAMS: Record<TSupportedNetworks, ITxBuilderV1Params> = {
    mainnet: {
      cancelRedeemer: VOID_REDEEMER,
      maxScooperFee: 2_500_000n,
    },
    preview: {
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
   * Retrieves the basic protocol parameters from the SundaeSwap API
   * and fills in a place-holder for the compiled code of any validators.
   *
   * This is to keep things lean until we really need to attach a validator,
   * in which case, a subsequent method call to {@link TxBuilderLucidV3#getValidatorScript}
   * will re-populate with real data.
   *
   * @returns {Promise<ISundaeProtocolParamsFull>}
   */
  public async getProtocolParams(): Promise<ISundaeProtocolParamsFull> {
    if (!this.protocolParams) {
      this.protocolParams =
        await this.queryProvider.getProtocolParamsWithScripts(
          EContractVersion.V1
        );
    }

    return this.protocolParams;
  }

  /**
   * Gets the full validator script based on the key. If the validator
   * scripts have not been fetched yet, then we get that information
   * before returning a response.
   *
   * @param {string} name The name of the validator script to retrieve.
   * @returns {Promise<ISundaeProtocolValidatorFull>}
   */
  public async getValidatorScript(
    name: string
  ): Promise<ISundaeProtocolValidatorFull> {
    const params = await this.getProtocolParams();
    const result = params.blueprint.validators.find(
      ({ title }) => title === name
    );
    if (!result) {
      throw new Error(
        `Could not find a validator that matched the key: ${name}`
      );
    }

    return result;
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
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} A promise that resolves to the result of the completed transaction.
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
  async swap(swapArgs: ISwapConfigArgs): Promise<IComposedTx<Tx, TxComplete>> {
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

    let scooperFee = this.__getParam("maxScooperFee");
    const v3TxBuilder = new TxBuilderLucidV3(
      this.lucid,
      new DatumBuilderLucidV3(this.network)
    );

    const v3Address = await v3TxBuilder.generateScriptAddress(
      "order.spend",
      swapArgs.ownerAddress ||
        swapArgs.orderAddresses.DestinationAddress.address
    );

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = this.lucid.utils.validatorToAddress({
      type: "PlutusV1",
      script: compiledCode,
    });

    // Adjust scooper fee supply based on destination address.
    if (orderAddresses.DestinationAddress.address === v3Address) {
      scooperFee += await v3TxBuilder.getMaxScooperFeeAmount();
    } else if (orderAddresses.DestinationAddress.address === scriptAddress) {
      scooperFee += this.__getParam("maxScooperFee");
    }

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee,
    });

    txInstance.payToContract(scriptAddress, cbor, payment);
    return this.completeTx({
      tx: txInstance,
      datum: cbor,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Performs an order route swap with the given arguments.
   *
   * @async
   * @param {IOrderRouteSwapArgs} args - The arguments for the order route swap.
   *
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} The result of the transaction.
   */
  async orderRouteSwap(
    args: IOrderRouteSwapArgs
  ): Promise<IComposedTx<Tx, TxComplete>> {
    const isSecondSwapV3 = args.swapB.pool.version === EContractVersion.V3;

    const secondSwapBuilder = isSecondSwapV3
      ? new TxBuilderLucidV3(this.lucid, new DatumBuilderLucidV3(this.network))
      : this;
    const secondSwapAddress = isSecondSwapV3
      ? await (secondSwapBuilder as TxBuilderLucidV3).generateScriptAddress(
          "order.spend",
          args.ownerAddress
        )
      : await this.getValidatorScript("escrow.spend").then(({ compiledCode }) =>
          this.lucid.utils.validatorToAddress({
            type: "PlutusV1",
            script: compiledCode,
          })
        );

    const swapA = new SwapConfig({
      ...args.swapA,
      ownerAddress: args.ownerAddress,
      orderAddresses: {
        DestinationAddress: {
          address: secondSwapAddress,
          datum: {
            type: EDatumType.NONE,
          },
        },
      },
    }).buildArgs();

    const [aReserve, bReserve] = SundaeUtils.sortSwapAssetsWithAmounts([
      new AssetAmount(
        args.swapA.pool.liquidity.aReserve,
        args.swapA.pool.assetA
      ),
      new AssetAmount(
        args.swapA.pool.liquidity.bReserve,
        args.swapA.pool.assetB
      ),
    ]);

    const aOutputAsset =
      swapA.suppliedAsset.metadata.assetId === aReserve.metadata.assetId
        ? bReserve.withAmount(swapA.minReceivable.amount)
        : aReserve.withAmount(swapA.minReceivable.amount);

    const swapB = new SwapConfig({
      ...args.swapB,
      suppliedAsset: aOutputAsset,
      orderAddresses: {
        DestinationAddress: {
          address: args.ownerAddress,
          datum: {
            type: EDatumType.NONE,
          },
        },
      },
    }).buildArgs();

    const secondSwapData = await secondSwapBuilder.swap({
      ...swapB,
      swapType: args.swapB.swapType,
    });

    let referralFeeAmount = 0n;
    if (swapA.referralFee) {
      referralFeeAmount += swapA.referralFee.payment.amount;
    }

    if (swapB.referralFee) {
      referralFeeAmount += swapB.referralFee.payment.amount;
    }

    let mergedReferralFee: ITxBuilderReferralFee | undefined;
    if (swapA.referralFee) {
      mergedReferralFee = {
        ...swapA.referralFee,
        payment: swapA.referralFee.payment.withAmount(referralFeeAmount),
      };
    } else if (swapB.referralFee) {
      mergedReferralFee = {
        ...swapB.referralFee,
        payment: swapB.referralFee.payment.withAmount(referralFeeAmount),
      };
    }

    const datumHash = this.lucid.utils.datumToHash(
      secondSwapData.datum as string
    );

    const { tx, datum, fees } = await this.swap({
      ...swapA,
      swapType: {
        type: ESwapType.LIMIT,
        minReceivable: swapA.minReceivable,
      },
      orderAddresses: {
        ...swapA.orderAddresses,
        DestinationAddress: {
          ...swapA.orderAddresses.DestinationAddress,
          datum: {
            type: EDatumType.HASH,
            value: datumHash,
          },
        },
        AlternateAddress: args.ownerAddress,
      },
      referralFee: mergedReferralFee,
    });

    tx.attachMetadataWithConversion(103251, {
      [`0x${datumHash}`]: SundaeUtils.splitMetadataString(
        secondSwapData.datum as string,
        "0x"
      ),
    });

    return this.completeTx({
      tx,
      datum,
      deposit: ORDER_DEPOSIT_DEFAULT,
      referralFee: mergedReferralFee?.payment,
      scooperFee: fees.scooperFee.add(secondSwapData.fees.scooperFee).amount,
    });
  }

  /**
   * Executes a cancel transaction based on the provided configuration arguments.
   * Validates the datum and datumHash, retrieves the necessary UTXO data,
   * sets up the transaction, and completes it.
   *
   * @param {ICancelConfigArgs} cancelArgs - The configuration arguments for the cancel transaction.
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} A promise that resolves to the result of the cancel transaction.
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
    const utxosToSpend = await this.lucid.provider.getUtxosByOutRef([
      { outputIndex: utxo.index, txHash: utxo.hash },
    ]);

    if (!utxosToSpend) {
      throw new Error(
        `UTXO data was not found with the following parameters: ${JSON.stringify(
          utxo
        )}`
      );
    }

    const spendingDatum =
      utxosToSpend[0]?.datum ||
      (utxosToSpend[0]?.datumHash &&
        (await this.lucid.provider.getDatum(utxosToSpend[0].datumHash)));

    if (!spendingDatum) {
      throw new Error(
        "Failed trying to cancel an order that doesn't include a datum!"
      );
    }

    /**
     * If we can properly deserialize the order datum using a V3 type, then it's a V3 order.
     * If not, then we can assume it is a normal V1 order.
     */
    try {
      Data.from(spendingDatum as string, OrderDatum);
      console.log("This is a V3 order! Calling appropriate builder...");
      const v3Builder = new TxBuilderLucidV3(
        this.lucid,
        new DatumBuilderLucidV3(this.network)
      );
      return v3Builder.cancel({ ...cancelArgs });
    } catch (e) {}

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptValidator: Script = {
      type: "PlutusV1",
      script: compiledCode,
    };

    tx.collectFrom(
      utxosToSpend,
      this.__getParam("cancelRedeemer")
    ).attachSpendingValidator(scriptValidator);

    const details = getAddressDetails(ownerAddress);

    if (
      details?.stakeCredential?.hash &&
      spendingDatum.includes(details.stakeCredential.hash)
    ) {
      tx.addSignerKey(details.stakeCredential.hash);
    }

    if (
      details?.paymentCredential?.hash &&
      spendingDatum.includes(details.paymentCredential.hash)
    ) {
      tx.addSignerKey(details.paymentCredential.hash);
    }

    return this.completeTx({
      tx,
      datum: spendingDatum as string,
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
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} A promise that resolves to the result of the updated transaction.
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

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = this.lucid.utils.validatorToAddress({
      type: "PlutusV1",
      script: compiledCode,
    });

    cancelTx.payToContract(
      scriptAddress,
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

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = this.lucid.utils.validatorToAddress({
      type: "PlutusV1",
      script: compiledCode,
    });

    tx.payToContract(scriptAddress, cbor, payment);
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

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = this.lucid.utils.validatorToAddress({
      type: "PlutusV1",
      script: compiledCode,
    });

    tx.payToContract(scriptAddress, cbor, payment);
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

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = this.lucid.utils.validatorToAddress({
      type: "PlutusV1",
      script: compiledCode,
    });

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
          address: scriptAddress,
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

    tx.payToContract(scriptAddress, swapData.inline, payment);
    return this.completeTx({
      tx,
      datum: swapData.inline,
      deposit: undefined,
      scooperFee: this.__getParam("maxScooperFee") * 2n,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Temporary function that migrates liquidity from V1 to version V3 pools in a batch process. This asynchronous function
   * iterates through an array of migration configurations, each specifying the withdrawal configuration
   * from a V1 pool and the deposit details into a V3 pool. For each migration, it constructs a withdrawal
   * datum for the V1 pool and a deposit datum for the V3 pool, calculates required fees, and constructs
   * the transaction metadata. It accumulates the total scooper fees, deposit amounts, and referral fees
   * across all migrations. The function concludes by composing a final transaction that encompasses all
   * individual migrations and returns the completed transaction along with the total fees and deposits.
   *
   * @param {IMigrateLiquidityConfig[]} migrations - An array of objects, each containing the withdrawal configuration for a V1 pool and the deposit pool data for a V3 pool.
   * @param {IMigrateYieldFarmingLiquidityConfig} yieldFarming - Migration configuration for any locked Yield Farming positions for a V1 pool.
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
    migrations: IMigrateLiquidityConfig[],
    yieldFarming?: IMigrateYieldFarmingLiquidityConfig
  ): Promise<
    IComposedTx<
      Tx,
      TxComplete,
      string | undefined,
      Record<string, AssetAmount<IAssetAmountMetadata>>
    >
  > {
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
    const v3MaxScooperFee = await v3TxBuilderInstance.getMaxScooperFeeAmount();
    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = this.lucid.utils.validatorToAddress({
      type: "PlutusV1",
      script: compiledCode,
    });

    const YF_V2_PARAMS = {
      mainnet: {
        stakeKeyHash:
          "d7244b4a8777b7dc6909f4640cf02ea4757a557a99fb483b05f87dfe",
        scriptHash: "73275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c",
        referenceInput:
          "006ddd85cfc2e2d8b7238daa37b37a5db2ac63de2df35884a5e501667981e1e3#0",
      },
      preview: {
        stakeKeyHash:
          "045d47cac5067ce697478c11051deb935a152e0773a5d7430a11baa8",
        scriptHash: "73275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c",
        referenceInput:
          "aaaf193b8418253f4169ab869b77dedd4ee3df4f2837c226cee3c2f7fa955189#0",
      },
    };

    const yfRefInput =
      yieldFarming &&
      (await this.lucid.provider.getUtxosByOutRef([
        {
          txHash: YF_V2_PARAMS[this.network].referenceInput.split("#")[0],
          outputIndex: Number(
            YF_V2_PARAMS[this.network].referenceInput.split("#")[1]
          ),
        },
      ]));

    const existingPositionsData =
      yieldFarming?.existingPositions &&
      (await this.lucid.provider.getUtxosByOutRef(
        yieldFarming.existingPositions.map(({ hash, index }) => ({
          outputIndex: index,
          txHash: hash,
        }))
      ));

    const lockContractAddress = this.lucid.utils.credentialToAddress(
      {
        hash: YF_V2_PARAMS[this.network].scriptHash,
        type: "Script",
      },
      {
        hash: YF_V2_PARAMS[this.network].stakeKeyHash,
        type: "Key",
      }
    );

    const returnedYFAssets: Record<
      string,
      IAssetAmountMetadata & { amount: bigint }
    > = {};
    const migrationAssets: Record<
      string,
      IAssetAmountMetadata & { amount: bigint }
    > = {};

    /**
     * If yield farming positions have been supplied,
     * we want to build their configurations and include them in the order.
     * This includes taking into consideration what migrations
     * have been submitted, and resolving that difference to what assets
     * are actually locked up. We specifically only migrate the supplied,
     * and then explicitely pay back the change to the YF smart contract.
     */
    if (
      yieldFarming &&
      yfRefInput &&
      existingPositionsData &&
      existingPositionsData.length > 0
    ) {
      finalTx
        .readFrom(yfRefInput)
        .collectFrom(existingPositionsData, VOID_REDEEMER);

      const withdrawAssetsList = yieldFarming.migrations.reduce(
        (list, { withdrawPool }) => {
          list.push(withdrawPool.assetLP.assetId.replace(".", ""));
          return list;
        },
        [] as string[]
      );

      existingPositionsData.forEach(({ assets }) => {
        for (const [id, amount] of Object.entries(assets)) {
          if (withdrawAssetsList.includes(id)) {
            if (!migrationAssets[id]) {
              migrationAssets[id] = {
                amount,
                assetId: id,
                decimals: 0, // Decimals aren't required since we just use the raw amount.
              };
            } else {
              migrationAssets[id].amount += amount;
            }
          } else {
            if (!returnedYFAssets[id]) {
              returnedYFAssets[id] = {
                amount,
                assetId: id,
                decimals: 0, // Decimals aren't required since we just use the raw amount.
              };
            } else {
              returnedYFAssets[id].amount += amount;
            }
          }
        }
      });

      if (Object.keys(migrationAssets).length === 0) {
        throw new Error(
          "There were no eligible assets to migrate within the provided existing positions. Please check your migration config, and try again."
        );
      }

      yieldFarming.migrations.forEach(({ withdrawPool, depositPool }) => {
        const oldDelegation = existingPositionsData.find(({ assets }) => {
          if (assets[withdrawPool.assetLP.assetId.replace(".", "")]) {
            return true;
          }
        });

        if (!oldDelegation) {
          throw new Error("Could not find a matching delegation!");
        }

        const config = {
          newLockedAssets: returnedYFAssets,
          depositPool,
          withdrawConfig: {
            orderAddresses: {
              DestinationAddress: {
                address: lockContractAddress,
                datum: {
                  type: EDatumType.INLINE,
                  value: oldDelegation.datum as string,
                },
              },
              AlternateAddress: yieldFarming.ownerAddress.address,
            },
            pool: withdrawPool,
            suppliedLPAsset: new AssetAmount(
              migrationAssets[
                withdrawPool.assetLP.assetId.replace(".", "")
              ].amount,
              withdrawPool.assetLP
            ),
          },
        };

        migrations.push(config);
      });
    }

    /**
     * Now we can wrap up all the migrations and compose them into the transaction,
     * as well as update the metadata object we will attach.
     */
    migrations.forEach(({ withdrawConfig, depositPool }) => {
      const withdrawArgs = new WithdrawConfig(withdrawConfig).buildArgs();

      const tx = this.newTxInstance(withdrawArgs.referralFee);
      const scooperFee = this.__getParam("maxScooperFee") + v3MaxScooperFee;

      const payment = SundaeUtils.accumulateSuppliedAssets({
        suppliedAssets: [withdrawArgs.suppliedLPAsset],
        // Add another scooper fee requirement since we are executing two orders.
        scooperFee,
      });

      totalDeposit += ORDER_DEPOSIT_DEFAULT;
      totalScooper += scooperFee;
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
          ownerAddress: withdrawArgs.orderAddresses.AlternateAddress,
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
          scooperFee: v3MaxScooperFee,
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
            withdrawArgs.orderAddresses.AlternateAddress ??
            withdrawArgs.orderAddresses.DestinationAddress.address,
        },
        scooperFee: this.__getParam("maxScooperFee"),
        suppliedLPAsset: withdrawArgs.suppliedLPAsset,
      });

      metadataDatums[`0x${depositHash}`] = SundaeUtils.splitMetadataString(
        depositInline,
        "0x"
      );

      tx.payToContract(scriptAddress, withdrawInline, payment);

      finalTx.compose(tx);
    });

    /**
     * If we have YF migrations, then we specifically pay back the
     * non-migrated assets back to the contract.
     */
    if (yieldFarming && existingPositionsData) {
      const returningPayment: Assets = {};
      Object.values(returnedYFAssets).forEach(({ amount, assetId }) => {
        if (returningPayment[assetId.replace(".", "")]) {
          returningPayment[assetId.replace(".", "")] += amount;
        } else {
          returningPayment[assetId.replace(".", "")] = amount;
        }
      });

      const signerKey = LucidHelper.getAddressHashes(
        yieldFarming.ownerAddress.address
      );

      finalTx.addSignerKey(signerKey.paymentCredentials);

      if (signerKey?.stakeCredentials) {
        finalTx.addSignerKey(signerKey.stakeCredentials);
      }

      finalTx.payToContract(
        lockContractAddress,
        { inline: existingPositionsData[0].datum as string },
        returningPayment
      );
    }

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
