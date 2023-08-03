import {
  Lucid,
  Tx,
  WalletApi,
  Blockfrost,
  Provider,
  Network,
  C,
  getAddressDetails,
  Datum,
  Assets,
} from "lucid-cardano";
import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";

import {
  IQueryProviderClass,
  TSupportedNetworks,
  ITxBuilderBaseOptions,
  ITxBuilderTx,
  ITxBuilderFees,
  DepositMixed,
  ITxBuilderReferralFee,
  ICalculatedReferralFee,
} from "../../../@types";
import { TxBuilder } from "../../Abstracts/TxBuilder.abstract.class";
import { Utils } from "../../Utils.class";
import { DatumBuilderLucid } from "../DatumBuilders/DatumBuilder.Lucid.class";
import { ADA_ASSET_DECIMAL, ADA_ASSET_ID } from "../../../lib/constants";
import { SwapConfig } from "../../Configs/SwapConfig.class";
import { CancelConfig } from "../../Configs/CancelConfig.class";
import { ZapConfig } from "../../Configs/ZapConfig.class";
import { WithdrawConfig } from "../../Configs/WithdrawConfig.class";
import { DepositConfig } from "../../Configs/DepositConfig.class";
import { FreezerConfig } from "../../Configs/FreezerConfig.class";
import { Transaction } from "../../Transaction.class";
import { LucidHelper } from "../LucidHelper.class";

/**
 * Options interface for the {@link TxBuilderLucid} class.
 *
 * @group Extensions
 */
export interface ITxBuilderLucidOptions extends ITxBuilderBaseOptions {
  /** The provider type used by Lucid. Currently only supports Blockfrost. */
  providerType?: "blockfrost";
  /** The chosen provider options object to pass to Lucid. */
  blockfrost?: {
    url: string;
    apiKey: string;
  };
}

/**
 * Object arguments for completing a transaction.
 */
interface ITxBuilderLucidCompleteTxArgs {
  tx: Transaction<Tx>;
  referralFee?: AssetAmount<IAssetAmountMetadata>;
  datum?: string;
  deposit?: bigint;
  scooperFee?: bigint;
  coinSelection?: boolean;
}

/**
 * Building a TxBuilder is fairly simple, but depends on the library that the underlying tooling uses. In this case,
 * you would build this TxBuilder like this:
 *
 * @example
 * ```ts
 * const builder = new TxBuilderLucid(
 *  {
 *    provider: "blockfrost";
 *    blockfrost: {
 *      url: <base_api_url>,
 *      apiKey: <base_api_key>,
 *    }
 *  },
 *  new ProviderSundaeSwap("preview")
 * );
 * ```
 *
 * @group Extensions
 */
export class TxBuilderLucid extends TxBuilder<
  ITxBuilderLucidOptions,
  Lucid,
  Tx
