import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  C,
  Data,
  OutRef,
  UTxO,
  toUnit,
  type Assets,
  type Datum,
  type Lucid,
  type Tx,
  type TxComplete,
} from "lucid-cardano";

import {
  EContractVersion,
  EDatumType,
  ICancelConfigArgs,
  IComposedTx,
  IDepositConfigArgs,
  IMintV3PoolConfigArgs,
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
import { MintV3PoolConfig } from "../Configs/MintV3PoolConfig.class.js";
import { SwapConfig } from "../Configs/SwapConfig.class.js";
import { WithdrawConfig } from "../Configs/WithdrawConfig.class.js";
import { ZapConfig } from "../Configs/ZapConfig.class.js";
import { DatumBuilderLucidV3 } from "../DatumBuilders/DatumBuilder.Lucid.V3.class.js";
import { V3Types } from "../DatumBuilders/contracts/index.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
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
  nativeUplc?: boolean;
}

/**
 * Interface describing the parameter names for the transaction builder.
 */
export interface ITxBuilderV3Params {
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
  queryProvider: QueryProviderSundaeSwap;
  network: TSupportedNetworks;
  protocolParams: ISundaeProtocolParamsFull | undefined;
  referenceUtxos: UTxO[] | undefined;
  settingsUtxos: UTxO[] | undefined;
  validatorScripts: Record<string, ISundaeProtocolValidatorFull> = {};

  static PARAMS: Record<TSupportedNetworks, ITxBuilderV3Params> = {
    mainnet: {
      cancelRedeemer: VOID_REDEEMER,
      maxScooperFee: 1_000_000n,
    },
    preview: {
      cancelRedeemer: VOID_REDEEMER,
      maxScooperFee: 1_000_000n,
    },
  };

  /**
   * @param {Lucid} lucid A configured Lucid instance to use.
   * @param {DatumBuilderLucidV3} datumBuilder A valid V3 DatumBuilder class that will build valid datums.
   */
  constructor(
    public lucid: Lucid,
    public datumBuilder: DatumBuilderLucidV3,
    queryProvider?: QueryProviderSundaeSwap
  ) {
    super();
    this.network = lucid.network === "Mainnet" ? "mainnet" : "preview";
    this.queryProvider =
      queryProvider ?? new QueryProviderSundaeSwap(this.network);

    // Preemptively fetch protocol parameters.
    this.getProtocolParams();
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
  public __getParam<K extends keyof ITxBuilderV3Params>(param: K) {
    return TxBuilderLucidV3.getParam(param, this.network);
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
      const rawResponse =
        await this.queryProvider.getProtocolParamsWithScriptHashes(
          EContractVersion.V3
        );
      this.protocolParams = {
        ...rawResponse,
        blueprint: {
          ...rawResponse.blueprint,
          validators: rawResponse.blueprint.validators.map((data) => ({
            ...data,
            compiledCode: "",
          })),
        },
      };
    }

    return this.protocolParams;
  }

  /**
   * Gets the reference UTxOs based on the transaction data
   * stored in the reference scripts of the protocol parameters
   * using the Lucid provider.
   *
   * @returns {Promise<UTxO[]>}
   */
  public async getAllReferenceUtxos(): Promise<UTxO[]> {
    if (!this.referenceUtxos) {
      const utxos: OutRef[] = [];
      const { references } = await this.getProtocolParams();
      references.forEach(({ txIn }) =>
        utxos.push({ outputIndex: txIn.index, txHash: txIn.hash })
      );
      this.referenceUtxos = await this.lucid.provider.getUtxosByOutRef(utxos);
    }

    return this.referenceUtxos;
  }

