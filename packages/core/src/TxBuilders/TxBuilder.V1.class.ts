import { parse, Void } from "@blaze-cardano/data";
import {
  Blaze,
  TxBuilder as BlazeTx,
  Core,
  makeValue,
  Provider,
  Wallet,
} from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { getTokensForLp } from "@sundaeswap/cpp";

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
import { TxBuilderAbstractV1 } from "../Abstracts/TxBuilderAbstract.V1.class.js";
import { CancelConfig } from "../Configs/CancelConfig.class.js";
import { DepositConfig } from "../Configs/DepositConfig.class.js";
import { SwapConfig } from "../Configs/SwapConfig.class.js";
import { WithdrawConfig } from "../Configs/WithdrawConfig.class.js";
import { ZapConfig } from "../Configs/ZapConfig.class.js";
import { OrderDatum as V3OrderDatum } from "../DatumBuilders/ContractTypes/Contract.v3.js";
import { V1Types } from "../DatumBuilders/ContractTypes/index.js";
import { DatumBuilderV1 } from "../DatumBuilders/DatumBuilder.V1.class.js";
import { DatumBuilderV3Like } from "../DatumBuilders/DatumBuilder.V3Like.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { SundaeSDK } from "../SundaeSDK.class.js";
import { BlazeHelper } from "../Utilities/BlazeHelper.class.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import {
  ADA_METADATA,
  CANCEL_REDEEMER,
  ORDER_DEPOSIT_DEFAULT,
} from "../constants.js";
import { TxBuilderV3 } from "./TxBuilder.V3.class.js";

/**
 * Object arguments for completing a transaction.
 */
export interface ITxBuilderCompleteTxArgs {
  tx: BlazeTx;
  referralFee?: Core.Value;
  datum?: string;
  deposit?: bigint;
  scooperFee?: bigint;
  coinSelection?: boolean;
}

/**
 * Interface describing the parameter names for the transaction builder.
 */
export interface ITxBuilderV1BlazeParams {
  cancelRedeemer: string;
  maxScooperFee: bigint;
}

/**
 * `TxBuilderBlazeV1` is a class extending `TxBuilder` to support transaction construction
 * for Blaze against the V1 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
 * such as swaps, cancellations, updates, deposits, withdrawals, zaps, and liquidity migrations to
 * the V3 contracts (it is recommended to utilize V3 contracts if possible: {@link Core.TxBuilderV3}).
 *
 * @extends {TxBuilderAbstractV1}
 */
export class TxBuilderV1 extends TxBuilderAbstractV1 {
  queryProvider: QueryProviderSundaeSwap;
  network: TSupportedNetworks;
  protocolParams: ISundaeProtocolParamsFull | undefined;
  datumBuilder: DatumBuilderV1;
  validatorScriptHashes: Set<string> = new Set();
  tracing: boolean = false;

  static PARAMS: Record<TSupportedNetworks, ITxBuilderV1BlazeParams> = {
    mainnet: {
      cancelRedeemer: CANCEL_REDEEMER,
      maxScooperFee: 2_500_000n,
    },
    preview: {
      cancelRedeemer: CANCEL_REDEEMER,
      maxScooperFee: 2_500_000n,
    },
  };

  /**
   * @param {Blaze<Provider, Wallet>} blaze A configured Blaze instance to use.
   * @param {QueryProviderSundaeSwap} queryProvider A custom query provider if desired.
   */
  constructor(
    public blaze: Blaze<Provider, Wallet>,
    queryProvider?: QueryProviderSundaeSwap,
  ) {
    super();
    const network: TSupportedNetworks = blaze.provider.network
      ? "mainnet"
      : "preview";

    this.network = network;
    this.queryProvider = queryProvider ?? new QueryProviderSundaeSwap(network);
    this.datumBuilder = new DatumBuilderV1(network, this.validatorScriptHashes);
  }

  /**
   * Enables tracing in the Blaze transaction builder.
   *
   * @param {boolean} enable True to enable tracing, false to turn it off. (default: false)
   * @returns {TxBuilderV1}
   */
  public enableTracing(enable: boolean): TxBuilderV1 {
    this.tracing = enable;
    return this;
  }

