import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  type IComposedTx,
  type ITxBuilderReferralFee,
  type SundaeSDK,
  type TSupportedNetworks,
} from "@sundaeswap/core";
import { SundaeUtils } from "@sundaeswap/core/utilities";

import { type Datum, type Tx, type TxComplete } from "lucid-cardano";

import { IDepositArgs } from "./@types/configs.js";
import { GummiWorm } from "./Abstracts/GummiWorm.abstract.class.js";
import { DatumBuilderLucid } from "./Classes/DatumBuilder.Lucid.class.js";

/**
 * Object arguments for completing a transaction.
 */
export interface IGummiWormCompleteTxArgs {
  datum?: string;
  deposit: AssetAmount<IAssetAmountMetadata>;
  referralFee?: ITxBuilderReferralFee;
  tx: Tx;
}

interface IGummiWormParams {
  contractAddress: string;
  minLockAda: bigint;
}

/**
 * Represents the GummiWorm class for Lucid, capable of handling various blockchain interactions for interacting with the
 * GummiWorm contracts on the SundaeSwap protocol.
 *
 * This class encapsulates methods for common operations required in the depositing and withdraw process on the blockchain.
 * It provides an interface to deposit and withdraw assets from the GummiWorm protocol.
 *
 * The GummiWormLucid class relies on the Lucid service, which should come from an existing
 * @module Core.SundaeSDK class instance (as shown below). The class methods handle the detailed steps of each operation, including
 * transaction preparation, fee handling, and error checking, abstracting these complexities from the end user.
 *
 * ```ts
 *  const GW = new GummiWormLucid(sdk);
 *  const txHash = await GW.deposit({ ...args }).then(({ submit }) => submit());
 * ```
 *
 * @extends {GummiWorm}
 */
export class GummiWormLucid implements GummiWorm {
  network: TSupportedNetworks;
  datumBuilder: DatumBuilderLucid;

  static PARAMS: Record<TSupportedNetworks, IGummiWormParams> = {
    mainnet: {
      contractAddress: "",
      minLockAda: 5_000_000n,
    },
    preview: {
      contractAddress:
        /**
         * @todo Update to real contract address
         */
        "addr_test1qzt4mu987ghxdfdhgp42ac57x5vjpyc6hm8gurkvmhldg6tgpzrz0ht2a8faz0waqgsf42pz8rdajr7tf83p08nkdmqqlak2wl",
      minLockAda: 5_000_000n,
    },
  };

  constructor(public sdk: SundaeSDK) {
    const lucid = sdk.lucid();
    if (!lucid) {
      throw new Error(
        "A lucid instance is required. Ensure that you have a builder set up in your SDK.",
      );
    }

    console.log("Comment for testing changeset");
    const network = lucid.network === "Mainnet" ? "mainnet" : "preview";
    this.datumBuilder = new DatumBuilderLucid(network);
    this.network = network;
  }

  /**
   * Helper method to get a specific parameter of the transaction builder.
   *
   * @param {K extends keyof IGummiWormParams} param The parameter you want to retrieve.
   * @param {TSupportedNetworks} network The protocol network.
   * @returns {IGummiWormParams[K]}
   */
  static getParam<K extends keyof IGummiWormParams>(
    param: K,
    network: TSupportedNetworks,
  ): IGummiWormParams[K] {
    return GummiWormLucid.PARAMS[network][param];
  }

  /**
   * A shortcut method to avoid having to pass in the network all the time.
   *
   * @param param The parameter you want to retrieve.
   * @returns {IGummiWormParams}
   */
  public getParam<K extends keyof IGummiWormParams>(
    param: K,
  ): IGummiWormParams[K] {
    return GummiWormLucid.getParam(param, this.network);
  }

