import {
  Blaze,
  TxBuilder as BlazeTx,
  Core,
  Data,
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
import { TxBuilderV1 } from "../Abstracts/TxBuilderV1.abstract.class.js";
import { CancelConfig } from "../Configs/CancelConfig.class.js";
import { DepositConfig } from "../Configs/DepositConfig.class.js";
import { SwapConfig } from "../Configs/SwapConfig.class.js";
import { WithdrawConfig } from "../Configs/WithdrawConfig.class.js";
import { ZapConfig } from "../Configs/ZapConfig.class.js";
import { OrderDatum as V3OrderDatum } from "../DatumBuilders/ContractTypes/Contract.Blaze.v3.js";
import { DatumBuilderBlazeV1 } from "../DatumBuilders/DatumBuilder.Blaze.V1.class.js";
import { DatumBuilderBlazeV3 } from "../DatumBuilders/DatumBuilder.Blaze.V3.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { BlazeHelper } from "../Utilities/BlazeHelper.class.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import {
  ADA_METADATA,
  CANCEL_REDEEMER,
  ORDER_DEPOSIT_DEFAULT,
} from "../constants.js";
import { TxBuilderBlazeV3 } from "./TxBuilder.Blaze.V3.class.js";

/**
 * Object arguments for completing a transaction.
 */
export interface ITxBuilderBlazeCompleteTxArgs {
  tx: BlazeTx;
  referralFee?: AssetAmount<IAssetAmountMetadata>;
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
 * the V3 contracts (it is recommended to utilize V3 contracts if possible: {@link Blaze.TxBuilderBlazeV3}).
 *
 * @extends {TxBuilderV1}
 */
export class TxBuilderBlazeV1 extends TxBuilderV1 {
  queryProvider: QueryProviderSundaeSwap;
  network: TSupportedNetworks;
  protocolParams: ISundaeProtocolParamsFull | undefined;
  datumBuilder: DatumBuilderBlazeV1;

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
   * @param {TSupportedNetworks} network The network id to use when building the transaction.
   */
  constructor(
    public blaze: Blaze<Provider, Wallet>,
    network: TSupportedNetworks,
    queryProvider?: QueryProviderSundaeSwap,
  ) {
    super();
    this.network = network;
    this.queryProvider = queryProvider ?? new QueryProviderSundaeSwap(network);
    this.datumBuilder = new DatumBuilderBlazeV1(network);

    if (this.network === "preview") {
      this.blaze.params.costModels.set(
        Core.PlutusLanguageVersion.V1,
        Core.CostModel.newPlutusV1([
          100788, 420, 1, 1, 1000, 173, 0, 1, 1000, 59957, 4, 1, 11183, 32,
          201305, 8356, 4, 16000, 100, 16000, 100, 16000, 100, 16000, 100,
          16000, 100, 16000, 100, 100, 100, 16000, 100, 94375, 32, 132994, 32,
          61462, 4, 72010, 178, 0, 1, 22151, 32, 91189, 769, 4, 2, 85848,
          228465, 122, 0, 1, 1, 1000, 42921, 4, 2, 24548, 29498, 38, 1, 898148,
          27279, 1, 51775, 558, 1, 39184, 1000, 60594, 1, 141895, 32, 83150, 32,
          15299, 32, 76049, 1, 13169, 4, 22100, 10, 28999, 74, 1, 28999, 74, 1,
          43285, 552, 1, 44749, 541, 1, 33852, 32, 68246, 32, 72362, 32, 7243,
          32, 7391, 32, 11546, 32, 85848, 228465, 122, 0, 1, 1, 90434, 519, 0,
          1, 74433, 32, 85848, 228465, 122, 0, 1, 1, 85848, 228465, 122, 0, 1,
          1, 270652, 22588, 4, 1457325, 64566, 4, 20467, 1, 4, 0, 141992, 32,
          100788, 420, 1, 1, 81663, 32, 59498, 32, 20142, 32, 24588, 32, 20744,
          32, 25933, 32, 24623, 32, 53384111, 14333, 10,
        ]).costs(),
      );
      this.blaze.params.costModels.set(
        Core.PlutusLanguageVersion.V2,
        Core.CostModel.newPlutusV2([
          100788, 420, 1, 1, 1000, 173, 0, 1, 1000, 59957, 4, 1, 11183, 32,
          201305, 8356, 4, 16000, 100, 16000, 100, 16000, 100, 16000, 100,
          16000, 100, 16000, 100, 100, 100, 16000, 100, 94375, 32, 132994, 32,
          61462, 4, 72010, 178, 0, 1, 22151, 32, 91189, 769, 4, 2, 85848,
          228465, 122, 0, 1, 1, 1000, 42921, 4, 2, 24548, 29498, 38, 1, 898148,
          27279, 1, 51775, 558, 1, 39184, 1000, 60594, 1, 141895, 32, 83150, 32,
          15299, 32, 76049, 1, 13169, 4, 22100, 10, 28999, 74, 1, 28999, 74, 1,
          43285, 552, 1, 44749, 541, 1, 33852, 32, 68246, 32, 72362, 32, 7243,
          32, 7391, 32, 11546, 32, 85848, 228465, 122, 0, 1, 1, 90434, 519, 0,
          1, 74433, 32, 85848, 228465, 122, 0, 1, 1, 85848, 228465, 122, 0, 1,
          1, 955506, 213312, 0, 2, 270652, 22588, 4, 1457325, 64566, 4, 20467,
          1, 4, 0, 141992, 32, 100788, 420, 1, 1, 81663, 32, 59498, 32, 20142,
          32, 24588, 32, 20744, 32, 25933, 32, 24623, 32, 43053543, 10,
          53384111, 14333, 10, 43574283, 26308, 10,
        ]).costs(),
      );
      this.blaze.params.costModels.delete(
        Core.PlutusLanguageVersion.V3,
        // Core.CostModel.newPlutusV3([
        //   100788, 420, 1, 1, 1000, 173, 0, 1, 1000, 59957, 4, 1, 11183, 32,
        //   201305, 8356, 4, 16000, 100, 16000, 100, 16000, 100, 16000, 100,
        //   16000, 100, 16000, 100, 100, 100, 16000, 100, 94375, 32, 132994, 32,
        //   61462, 4, 72010, 178, 0, 1, 22151, 32, 91189, 769, 4, 2, 85848,
        //   123203, 7305, -900, 1716, 549, 57, 85848, 0, 1, 1, 1000, 42921, 4, 2,
        //   24548, 29498, 38, 1, 898148, 27279, 1, 51775, 558, 1, 39184, 1000,
        //   60594, 1, 141895, 32, 83150, 32, 15299, 32, 76049, 1, 13169, 4, 22100,
        //   10, 28999, 74, 1, 28999, 74, 1, 43285, 552, 1, 44749, 541, 1, 33852,
        //   32, 68246, 32, 72362, 32, 7243, 32, 7391, 32, 11546, 32, 85848,
        //   123203, 7305, -900, 1716, 549, 57, 85848, 0, 1, 90434, 519, 0, 1,
        //   74433, 32, 85848, 123203, 7305, -900, 1716, 549, 57, 85848, 0, 1, 1,
        //   85848, 123203, 7305, -900, 1716, 549, 57, 85848, 0, 1, 955506, 213312,
        //   0, 2, 270652, 22588, 4, 1457325, 64566, 4, 20467, 1, 4, 0, 141992, 32,
        //   100788, 420, 1, 1, 81663, 32, 59498, 32, 20142, 32, 24588, 32, 20744,
        //   32, 25933, 32, 24623, 32, 43053543, 10, 53384111, 14333, 10, 43574283,
        //   26308, 10, 16000, 100, 16000, 100, 962335, 18, 2780678, 6, 442008, 1,
        //   52538055, 3756, 18, 267929, 18, 76433006, 8868, 18, 52948122, 18,
        //   1995836, 36, 3227919, 12, 901022, 1, 166917843, 4307, 36, 284546, 36,
        //   158221314, 26549, 36, 74698472, 36, 333849714, 1, 254006273, 72,
        //   2174038, 72, 2261318, 64571, 4, 207616, 8310, 4, 1293828, 28716, 63,
        //   0, 1, 1006041, 43623, 251, 0, 1,
        // ]).costs()
      );
    }
  }

  /**
   * Retrieves the basic protocol parameters from the SundaeSwap API
   * and fills in a place-holder for the compiled code of any validators.
   *
   * This is to keep things lean until we really need to attach a validator,
   * in which case, a subsequent method call to {@link TxBuilderBlazeV3#getValidatorScript}
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
    return TxBuilderBlazeV1.PARAMS[network][param];
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
    return TxBuilderBlazeV1.getParam(param, this.network);
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

    return instance;
  }

  /**
   * Helper function to attache referral fees to a tx instance.
   *
   * @param instance Blaze TxBuilder instance.
   * @param fee The referral fees to add.
   */
  private attachReferralFees(instance: BlazeTx, fee: ITxBuilderReferralFee) {
    const tokenMap = new Map<Core.AssetId, bigint>();
    const payment: Core.Value = new Core.Value(0n, tokenMap);
    if (SundaeUtils.isAdaAsset(fee.payment.metadata)) {
      payment.setCoin(fee.payment.amount);
      instance.payLovelace(
        Core.addressFromBech32(fee.destination),
        fee.payment.amount,
      );
    } else {
      tokenMap.set(
        Core.AssetId(fee.payment.metadata.assetId),
        fee.payment.amount,
      );
      instance.payAssets(Core.addressFromBech32(fee.destination), payment);
    }

    if (fee?.feeLabel) {
      /**
       * @todo Ensure metadata is correctly attached.
       */
      const data = new Core.AuxiliaryData();
      const map = new Map<bigint, Core.Metadatum>();
      map.set(
        674n,
        Core.Metadatum.fromCore(
          Core.Metadatum.newText(
            `${fee.feeLabel}: ${fee.payment.value.toString()} ${
              !SundaeUtils.isAdaAsset(fee.payment.metadata)
                ? Buffer.from(
                    fee.payment.metadata.assetId.split(".")[1],
                    "hex",
                  ).toString("utf-8")
                : "ADA"
            }`,
          ).toCore(),
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
      scooperFee: this.__getParam("maxScooperFee"),
    });

    let scooperFee = this.__getParam("maxScooperFee");
    const v3TxBuilder = new TxBuilderBlazeV3(this.blaze, this.network);

    const v3Address = await v3TxBuilder.generateScriptAddress(
      "order.spend",
      swapArgs.ownerAddress ||
        swapArgs.orderAddresses.DestinationAddress.address,
    );

    const { compiledCode } = await this.getValidatorScript("escrow.spend");
    const scriptAddress = Core.addressFromValidator(
      this.network === "mainnet" ? 1 : 0,
      Core.Script.newPlutusV1Script(
        new Core.PlutusV1Script(
          Core.HexBlob.fromBytes(Buffer.from(compiledCode, "hex")),
        ),
      ),
    ).toBech32();

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

    const newPayment = makeValue(
      payment.lovelace,
      ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
    );

    const datum = Core.DatumHash(Core.HexBlob(hash));
    const script = Core.addressFromBech32(scriptAddress);

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
    const isSecondSwapV3 = args.swapB.pool.version === EContractVersion.V3;

    const secondSwapBuilder = isSecondSwapV3
      ? new TxBuilderBlazeV3(this.blaze, this.network)
      : this;
    const secondSwapAddress = isSecondSwapV3
      ? await (secondSwapBuilder as TxBuilderBlazeV3).generateScriptAddress(
          "order.spend",
          args.ownerAddress,
        )
      : await this.getValidatorScript("escrow.spend").then(({ compiledCode }) =>
          Core.addressFromValidator(
            this.network === "mainnet" ? 1 : 0,
            Core.Script.newPlutusV1Script(
              new Core.PlutusV1Script(
                Core.HexBlob.fromBytes(Buffer.from(compiledCode, "hex")),
              ),
            ),
          ).toBech32(),
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
    const { utxo, referralFee, ownerAddress } = new CancelConfig(
      cancelArgs,
    ).buildArgs();

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
      Data.from(spendingDatum, V3OrderDatum);
      console.log("This is a V3 order! Calling appropriate builder...");
      const v3Builder = new TxBuilderBlazeV3(this.blaze, this.network);
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
    const details = Core.Address.fromBech32(ownerAddress);
    const paymentCred = details.asBase()?.getPaymentCredential().hash;
    const stakingCred = details.asBase()?.getStakeCredential().hash;

    if (paymentCred && spendingDatum.toCbor().includes(paymentCred)) {
      tx.addRequiredSigner(Core.Ed25519KeyHashHex(paymentCred));
    }

    if (stakingCred && spendingDatum.toCbor().includes(stakingCred)) {
      tx.addRequiredSigner(Core.Ed25519KeyHashHex(stakingCred));
    }

    tx.setMinimumFee(310_000n);

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
      cancelTx.payAssets(
        Core.addressFromBech32(swapArgs.referralFee.destination),
        SundaeUtils.isAdaAsset(swapArgs.referralFee.payment.metadata)
          ? makeValue(swapArgs.referralFee.payment.amount)
          : makeValue(ORDER_DEPOSIT_DEFAULT, [
              swapArgs.referralFee.payment.metadata.assetId,
              swapArgs.referralFee.payment.amount,
            ]),
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
    const finalTx = this.blaze.newTransaction();
    let totalScooper = 0n;
    let totalDeposit = 0n;
    const totalReferralFees = new AssetAmount(0n, ADA_METADATA);
    const metadataDatums = new Core.MetadatumMap();
    const v3TxBuilderInstance = new TxBuilderBlazeV3(
      this.blaze,
      this.network,
      this.queryProvider,
    );
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

    const yfRefInputs =
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
      yfRefInputs &&
      existingPositionsData &&
      existingPositionsData.length > 0
    ) {
      yfRefInputs.forEach((input) => finalTx.addReferenceInput(input));
      existingPositionsData.forEach((input) => {
        finalTx.addInput(input, Data.void());
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

      yieldFarming.migrations.map(({ withdrawPool, depositPool }) => {
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
      withdrawArgs.referralFee?.payment &&
        totalReferralFees.add(withdrawArgs.referralFee.payment);

      const [coinA, coinB] = getTokensForLp(
        withdrawArgs.suppliedLPAsset.amount,
        withdrawConfig.pool.liquidity.aReserve,
        withdrawConfig.pool.liquidity.bReserve,
        withdrawConfig.pool.liquidity.lpTotal,
      );

      const v3DatumBuilder = new DatumBuilderBlazeV3(this.network);
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

      const signerKey = BlazeHelper.getAddressHashes(
        yieldFarming.ownerAddress.address,
      );

      finalTx.addRequiredSigner(
        Core.Ed25519KeyHashHex(signerKey.paymentCredentials),
      );

      if (signerKey?.stakeCredentials) {
        finalTx.addRequiredSigner(
          Core.Ed25519KeyHashHex(signerKey.stakeCredentials),
        );
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

  private async completeTx({
    tx,
    datum,
    referralFee,
    deposit,
    scooperFee,
  }: ITxBuilderBlazeCompleteTxArgs): Promise<
    IComposedTx<BlazeTx, Core.Transaction>
  > {
    const baseFees: Omit<ITxBuilderFees, "cardanoTxFee"> = {
      deposit: new AssetAmount(deposit ?? ORDER_DEPOSIT_DEFAULT, ADA_METADATA),
      scooperFee: new AssetAmount(
        scooperFee ?? this.__getParam("maxScooperFee"),
        ADA_METADATA,
      ),
      referral: referralFee,
    };

    let finishedTx: Core.Transaction | undefined;
    const that = this;

    const thisTx: IComposedTx<BlazeTx, Core.Transaction> = {
      tx,
      datum,
      fees: baseFees,
      async build() {
        if (!finishedTx) {
          finishedTx = await tx.complete();
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
