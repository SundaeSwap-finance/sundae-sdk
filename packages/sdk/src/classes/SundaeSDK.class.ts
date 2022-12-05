// import type { Lucid, Provider, WalletApi } from "lucid-cardano";
// import { Constr } from "lucid-cardano";

import type { BrowserWallet, Data, Asset } from "@martifylabs/mesh";

import { params } from "../lib/params.js";
import { ERROR_CODES } from "../lib/errors.js";
import { getAssetIDs, toLovelace } from "../lib/utils.js";
import { TSupportedNetworks, IParams, IGetSwapArgs } from "../types";

export class SundaeSDK {
  // Instances.
  public wallet: BrowserWallet;

  // States.
  public swapping: boolean = false;
  public network: TSupportedNetworks;
  public params: IParams;

  constructor(wallet: BrowserWallet, network?: TSupportedNetworks) {
    this.wallet = wallet;
    this.network = network ?? "Mainnet";
    this.params = params[this.network];
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

    console.log({
      usedUtxos: await this.wallet.getUsedUTxOs(),
      utxos: await this.wallet.getUtxos(),
    });

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

    try {
      const { Transaction, resolveDataHash } = await import(
        "@martifylabs/mesh"
      );
      const tx = new Transaction({ initiator: this.wallet });
      const paymentsData: Record<string, bigint> = {};

      if (assetIDs.name === "" && swapFromAsset) {
        paymentsData.lovelace =
          this.params.SCOOPER_FEE +
          BigInt(toLovelace(asset.amount, asset.metadata.decimals));
      } else {
        paymentsData.lovelace = this.params.SCOOPER_FEE;
        paymentsData[assetIDs.concatenated] = BigInt(
          toLovelace(asset.amount, asset.metadata.decimals)
        );
      }

      const recipient = {
        address: this.params.ESCROW_ADDRESS,
        datum: {
          value: "supersecret",
        },
      };
      const assets: Asset[] = Object.entries(paymentsData).map(
        ([unit, quantity]) => {
          return {
            unit,
            quantity: quantity.toString(),
          };
        }
      );

      console.log(recipient, assets);
      tx.sendValue(recipient, assets);

      const unsignedTx = await tx.build();
      const signedTx = await this.wallet.signTx(unsignedTx);
      const txHash = await this.wallet.submitTx(signedTx);

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