> {
  tx?: Tx;

  /**
   * @param options The main option for instantiating the class.
   * @param query A valid Query Provider class that will do the lookups.
   */
  constructor(options: ITxBuilderLucidOptions, query: IQueryProviderClass) {
    super(query, options);
    switch (this.options?.providerType) {
      case "blockfrost":
        if (!this.options?.blockfrost) {
          throw new Error(
            "When using Blockfrost as a Lucid provider, you must supply a `blockfrost` parameter to your config!"
          );
        }
    }

    // Connect the wallet.
    this.initWallet().catch((e) => console.log(e));
  }

  /**
   * Initializes a Lucid instance with the
   */
  private async initWallet() {
    if (this.wallet) {
      return;
    }

    const { providerType, blockfrost } = this.options;
    let ThisProvider: Provider | undefined;
    switch (providerType) {
      case "blockfrost":
        if (!blockfrost) {
          throw new Error(
            "Must provide a Blockfrost object when choosing it as a Provider for Lucid."
          );
        }

        ThisProvider = new Blockfrost(blockfrost.url, blockfrost.apiKey);
    }

    const walletApi: WalletApi = (await window.cardano[
      this.options.wallet
    ].enable()) as WalletApi;

    const instance = await Lucid.new(
      ThisProvider,
      this._conformNetwork(this.options.network)
    );
    const instanceWithWallet = instance.selectWallet(walletApi);
    this.wallet = instanceWithWallet;
  }

  /**
   * Returns a new Tx instance from Lucid. Throws an error if not ready.
   * @returns
   */
  async newTxInstance(fee?: ICalculatedReferralFee): Promise<Transaction<Tx>> {
    await this.initWallet();
    if (!this.wallet) {
      this._throwWalletNotConnected();
    }

    const instance = new Transaction<Tx>(this, this.wallet.newTx());

    if (fee) {
      const payment: Assets = {};
      payment[
        fee.payment.metadata.assetId === ""
          ? "lovelace"
          : fee.payment.metadata.assetId
      ] = fee.payment.amount;
      instance.tx.payToAddress(fee.destination, payment);

      if (fee.label) {
        instance.tx.attachMetadataWithConversion(
          674,
          `${fee.label}: ${fee.payment.value.toString()} ${
            fee.payment.metadata.assetId !== ""
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
   * Builds a valid transaction for the V2 Yield Farming contract
   * that allows a user to add or update staking positions.
   * @param freezerConfig
   * @returns
   */
  async buildFreezerTx(freezerConfig: FreezerConfig) {
    const {
      existingPositions,
      lockedValues,
      delegation,
      ownerAddress,
      referralFee,
    } = freezerConfig.buildArgs();

    const calculatedFee =
      referralFee &&
      TxBuilder.calculateReferralFee(
        referralFee,
        lockedValues.reduce((total, curr) => {
          if (curr.metadata.assetId === total.metadata.assetId) {
            return total.add(curr);
          }

          return total;
        }, new AssetAmount(0n, referralFee?.minimumAmount.metadata))
      );
    const txInstance = await this.newTxInstance(calculatedFee);

    const {
      FREEZER_REFERENCE_INPUT,
      FREEZER_PAYMENT_SCRIPTHASH,
      FREEZER_STAKE_KEYHASH,
    } = Utils.getParams(this.options.network);

    if (!this.wallet?.provider) {
      throw new Error("A provider is required to lookup position data!");
    }

    const [referenceInput, existingPositionData] = await Promise.all([
      this.wallet.provider.getUtxosByOutRef([
        {
          txHash: FREEZER_REFERENCE_INPUT.split("#")[0],
          outputIndex: Number(FREEZER_REFERENCE_INPUT.split("#")[1]),
        },
      ]),
      (() =>
        existingPositions &&
        this.wallet.provider.getUtxosByOutRef(
          existingPositions.map(({ hash, index }) => ({
            outputIndex: index,
            txHash: hash,
          }))
        ))(),
    ]);

    if (!referenceInput?.length) {
      throw new Error(
        "Could not fetch valid UTXO from Blockfrost based on the the Freezer's reference input. Please check the Utils class parameters."
      );
    }

    const minAda = this.options.minLockAda as bigint; // It gets set as a default parameter if undefined.
    const payment: Assets = {
      lovelace: 0n,
    };

    lockedValues.forEach(({ amount, metadata }) => {
      if (metadata?.assetId === ADA_ASSET_ID) {
        payment.lovelace += amount;
      } else {
        const assetIdRef = metadata?.assetId?.replace(".", "");
        if (!payment[assetIdRef]) {
          payment[assetIdRef] = amount;
        } else {
          payment[assetIdRef] += amount;
        }
      }
    });

    // Deduct the minimum amount we started with if we've supplied at least that much.
    if (payment.lovelace < minAda) {
      payment.lovelace = minAda;
    }

    const contractAddress = this.wallet?.utils.credentialToAddress(
      {
        hash: FREEZER_PAYMENT_SCRIPTHASH,
        type: "Script",
      },
      {
        hash: FREEZER_STAKE_KEYHASH,
        type: "Key",
      }
    );

    if (!contractAddress) {
      throw new Error("Could not generate a valid contract address.");
    }

    const signerKey = LucidHelper.getAddressHashes(ownerAddress);

    txInstance
      .get()
      .readFrom(referenceInput)
      .addSignerKey(signerKey?.paymentCredentials);

    if (signerKey?.stakeCredentials) {
      txInstance.get().addSignerKey(signerKey?.stakeCredentials);
    }

    if (existingPositionData) {
      txInstance
        .get()
        .collectFrom(existingPositionData, Utils.getVoidRedeemer());
    }

    if (delegation && lockedValues?.length > 0) {
      const datumBuilder = new DatumBuilderLucid(this.options.network);
      const { cbor } = datumBuilder.buildLockDatum({
        address: ownerAddress,
        delegation,
      });

      txInstance
        .get()
        .payToContract(contractAddress, { inline: cbor }, payment);
      return this.completeTx({
        tx: txInstance,
        datum: cbor,
        deposit: this.options.minLockAda,
        scooperFee: 0n,
        referralFee: calculatedFee?.payment,
      });
    } else {
      return this.completeTx({
        tx: txInstance,
        datum: undefined,
        deposit: 0n,
        scooperFee: 0n,
        referralFee: calculatedFee?.payment,
      });
    }
  }

  async buildSwapTx(swapConfig: SwapConfig) {
    const {
      pool: { ident, assetA, assetB },
      orderAddresses,
      suppliedAsset,
      minReceivable,
      referralFee,
    } = swapConfig.buildArgs();

    const calculatedFee =
      referralFee && TxBuilder.calculateReferralFee(referralFee, suppliedAsset);
    const txInstance = await this.newTxInstance(calculatedFee);

    const { ESCROW_ADDRESS } = this.getParams();

    const datumBuilder = new DatumBuilderLucid(this.options.network);
    const { cbor } = datumBuilder.buildSwapDatum({
      ident,
      swap: {
        SuppliedCoin: Utils.getAssetSwapDirection(suppliedAsset.metadata, [
          assetA,
          assetB,
        ]),
        MinimumReceivable: minReceivable,
      },
      orderAddresses,
      fundedAsset: suppliedAsset,
    });

    const payment = Utils.accumulateSuppliedAssets(
      [suppliedAsset],
      this.options.network
    );

    txInstance.get().payToContract(ESCROW_ADDRESS, cbor, payment);
    return this.completeTx({
      tx: txInstance,
      datum: cbor,
      referralFee: calculatedFee?.payment,
    });
  }

  /**
   * Updates an open order by spending the UTXO back into the smart contract
   * with an updated swap datum.
   */
  async buildUpdateSwapTx({
    cancelConfig,
    swapConfig,
  }: {
    cancelConfig: CancelConfig;
    swapConfig: SwapConfig;
  }) {
    const {
      tx: cancelTx,
      fees: { referral: cancelReferralFee },
    } = await this.buildCancelTx(cancelConfig);
    const {
      datum,
      fees: { referral: swapReferralFee },
    } = await this.buildSwapTx(swapConfig);
    const { ESCROW_ADDRESS } = this.getParams();

    const { suppliedAsset, referralFee } = swapConfig.buildArgs();

    const payment = Utils.accumulateSuppliedAssets(
      [suppliedAsset],
      this.options.network
    );

    if (!datum) {
      throw new Error("Swap datum is required.");
    }

    const accumulatedFee = new AssetAmount(0n, cancelReferralFee?.metadata);
    const fees = [cancelReferralFee, swapReferralFee];
    fees.forEach((fee) => {
      // Skip the fee if it doesn't match the first fee type.
      if (fee && fee?.metadata?.assetId === accumulatedFee?.metadata?.assetId) {
        accumulatedFee.add(fee);
      }
    });

    cancelTx.get().payToContract(ESCROW_ADDRESS, datum, payment);
    return this.completeTx({
      tx: cancelTx,
      datum,
      referralFee: accumulatedFee,
    });
  }

  async buildDepositTx(depositConfig: DepositConfig) {
    const { suppliedAssets, pool, orderAddresses, referralFee } =
      depositConfig.buildArgs();

    const calculatedFee =
      referralFee &&
      TxBuilder.calculateReferralFee(
        referralFee,
        suppliedAssets.find(
          ({ metadata }) =>
            metadata.assetId === referralFee?.minimumAmount?.metadata?.assetId
        )
      );
    const tx = await this.newTxInstance(calculatedFee);

    const payment = Utils.accumulateSuppliedAssets(
      suppliedAssets,
      this.options.network
    );
    const datumBuilder = new DatumBuilderLucid(this.options.network);
    const [coinA, coinB] = Utils.sortSwapAssetsWithAmounts(suppliedAssets);

    const { cbor } = datumBuilder.buildDepositDatum({
      ident: pool.ident,
      orderAddresses: orderAddresses,
      deposit: {
        CoinAAmount: coinA,
        CoinBAmount: coinB,
      },
    });

    tx.get().payToContract(this.getParams().ESCROW_ADDRESS, cbor, payment);
    return this.completeTx({
      tx,
      datum: cbor,
      referralFee: calculatedFee?.payment,
    });
  }

  async buildWithdrawTx(withdrawConfig: WithdrawConfig): Promise<ITxBuilderTx> {
    const { suppliedLPAsset, pool, orderAddresses, referralFee } =
      withdrawConfig.buildArgs();

    const calculatedFee =
      referralFee &&
      TxBuilder.calculateReferralFee(referralFee, suppliedLPAsset);
    const tx = await this.newTxInstance(calculatedFee);

    const payment = Utils.accumulateSuppliedAssets(
      [suppliedLPAsset],
      this.options.network
    );
    const datumBuilder = new DatumBuilderLucid(this.options.network);

    const { cbor } = datumBuilder.buildWithdrawDatum({
      ident: pool.ident,
      orderAddresses: orderAddresses,
      suppliedLPAsset: suppliedLPAsset,
    });

    tx.get().payToContract(this.getParams().ESCROW_ADDRESS, cbor, payment);
    return this.completeTx({
      tx,
      datum: cbor,
      deposit: 0n,
      referralFee: calculatedFee?.payment,
    });
  }

  async buildCancelTx(cancelConfig: CancelConfig) {
    const { datum, datumHash, utxo, address, referralFee } =
      cancelConfig.buildArgs();

    const calculatedFee =
      referralFee && TxBuilder.calculateReferralFee(referralFee);
    const tx = await this.newTxInstance(calculatedFee);

    const plutusData = C.PlutusData.from_bytes(Buffer.from(datum, "hex"));
    const calculatedDatumHash = C.hash_plutus_data(plutusData).to_hex();
    if (calculatedDatumHash !== datumHash) {
      throw new Error(
        "The provided datum and datumHash do not match! Confirm your datum is correct."
      );
    }

    const utxoToSpend = await this.wallet?.provider.getUtxosByOutRef([
      { outputIndex: utxo.index, txHash: utxo.hash },
    ]);

    if (!utxoToSpend) {
      throw new Error(
        "UTXO data was not found with the following parameters: " +
          JSON.stringify(utxo)
      );
    }

    // TODO: parse from datum instead
    const details = getAddressDetails(address);
    const signerKey = details.paymentCredential?.hash;
    if (!signerKey) {
      throw new Error(
        "Could not get payment keyhash from fetched UTXO details: " +
          JSON.stringify(utxo)
      );
    }

    const { ESCROW_CANCEL_REDEEMER, ESCROW_SCRIPT_VALIDATOR } =
      this.getParams();

    try {
      tx.get()
        .collectFrom(utxoToSpend, ESCROW_CANCEL_REDEEMER)
        .addSignerKey(signerKey)
        .attachSpendingValidator({
          type: "PlutusV1",
          script: ESCROW_SCRIPT_VALIDATOR,
        });
    } catch (e) {
      throw e;
    }

    return this.completeTx({
      tx,
      datum: utxoToSpend[0]?.datum as string,
      deposit: 0n,
      scooperFee: 0n,
      referralFee: calculatedFee?.payment,
    });
  }

  async buildChainedZapTx(zapConfig: ZapConfig): Promise<ITxBuilderTx> {
    const { pool, suppliedAsset, orderAddresses, swapSlippage, referralFee } =
      zapConfig.buildArgs();

    const calculatedFee =
      referralFee && TxBuilder.calculateReferralFee(referralFee, suppliedAsset);
    const tx = await this.newTxInstance(calculatedFee);

    const { ESCROW_ADDRESS, SCOOPER_FEE } = this.getParams();
    const payment = Utils.accumulateSuppliedAssets(
      [suppliedAsset],
      this.options.network,
      // Add another scooper fee requirement since we are executing two orders.
      SCOOPER_FEE
    );

    const datumBuilder = new DatumBuilderLucid(this.options.network);

    /**
     * To accurately determine the altReceivable, we need to swap only half the supplied asset.
     */
    const halfSuppliedAmount = new AssetAmount(
      Math.ceil(Number(suppliedAsset.amount) / 2),
      suppliedAsset.metadata
    );

    const minReceivable = Utils.getMinReceivableFromSlippage(
      pool,
      halfSuppliedAmount,
      swapSlippage
    );

    let depositPair: DepositMixed;
    if (pool.assetA.assetId === suppliedAsset.metadata.assetId) {
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
    const depositData = datumBuilder.buildDepositDatum({
      ident: pool.ident,
      orderAddresses,
      deposit: depositPair,
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
    const swapData = datumBuilder.buildSwapDatum({
      ident: pool.ident,
      fundedAsset: halfSuppliedAmount,
      orderAddresses: {
        DestinationAddress: {
          address: ESCROW_ADDRESS,
          datumHash: depositData.hash,
        },
        AlternateAddress: orderAddresses.DestinationAddress.address,
      },
      swap: {
        SuppliedCoin: Utils.getAssetSwapDirection(suppliedAsset.metadata, [
          pool.assetA,
          pool.assetB,
        ]),
        MinimumReceivable: minReceivable,
      },
    });

    tx.tx.attachMetadataWithConversion(103251, {
      [`0x${depositData.hash}`]: Utils.splitMetadataString(
        depositData.cbor,
        "0x"
      ),
    });

    tx.get().payToContract(ESCROW_ADDRESS, swapData.cbor, payment);
    return this.completeTx({
      tx,
      datum: swapData.cbor,
      deposit: undefined,
      scooperFee: this.getParams().SCOOPER_FEE * 2n,
      referralFee: calculatedFee?.payment,
    });
  }

  async buildAtomicZapTx(zapConfig: ZapConfig): Promise<ITxBuilderTx> {
    const { suppliedAsset, pool, orderAddresses, zapDirection, referralFee } =
      zapConfig.buildArgs();

    const calculatedFee =
      referralFee && TxBuilder.calculateReferralFee(referralFee, suppliedAsset);
    const tx = await this.newTxInstance(calculatedFee);

    const payment = Utils.accumulateSuppliedAssets(
      [suppliedAsset],
      this.options.network
    );
    const datumBuilder = new DatumBuilderLucid(this.options.network);

    const { cbor } = datumBuilder.buildZapDatum({
      ident: pool.ident,
      orderAddresses: orderAddresses,
      zap: {
        CoinAmount: suppliedAsset,
        ZapDirection: zapDirection,
      },
    });

    tx.get().payToContract(this.getParams().ESCROW_ADDRESS, cbor, payment);
    return this.completeTx({
      tx,
      datum: cbor,
      referralFee: calculatedFee?.payment,
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
    ITxBuilderTx<Transaction<Tx>, Datum | undefined>
  > {
    const baseFees: Omit<ITxBuilderFees, "cardanoTxFee"> = {
      deposit: new AssetAmount(
        deposit ?? this.getParams().RIDER_FEE,
        ADA_ASSET_DECIMAL
      ),
      scooperFee: new AssetAmount(
        scooperFee ?? this.getParams().SCOOPER_FEE,
        ADA_ASSET_DECIMAL
      ),
      referral: referralFee,
    };

    const txFee = tx.get().txBuilder.get_fee_if_set();
    const finishedTx = await tx.get().complete({ coinSelection });

    const thisTx = {
      tx,
      datum,
      fees: {
        ...baseFees,
        cardanoTxFee: new AssetAmount(
          BigInt(txFee?.to_str() ?? finishedTx?.fee?.toString() ?? "0"),
          ADA_ASSET_DECIMAL
        ),
      },
      async build() {
        return {
          submit: async () => {
            throw new Error(
              "You must sign your transaction before submitting to a wallet!"
            );
          },
          cbor: Buffer.from(finishedTx.txComplete.to_bytes()).toString("hex"),
        };
      },
      async sign() {
        const signedTx = await finishedTx.sign().complete();
        return {
          submit: async () => await signedTx.submit(),
          cbor: Buffer.from(signedTx.txSigned.to_bytes()).toString("hex"),
        };
      },
    };

    return thisTx;
  }

  private _conformNetwork(network: TSupportedNetworks): Network {
    switch (network) {
      case "mainnet":
        return "Mainnet";
      case "preview":
        return "Preview";
    }
  }

  private _throwWalletNotConnected(): never {
    throw new Error("The wallet has not yet been initialized!");
  }
}
