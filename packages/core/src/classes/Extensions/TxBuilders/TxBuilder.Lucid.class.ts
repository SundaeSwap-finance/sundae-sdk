import {
  Lucid,
  Tx,
  WalletApi,
  Blockfrost,
  Provider,
  Network,
  C,
  getAddressDetails,
} from "lucid-cardano";
import { Transaction } from "../../../classes/Transaction.class";
import { AssetAmount } from "../../../classes/AssetAmount.class";

import {
  IQueryProviderClass,
  TSupportedNetworks,
  ITxBuilderBaseOptions,
  IAsset,
  ITxBuilderTx,
  IZapArgs,
  SwapConfigArgs,
  DepositConfigArgs,
  WithdrawConfigArgs,
  CancelConfigArgs,
  ITxBuilderFees,
  DepositMixed,
} from "../../../@types";
import { TxBuilder } from "../../Abstracts/TxBuilder.abstract.class";
import { Utils } from "../../Utils.class";
import { DatumBuilderLucid } from "../DatumBuilders/DatumBuilder.Lucid.class";
import { ADA_ASSET_DECIMAL } from "../../../lib/constants";

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
    this.initWallet();
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

  async buildSwapTx(args: SwapConfigArgs) {
    const txInstance = await this.newTxInstance();
    const {
      pool: { ident, assetA, assetB },
      orderAddresses,
      suppliedAsset,
      minReceivable,
    } = args;

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
    return this.completeTx(txInstance);
  }

  async buildDepositTx(args: DepositConfigArgs) {
    const tx = await this.newTxInstance();
    const payment = Utils.accumulateSuppliedAssets(
      args.suppliedAssets,
      this.options.network
    );
    const datumBuilder = new DatumBuilderLucid(this.options.network);
    const [coinA, coinB] = Utils.sortSwapAssets(args.suppliedAssets);

    const { cbor } = datumBuilder.buildDepositDatum({
      ident: args.pool.ident,
      orderAddresses: args.orderAddresses,
      deposit: {
        CoinAAmount: (coinA as IAsset).amount,
        CoinBAmount: (coinB as IAsset).amount,
      },
    });

    tx.get().payToContract(this.getParams().ESCROW_ADDRESS, cbor, payment);
    return this.completeTx(tx);
  }

  async buildWithdrawTx(args: WithdrawConfigArgs): Promise<ITxBuilderTx> {
    const tx = await this.newTxInstance();
    const payment = Utils.accumulateSuppliedAssets(
      [args.suppliedLPAsset],
      this.options.network
    );
    const datumBuilder = new DatumBuilderLucid(this.options.network);

    const { cbor } = datumBuilder.buildWithdrawDatum({
      ident: args.pool.ident,
      orderAddresses: args.orderAddresses,
      suppliedLPAsset: args.suppliedLPAsset,
    });

    tx.get().payToContract(this.getParams().ESCROW_ADDRESS, cbor, payment);
    return this.completeTx(tx);
  }

  async buildCancelTx({
    datum,
    datumHash,
    utxo,
    address,
  }: CancelConfigArgs): Promise<ITxBuilderTx> {
    const tx = await this.newTxInstance();

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
    return this.completeTx(tx);
  }

  async buildChainedZapTx(args: IZapArgs): Promise<ITxBuilderTx> {
    const tx = await this.newTxInstance();
    const payment = Utils.accumulateSuppliedAssets(
      [args.suppliedAsset],
      this.options.network
    );

    const { ESCROW_ADDRESS } = this.getParams();
    const datumBuilder = new DatumBuilderLucid(this.options.network);

    const sortedSwapAssets = Utils.sortSwapAssets([
      args.pool.assetA,
      args.pool.assetB,
    ]);

    let depositPair: DepositMixed;
    if (sortedSwapAssets[0].assetId === args.suppliedAsset.assetId) {
      depositPair = {
        CoinAAmount: 
      }
    } else {
      
    }

    const depositData = datumBuilder.buildDepositPair({
      CoinAAmount: args.suppliedAsset.amount,
      CoinBAmount: args.suppliedAsset.amount,
    });

    const swapData = datumBuilder.buildSwapDatum({
      ident: args.pool.ident,
      fundedAsset: args.suppliedAsset,
      orderAddresses: {
        DestinationAddress: {
          address: ESCROW_ADDRESS,
          datumHash: depositData.hash,
        },
        AlternateAddress: args.orderAddresses.DestinationAddress.address,
      },
      swap: {
        SuppliedCoin: Utils.getAssetSwapDirection(args.suppliedAsset, [
          args.pool.assetA,
          args.pool.assetB,
        ]),
      },
    });

    if (!depositData?.hash) {
      throw new Error(
        "A datum hash for a deposit transaction is required to build a chained Zap operation."
      );
    }
    tx.tx.attachMetadata(103251, {
      [depositData.hash]: depositData.cbor,
    });

    console.log({
      depositData,
      swapData,
    });

    tx.get().payToContract(ESCROW_ADDRESS, swapData.cbor, payment);
    return this.completeTx(tx);
  }

  async buildAtomicZapTx(args: IZapArgs): Promise<ITxBuilderTx> {
    const tx = await this.newTxInstance();
    const payment = Utils.accumulateSuppliedAssets(
      [args.suppliedAsset],
      this.options.network
    );
    const datumBuilder = new DatumBuilderLucid(this.options.network);

    const { cbor } = datumBuilder.buildZapDatum({
      ident: args.pool.ident,
      orderAddresses: args.orderAddresses,
      zap: {
        CoinAmount: args.suppliedAsset.amount,
        ZapDirection: args.zapDirection,
      },
    });

    tx.get().payToContract(this.getParams().ESCROW_ADDRESS, cbor, payment);
    return this.completeTx(tx);
  }

  private async completeTx(tx: Transaction<Tx>): Promise<ITxBuilderTx> {
    let sign: boolean = false;
    const finishedTx = await tx.get().complete();
    const baseFees: Pick<ITxBuilderFees, "scooperFee" | "deposit"> = {
      deposit: new AssetAmount(this.getParams().RIDER_FEE, ADA_ASSET_DECIMAL),
      scooperFee: new AssetAmount(
        this.getParams().SCOOPER_FEE,
        ADA_ASSET_DECIMAL
      ),
    };

    const thisTx = {
      complete: async () => {
        if (sign) {
          const signedTx = await finishedTx.sign().complete();
          return {
            submit: async () => await signedTx.submit(),
            cbor: Buffer.from(signedTx.txSigned.to_bytes()).toString("hex"),
            fees: {
              ...baseFees,
              cardanoTxFee: new AssetAmount(
                BigInt(signedTx.txSigned.body().fee().to_str()),
                ADA_ASSET_DECIMAL
              ),
            },
          };
        }

        return {
          submit: async () => {
            throw new Error(
              "You must sign your transaction before submitting to a wallet!"
            );
          },
          cbor: Buffer.from(finishedTx.txComplete.to_bytes()).toString("hex"),
          fees: {
            ...baseFees,
            cardanoTxFee: new AssetAmount(
              BigInt(finishedTx.txComplete.body().fee().to_str()),
              ADA_ASSET_DECIMAL
            ),
          },
        };
      },
      sign: function () {
        sign = true;
        return this;
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