  /**
   * Builds a valid transaction for the GummiWorm contract
   * that allows a user to deposit assets for use.
   * @param depositArgs
   * @returns
   */
  async deposit(depositArgs: IDepositArgs) {
    const contractAddress = this.getParam("contractAddress");
    const payment = SundaeUtils.accumulateSuppliedAssets({
      scooperFee: 0n,
      suppliedAssets: depositArgs.assets,
      orderDeposit: this.getParam("minLockAda"),
    });

    const lucid = this.sdk.lucid();
    if (!lucid) {
      throw new Error(
        "Lucid is not available. Are you using a different builder?",
      );
    }

    const wallet = lucid.wallet;
    if (!wallet) {
      throw new Error(
        "A wallet was not initialized in your Lucid instance. Please select a wallet, and then try again.",
      );
    }

    const txInstance = lucid.newTx();
    const { inline } = this.datumBuilder.buildDepositDatum({
      address: depositArgs.address ?? (await wallet.address()),
    });

    txInstance.payToContract(contractAddress, { inline }, payment);

    return this.completeTx({
      tx: txInstance,
      deposit: new AssetAmount(this.getParam("minLockAda"), ADA_METADATA),
      datum: inline,
    });
  }

  /**
   * Completes a GummiWorm transaction by processing referral fees,
   * calculating transaction fees, and preparing the transaction for submission.
   *
   * This method handles the payment of referral fees by determining the type of
   * asset involved and paying the appropriate amount to the specified address.
   * It also attaches metadata related to the referral fee, if applicable.
   * The transaction fees are calculated and set within the transaction object.
   * The method returns an object representing the composed transaction, which
   * includes the original transaction, fees, and an optional datum.
   *
   * The composed transaction object provides a `build` function to finalize the transaction,
   * calculate the Cardano transaction fee, and prepare it for signing and submission.
   *
   * @param {IGummiWormCompleteTxArgs} args - The arguments required to complete the transaction, including:
   *   - `datum`: Optional data associated with the transaction.
   *   - `deposit`: The deposit amount required for the transaction.
   *   - `referralFee`: The referral fee details, if applicable.
   *   - `tx`: The initial transaction object to be completed.
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} A promise that resolves to the composed transaction object, which includes methods for finalizing, signing, and submitting the transaction.
   */
  private async completeTx({
    datum,
    deposit,
    referralFee,
    tx,
  }: IGummiWormCompleteTxArgs): Promise<
    IComposedTx<Tx, TxComplete, Datum | undefined>
  > {
    if (referralFee) {
      if (!SundaeUtils.isAdaAsset(referralFee.payment.metadata)) {
        tx.payToAddress(referralFee.destination, {
          [referralFee.payment.metadata.assetId.replace(".", "")]:
            referralFee.payment.amount,
        });
      } else {
        tx.payToAddress(referralFee.destination, {
          lovelace: referralFee.payment.amount,
        });
      }

      if (referralFee.feeLabel) {
        tx.attachMetadataWithConversion(
          674,
          `${referralFee.feeLabel}: ${referralFee.payment.value.toString()} ${
            !SundaeUtils.isAdaAsset(referralFee.payment.metadata)
              ? Buffer.from(
                  referralFee.payment.metadata.assetId.split(".")[1],
                  "hex",
                ).toString("utf-8")
              : "ADA"
          }`,
        );
      }
    }

    const txFee = tx.txBuilder.get_fee_if_set();
    let finishedTx: TxComplete | undefined;
    const thisTx: IComposedTx<Tx, TxComplete, Datum | undefined> = {
      tx,
      fees: {
        cardanoTxFee: new AssetAmount(0n, ADA_METADATA),
        deposit,
        scooperFee: new AssetAmount(0n, ADA_METADATA),
        referral: new AssetAmount(
          referralFee?.payment?.amount ?? 0n,
          referralFee?.payment?.metadata ?? ADA_METADATA,
        ),
      },
      datum,
      async build() {
        if (!finishedTx) {
          finishedTx = await tx.complete();
        }

        thisTx.fees.cardanoTxFee = new AssetAmount(
          BigInt(txFee?.to_str() ?? finishedTx?.fee?.toString() ?? "0"),
          6,
        );

        return {
          cbor: Buffer.from(finishedTx.txComplete.to_bytes()).toString("hex"),
          builtTx: finishedTx,
          sign: async () => {
            const signedTx = await (finishedTx as TxComplete).sign().complete();
            return {
              cbor: Buffer.from(signedTx.txSigned.to_bytes()).toString("hex"),
              submit: async () => await signedTx.submit(),
            };
          },
        };
      },
    };

    return thisTx;
  }
}
