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
import { AssetAmount } from "@sundaeswap/asset";

import {
  IQueryProviderClass,
  TSupportedNetworks,
  ITxBuilderBaseOptions,
  IAsset,
  ITxBuilderTx,
  ITxBuilderFees,
  DepositMixed,
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
  constructor(
    public options: ITxBuilderLucidOptions,
    public query: IQueryProviderClass
  ) {
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
  async newTxInstance(): Promise<Transaction<Tx>> {
    if (!this.wallet) {
      this._throwWalletNotConnected();
    }

    return new Transaction<Tx>(this, this.wallet.newTx());
  }

  /**
   * Builds a valid transaction for the V2 Yield Farming contract
   * that allows a user to add or update staking positions.
   * @param lockConfig
   * @returns
   */
  async buildFreezerTx(lockConfig: FreezerConfig) {
    const txInstance = await this.newTxInstance();
    const { existingPositions, lockedValues, delegation, ownerAddress } =
      lockConfig.buildArgs();

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

    const payment: Assets = {
      lovelace: 5000000n, // a minimum of 5 ADA to hold assets.
    };

    lockedValues.forEach(({ amount, metadata }) => {
      if (metadata?.assetId === ADA_ASSET_ID) {
        payment.lovelace += amount;
      } else {
        if (!payment[metadata?.assetId]) {
          payment[metadata?.assetId?.replace(".", "")] = amount;
        } else {
          payment[metadata?.assetId?.replace(".", "")] += amount;
        }
      }
    });

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
      .addSignerKey(
        signerKey?.stakeCredentials ?? signerKey?.paymentCredentials
      );

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

      txInstance.get().payToContract(contractAddress, cbor, payment);
      return this.completeTx(txInstance, cbor);
    } else {
      return this.completeTx(txInstance);
    }
  }

  async buildSwapTx(swapConfig: SwapConfig) {
    const txInstance = await this.newTxInstance();
    const {
      pool: { ident, assetA, assetB },
      orderAddresses,
      suppliedAsset,
      minReceivable,
    } = swapConfig.buildArgs();

    const { ESCROW_ADDRESS } = this.getParams();

    const datumBuilder = new DatumBuilderLucid(this.options.network);
    const { cbor } = datumBuilder.buildSwapDatum({
      ident,
      swap: {
        SuppliedCoin: Utils.getAssetSwapDirection(suppliedAsset, [
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
    return this.completeTx(txInstance, cbor);
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
    const { tx: cancelTx } = await this.buildCancelTx(cancelConfig);
    const { datum } = await this.buildSwapTx(swapConfig);
    const { ESCROW_ADDRESS } = this.getParams();

    const { suppliedAsset } = swapConfig.buildArgs();

    const payment = Utils.accumulateSuppliedAssets(
      [suppliedAsset],
      this.options.network
    );

    if (!datum) {
      throw new Error("Swap datum is required.");
    }

    cancelTx.get().payToContract(ESCROW_ADDRESS, datum, payment);
    return this.completeTx(cancelTx, datum);
  }

  async buildDepositTx(depositConfig: DepositConfig) {
    const tx = await this.newTxInstance();
    const { suppliedAssets, pool, orderAddresses } = depositConfig.buildArgs();
    const payment = Utils.accumulateSuppliedAssets(
      suppliedAssets,
      this.options.network
    );
    const datumBuilder = new DatumBuilderLucid(this.options.network);
    const [coinA, coinB] = Utils.sortSwapAssets(suppliedAssets);

    const { cbor } = datumBuilder.buildDepositDatum({
      ident: pool.ident,
      orderAddresses: orderAddresses,
      deposit: {
        CoinAAmount: (coinA as IAsset).amount,
        CoinBAmount: (coinB as IAsset).amount,
      },
    });

    tx.get().payToContract(this.getParams().ESCROW_ADDRESS, cbor, payment);
    return this.completeTx(tx, cbor);
  }

  async buildWithdrawTx(withdrawConfig: WithdrawConfig): Promise<ITxBuilderTx> {
    const tx = await this.newTxInstance();
    const { suppliedLPAsset, pool, orderAddresses } =
      withdrawConfig.buildArgs();
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
    return this.completeTx(tx, cbor);
  }

  async buildCancelTx(cancelConfig: CancelConfig) {
    const tx = await this.newTxInstance();
    const { datum, datumHash, utxo, address } = cancelConfig.buildArgs();

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

    return this.completeTx(tx, utxoToSpend[0]?.datum as string);
  }

  async buildChainedZapTx(zapConfig: ZapConfig): Promise<ITxBuilderTx> {
    const { pool, suppliedAsset, orderAddresses } = zapConfig.buildArgs();
    const tx = await this.newTxInstance();
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
    const halfSuppliedAmount = suppliedAsset.amount.subtract(
      new AssetAmount(
        BigInt(Math.floor(Number(suppliedAsset.amount.amount) / 2))
      )
    );

    const minReceivable = Utils.getMinReceivableFromSlippage(
      pool,
      {
        amount: halfSuppliedAmount,
        assetId: suppliedAsset.assetId,
      },
      0
    );

    let depositPair: DepositMixed;
    if (pool.assetA.assetId === suppliedAsset.assetId) {
      depositPair = {
        CoinAAmount: halfSuppliedAmount,
        CoinBAmount: minReceivable,
      };
    } else {
      depositPair = {
        CoinAAmount: minReceivable,
        CoinBAmount: halfSuppliedAmount,
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
      fundedAsset: suppliedAsset,
      orderAddresses: {
        DestinationAddress: {
          address: ESCROW_ADDRESS,
          datumHash: depositData.hash,
        },
        AlternateAddress: orderAddresses.DestinationAddress.address,
      },
      swap: {
        SuppliedCoin: Utils.getAssetSwapDirection(suppliedAsset, [
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
    return this.completeTx(tx, swapData.cbor);
  }

  async buildAtomicZapTx(zapConfig: ZapConfig): Promise<ITxBuilderTx> {
    const tx = await this.newTxInstance();
    const { suppliedAsset, pool, orderAddresses, zapDirection } =
      zapConfig.buildArgs();
    const payment = Utils.accumulateSuppliedAssets(
      [suppliedAsset],
      this.options.network
    );
    const datumBuilder = new DatumBuilderLucid(this.options.network);

    const { cbor } = datumBuilder.buildZapDatum({
      ident: pool.ident,
      orderAddresses: orderAddresses,
      zap: {
        CoinAmount: suppliedAsset.amount,
        ZapDirection: zapDirection,
      },
    });

    tx.get().payToContract(this.getParams().ESCROW_ADDRESS, cbor, payment);
    return this.completeTx(tx, cbor);
  }

  private async completeTx(
    tx: Transaction<Tx>,
    datum?: string,
    coinSelection?: boolean
  ): Promise<ITxBuilderTx<Transaction<Tx>, Datum | undefined>> {
    let sign: boolean = false;
    const baseFees: Pick<ITxBuilderFees, "scooperFee" | "deposit"> = {
      deposit: new AssetAmount(this.getParams().RIDER_FEE, ADA_ASSET_DECIMAL),
      scooperFee: new AssetAmount(
        this.getParams().SCOOPER_FEE,
        ADA_ASSET_DECIMAL
      ),
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
      async complete() {
        if (sign) {
          console.log(thisTx.tx.txComplete, coinSelection);
          const signedTx = await finishedTx.sign().complete();
          return {
            submit: async () => await signedTx.submit(),
            cbor: Buffer.from(signedTx.txSigned.to_bytes()).toString("hex"),
          };
        }

        return {
          submit: async () => {
            throw new Error(
              "You must sign your transaction before submitting to a wallet!"
            );
          },
          cbor: Buffer.from(finishedTx.txComplete.to_bytes()).toString("hex"),
        };
      },
      sign() {
        sign = true;
        return thisTx;
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
