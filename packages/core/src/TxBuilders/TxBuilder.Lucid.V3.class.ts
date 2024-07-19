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

import type {
  ICancelConfigArgs,
  IComposedTx,
  IDepositConfigArgs,
  IMintV3PoolConfigArgs,
  IOrderRouteSwapArgs,
  ISundaeProtocolParamsFull,
  ISundaeProtocolReference,
  ISundaeProtocolValidatorFull,
  ISwapConfigArgs,
  ITxBuilderFees,
  ITxBuilderReferralFee,
  IWithdrawConfigArgs,
  IZapConfigArgs,
  TDepositMixed,
  TSupportedNetworks,
} from "../@types/index.js";
import { EContractVersion, EDatumType, ESwapType } from "../@types/index.js";
import { TxBuilder } from "../Abstracts/TxBuilder.abstract.class.js";
import { CancelConfig } from "../Configs/CancelConfig.class.js";
import { DepositConfig } from "../Configs/DepositConfig.class.js";
import { MintV3PoolConfig } from "../Configs/MintV3PoolConfig.class.js";
import { SwapConfig } from "../Configs/SwapConfig.class.js";
import { WithdrawConfig } from "../Configs/WithdrawConfig.class.js";
import { ZapConfig } from "../Configs/ZapConfig.class.js";
import { DatumBuilderLucidV1 } from "../DatumBuilders/DatumBuilder.Lucid.V1.class.js";
import { DatumBuilderLucidV3 } from "../DatumBuilders/DatumBuilder.Lucid.V3.class.js";
import {
  OrderDatum,
  SettingsDatum,
} from "../DatumBuilders/contracts/contracts.v3.js";
import { V3Types } from "../DatumBuilders/contracts/index.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import {
  ADA_METADATA,
  ORDER_DEPOSIT_DEFAULT,
  ORDER_ROUTE_DEPOSIT_DEFAULT,
  POOL_MIN_ADA,
  VOID_REDEEMER,
} from "../constants.js";
import { TxBuilderLucidV1 } from "./TxBuilder.Lucid.V1.class.js";

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

  static MIN_ADA_POOL_MINT_ERROR =
    "You tried to create a pool with less ADA than is required. Try again with more than 2 ADA.";
  private SETTINGS_NFT_NAME = "73657474696e6773";

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
          EContractVersion.V3
        );
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
   *
   * @param {string} type The type of reference input to retrieve.
   * @returns {ISundaeProtocolReference}
   */
  public async getReferenceScript(
    type: "order.spend" | "pool.spend"
  ): Promise<ISundaeProtocolReference> {
    const { references } = await this.getProtocolParams();
    const match = references.find(({ key }) => key === type);
    if (!match) {
      throw new Error(`Could not find reference input with type: ${type}`);
    }

    return match;
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
      const { hash } = await this.getValidatorScript("settings.mint");
      this.settingsUtxos = [
        await this.lucid.provider.getUtxoByUnit(
          `${hash}${this.SETTINGS_NFT_NAME}`
        ),
      ];
    }

    return this.settingsUtxos;
  }

  /**
   * Utility function to get the max scooper fee amount, which is defined
   * in the settings UTXO datum. If no settings UTXO was found, due to a network
   * error or otherwise, we fallback to 1 ADA.
   *
   * @returns {bigint} The maxScooperFee as defined by the settings UTXO.
   */
  public async getMaxScooperFeeAmount(): Promise<bigint> {
    const [settings] = await this.getAllSettingsUtxos();
    if (!settings) {
      return 1_000_000n;
    }

    const { baseFee, simpleFee } = Data.from(
      settings.datum as string,
      SettingsDatum
    );

    return baseFee + simpleFee;
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

  /**
   * Mints a new liquidity pool on the Cardano blockchain. This method
   * constructs and submits a transaction that includes all the necessary generation
   * of pool NFTs, metadata, pool assets, and initial liquidity tokens,
   *
   * @param {IMintV3PoolConfigArgs} mintPoolArgs - Configuration arguments for minting the pool, including assets,
   * fee parameters, owner address, protocol fee, and referral fee.
   *  - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
   *  - fee: The desired pool fee, denominated out of 10 thousand.
   *  - marketOpen: The POSIX timestamp for when the pool should allow trades (market open).
   *  - ownerAddress: Who the generated LP tokens should be sent to.
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} A completed transaction object.
   *
   * @throws {Error} Throws an error if the transaction fails to build or submit.
   */
  async mintPool(
    mintPoolArgs: IMintV3PoolConfigArgs
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined>> {
    const {
      assetA,
      assetB,
      fees,
      marketOpen,
      ownerAddress,
      referralFee,
      donateToTreasury,
    } = new MintV3PoolConfig(mintPoolArgs).buildArgs();

    const sortedAssets = SundaeUtils.sortSwapAssetsWithAmounts([
      assetA,
      assetB,
    ]);

    const exoticPair = !SundaeUtils.isAdaAsset(sortedAssets[0].metadata);

    const [userUtxos, { hash: poolPolicyId }, references, settings] =
      await Promise.all([
        this.getUtxosForPoolMint(),
        this.getValidatorScript("pool.mint"),
        this.getAllReferenceUtxos(),
        this.getAllSettingsUtxos(),
      ]);

    const newPoolIdent = DatumBuilderLucidV3.computePoolId(userUtxos[0]);

    const poolNftNameHex = toUnit(
      poolPolicyId,
      DatumBuilderLucidV3.computePoolNftName(newPoolIdent)
    );
    const poolRefNameHex = toUnit(
      poolPolicyId,
      DatumBuilderLucidV3.computePoolRefName(newPoolIdent)
    );
    const poolLqNameHex = toUnit(
      poolPolicyId,
      DatumBuilderLucidV3.computePoolLqName(newPoolIdent)
    );

    const poolAssets = {
      lovelace: POOL_MIN_ADA,
      [poolNftNameHex]: 1n,
      [sortedAssets[1].metadata.assetId.replace(".", "")]:
        sortedAssets[1].amount,
    };

    if (exoticPair) {
      // Add non-ada asset.
      poolAssets[sortedAssets[0].metadata.assetId.replace(".", "")] =
        sortedAssets[0].amount;
    } else {
      poolAssets.lovelace += sortedAssets[0].amount;
    }

    const {
      inline: mintPoolDatum,
      schema: { circulatingLp },
    } = this.datumBuilder.buildMintPoolDatum({
      assetA: sortedAssets[0],
      assetB: sortedAssets[1],
      fees,
      marketOpen,
      depositFee: POOL_MIN_ADA,
      seedUtxo: userUtxos[0],
    });

    const { inline: mintRedeemerDatum } =
      this.datumBuilder.buildPoolMintRedeemerDatum({
        assetA: sortedAssets[0],
        assetB: sortedAssets[1],
        // The metadata NFT is in the second output.
        metadataOutput: 1n,
        // The pool output is the first output.
        poolOutput: 0n,
      });

    const {
      metadataAdmin: { paymentCredential, stakeCredential },
      authorizedStakingKeys: [poolStakingCredential],
    } = Data.from(settings[0].datum as string, V3Types.SettingsDatum);
    const metadataAddress = DatumBuilderLucidV3.addressSchemaToBech32(
      { paymentCredential, stakeCredential },
      this.lucid
    );

    const { blueprint } = await this.getProtocolParams();
    const poolContract = blueprint.validators.find(
      ({ title }) => title === "pool.mint"
    );

    const sundaeStakeAddress = DatumBuilderLucidV3.addressSchemaToBech32(
      {
        paymentCredential: {
          SCredential: {
            bytes: poolContract?.hash as string,
          },
        },
        stakeCredential: {
          keyHash: poolStakingCredential,
        },
      },
      this.lucid
    );

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
      .payToContract(sundaeStakeAddress, { inline: mintPoolDatum }, poolAssets)
      .payToAddressWithData(
        metadataAddress,
        { inline: Data.void() },
        {
          lovelace: ORDER_DEPOSIT_DEFAULT,
          [poolRefNameHex]: 1n,
        }
      );

    if (donateToTreasury) {
      const datum = Data.from(settings[0].datum as string, SettingsDatum);
      const realTreasuryAddress = DatumBuilderLucidV3.addressSchemaToBech32(
        datum.treasuryAddress,
        this.lucid
      );

      if (donateToTreasury === 100n) {
        tx.payToContract(realTreasuryAddress, Data.void(), {
          lovelace: ORDER_DEPOSIT_DEFAULT,
          [poolLqNameHex]: circulatingLp,
        });
      } else {
        const donation = (circulatingLp * donateToTreasury) / 100n;
        tx.payToContract(realTreasuryAddress, Data.void(), {
          lovelace: ORDER_DEPOSIT_DEFAULT,
          [poolLqNameHex]: donation,
        });

        tx.payToAddress(ownerAddress, {
          lovelace: ORDER_DEPOSIT_DEFAULT,
          [poolLqNameHex]: circulatingLp - donation,
        });
      }
    } else {
      tx.payToAddress(ownerAddress, {
        lovelace: ORDER_DEPOSIT_DEFAULT,
        [poolLqNameHex]: circulatingLp,
      });
    }

    return this.completeTx({
      tx,
      datum: mintPoolDatum,
      referralFee: referralFee?.payment,
      deposit: ORDER_DEPOSIT_DEFAULT * (exoticPair ? 3n : 2n),
      /**
       * We avoid Lucid's version of coinSelection because we need to ensure
       * that the first input is also the seed input for determining the pool
       * ident.
       */
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
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} A promise that resolves to the result of the completed transaction.
   */
  async swap(
    swapArgs: ISwapConfigArgs
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined>> {
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
      ownerAddress: swapArgs.ownerAddress,
      order: {
        minReceived: minReceivable,
        offered: suppliedAsset,
      },
      scooperFee: await this.getMaxScooperFeeAmount(),
    });

    let scooperFee = await this.getMaxScooperFeeAmount();
    const v1TxBUilder = new TxBuilderLucidV1(
      this.lucid,
      new DatumBuilderLucidV1(this.network)
    );
    const v1Address = await v1TxBUilder
      .getValidatorScript("escrow.spend")
      .then(({ compiledCode }) =>
        this.lucid.utils.validatorToAddress({
          type: "PlutusV1",
          script: compiledCode,
        })
      );
    const v3Address = await this.generateScriptAddress(
      "order.spend",
      swapArgs?.ownerAddress ?? orderAddresses.DestinationAddress.address
    );

    // Adjust scooper fee supply based on destination address.
    if (orderAddresses.DestinationAddress.address === v1Address) {
      scooperFee += v1TxBUilder.__getParam("maxScooperFee");
    } else if (orderAddresses.DestinationAddress.address === v3Address) {
      scooperFee += await this.getMaxScooperFeeAmount();
    }

    const isOrderRoute = [v1Address, v3Address].includes(
      orderAddresses.DestinationAddress.address
    );
    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee,
      orderDeposit: isOrderRoute
        ? ORDER_ROUTE_DEPOSIT_DEFAULT
        : ORDER_DEPOSIT_DEFAULT,
    });

    txInstance.payToContract(v3Address, { inline }, payment);

    return this.completeTx({
      tx: txInstance,
      datum: inline,
      referralFee: referralFee?.payment,
      deposit: isOrderRoute
        ? ORDER_ROUTE_DEPOSIT_DEFAULT
        : ORDER_DEPOSIT_DEFAULT,
    });
  }

  /**
   * Performs an order route swap with the given arguments.
   *
   * @async
   * @param {IOrderRouteSwapArgs} args - The arguments for the order route swap.
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} The result of the transaction.
   */
  async orderRouteSwap(
    args: IOrderRouteSwapArgs
  ): Promise<IComposedTx<Tx, TxComplete>> {
    const isSecondSwapV1 = args.swapB.pool.version === EContractVersion.V1;

    const secondSwapBuilder = isSecondSwapV1
      ? new TxBuilderLucidV1(this.lucid, new DatumBuilderLucidV1(this.network))
      : this;
    const secondSwapAddress = isSecondSwapV1
      ? await (secondSwapBuilder as TxBuilderLucidV1)
          .getValidatorScript("escrow.spend")
          .then(({ compiledCode }) =>
            this.lucid.utils.validatorToAddress({
              type: "PlutusV1",
              script: compiledCode,
            })
          )
      : await this.generateScriptAddress("order.spend", args.ownerAddress);

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
      ownerAddress: args.ownerAddress,
      orderAddresses: {
        ...swapA.orderAddresses,
        DestinationAddress: {
          ...swapA.orderAddresses.DestinationAddress,
          datum: {
            type: isSecondSwapV1 ? EDatumType.HASH : EDatumType.INLINE,
            value: isSecondSwapV1
              ? datumHash
              : (secondSwapData.datum as string),
          },
        },
        AlternateAddress: args.ownerAddress,
      },
      referralFee: mergedReferralFee,
    });

    if (isSecondSwapV1) {
      tx.attachMetadataWithConversion(103251, {
        [`0x${datumHash}`]: SundaeUtils.splitMetadataString(
          secondSwapData.datum as string,
          "0x"
        ),
      });
    }

    return this.completeTx({
      tx,
      datum,
      deposit: ORDER_ROUTE_DEPOSIT_DEFAULT,
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
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} A promise that resolves to the result of the cancel transaction.
   */
  async cancel(
    cancelArgs: ICancelConfigArgs
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined>> {
    const { utxo, referralFee } = new CancelConfig(cancelArgs).buildArgs();

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
     * If not, then we can assume it is a normal V1 order, and call accordingly.
     */
    try {
      Data.from(spendingDatum as string, OrderDatum);
    } catch (e) {
      console.log("This is a V1 order! Calling appropriate builder...");
      const v1Builder = new TxBuilderLucidV1(
        this.lucid,
        new DatumBuilderLucidV1(this.network)
      );
      return v1Builder.cancel({ ...cancelArgs });
    }

    const cancelReferenceInput = await this.getReferenceScript("order.spend");
    const cancelReadFrom = await this.lucid.provider.getUtxosByOutRef([
      {
        outputIndex: cancelReferenceInput.txIn.index,
        txHash: cancelReferenceInput.txIn.hash,
      },
    ]);

    tx.collectFrom(utxosToSpend, VOID_REDEEMER).readFrom(cancelReadFrom);

    const signerKey = DatumBuilderLucidV3.getSignerKeyFromDatum(spendingDatum);
    if (signerKey) {
      tx.addSignerKey(signerKey);
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
   * @returns {PromisePromise<IComposedTx<Tx, TxComplete, Datum | undefined>>} A promise that resolves to the result of the updated transaction.
   */
  async update({
    cancelArgs,
    swapArgs,
  }: {
    cancelArgs: ICancelConfigArgs;
    swapArgs: ISwapConfigArgs;
  }): Promise<IComposedTx<Tx, TxComplete, Datum | undefined>> {
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
      scooperFee: await this.getMaxScooperFeeAmount(),
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
        scooperFee: await this.getMaxScooperFeeAmount(),
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

  /**
   * Executes a deposit transaction using the provided deposit configuration arguments.
   * The method builds the deposit transaction, including the necessary accumulation of deposit tokens
   * and the required datum, then completes the transaction to add liquidity to a pool.
   *
   * @param {IDepositConfigArgs} depositArgs - The configuration arguments for the deposit.
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} A promise that resolves to the composed transaction object.
   */
  async deposit(
    depositArgs: IDepositConfigArgs
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined>> {
    const { suppliedAssets, pool, orderAddresses, referralFee } =
      new DepositConfig(depositArgs).buildArgs();

    const tx = this.newTxInstance(referralFee);

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets,
      scooperFee: await this.getMaxScooperFeeAmount(),
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
      scooperFee: await this.getMaxScooperFeeAmount(),
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
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} A promise that resolves to the composed transaction object.
   */
  async withdraw(
    withdrawArgs: IWithdrawConfigArgs
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined>> {
    const { suppliedLPAsset, pool, orderAddresses, referralFee } =
      new WithdrawConfig(withdrawArgs).buildArgs();

    const tx = this.newTxInstance(referralFee);

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedLPAsset],
      scooperFee: await this.getMaxScooperFeeAmount(),
    });

    const { inline } = this.datumBuilder.buildWithdrawDatum({
      ident: pool.ident,
      destinationAddress: orderAddresses.DestinationAddress,
      order: {
        lpToken: suppliedLPAsset,
      },
      scooperFee: await this.getMaxScooperFeeAmount(),
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
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} A promise that resolves to the composed transaction object resulting from the zap operation.
   */
  async zap(
    zapArgs: Omit<IZapConfigArgs, "zapDirection">
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined>> {
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
      scooperFee: (await this.getMaxScooperFeeAmount()) * 2n,
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
      scooperFee: await this.getMaxScooperFeeAmount(),
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
      scooperFee: await this.getMaxScooperFeeAmount(),
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
      scooperFee: (await this.getMaxScooperFeeAmount()) * 2n,
      referralFee: referralFee?.payment,
    });
  }

  /**
   * Merges the user's staking key to the contract payment address if present.
   *
   * @param {string} type
   * @param ownerAddress
   * @returns {Promise<string>} The generated Bech32 address.
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
   * in ascending order and then by output index (`outputIndex`) in ascending order, and returns them for Lucid
   * to collect from.
   *
   * @returns {Promise<UTxO[]>} A promise that resolves to an array of UTXOs for the transaction. Sorting is required
   * because the first UTXO in the sorted list is the seed (used for generating a unique pool ident, etc).
   * @throws {Error} Throws an error if the retrieval of UTXOs fails or if no UTXOs are available.
   */
  public async getUtxosForPoolMint(): Promise<UTxO[]> {
    const utxos = await this.lucid.wallet.getUtxos();
    const sortedUtxos = utxos.sort((a, b) => {
      // Sort by txHash first.
      if (a.txHash < b.txHash) return -1;
      if (a.txHash > b.txHash) return 1;

      // Sort by their index.
      return a.outputIndex - b.outputIndex;
    });

    return sortedUtxos;
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
        scooperFee ?? (await this.getMaxScooperFeeAmount()),
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
