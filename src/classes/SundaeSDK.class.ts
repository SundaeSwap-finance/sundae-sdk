// import type { Lucid, Provider, WalletApi } from "lucid-cardano";
import { Constr } from "lucid-cardano";

import type { BrowserWallet, Data } from "@martifylabs/mesh";

import { params } from "../lib/params";
import { ERROR_CODES } from "../lib/errors";
import { getAssetIDs, toLovelace } from "../lib/utils";
import { TSupportedNetworks, IParams, IGetSwapArgs } from "../types";

export class SundaeSDK {
  // Instances.
  public meshWallet?: BrowserWallet;

  // States.
  public preferredWallet: string;
  public swapping: boolean = false;
  public network: TSupportedNetworks;
  public params: IParams;
  // public provider?: Provider;

  constructor(
    preferredWallet: string,
    // provider?: Provider,
    network?: TSupportedNetworks
  ) {
    this.preferredWallet = preferredWallet;
    // this.provider = provider;
    this.network = network ?? "Mainnet";
    this.params = params[this.network];
  }

  public async getMeshWallet(): Promise<BrowserWallet> {
    if (!this.meshWallet) {
      this.meshWallet = await import("@martifylabs/mesh").then(
        async ({ BrowserWallet }) => {
          return await BrowserWallet.enable(this.preferredWallet);
        }
      );
    }

    return this.meshWallet;
  }

  public async swap({
    poolIdent,
    asset,
    walletHash,
    swapFromAsset = true,
    minimumReceivableAsset = 1n,
  }: IGetSwapArgs): Promise<string> {
    this.ensureNotSwapping();
    const assetIDs = getAssetIDs(asset);

    this.swapping = true;
    const swapFromAssetData: Data = new Map<Data, Data>();
    swapFromAssetData.set(swapFromAsset ? 0 : 1, []);

    const data: Data = [
      [poolIdent, [[[[[walletHash], []]]], []]],
      "0n",
      [
        swapFromAssetData,
        `${toLovelace(asset.amount, asset.metadata.decimals)}n`,
        [[minimumReceivableAsset.toString()]],
      ],
    ];

    const data2 = new Constr(0, [
      poolIdent,
      new Constr(0, [
        new Constr(0, [
          new Constr(0, [new Constr(0, [walletHash]), new Constr(1, [])]),
          new Constr(1, []),
        ]),
        new Constr(1, []),
      ]),
      "0n",
      new Constr(0, [
        new Constr(swapFromAsset ? 0 : 1, []),
        `${toLovelace(asset.amount, asset.metadata.decimals)}n`,
        new Constr(0, [minimumReceivableAsset]),
      ]),
    ]);

    try {
      const wallet = await this.getMeshWallet();
      const { Transaction, resolveDataHash } = await import(
        "@martifylabs/mesh"
      );
      const tx = new Transaction({ initiator: wallet });
      const payment: Record<string, bigint> = {};

      if (assetIDs.name === "" && swapFromAsset) {
        payment.lovelace =
          this.params.SCOOPER_FEE +
          BigInt(toLovelace(asset.amount, asset.metadata.decimals));
      } else {
        payment.lovelace = this.params.SCOOPER_FEE;
        payment[assetIDs.concatenated] = BigInt(
          toLovelace(asset.amount, asset.metadata.decimals)
        );
      }

      tx.sendAssets(
        {
          address: this.params.ESCROW_ADDRESS,
          datum: {
            value: data,
          },
        },
        [
          {
            unit: asset.metadata.assetID,
            quantity: payment,
          },
        ]
      );

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      // const payment: Record<string, bigint> = {};

      // if (assetIDs.name === "" && swapFromAsset) {
      //   payment.lovelace =
      //     this.params.SCOOPER_FEE +
      //     BigInt(toLovelace(asset.amount, asset.metadata.decimals));
      // } else {
      //   payment.lovelace = this.params.SCOOPER_FEE;
      //   payment[assetIDs.concatenated] = BigInt(
      //     toLovelace(asset.amount, asset.metadata.decimals)
      //   );
      // }

      // tx.payToContract(this.params.ESCROW_ADDRESS, Data.to(data), payment);

      // const finishedTx = await tx.complete();
      // const signedTx = await finishedTx.sign().complete();
      // const txHash = await signedTx.submit();
      this.swapping = false;
      return txHash;
    } catch (e) {
      this.swapping = false;
      throw e;
    }
  }

  private ensureNotSwapping() {
    if (this.swapping) {
      console.warn(ERROR_CODES[1]);
      throw new Error(ERROR_CODES[1].message);
    }
  }
}
