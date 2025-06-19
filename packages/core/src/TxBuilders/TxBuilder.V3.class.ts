import {
  Blaze,
  TxBuilder as BlazeTx,
  CoinSelector,
  Core,
  Data,
  makeValue,
  Provider,
  Wallet,
} from "@blaze-cardano/sdk";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import type {
  ICancelConfigArgs,
  IComposedTx,
  IDepositConfigArgs,
  IMintV3PoolConfigArgs,
  IOrderRouteSwapArgs,
  IStrategyConfigInputArgs,
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
import { TxBuilderAbstractV3 } from "../Abstracts/TxBuilderAbstract.V3..class.js";
import { CancelConfig } from "../Configs/CancelConfig.class.js";
import { DepositConfig } from "../Configs/DepositConfig.class.js";
import { MintV3PoolConfig } from "../Configs/MintV3PoolConfig.class.js";
import { StrategyConfig } from "../Configs/StrategyConfig.class.js";
import { SwapConfig } from "../Configs/SwapConfig.class.js";
import { WithdrawConfig } from "../Configs/WithdrawConfig.class.js";
import { ZapConfig } from "../Configs/ZapConfig.class.js";
import {
  OrderDatum,
  SettingsDatum,
} from "../DatumBuilders/ContractTypes/Contract.v3.js";
import { DatumBuilderV3 } from "../DatumBuilders/DatumBuilder.V3.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { BlazeHelper } from "../Utilities/BlazeHelper.class.js";
import { SundaeUtils } from "../Utilities/SundaeUtils.class.js";
import {
  ADA_METADATA,
  CANCEL_REDEEMER,
  ORDER_DEPOSIT_DEFAULT,
  ORDER_ROUTE_DEPOSIT_DEFAULT,
  POOL_MIN_ADA,
} from "../constants.js";
import { TxBuilderV1 } from "./TxBuilder.V1.class.js";

/**
 * Object arguments for completing a transaction.
 */
interface ITxBuilderCompleteTxArgs {
  tx: BlazeTx;
  referralFee?: Core.Value;
  datum?: string;
  deposit?: bigint;
  scooperFee?: bigint;
  coinSelection?: boolean;
  nativeUplc?: boolean;
}

/**
 * `TxBuilderBlazeV3` is a class extending `TxBuilder` to support transaction construction
 * for Blaze against the V3 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
 * such as swaps, cancellations, updates, deposits, withdrawals, and zaps.
 *
 * @extends {TxBuilderAbstractV3}
 */
export class TxBuilderV3 extends TxBuilderAbstractV3 {
  datumBuilder: DatumBuilderV3;
  queryProvider: QueryProviderSundaeSwap;
  network: TSupportedNetworks;
  protocolParams: ISundaeProtocolParamsFull | undefined;
  referenceUtxos: Core.TransactionUnspentOutput[] | undefined;
  settingsUtxoDatum: string | undefined;
  validatorScripts: Record<string, ISundaeProtocolValidatorFull> = {};
  maxScopoerFeeOverride?: bigint;
  tracing: boolean = false;

  static MIN_ADA_POOL_MINT_ERROR =
    "You tried to create a pool with less ADA than is required. Try again with more than 2 ADA.";
  private SETTINGS_NFT_NAME = "73657474696e6773";

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
    this.datumBuilder = new DatumBuilderV3(network);
  }

  /**
   * Enables tracing in the Blaze transaction builder.
   *
   * @param {boolean} enable True to enable tracing, false to turn it off. (default: false)
   * @returns {TxBuilderV3}
   */
  public enableTracing(enable: boolean): TxBuilderV3 {
    this.tracing = enable;
    return this;
  }

  /**
   * Retrieves the basic protocol parameters from the SundaeSwap API
   * and fills in a place-holder for the compiled code of any validators.
   *
   * @returns {Promise<ISundaeProtocolParamsFull>}
   */
  public async getProtocolParams(): Promise<ISundaeProtocolParamsFull> {
    if (!this.protocolParams) {
      this.protocolParams =
        await this.queryProvider.getProtocolParamsWithScripts(
          EContractVersion.V3,
        );
    }

    return this.protocolParams;
  }

  /**
   * Gets the reference UTxOs based on the transaction data
   * stored in the reference scripts of the protocol parameters
   * using the Blaze provider.
   *
   * @returns {Promise<Core.TransactionUnspentOutput[]>}
   */
  public async getAllReferenceUtxos(): Promise<
    Core.TransactionUnspentOutput[]
  > {
    if (!this.referenceUtxos) {
      const { references } = await this.getProtocolParams();
      this.referenceUtxos = await this.blaze.provider.resolveUnspentOutputs(
        references.map(({ txIn }) => {
          return new Core.TransactionInput(
            Core.TransactionId(txIn.hash),
            BigInt(txIn.index),
          );
        }),
      );
    }

    return this.referenceUtxos;
  }

  /**
   *
   * @param {string} type The type of reference input to retrieve.
   * @returns {ISundaeProtocolReference}
   */
  public async getReferenceScript(
    type: "order.spend" | "pool.spend",
  ): Promise<ISundaeProtocolReference> {
    const { references } = await this.getProtocolParams();
    const match = references.find(({ key }) => key === type);
    if (!match) {
      throw new Error(`Could not find reference input with type: ${type}`);
    }

    return match;
  }

  /**
   * Gets the settings UTxO.
   *
   * @returns {Promise<Core.TransactionUnspentOutput>}
   */
  public async getSettingsUtxo(): Promise<Core.TransactionUnspentOutput> {
    const { hash } = await this.getValidatorScript("settings.mint");
    return this.blaze.provider.getUnspentOutputByNFT(
      Core.AssetId(`${hash}${this.SETTINGS_NFT_NAME}`),
    );
  }

  /**
   * Gets the setting utxo's datum CBOR.
   *
   * @returns {string}
   */
  public async getSettingsUtxoDatum(): Promise<string> {
    if (!this.settingsUtxoDatum) {
      const instance = await this.getSettingsUtxo();
      this.settingsUtxoDatum = instance
        .output()
        .datum()
        ?.asInlineData()
        ?.toCbor() as string;
    }

    return this.settingsUtxoDatum;
  }

  /**
   * Utility function to get the max scooper fee amount, which is defined
   * in the settings UTXO datum. If no settings UTXO was found, due to a network
   * error or otherwise, we fallback to 1 ADA.
   *
   * @returns {bigint} The maxScooperFee as defined by the settings UTXO.
   */
  public async getMaxScooperFeeAmount(): Promise<bigint> {
    if (this.maxScopoerFeeOverride) {
      return this.maxScopoerFeeOverride;
    }

    const settings = await this.getSettingsUtxoDatum();
    if (!settings) {
      return 1_000_000n;
    }

    const { baseFee, simpleFee } = Data.from(
      Core.PlutusData.fromCbor(Core.HexBlob(settings)),
      SettingsDatum,
    );

    return baseFee + simpleFee;
  }

  /**
   * Sets the max scooper fee override value.
   *
   * @param {bigint} val The value in lovelace.
   * @return {void}
   */
  public setMaxScooperFee(val: bigint): void {
    this.maxScopoerFeeOverride = val;
  }

  /**
   * Resets the max scooper fee to read from the settings UTXO.
   *
   * @return {void}
   */
  public resetMaxScooperFee(): void {
    this.maxScopoerFeeOverride = undefined;
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
   * Returns a new Tx instance from Blaze. Throws an error if not ready.
   * @returns
   */
  newTxInstance(fee?: ITxBuilderReferralFee): BlazeTx {
    const instance = this.blaze.newTransaction();

    if (fee) {
      instance.payAssets(Core.addressFromBech32(fee.destination), fee.payment);

      if (fee?.feeLabel) {
        /**
         * @todo Ensure metadata is correctly attached.
         */
        const data = new Core.AuxiliaryData();
        const map = new Map<bigint, Core.Metadatum>();
        map.set(674n, Core.Metadatum.newText(`${fee.feeLabel}`));
        data.setMetadata(new Core.Metadata(map));
        instance.setAuxiliaryData(data);
      }
    }

    instance.enableTracing(this.tracing);
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
   * @returns {Promise<IComposedTx<BlazeTx, Core.Transaction>>} A completed transaction object.
   *
   * @throws {Error} Throws an error if the transaction fails to build or submit.
   */
  async mintPool(
    mintPoolArgs: IMintV3PoolConfigArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const {
      assetA,
      assetB,
      fees,
      marketOpen,
      ownerAddress,
      referralFee,
      donateToTreasury,
      feeManager,
    } = new MintV3PoolConfig(mintPoolArgs).buildArgs();

    const sortedAssets = SundaeUtils.sortSwapAssetsWithAmounts([
      assetA,
      assetB,
    ]);

    const exoticPair = !SundaeUtils.isAdaAsset(sortedAssets[0].metadata);

    const [userUtxos, { hash: poolPolicyId }, references, settings] =
      await Promise.all([
        this.getUtxosForPoolMint(sortedAssets),
        this.getValidatorScript("pool.mint"),
        this.getAllReferenceUtxos(),
        this.getSettingsUtxo(),
      ]);

    const seedUtxo = {
      outputIndex: Number(userUtxos[0].input().index().toString()),
      txHash: userUtxos[0].input().transactionId(),
    };

    const newPoolIdent = DatumBuilderV3.computePoolId(seedUtxo);

    const nftAssetName = DatumBuilderV3.computePoolNftName(newPoolIdent);
    const poolNftAssetIdHex = `${poolPolicyId + nftAssetName}`;

    const refAssetName = DatumBuilderV3.computePoolRefName(newPoolIdent);
    const poolRefAssetIdHex = `${poolPolicyId + refAssetName}`;

    const poolLqAssetName = DatumBuilderV3.computePoolLqName(newPoolIdent);
    const poolLqAssetIdHex = `${poolPolicyId + poolLqAssetName}`;

    const poolAssets = {
      lovelace: POOL_MIN_ADA,
      [poolNftAssetIdHex]: 1n,
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
      seedUtxo,
      feeManager,
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

    const settingsDatum = await this.getSettingsUtxoDatum();
    if (!settingsDatum) {
      throw new Error("Could not retrieve the datum from the settings UTXO.");
    }

    const {
      metadataAdmin: { paymentCredential, stakeCredential },
      authorizedStakingKeys: [poolStakingCredential],
    } = Data.from(
      Core.PlutusData.fromCbor(Core.HexBlob(settingsDatum)),
      SettingsDatum,
    );
    const metadataAddress = DatumBuilderV3.addressSchemaToBech32(
      { paymentCredential, stakeCredential },
      this.network === "mainnet"
        ? Core.NetworkId.Mainnet
        : Core.NetworkId.Testnet,
    );

    const { blueprint } = await this.getProtocolParams();
    const poolContract = blueprint.validators.find(
      ({ title }) => title === "pool.mint",
    );

    const sundaeStakeAddress = DatumBuilderV3.addressSchemaToBech32(
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
      this.network === "mainnet"
        ? Core.NetworkId.Mainnet
        : Core.NetworkId.Testnet,
    );

    const tx = this.newTxInstance(referralFee);
    const mints = new Map<Core.AssetName, bigint>();
    mints.set(Core.AssetName(nftAssetName), 1n);
    mints.set(Core.AssetName(refAssetName), 1n);
    mints.set(Core.AssetName(poolLqAssetName), circulatingLp);

    [...references, settings].forEach((utxo) => {
      tx.addReferenceInput(
        Core.TransactionUnspentOutput.fromCore(utxo.toCore()),
      );
    });
    userUtxos.forEach((utxo) => tx.addInput(utxo));

    // Mint our assets.
    tx.addMint(
      Core.PolicyId(poolPolicyId),
      mints,
      Core.PlutusData.fromCbor(Core.HexBlob(mintRedeemerDatum)),
    );

    // Lock the pool assets at the pool script.
    tx.lockAssets(
      Core.addressFromBech32(sundaeStakeAddress),
      makeValue(
        poolAssets.lovelace,
        ...Object.entries(poolAssets).filter(([key]) => key !== "lovelace"),
      ),
      Core.PlutusData.fromCbor(Core.HexBlob(mintPoolDatum)),
    );

    // Send the metadata reference NFT to the metadata address.
    const address = Core.addressFromBech32(metadataAddress);
    const type = address.getProps().paymentPart?.type;
    if (type === Core.CredentialType.ScriptHash) {
      tx.lockAssets(
        address,
        makeValue(ORDER_DEPOSIT_DEFAULT, [poolRefAssetIdHex, 1n]),
        Data.void(),
      );
    } else {
      tx.payAssets(
        address,
        makeValue(ORDER_DEPOSIT_DEFAULT, [poolRefAssetIdHex, 1n]),
        Data.void(),
      );
    }

    if (donateToTreasury) {
      const datum = Data.from(
        Core.PlutusData.fromCbor(Core.HexBlob(settingsDatum)),
        SettingsDatum,
      );
      const realTreasuryAddress = DatumBuilderV3.addressSchemaToBech32(
        datum.treasuryAddress,
        this.network === "mainnet"
          ? Core.NetworkId.Mainnet
          : Core.NetworkId.Testnet,
      );

      if (donateToTreasury === 100n) {
        tx.payAssets(
          Core.addressFromBech32(realTreasuryAddress),
          makeValue(ORDER_DEPOSIT_DEFAULT, [poolLqAssetIdHex, circulatingLp]),
          Data.void(),
        );
      } else {
        const donation = (circulatingLp * donateToTreasury) / 100n;
        tx.provideDatum(Data.void()).payAssets(
          Core.addressFromBech32(realTreasuryAddress),
          makeValue(ORDER_DEPOSIT_DEFAULT, [poolLqAssetIdHex, donation]),
          Data.void(),
        );

        tx.payAssets(
          Core.addressFromBech32(ownerAddress),
          makeValue(ORDER_DEPOSIT_DEFAULT, [
            poolLqAssetIdHex,
            circulatingLp - donation,
          ]),
        );
      }
    } else {
      tx.payAssets(
        Core.addressFromBech32(ownerAddress),
        makeValue(ORDER_DEPOSIT_DEFAULT, [poolLqAssetIdHex, circulatingLp]),
      );
    }

    // Add collateral since coin selection is false.
    tx.provideCollateral(userUtxos);

    return this.completeTx({
      tx,
      datum: mintPoolDatum,
      referralFee: referralFee?.payment,
      deposit: ORDER_DEPOSIT_DEFAULT * (exoticPair ? 3n : 2n),
      /**
       * We avoid Blaze's version of coinSelection because we need to ensure
       * that the first input is also the seed input for determining the pool
       * ident.
       */
      coinSelection: false,
      /**
       * There are some issues with the way Blaze evaluates scripts sometimes,
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
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} A promise that resolves to the result of the completed transaction.
   */
  async swap(
    swapArgs: ISwapConfigArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
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
    const v1TxBUilder = new TxBuilderV1(this.blaze);
    const v1Address = await v1TxBUilder
      .getValidatorScript("escrow.spend")
      .then(({ compiledCode }) =>
        Core.addressFromValidator(
          this.network === "mainnet" ? 1 : 0,
          Core.Script.newPlutusV1Script(
            new Core.PlutusV1Script(
              Core.HexBlob.fromBytes(Buffer.from(compiledCode, "hex")),
            ),
          ),
        ).toBech32(),
      );
    const v3Address = await this.generateScriptAddress(
      "order.spend",
      swapArgs?.ownerAddress ?? orderAddresses.DestinationAddress.address,
    );

    // Adjust scooper fee supply based on destination address.
    if (orderAddresses.DestinationAddress.address === v1Address) {
      scooperFee += v1TxBUilder.__getParam("maxScooperFee");
    } else if (orderAddresses.DestinationAddress.address === v3Address) {
      scooperFee += await this.getMaxScooperFeeAmount();
    }

    const isOrderRoute = [v1Address, v3Address].includes(
      orderAddresses.DestinationAddress.address,
    );
    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee,
      orderDeposit: isOrderRoute
        ? ORDER_ROUTE_DEPOSIT_DEFAULT
        : ORDER_DEPOSIT_DEFAULT,
    });

    txInstance.lockAssets(
      Core.addressFromBech32(v3Address),
      makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      ),
      Core.PlutusData.fromCbor(Core.HexBlob(inline)),
    );

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
   * @param {IOrderRouteSwapArgs} args - The arguments for the order route swap.
   * @returns {Promise<IComposedTx<Tx, TxComplete>>} The result of the transaction.
   */
  async orderRouteSwap(
    args: IOrderRouteSwapArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const isSecondSwapV1 = args.swapB.pool.version === EContractVersion.V1;

    const secondSwapBuilder = isSecondSwapV1
      ? new TxBuilderV1(this.blaze)
      : this;
    const secondSwapAddress = isSecondSwapV1
      ? await (secondSwapBuilder as TxBuilderV1)
          .getValidatorScript("escrow.spend")
          .then(({ compiledCode }) =>
            Core.addressFromValidator(
              this.network === "mainnet" ? 1 : 0,
              Core.Script.newPlutusV1Script(
                new Core.PlutusV1Script(Core.HexBlob(compiledCode)),
              ),
            ).toBech32(),
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
      const data = new Core.AuxiliaryData();
      const metadata = new Map<bigint, Core.Metadatum>();
      metadata.set(
        103251n,
        Core.Metadatum.fromCore(
          new Map([
            [
              Buffer.from(datumHash, "hex"),
              SundaeUtils.splitMetadataString(
                secondSwapData.datum as string,
              ).map((v) => Buffer.from(v, "hex")),
            ],
          ]),
        ),
      );
      data.setMetadata(new Core.Metadata(metadata));
      tx.setAuxiliaryData(data);
    }

    return this.completeTx({
      tx,
      datum: datum,
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
    cancelArgs: ICancelConfigArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const { utxo, referralFee } = new CancelConfig(cancelArgs).buildArgs();

    const tx = this.newTxInstance(referralFee);
    const utxosToSpend = await this.blaze.provider.resolveUnspentOutputs([
      new Core.TransactionInput(
        Core.TransactionId(utxo.hash),
        BigInt(utxo.index),
      ),
    ]);

    const utxoToSpend = utxosToSpend?.[0];
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
     * If not, then we can assume it is a normal V1 order, and call accordingly.
     */
    try {
      Data.from(spendingDatum, OrderDatum);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("This is a V1 order! Calling appropriate builder...");
      const v1Builder = new TxBuilderV1(this.blaze);
      return v1Builder.cancel({ ...cancelArgs });
    }

    const cancelReferenceInput = await this.getReferenceScript("order.spend");
    const cancelReadFrom = await this.blaze.provider.resolveUnspentOutputs([
      new Core.TransactionInput(
        Core.TransactionId(cancelReferenceInput.txIn.hash),
        BigInt(cancelReferenceInput.txIn.index),
      ),
    ]);

    let datum: Core.PlutusData | undefined = undefined;
    const datumHash = utxoToSpend.output().datum()?.asDataHash();
    if (datumHash) {
      const resolvedDatum = await this.blaze.provider.resolveDatum(
        Core.DatumHash(datumHash),
      );
      datum = Core.PlutusData.fromCbor(resolvedDatum.toCbor());
    }

    tx.addInput(
      utxoToSpend,
      Core.PlutusData.fromCbor(Core.HexBlob(CANCEL_REDEEMER)),
      datum,
    );
    cancelReadFrom.forEach((utxo) => tx.addReferenceInput(utxo));

    const signerKey = DatumBuilderV3.getSignerKeyFromDatum(
      spendingDatum.toCbor(),
    );

    if (signerKey) {
      tx.addRequiredSigner(Core.Ed25519KeyHashHex(signerKey));
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
   * @returns {PromisePromise<IComposedTx<Tx, TxComplete, Datum | undefined>>} A promise that resolves to the result of the updated transaction.
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

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee: await this.getMaxScooperFeeAmount(),
    });

    cancelTx.lockAssets(
      Core.addressFromBech32(
        await this.generateScriptAddress(
          "order.spend",
          orderAddresses.DestinationAddress.address,
        ),
      ),
      makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      ),
      Core.PlutusData.fromCbor(Core.HexBlob(swapDatum.inline)),
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

  /**
   * Executes a deposit transaction using the provided deposit configuration arguments.
   * The method builds the deposit transaction, including the necessary accumulation of deposit tokens
   * and the required datum, then completes the transaction to add liquidity to a pool.
   *
   * @param {IDepositConfigArgs} depositArgs - The configuration arguments for the deposit.
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} A promise that resolves to the composed transaction object.
   */
  async deposit(
    depositArgs: IDepositConfigArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
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

    tx.lockAssets(
      Core.addressFromBech32(
        await this.generateScriptAddress(
          "order.spend",
          orderAddresses.DestinationAddress.address,
        ),
      ),
      makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      ),
      Core.PlutusData.fromCbor(Core.HexBlob(inline)),
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
    withdrawArgs: Omit<IWithdrawConfigArgs, "withdraw">,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const { suppliedLPAsset, orderAddresses, referralFee } = new WithdrawConfig(
      withdrawArgs,
    ).buildArgs();

    const tx = this.newTxInstance(referralFee);

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedLPAsset],
      scooperFee: await this.getMaxScooperFeeAmount(),
    });

    const ident = SundaeUtils.getIdentFromAssetId(
      suppliedLPAsset.metadata.assetId,
    );

    const { inline } = this.datumBuilder.buildWithdrawDatum({
      ident,
      destinationAddress: orderAddresses.DestinationAddress,
      order: {
        lpToken: suppliedLPAsset,
      },
      scooperFee: await this.getMaxScooperFeeAmount(),
    });

    const assets = makeValue(
      payment.lovelace,
      ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
    );

    tx.lockAssets(
      Core.addressFromBech32(
        await this.generateScriptAddress(
          "order.spend",
          orderAddresses.DestinationAddress.address,
        ),
      ),
      assets,
      Core.PlutusData.fromCbor(Core.HexBlob(inline)),
    );

    return this.completeTx({
      tx,
      datum: inline,
      referralFee: referralFee?.payment,
    });
  }

  async strategy(
    strategyArgs: IStrategyConfigInputArgs,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const {
      suppliedAsset,
      pool,
      destination,
      ownerAddress,
      referralFee,
      authSigner,
      authScript,
    } = new StrategyConfig(strategyArgs).buildArgs();

    const tx = this.newTxInstance(referralFee);

    const v3Address = await this.generateScriptAddress(
      "order.spend",
      ownerAddress,
    );

    const { inline } = this.datumBuilder.buildStrategyDatum({
      destination,
      ident: pool.ident,
      order: {
        signer: authSigner,
        script: authScript,
      },
      ownerAddress,
      scooperFee: await this.getMaxScooperFeeAmount(),
    });

    const payment = SundaeUtils.accumulateSuppliedAssets({
      suppliedAssets: [suppliedAsset],
      scooperFee: await this.getMaxScooperFeeAmount(),
    });

    tx.lockAssets(
      Core.addressFromBech32(v3Address),
      makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      ),
      Core.PlutusData.fromCbor(Core.HexBlob(inline)),
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
      scooperFee: (await this.getMaxScooperFeeAmount()) * 2n,
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
      swapSlippage ?? 0.3,
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
        "A datum hash for a deposit transaction is required to build a chained Zap operation.",
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
          orderAddresses.DestinationAddress.address,
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

    const data = new Core.AuxiliaryData();
    const metadata = new Map<bigint, Core.Metadatum>();
    metadata.set(
      103251n,
      Core.Metadatum.fromCore(
        new Map([
          [
            Buffer.from(depositData.hash, "hex"),
            SundaeUtils.splitMetadataString(depositData.inline as string).map(
              (v) => Buffer.from(v, "hex"),
            ),
          ],
        ]),
      ),
    );
    data.setMetadata(new Core.Metadata(metadata));
    tx.setAuxiliaryData(data);

    tx.lockAssets(
      Core.addressFromBech32(
        await this.generateScriptAddress(
          "order.spend",
          orderAddresses.DestinationAddress.address,
        ),
      ),
      makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      ),
      Core.PlutusData.fromCbor(Core.HexBlob(inline)),
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
    ownerAddress?: string,
  ): Promise<string> {
    const { hash } = await this.getValidatorScript(type);

    const orderAddress = Core.addressFromCredential(
      this.network === "mainnet" ? 1 : 0,
      Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16(hash),
        type: Core.CredentialType.ScriptHash,
      }),
    ).toBech32();

    if (!ownerAddress) {
      return orderAddress;
    }

    const paymentStakeCred = Core.Hash28ByteBase16(hash);
    const ownerStakeCred = ownerAddress
      ? Core.addressFromBech32(ownerAddress).asBase()?.getStakeCredential()
      : undefined;

    if (!ownerStakeCred) {
      return orderAddress;
    }

    const newAddress = new Core.Address({
      type: Core.AddressType.BasePaymentScriptStakeKey,
      paymentPart: {
        hash: paymentStakeCred,
        type: Core.CredentialType.ScriptHash,
      },
      delegationPart: ownerStakeCred,
      networkId: this.network === "mainnet" ? 1 : 0,
    }).toBech32();

    return newAddress;
  }

  /**
   * Retrieves the list of UTXOs associated with the wallet, sorts them first by transaction hash (`txHash`)
   * in ascending order and then by output index (`outputIndex`) in ascending order, and returns them for Blaze
   * to collect from.
   *
   * @returns {Promise<UTxO[]>} A promise that resolves to an array of UTXOs for the transaction. Sorting is required
   * because the first UTXO in the sorted list is the seed (used for generating a unique pool ident, etc).
   * @throws {Error} Throws an error if the retrieval of UTXOs fails or if no UTXOs are available.
   */
  public async getUtxosForPoolMint(
    requiredAssets: [
      AssetAmount<IAssetAmountMetadata>,
      AssetAmount<IAssetAmountMetadata>,
    ],
  ): Promise<Core.TransactionUnspentOutput[]> {
    const utxos = await this.blaze.wallet.getUnspentOutputs();
    const neededValue = new Core.Value(5_000_000n); // Start with a 5 ADA requirement to cover fee and minting costs.
    requiredAssets.forEach((asset) => {
      if (SundaeUtils.isAdaAsset(asset.metadata)) {
        neededValue.setCoin(asset.amount);
      } else {
        neededValue.setMultiasset(
          new Map([[Core.AssetId(asset.metadata.assetId), asset.amount]]),
        );
      }
    });

    const chosenUtxos = CoinSelector.micahsSelector(
      utxos,
      neededValue,
      undefined,
      undefined,
      this.blaze.params.coinsPerUtxoByte,
    );

    const sortedUtxos = [...chosenUtxos.selectedInputs].sort((a, b) => {
      // Sort by txHash first.
      if (a.input().transactionId() < b.input().transactionId()) return -1;
      if (a.input().transactionId() > b.input().transactionId()) return 1;

      // Sort by their index.
      return (
        Number(a.input().index().toString()) -
        Number(b.input().index().toString())
      );
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
  }: ITxBuilderCompleteTxArgs): Promise<
    IComposedTx<BlazeTx, Core.Transaction>
  > {
    const baseFees: Omit<ITxBuilderFees, "cardanoTxFee"> = {
      deposit: new AssetAmount(deposit ?? ORDER_DEPOSIT_DEFAULT, ADA_METADATA),
      scooperFee: new AssetAmount(
        scooperFee ?? (await this.getMaxScooperFeeAmount()),
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
              submit: async () => {
                try {
                  return await that.blaze.submitTransaction(signedTx);
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.log(
                    `Could not submit order. Signed transaction CBOR: ${signedTx
                      .body()
                      .toCbor()}`,
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