  /**
   * Retrieves the basic protocol parameters from the SundaeSwap API
   * and fills in a place-holder for the compiled code of any validators.
   *
   * This is to keep things lean until we really need to attach a validator,
   * in which case, a subsequent method call to {@link TxBuilderV3#getValidatorScript}
   * will re-populate with real data.
   *
   * @returns {Promise<ISundaeProtocolParamsFull>}
   */
  public async getProtocolParams(): Promise<ISundaeProtocolParamsFull> {
    if (!this.protocolParams) {
      this.protocolParams =
        await this.queryProvider.getProtocolParamsWithScripts(
          EContractVersion.V1,
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
    name: string,
  ): Promise<ISundaeProtocolValidatorFull> {
    const params = await this.getProtocolParams();
    const result = params.blueprint.validators.find(
      ({ title }) => title === name,
    );
    if (!result) {
      throw new Error(
        `Could not find a validator that matched the key: ${name}`,
      );
    }

    // Keep a log of validator scripts.
    this.validatorScriptHashes.add(result.hash);

    return result;
  }

  /**
   * Helper method to get a specific parameter of the transaction builder.
   *
   * @param {K extends keyof ITxBuilderV1BlazeParams} param The parameter you want to retrieve.
   * @param {TSupportedNetworks} network The protocol network.
   * @returns {ITxBuilderV1BlazeParams[K]}
   */
  static getParam<K extends keyof ITxBuilderV1BlazeParams>(
    param: K,
    network: TSupportedNetworks,
  ): ITxBuilderV1BlazeParams[K] {
    return TxBuilderV1.PARAMS[network][param];
  }

  /**
   * An internal shortcut method to avoid having to pass in the network all the time.
   *
   * @param param The parameter you want to retrieve.
   * @returns {ITxBuilderV1BlazeParams}
   */
  public __getParam<K extends keyof ITxBuilderV1BlazeParams>(
    param: K,
  ): ITxBuilderV1BlazeParams[K] {
    return TxBuilderV1.getParam(param, this.network);
  }

  /**
   * Returns a new Tx instance from Blaze. Throws an error if not ready.
   * @returns
   */
  newTxInstance(fee?: ITxBuilderReferralFee): BlazeTx {
    const instance = this.blaze.newTransaction();

    if (fee) {
      this.attachReferralFees(instance, fee);
    }

    instance.enableTracing(this.tracing);
    return instance;
  }

  /**
   * Helper function to attache referral fees to a tx instance.
   *
   * @param instance Blaze TxBuilder instance.
   * @param fee The referral fees to add.
   */
  private attachReferralFees(instance: BlazeTx, fee: ITxBuilderReferralFee) {
    instance.payAssets(Core.addressFromBech32(fee.destination), fee.payment);

    if (fee?.feeLabel) {
      const data = new Core.AuxiliaryData();
      const map = new Map<bigint, Core.Metadatum>();
      map.set(
        674n,
        Core.Metadatum.fromCore(
          Core.Metadatum.newText(`${fee.feeLabel}`).toCore(),
        ),
      );
      data.setMetadata(new Core.Metadata(map));
      instance.setAuxiliaryData(data);
    }
  }

  /**
   * Executes a swap transaction based on the provided swap configuration.
   * It constructs the necessary arguments for the swap, builds the transaction instance,
   * and completes the transaction by paying to the contract and finalizing the transaction details.
   *
   * @param {ISwapConfigArgs} swapArgs - The configuration arguments for the swap.
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} A promise that resolves to the result of the completed transaction.
   *
   * @example
   * ```ts
   * const txHash = await sdk.builder().swap({
   *   ...args
   * })
   *   .then(({ sign }) => sign())
   *   .then(({ submit }) => submit())
   * ```
   */
  async swap(
    swapArgs: ISwapConfigArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const config = new SwapConfig(swapArgs);

    const {
      pool: { ident, assetA, assetB },
      orderAddresses,
      suppliedAsset,
      minReceivable,
      referralFee,
    } = config.buildArgs();

    const txInstance = this.newTxInstance(referralFee);

    let scooperFee = await this.getMaxScooperFeeAmount();

    const { inline, hash } = this.datumBuilder.buildSwapDatum({
      ident,
      swap: {
        SuppliedCoin: SundaeUtils.getAssetSwapDirection(
          suppliedAsset.metadata,
          [assetA, assetB],
        ),
        MinimumReceivable: minReceivable,
      },
      orderAddresses,
      fundedAsset: suppliedAsset,
      scooperFee,
    });

    if (swapArgs.orderAddresses.PoolDestinationVersion) {
      const destinationBuilder = SundaeSDK.new({
        blazeInstance: this.blaze,
        customQueryProvider: this.queryProvider,
      }).builder(
        swapArgs.orderAddresses.PoolDestinationVersion as EContractVersion,
      );
      scooperFee += await destinationBuilder.getMaxScooperFeeAmount();
    }

    const orderAddress = await this.getOrderScriptAddress(
      swapArgs?.ownerAddress ?? orderAddresses.DestinationAddress.address,
    );

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee,
    });

    const newPayment = makeValue(
      payment.lovelace,
      ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
    );

    const datum = Core.DatumHash(Core.HexBlob(hash));
    const script = Core.addressFromBech32(orderAddress);

    txInstance
      .provideDatum(Core.PlutusData.fromCbor(Core.HexBlob(inline)))
      .lockAssets(script, newPayment, datum);

    return this.completeTx({
      tx: txInstance,
      datum: inline,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Performs an order route swap with the given arguments.
   *
   * @param {IOrderRouteSwapArgs} args - The arguments for the order route swap.
   *
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} The result of the transaction.
   */
  async orderRouteSwap(
    args: IOrderRouteSwapArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const secondBuilder = SundaeSDK.new({
      blazeInstance: this.blaze,
      customQueryProvider: this.queryProvider,
    }).builder(args.swapB.pool.version as EContractVersion);

    const secondSwapAddress = await secondBuilder.getOrderScriptAddress(
      args.ownerAddress,
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
        PoolDestinationVersion: args.swapB.pool.version as EContractVersion,
      },
    }).buildArgs();

    const [aReserve, bReserve] = SundaeUtils.sortSwapAssetsWithAmounts([
      new AssetAmount(
        args.swapA.pool.liquidity.aReserve,
        args.swapA.pool.assetA,
      ),
      new AssetAmount(
        args.swapA.pool.liquidity.bReserve,
        args.swapA.pool.assetB,
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

    const secondSwapData = await secondBuilder.swap({
      ...swapB,
      swapType: args.swapB.swapType,
    });

    const referralFeeAmount = BlazeHelper.mergeValues(
      swapA.referralFee?.payment,
      swapB.referralFee?.payment,
    );

    let mergedReferralFee: ITxBuilderReferralFee | undefined;
    if (swapA.referralFee) {
      mergedReferralFee = {
        ...swapA.referralFee,
        payment: referralFeeAmount,
      };
    } else if (swapB.referralFee) {
      mergedReferralFee = {
        ...swapB.referralFee,
        payment: referralFeeAmount,
      };
    }

    const datumHash = Core.PlutusData.fromCbor(
      Core.HexBlob(secondSwapData.datum as string),
    ).hash();

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

    const data = new Core.AuxiliaryData();
    const metadata = new Map<bigint, Core.Metadatum>();
    metadata.set(
      103251n,
      Core.Metadatum.fromCore(
        new Map([
          [
            Buffer.from(datumHash, "hex"),
            SundaeUtils.splitMetadataString(secondSwapData.datum as string).map(
              (v) => Buffer.from(v, "hex"),
            ),
          ],
        ]),
      ),
    );
    data.setMetadata(new Core.Metadata(metadata));
    tx.setAuxiliaryData(data);

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
   * @example
   * ```ts
   * const txHash = await sdk.builder().cancel({
   *   ...args
   * })
   *   .then(({ sign }) => sign())
   *   .then(({ submit }) => submit());
   * ```
   */
  async cancel(
    cancelArgs: ICancelConfigArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const { utxo, referralFee } = new CancelConfig(cancelArgs).buildArgs();

    const tx = this.newTxInstance(referralFee);
    const [utxoToSpend] = await this.blaze.provider.resolveUnspentOutputs([
      new Core.TransactionInput(
        Core.TransactionId(utxo.hash),
        BigInt(utxo.index),
      ),
    ]);

    if (!utxoToSpend) {
      throw new Error(
        `UTXO data was not found with the following parameters: ${JSON.stringify(
          utxo,
        )}`,
      );
    }

    const spendingDatum =
      utxoToSpend?.output().datum()?.asInlineData() ||
      (utxoToSpend?.output().datum()?.asDataHash() &&
        (await this.blaze.provider.resolveDatum(
          Core.DatumHash(utxoToSpend?.output().datum()?.asDataHash() as string),
        )));

    if (!spendingDatum) {
      throw new Error(
        "Failed trying to cancel an order that doesn't include a datum!",
      );
    }

    /**
     * If we can properly deserialize the order datum using a V3 type, then it's a V3 order.
     * If not, then we can assume it is a normal V1 order.
     */
    try {
      parse(V3OrderDatum, spendingDatum);
      // eslint-disable-next-line no-console
      console.log("This is a V3 order! Calling appropriate builder...");
      const v3Builder = new TxBuilderV3(this.blaze);
      return v3Builder.cancel({ ...cancelArgs });
    } catch (e) {}

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptValidator = Core.Script.newPlutusV1Script(
      new Core.PlutusV1Script(Core.HexBlob(compiledCode)),
    );

    tx.addInput(
      utxoToSpend,
      Core.PlutusData.fromCbor(Core.HexBlob(this.__getParam("cancelRedeemer"))),
      spendingDatum,
    );

    tx.provideScript(scriptValidator);

    // Must try deserializing the datum with each order type.
    let data:
      | V1Types.SwapOrder
      | V1Types.WithdrawOrder
      | V1Types.DepositOrder
      | undefined;
    [V1Types.SwapOrder, V1Types.WithdrawOrder, V1Types.DepositOrder].forEach(
      (type) => {
        if (data) {
          return;
        }

        try {
          data = parse(type, spendingDatum);
        } catch (e) {}
      },
    );

    if (!data) {
      throw new Error(
        "Could not determine order type based on the order's datum.",
      );
    }

    if (!data.orderAddresses.alternate) {
      if ("KeyHash" in data.orderAddresses.destination.credentials.paymentKey) {
        const paymentKeyCred =
          data.orderAddresses.destination.credentials.paymentKey?.KeyHash
            .keyHash;
        tx.addRequiredSigner(Core.Ed25519KeyHashHex(paymentKeyCred));
      }
      if (
        data.orderAddresses.destination.credentials.stakingKey &&
        "KeyHash" in
          data.orderAddresses.destination.credentials.stakingKey.value
      ) {
        const stakingKeyCred =
          data.orderAddresses.destination.credentials.stakingKey.value.KeyHash
            .keyHash;
        tx.addRequiredSigner(Core.Ed25519KeyHashHex(stakingKeyCred));
      }
    } else {
      tx.addRequiredSigner(
        Core.Ed25519KeyHashHex(data.orderAddresses.alternate),
      );
    }

    return this.completeTx({
      tx,
      datum: spendingDatum.toCbor(),
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
  }): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
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
          [assetA, assetB],
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
    const scriptAddress = Core.addressFromValidator(
      this.network === "mainnet" ? 1 : 0,
      Core.Script.newPlutusV1Script(
        new Core.PlutusV1Script(Core.HexBlob(compiledCode)),
      ),
    );

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee: this.__getParam("maxScooperFee"),
    });

    cancelTx
      .provideDatum(Core.PlutusData.fromCbor(Core.HexBlob(swapDatum.inline)))
      .lockAssets(
        scriptAddress,
        makeValue(
          payment.lovelace,
          ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
        ),
        Core.DatumHash(swapDatum.hash),
      );

    /**
     * Accumulate any referral fees.
     */
    const accumulatedReferralFee = BlazeHelper.mergeValues(
      cancelArgs.referralFee?.payment,
      swapArgs.referralFee?.payment,
    );

    if (cancelArgs.referralFee) {
      cancelTx.payAssets(
        Core.addressFromBech32(cancelArgs.referralFee.destination),
        cancelArgs.referralFee.payment,
      );
    }

    if (swapArgs.referralFee) {
      cancelTx.payAssets(
        Core.addressFromBech32(swapArgs.referralFee.destination),
        swapArgs.referralFee.payment,
      );
    }

    return this.completeTx({
      tx: cancelTx,
      datum: swapDatum.inline,
      referralFee: accumulatedReferralFee,
    });
  }

  async deposit(
    depositArgs: IDepositConfigArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const { suppliedAssets, pool, orderAddresses, referralFee } =
      new DepositConfig(depositArgs).buildArgs();

    const tx = this.newTxInstance(referralFee);

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets,
      scooperFee: this.__getParam("maxScooperFee"),
    });
    const [coinA, coinB] =
      SundaeUtils.sortSwapAssetsWithAmounts(suppliedAssets);

    const depositDatum = this.datumBuilder.buildDepositDatum({
      ident: pool.ident,
      orderAddresses: orderAddresses,
      deposit: {
        CoinAAmount: coinA,
        CoinBAmount: coinB,
      },
      scooperFee: this.__getParam("maxScooperFee"),
    });

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = Core.addressFromValidator(
      this.network === "mainnet" ? 1 : 0,
      Core.Script.newPlutusV1Script(
        new Core.PlutusV1Script(Core.HexBlob(compiledCode)),
      ),
    );

    tx.provideDatum(
      Core.PlutusData.fromCbor(Core.HexBlob(depositDatum.inline)),
    ).lockAssets(
      scriptAddress,
      makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      ),
      Core.DatumHash(depositDatum.hash),
    );

