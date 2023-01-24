import {
  Lucid,
  Tx,
  WalletApi,
  Blockfrost,
  Provider as BlockfrostProvider,
  Network,
} from "lucid-cardano";

import {
  IQueryProviderClass,
  TSupportedNetworks,
  ISwapArgs,
  ITxBuilderBaseOptions,
  IDepositArgs,
  IAsset,
} from "../../../@types";
import { ADA_ASSET_ID } from "../../../lib/constants";
import { TxBuilder } from "../../Abstracts/TxBuilder.abstract.class";
import { Utils } from "../../Utils.class";
import { LucidDatumBuilder } from "../DatumBuilders/DatumBuilder.Lucid.class";

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
  async newTx(): Promise<Tx> {
    if (!this.wallet) {
      this._throwWalletNotConnected();
    }

    return this.wallet.newTx();
  }

  async buildSwapTx(args: ISwapArgs) {
    const tx = await this.newTx();
    const {
      pool: { ident, assetA, assetB },
      orderAddresses: escrowAddress,
      suppliedAsset,
      minReceivable,
    } = args;

    const { SCOOPER_FEE, RIDER_FEE, ESCROW_ADDRESS } = this.getParams();

    const datumBuilder = new LucidDatumBuilder(this.options.network);
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

    const payment = this._buildPayment([suppliedAsset]);

    tx.payToContract(ESCROW_ADDRESS, cbor, payment);
    const finishedTx = await tx.complete();
    const signedTx = await finishedTx.sign().complete();

    this.txArgs = args;
    this.txComplete = {
      submit: async () => await signedTx.submit(),
      cbor: (await getBuffer())
        .from(signedTx.txSigned.to_bytes())
        .toString("hex"),
    };

    return this;
  }

  async buildDepositTx(args: IDepositArgs) {
    const tx = await this.newTx();
    const payment = this._buildPayment(args.suppliedAssets);
    const datumBuilder = new LucidDatumBuilder(this.options.network);
    const [coinA, coinB] = Utils.sortSwapAssets([
      args.pool.assetA,
      args.pool.assetB,
    ]);

    // const { cbor } = datumBuilder.buildDepositDatum({
    //   ident: args.pool.ident,
    //   orderAddresses: args.orderAddresses,
    //   deposit: {
    //     CoinAAmount: args.suppliedAssets.find(({ assetID }) => coinA.assetID)?.amount,
    //     CoinBAmount: coinB.amount,
    //   },
    // });

    // tx.payToContract(this.getParams().ESCROW_ADDRESS, cbor, payment);
    return this;
  }

  private _buildPayment(suppliedAssets: IAsset[]): Record<string, bigint> {
    const payment: Record<string, bigint> = {};
    const { SCOOPER_FEE, RIDER_FEE } = this.getParams();

    const aggregatedAssets = suppliedAssets.reduce((acc, curr) => {
      const existingAsset = acc.find(({ assetID }) => curr.assetID === assetID);
      if (existingAsset) {
        existingAsset.amount.add(curr.amount.getAmount());
      }

      return [...acc, curr];
    }, [] as IAsset[]);

    aggregatedAssets.forEach((suppliedAsset) => {
      if (suppliedAsset.assetID === ADA_ASSET_ID) {
        payment.lovelace =
          SCOOPER_FEE + RIDER_FEE + suppliedAsset.amount.getAmount();
      } else {
        payment.lovelace = SCOOPER_FEE + RIDER_FEE;
        payment[suppliedAsset.assetID.replace(".", "")] =
          suppliedAsset.amount.getAmount();
      }
    });

    return payment;
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
