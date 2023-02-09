import {
  Lucid,
  Tx,
  WalletApi,
  Blockfrost,
  Provider,
  Network,
  TxSigned,
  C,
  Utils as LU,
} from "lucid-cardano";
import { Transaction } from "../../../classes/Transaction.class";

import {
  IQueryProviderClass,
  TSupportedNetworks,
  ITxBuilderBaseOptions,
  IAsset,
  ITxBuilderComplete,
  IZapArgs,
  SwapConfigArgs,
  DepositConfigArgs,
  WithdrawConfigArgs,
  CancelConfigArgs,
} from "../../../@types";
import { TxBuilder } from "../../Abstracts/TxBuilder.abstract.class";
import { Utils } from "../../Utils.class";
import { DatumBuilderLucid } from "../DatumBuilders/DatumBuilder.Lucid.class";

const getBuffer = async () => {
  const CtxBuffer =
    typeof window !== "undefined"
      ? await import("buffer").then(({ Buffer }) => Buffer)
      : Buffer;
  return CtxBuffer;
};

/**
 * Options interface for the {@link TxBuilderLucid} class.
 *
 * @group Extensions
 */
export interface ITxBuilderLucidOptions extends ITxBuilderBaseOptions {
  /** The provider type used by Lucid. Currently only supports Blockfrost. */
  providerType: "blockfrost";
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
    let ThisProvider: Provider;
    switch (providerType) {
      default:
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

  async buildWithdrawTx(args: WithdrawConfigArgs): Promise<ITxBuilderComplete> {
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
  }: CancelConfigArgs): Promise<ITxBuilderComplete> {
    const tx = await this.newTxInstance();

    const plutusData = C.PlutusData.from_bytes(Buffer.from(datum, "hex"));
    const calculatedDatumHash = C.hash_plutus_data(plutusData).to_hex();
    if (calculatedDatumHash !== datumHash) {
      throw new Error(
        "The provided datum and datumHash do not match! Confirm your datum is correct."
      );
    }

    // Provide the UTXO being spent.
    // Add the redeemer (always the cbor): d87a80
    // Provide collateral
    // Add required signer from the payment keyhash in the datum.
    // Add the script

    const utxoToSpend = await this.wallet?.provider.getUtxosByOutRef([
      { outputIndex: utxo.index, txHash: utxo.hash },
    ]);
    console.log(utxoToSpend);
    if (!utxoToSpend) {
      throw new Error(
        "UTXO data was not found with the following parameters: " +
          JSON.stringify(utxo)
      );
    }

    // TODO: parse from datum
    const signerKey = 'a84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d4';
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

  async buildZapTx(args: IZapArgs): Promise<ITxBuilderComplete> {
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

  private async completeTx(tx: Transaction<Tx>): Promise<ITxBuilderComplete> {
    const finishedTx = await tx.get().complete();
    console.log(finishedTx.toString());
    const signedTx = await finishedTx.sign().complete();
    return this._buildTxComplete(signedTx);
  }

  private _conformNetwork(network: TSupportedNetworks): Network {
    switch (network) {
      case "mainnet":
        return "Mainnet";
      case "preview":
        return "Preview";
    }
  }

  private async _buildTxComplete(
    signedTx: TxSigned
  ): Promise<ITxBuilderComplete> {
    return {
      submit: async () => await signedTx.submit(),
      cbor: (await getBuffer())
        .from(signedTx.txSigned.to_bytes())
        .toString("hex"),
    };
  }

  private _throwWalletNotConnected(): never {
    throw new Error("The wallet has not yet been initialized!");
  }
}
