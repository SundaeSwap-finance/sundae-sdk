import {
  Lucid,
  Tx,
  WalletApi,
  Blockfrost,
  Provider as BlockfrostProvider,
  Network,
  TxSigned,
} from "lucid-cardano";
import { Transaction } from "../../../classes/Transaction.class";

import {
  IQueryProviderClass,
  TSupportedNetworks,
  ISwapArgs,
  ITxBuilderBaseOptions,
  IDepositArgs,
  IAsset,
  ITxBuilderComplete,
  IWithdrawArgs,
} from "../../../@types";
import { ADA_ASSET_ID } from "../../../lib/constants";
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
  provider: "blockfrost";
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
  lib?: Lucid;
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
    switch (this.options?.provider) {
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
    const { provider, blockfrost } = this.options;
    let ThisProvider: BlockfrostProvider;
    switch (provider) {
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

  async buildSwapTx(args: ISwapArgs) {
    TxBuilder.validateSwapArguments(args, this.options);

    const txInstance = await this.newTxInstance();
    const {
      pool: { ident, assetA, assetB },
      orderAddresses: escrowAddress,
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
      orderAddresses: escrowAddress,
      fundedAsset: suppliedAsset,
    });

    const payment = Utils.accumulateSuppliedAssets(
      [suppliedAsset],
      this.options.network
    );

    txInstance.get().payToContract(ESCROW_ADDRESS, cbor, payment);
    const finishedTx = await txInstance.get().complete();
    const signedTx = await finishedTx.sign().complete();

    return {
      submit: async () => await signedTx.submit(),
      cbor: (await getBuffer())
        .from(signedTx.txSigned.to_bytes())
        .toString("hex"),
    };
  }

  async buildDepositTx(args: IDepositArgs) {
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
    const finishedTx = await tx.get().complete();
    const signedTx = await finishedTx.sign().complete();
    return this._buildTxComplete(signedTx);
  }

  async buildWithdrawTx(args: IWithdrawArgs): Promise<ITxBuilderComplete> {
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
    const finishedTx = await tx.get().complete();
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