    return this.completeTx({
      tx,
      datum: depositDatum.inline,
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
    withdrawArgs: IWithdrawConfigArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const { suppliedLPAsset, orderAddresses, referralFee } = new WithdrawConfig(
      withdrawArgs,
    ).buildArgs();

    const tx = this.newTxInstance(referralFee);

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedLPAsset],
      scooperFee: this.__getParam("maxScooperFee"),
    });

    const ident = SundaeUtils.getIdentFromAssetId(
      suppliedLPAsset.metadata.assetId,
    );

    const withdrawDatum = this.datumBuilder.buildWithdrawDatum({
      ident,
      orderAddresses: orderAddresses,
      suppliedLPAsset: suppliedLPAsset,
      scooperFee: this.__getParam("maxScooperFee"),
    });

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = Core.addressFromValidator(
      this.network === "mainnet" ? 1 : 0,
      Core.Script.newPlutusV1Script(
        new Core.PlutusV1Script(Core.HexBlob(compiledCode)),
      ),
    );

    tx.provideDatum(
      Core.PlutusData.fromCbor(Core.HexBlob(withdrawDatum.inline)),
    ).lockAssets(
      scriptAddress,
      makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      ),
      Core.DatumHash(withdrawDatum.hash),
    );

    return this.completeTx({
      tx,
      datum: withdrawDatum.inline,
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
    zapArgs: Omit<IZapConfigArgs, "zapDirection">,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const zapDirection = SundaeUtils.getAssetSwapDirection(
      zapArgs.suppliedAsset.metadata,
      [zapArgs.pool.assetA, zapArgs.pool.assetB],
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
      suppliedAsset.metadata,
    );

    const minReceivable = SundaeUtils.getMinReceivableFromSlippage(
      pool,
      halfSuppliedAmount,
      swapSlippage,
    );

    let depositPair: TDepositMixed;
    if (
      SundaeUtils.isAssetIdsEqual(
        pool.assetA.assetId,
        suppliedAsset.metadata.assetId,
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
        "A datum hash for a deposit transaction is required to build a chained Zap operation.",
      );
    }

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = Core.addressFromValidator(
      this.network === "mainnet" ? 1 : 0,
      Core.Script.newPlutusV1Script(
        new Core.PlutusV1Script(Core.HexBlob(compiledCode)),
      ),
    );

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
          address: scriptAddress.toBech32(),
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
          [pool.assetA, pool.assetB],
        ),
        MinimumReceivable: minReceivable,
      },
      scooperFee: this.__getParam("maxScooperFee"),
    });

    const data = new Core.AuxiliaryData();
    const metadata = new Map<bigint, Core.Metadatum>();
    metadata.set(
      103251n,
      Core.Metadatum.fromCore(
        new Map([
          [
            Buffer.from(depositHash, "hex"),
            SundaeUtils.splitMetadataString(depositInline).map((v) =>
              Buffer.from(v, "hex"),
            ),
          ],
        ]),
      ),
    );
    data.setMetadata(new Core.Metadata(metadata));
    tx.setAuxiliaryData(data);

    tx.provideDatum(
      Core.PlutusData.fromCbor(Core.HexBlob(swapData.inline)),
    ).lockAssets(
      scriptAddress,
      makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      ),
      Core.DatumHash(swapData.hash),
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
    yieldFarming?: IMigrateYieldFarmingLiquidityConfig,
  ): Promise<
    IComposedTx<
      BlazeTx,
      Core.Transaction,
      string | undefined,
      Record<string, AssetAmount<IAssetAmountMetadata>>
    >
  > {
    const finalTx = this.newTxInstance();
    let totalScooper = 0n;
    let totalDeposit = 0n;
    let totalReferralFees = new Core.Value(0n);
    const metadataDatums = new Core.MetadatumMap();
    const v3TxBuilderInstance = new TxBuilderV3(this.blaze, this.queryProvider);
    const v3OrderScriptAddress =
      await v3TxBuilderInstance.generateScriptAddress("order.spend");
    const v3MaxScooperFee = await v3TxBuilderInstance.getMaxScooperFeeAmount();
    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = Core.addressFromValidator(
      this.network === "mainnet" ? 1 : 0,
      Core.Script.newPlutusV1Script(
        new Core.PlutusV1Script(Core.HexBlob(compiledCode)),
      ),
    );

    const YF_V2_PARAMS = {
      mainnet: {
        stakeKeyHash:
          "d7244b4a8777b7dc6909f4640cf02ea4757a557a99fb483b05f87dfe",
        scriptHash: "73275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c",
        referenceInput:
          "5af2bc2b1c983f65122d8737755d1de6e88c4d24797fdfac2c01e5156c15256f#0",
      },
      preview: {
        stakeKeyHash:
          "045d47cac5067ce697478c11051deb935a152e0773a5d7430a11baa8",
        scriptHash: "73275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c",
        referenceInput:
          "aaaf193b8418253f4169ab869b77dedd4ee3df4f2837c226cee3c2f7fa955189#0",
      },
    };

    const yfRefUtxo =
      yieldFarming &&
      (await this.blaze.provider.resolveUnspentOutputs([
        new Core.TransactionInput(
          Core.TransactionId(
            YF_V2_PARAMS[this.network].referenceInput.split("#")[0],
          ),
          BigInt(YF_V2_PARAMS[this.network].referenceInput.split("#")[1]),
        ),
      ]));

    const existingPositionsData =
      yieldFarming?.existingPositions &&
      (await this.blaze.provider.resolveUnspentOutputs(
        yieldFarming.existingPositions.map(
          ({ hash, index }) =>
            new Core.TransactionInput(Core.TransactionId(hash), BigInt(index)),
        ),
      ));

    const lockContractAddress = Core.addressFromCredentials(
      this.network === "mainnet" ? 1 : 0,
      Core.Credential.fromCore({
        type: Core.CredentialType.ScriptHash,
        hash: Core.Hash28ByteBase16(YF_V2_PARAMS[this.network].scriptHash),
      }),
      Core.Credential.fromCore({
        type: Core.CredentialType.KeyHash,
        hash: Core.Hash28ByteBase16(YF_V2_PARAMS[this.network].stakeKeyHash),
      }),
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
      yfRefUtxo &&
      existingPositionsData &&
      existingPositionsData.length > 0
    ) {
      yfRefUtxo.forEach((input) => {
        const cbor = input.toCbor();
        const newInstance = Core.TransactionUnspentOutput.fromCbor(cbor);
        finalTx.addReferenceInput(newInstance);
      });
      existingPositionsData.forEach((input) => {
        finalTx.addInput(input, Void());
      });

      const withdrawAssetsList = yieldFarming.migrations.reduce(
        (list, { withdrawPool }) => {
          list.push(withdrawPool.assetLP.assetId.replace(".", ""));
          return list;
        },
        [] as string[],
      );

      existingPositionsData.forEach((position) => {
        const lovelace = position.output().amount().coin();
        if (!returnedYFAssets.lovelace) {
          returnedYFAssets.lovelace = {
            amount: lovelace,
            // These don't matter, just for types.
            assetId: "lovelace",
            decimals: 0,
          };
        } else {
          returnedYFAssets.lovelace.amount += lovelace;
        }

        position
          .output()
          .amount()
          .multiasset()
          ?.forEach((amount, id) => {
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
          });
      });

      if (Object.keys(migrationAssets).length === 0) {
        throw new Error(
          "There were no eligible assets to migrate within the provided existing positions. Please check your migration config, and try again.",
        );
      }

      yieldFarming.migrations.forEach(({ withdrawPool, depositPool }) => {
        const oldDelegation = existingPositionsData.find((position) => {
          const hasLpAsset = position
            .output()
            .amount()
            .multiasset()
            ?.has(Core.AssetId(withdrawPool.assetLP.assetId.replace(".", "")));

          return hasLpAsset;
        });

        if (!oldDelegation) {
          throw new Error("Could not find a matching delegation!");
        }

        const oldDelegationDatum = oldDelegation
          .output()
          .datum()
          ?.asInlineData();

        const config = {
          newLockedAssets: returnedYFAssets,
          depositPool,
          withdrawConfig: {
            orderAddresses: {
              DestinationAddress: {
                address: lockContractAddress.toBech32(),
                datum: {
                  type: EDatumType.INLINE,
                  value: oldDelegationDatum?.toCbor() as string,
                },
              },
              AlternateAddress: yieldFarming.ownerAddress.address,
            },
            pool: withdrawPool,
            suppliedLPAsset: new AssetAmount(
              migrationAssets[
                withdrawPool.assetLP.assetId.replace(".", "")
              ].amount,
              withdrawPool.assetLP,
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
      const scooperFee = this.__getParam("maxScooperFee") + v3MaxScooperFee;

      const payment = SundaeUtils.accumulateSuppliedAssets({
        suppliedAssets: [withdrawArgs.suppliedLPAsset],
        // Add another scooper fee requirement since we are executing two orders.
        scooperFee,
      });

      totalDeposit += ORDER_DEPOSIT_DEFAULT;
      totalScooper += scooperFee;
      if (withdrawArgs.referralFee) {
        totalReferralFees = BlazeHelper.mergeValues(
          totalReferralFees,
          withdrawArgs.referralFee.payment,
        );
      }

      const [coinA, coinB] = getTokensForLp(
        withdrawArgs.suppliedLPAsset.amount,
        withdrawConfig.pool.liquidity.aReserve,
        withdrawConfig.pool.liquidity.bReserve,
        withdrawConfig.pool.liquidity.lpTotal,
      );

      const v3DatumBuilder = new DatumBuilderV3Like(this.network);
      const { hash: depositHash, inline: depositInline } =
        v3DatumBuilder.buildDepositDatum({
          destinationAddress: withdrawArgs.orderAddresses.DestinationAddress,
          ownerAddress: withdrawArgs.orderAddresses.AlternateAddress,
          ident: depositPool.ident,
          order: {
            assetA: new AssetAmount<IAssetAmountMetadata>(
              coinA,
              depositPool.assetA,
            ),
            assetB: new AssetAmount<IAssetAmountMetadata>(
              coinB,
              depositPool.assetB,
            ),
          },
          scooperFee: v3MaxScooperFee,
        });

      const { inline: withdrawInline, hash: withdrawHash } =
        this.datumBuilder.buildWithdrawDatum({
          ident: withdrawConfig.pool.ident,
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

      metadataDatums?.insert(
        Core.Metadatum.fromCore(Buffer.from(depositHash, "hex")),
        Core.Metadatum.fromCore(
          SundaeUtils.splitMetadataString(depositInline).map((v) =>
            Buffer.from(v, "hex"),
          ),
        ),
      );

      const withdrawPayment = makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      );

      finalTx
        .provideDatum(Core.PlutusData.fromCbor(Core.HexBlob(withdrawInline)))
        .lockAssets(
          scriptAddress,
          withdrawPayment,
          Core.DatumHash(withdrawHash),
        );

      if (withdrawArgs.referralFee) {
        this.attachReferralFees(finalTx, withdrawArgs.referralFee);
      }
    });

    /**
     * If we have YF migrations, then we specifically pay back the
     * non-migrated assets back to the contract.
     */
    if (yieldFarming && existingPositionsData) {
      const returningPayment: Record<string, bigint> = {};
      Object.values(returnedYFAssets).forEach(({ amount, assetId }) => {
        if (returningPayment[assetId.replace(".", "")]) {
          returningPayment[assetId.replace(".", "")] += amount;
        } else {
          returningPayment[assetId.replace(".", "")] = amount;
        }
      });

      const paymentPart = BlazeHelper.getPaymentHashFromBech32(
        yieldFarming.ownerAddress.address,
      );
      const stakingPart = BlazeHelper.getStakingHashFromBech32(
        yieldFarming.ownerAddress.address,
      );

      finalTx.addRequiredSigner(Core.Ed25519KeyHashHex(paymentPart));

      if (stakingPart) {
        finalTx.addRequiredSigner(Core.Ed25519KeyHashHex(stakingPart));
      }

      const existingDatum =
        existingPositionsData[0]?.output().datum()?.asInlineData() ||
        (existingPositionsData[0]?.output().datum()?.asDataHash() &&
          (await this.blaze.provider.resolveDatum(
            Core.DatumHash(
              existingPositionsData[0]
                ?.output()
                .datum()
                ?.asDataHash() as string,
            ),
          )));

      if (!existingDatum) {
        throw new Error(
          "Failed trying to migrate a position that doesn't have a datum!",
        );
      }

      const orderPayment = makeValue(
        returningPayment.lovelace ||
          BigInt(migrations.length) * ORDER_DEPOSIT_DEFAULT,
        ...Object.entries(returningPayment).filter(
          ([key]) => key !== "lovelace",
        ),
      );

      const outputData = existingPositionsData[0]?.output().datum();
      const datum = outputData?.asInlineData();

      if (!datum) {
        throw new Error(
          "Could not find a matching datum from the original Yield Farming positions.",
        );
      }

      finalTx.lockAssets(lockContractAddress, orderPayment, datum);
    }

    const data = new Core.AuxiliaryData();
    const map = new Map<bigint, Core.Metadatum>();
    map.set(103251n, Core.Metadatum.newMap(metadataDatums));
    data.setMetadata(new Core.Metadata(map));
    finalTx.setAuxiliaryData(data);

    return this.completeTx({
      tx: finalTx,
      deposit: totalDeposit,
      scooperFee: totalScooper,
      referralFee: totalReferralFees,
    });
  }

  setQueryProvider(queryProvider: QueryProviderSundaeSwap): void {
    this.queryProvider = queryProvider;
  }

  async getOrderScriptAddress(_address: string): Promise<string> {
    return await this.getValidatorScript("escrow.spend").then(
      ({ compiledCode }) =>
        Core.addressFromValidator(
          this.network === "mainnet" ? 1 : 0,
          Core.Script.newPlutusV1Script(
            new Core.PlutusV1Script(
              Core.HexBlob.fromBytes(Buffer.from(compiledCode, "hex")),
            ),
          ),
        ).toBech32(),
    );
  }

  getExtraSuppliedAssets(): AssetAmount<IAssetAmountMetadata>[] {
    return [];
  }

  getDatumType(): EDatumType {
    return EDatumType.HASH;
  }

  async getMaxScooperFeeAmount(): Promise<bigint> {
    return this.__getParam("maxScooperFee");
  }

  private async completeTx({
    tx,
    datum,
    referralFee,
    deposit,
    scooperFee,
    coinSelection = true,
  }: ITxBuilderCompleteTxArgs): Promise<
    IComposedTx<BlazeTx, Core.Transaction>
  > {
    const baseFees: Omit<ITxBuilderFees, "cardanoTxFee"> = {
      deposit: new AssetAmount(deposit ?? ORDER_DEPOSIT_DEFAULT, ADA_METADATA),
      scooperFee: new AssetAmount(
        scooperFee ?? this.__getParam("maxScooperFee"),
        ADA_METADATA,
      ),
      // TODO: update this to show native asset referral fees.
      referral: referralFee
        ? new AssetAmount(referralFee.coin() || 0n, ADA_METADATA)
        : undefined,
    };

    let finishedTx: Core.Transaction | undefined;
    const that = this;

    const thisTx: IComposedTx<BlazeTx, Core.Transaction> = {
      tx,
      datum,
      fees: baseFees,
      async build() {
        if (!finishedTx) {
          finishedTx = await tx.complete({ useCoinSelection: coinSelection });
          thisTx.fees.cardanoTxFee = new AssetAmount(
            BigInt(finishedTx?.body().fee()?.toString() ?? "0"),
            ADA_METADATA,
          );
        }

        return {
          cbor: finishedTx.toCbor(),
          builtTx: finishedTx,
          sign: async () => {
            const signedTx = await that.blaze.signTransaction(
              finishedTx as Core.Transaction,
            );

            return {
              cbor: signedTx.toCbor(),
              submit: async () => that.blaze.submitTransaction(signedTx),
            };
          },
        };
      },
    };

    return thisTx;
  }
}