  /**
   * Gets the settings UTxOs based on the transaction data
   * stored in the settings scripts of the protocol parameters
   * using the Lucid provider.
   *
   * @returns {Promise<UTxO[]>}
   */
  public async getAllSettingsUtxos(): Promise<UTxO[]> {
    if (!this.settingsUtxos) {
      // Hardcoded for now, will be added to API later.
      this.settingsUtxos = await this.lucid.provider.getUtxosByOutRef([
        {
          outputIndex: 0,
          txHash:
            "387dbd6718ed9218a28c11ea1386c688b4215a47d39610b8b1657bbcdc054e3c",
        },
      ]);
    }

    return this.settingsUtxos;
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
    const {
      blueprint: { validators },
    } = await this.getProtocolParams();
    if (validators.some(({ compiledCode }) => !compiledCode)) {
      this.protocolParams =
        await this.queryProvider.getProtocolParamsWithScripts(
          EContractVersion.V3
        );
    }

    const result = this.protocolParams?.blueprint.validators.find(
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
   * Returns a new Tx instance from Lucid and pre-applies the referral
   * fee payment if a {@link ITxBuilderReferralFee} config is passed in.
   *
   * @param {ITxBuilderReferralFee | undefined} fee The optional referral fee configuration.
   * @returns {Tx}
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

  async mintPool(args: IMintV3PoolConfigArgs) {
    const {
      assetA,
      assetB,
      feeDecay,
      feeSlotEnd,
      feeSlotStart,
      ownerAddress,
      protocolFee,
      referralFee,
    } = new MintV3PoolConfig(args).buildArgs();

    const [userUtxos, { hash: poolPolicyId }, references, settings] =
      await Promise.all([
        this.getUtxosForPoolMint([assetA, assetB]),
        this.getValidatorScript("pool.mint"),
        this.getAllReferenceUtxos(),
        this.getAllSettingsUtxos(),
      ]);

    const {
      inline: mintPoolDatum,
      schema: { identifier, circulatingLp },
    } = this.datumBuilder.buildMintPoolDatum({
      assetA,
      assetB,
      feeDecay,
      feeSlotEnd,
      feeSlotStart,
      protocolFee,
      seedUtxo: userUtxos[0],
    });

    const { inline: mintRedeemerDatum } =
      this.datumBuilder.buildPoolMintRedeemerDatum({
        assetA,
        assetB,
        // The metadata NFT is in the second output.
        metadataOutput: 1n,
        // The pool output is the first output.
        poolOutput: 0n,
      });

    const sortedAssets = SundaeUtils.sortSwapAssetsWithAmounts([
      assetA,
      assetB,
    ]);

    const {
      metadataAdmin: { paymentCredential },
    } = Data.from(settings[0].datum as string, V3Types.SettingsDatum);
    const metadataAddress = C.EnterpriseAddress.new(
      this.network === "preview" ? 0 : 1,
      C.StakeCredential.from_keyhash(
        // @ts-ignore
        C.Ed25519KeyHash.from_hex(paymentCredential.VKeyCredential.bytes)
      )
    )
      .to_address()
      .to_bech32(this.network === "preview" ? "addr_test" : "addr");

    const poolNftNameHex = toUnit(
      poolPolicyId,
      DatumBuilderLucidV3.computePoolNftName(identifier)
    );
    const poolRefNameHex = toUnit(
      poolPolicyId,
      DatumBuilderLucidV3.computePoolRefName(identifier)
    );
    const poolLqNameHex = toUnit(
      poolPolicyId,
      DatumBuilderLucidV3.computePoolLqName(identifier)
    );

    const poolAssets = {
      [poolNftNameHex]: 1n,
      [sortedAssets[1].metadata.assetId.replace(".", "")]:
        sortedAssets[1].amount,
    };

    if (SundaeUtils.isAdaAsset(sortedAssets[0].metadata)) {
      poolAssets["lovelace"] = sortedAssets[0].amount;
    } else {
      poolAssets["lovelace"] = ORDER_DEPOSIT_DEFAULT;
      poolAssets[sortedAssets[0].metadata.assetId.replace(".", "")] =
        sortedAssets[0].amount;
    }

    const tx = this.newTxInstance(referralFee)
      .mintAssets(
        {
          [poolNftNameHex]: 1n,
          [poolRefNameHex]: 1n,
          [poolLqNameHex]: circulatingLp,
        },
        mintRedeemerDatum
      )
      .readFrom([...references, ...settings])
      .collectFrom(userUtxos)
      .payToContract(
        await this.generateScriptAddress("pool.mint"),
        { inline: mintPoolDatum },
        poolAssets
      )
      .payToAddress(metadataAddress, {
        lovelace: 2_000_000n,
        [poolRefNameHex]: 1n,
      })
      .payToAddress(ownerAddress, {
        lovelace: 2_000_000n,
        [poolLqNameHex]: circulatingLp,
      });

    return this.completeTx({
      tx,
      datum: mintPoolDatum,
      referralFee: referralFee?.payment,
      coinSelection: false,
      /**
       * There are some issues with the way Lucid evaluates scripts sometimes,
       * so we just use the Haskell Plutus core engine since we use Blockfrost.
       */
      nativeUplc: false,
    });
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
      await this.generateScriptAddress(
        "order.spend",
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
        script: (await this.getValidatorScript("order.spend")).compiledCode,
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
      await this.generateScriptAddress(
        "order.spend",
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
      await this.generateScriptAddress(
        "order.spend",
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
      await this.generateScriptAddress(
        "order.spend",
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
        address: await this.generateScriptAddress(
          "order.spend",
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
      await this.generateScriptAddress(
        "order.spend",
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
   *
   * @param {string} type
   * @param ownerAddress
   * @returns
   */
  public async generateScriptAddress(
    type: "order.spend" | "pool.mint",
    ownerAddress?: string
  ): Promise<string> {
    const { hash } = await this.getValidatorScript(type);
    const paymentCred = this.lucid.utils.scriptHashToCredential(hash);
    const orderAddress = this.lucid.utils.credentialToAddress(paymentCred);

    if (!ownerAddress) {
      return orderAddress;
    }

    const paymentStakeCred = C.StakeCredential.from_scripthash(
      C.ScriptHash.from_hex(hash)
    );
    const ownerStakeCred =
      ownerAddress &&
      C.Address.from_bech32(ownerAddress).as_base()?.stake_cred();

    if (!ownerStakeCred) {
      return orderAddress;
    }

    const newAddress = C.BaseAddress.new(
      this.network === "mainnet" ? 1 : 0,
      paymentStakeCred,
      ownerStakeCred
    ).to_address();

    return newAddress.to_bech32(
      this.network === "mainnet" ? "addr" : "addr_test"
    );
  }

  /**
   * Retrieves the list of UTXOs associated with the wallet, sorts them first by transaction hash (`txHash`)
   * in ascending order and then by output index (`outputIndex`) in ascending order, and returns the first UTXO
   * in the sorted list. This UTXO is considered as the seed UTXO for pool minting operations.
   *
   * @param {AssetAmount<IAssetAmountMetadata>[]} assets The pool assets being deposited. They will automatically be sorted.
   *
   * @returns {Promise<UTxO>} A promise that resolves to the first UTXO in the sorted list, based on the
   * specified sorting criteria. The UTXO object includes properties such as `txHash` and `outputIndex`.
   * @throws {Error} Throws an error if the retrieval of UTXOs fails or if no UTXOs are available.
   */
  public async getUtxosForPoolMint(
    assets: [
      AssetAmount<IAssetAmountMetadata>,
      AssetAmount<IAssetAmountMetadata>
    ]
  ): Promise<UTxO[]> {
    const utxos = await this.lucid.wallet.getUtxos();
    const sortedUtxos = utxos.sort((a, b) => {
      // Sort by txHash first.
      if (a.txHash < b.txHash) return -1;
      if (a.txHash > b.txHash) return 1;

      // Sort by their index.
      return a.outputIndex - b.outputIndex;
    });

    const seedUtxo = sortedUtxos.shift();
    if (!seedUtxo) {
      throw new Error("Could not find a seed UTXO from the user's wallet.");
    }

    const selectedUtxos: UTxO[] = [seedUtxo];
    const [assetARequirement, assetBRequirement] =
      SundaeUtils.sortSwapAssetsWithAmounts(assets).map((asset) => {
        // We add an additional 4 ADA requirement to the ADA UTXO just to cover min amounts.
        if (SundaeUtils.isAdaAsset(asset.metadata)) {
          return asset.withAmount(asset.amount + 4_000_000n);
        }

        return asset;
      });

    const assetAId = SundaeUtils.isAdaAsset(assetARequirement.metadata)
      ? "lovelace"
      : assetARequirement.metadata.assetId.replace(".", "");
    const assetBId = SundaeUtils.isAdaAsset(assetBRequirement.metadata)
      ? "lovelace"
      : assetBRequirement.metadata.assetId.replace(".", "");

    const checkSelectedUtxosValue = () =>
      selectedUtxos.reduce(
        (total, { assets }) => {
          total[0] += assets[assetAId] ?? 0n;
          total[1] += assets[assetBId] ?? 0n;

          return total;
        },
        [0n, 0n]
      );

    for (const utxo of sortedUtxos) {
      // Add up our currently accumulated value within selected UTXOs.
      const [accumulatedAValue, accumulatedBValue] = checkSelectedUtxosValue();

      // If we have enough value in the selected UTXOs, then break out of the loop.
      if (
        accumulatedAValue >= assetARequirement.amount &&
        accumulatedBValue >= assetBRequirement.amount
      ) {
        break;
      }

      // No required assets, skip.
      if (!accumulatedAValue && !accumulatedBValue) {
        continue;
      }

      // Add UTXO.
      if (
        (accumulatedAValue < assetARequirement.amount &&
          utxo.assets[assetAId]) ||
        (accumulatedBValue < assetBRequirement.amount && utxo.assets[assetBId])
      ) {
        selectedUtxos.push(utxo);
      }
    }

    const [accumulatedAValue, accumulatedBValue] = checkSelectedUtxosValue();

    if (
      accumulatedAValue < assetARequirement.amount ||
      accumulatedBValue < assetBRequirement.amount
    ) {
      console.log(
        utxos,
        selectedUtxos,
        assetARequirement.metadata.assetId,
        assetBRequirement.metadata.assetId
      );
      throw new Error(`
        Could not select enough assets from your wallet to satisfy the pool creation requirements.
        Looking for ${assetARequirement.value.toString()} ${
        SundaeUtils.isAdaAsset(assetARequirement.metadata)
          ? "ADA"
          : Buffer.from(
              assetARequirement.metadata.assetId.split(".")[1],
              "hex"
            ).toString("utf-8")
      },
        and ${assetBRequirement.value.toString()} ${Buffer.from(
        assetBRequirement.metadata.assetId.split(".")[1],
        "hex"
      ).toString("utf-8")}.
      `);
    }

    return selectedUtxos;
  }

  private async completeTx({
    tx,
    datum,
    referralFee,
    deposit,
    scooperFee,
    coinSelection = true,
    nativeUplc = true,
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
          finishedTx = await tx.complete({ coinSelection, nativeUplc });
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
