import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  IComposedTx,
  ITxBuilderReferralFee,
  VOID_REDEEMER,
} from "@sundaeswap/core";
import { LucidHelper } from "@sundaeswap/core/lucid";
import { SundaeUtils } from "@sundaeswap/core/utilities";

import {
  type Assets,
  type Datum,
  type Lucid,
  type Tx,
  type TxComplete,
} from "lucid-cardano";

import { ILockConfigArgs } from "../../@types/configs.js";
import { YieldFarming } from "../Abstracts/YieldFarming.abstract.class.js";
import { LockConfig } from "../Configs/LockConfig.js";
import { DatumBuilderLucid } from "./DatumBuilder.Lucid.class.js";

/**
 * Object arguments for completing a transaction.
 */
export interface IYieldFarmingCompleteTxArgs {
  datum?: string;
  deposit: AssetAmount<IAssetAmountMetadata>;
  referralFee?: ITxBuilderReferralFee;
  tx: Tx;
}

/**
 * Represents the YieldFarmingLucid class, capable of handling various blockchain interactions for interacting with the
 * Yield Farming V2 contracts on the SundaeSwap protocol.
 *
 * This class encapsulates methods for common operations required in the Yield Farming process on the blockchain.
 * It provides an interface to lock and unlock assets, including updating their respective delegation datums.
 *
 * The YieldFarmingLucid class relies on the Lucid service, which can come either from your own instance or from an existing
 * @module Core.SundaeSDK class instance (as shown below). The class methods handle the detailed steps of each operation, including
 * transaction preparation, fee handling, and error checking, abstracting these complexities from the end user.
 *
 * ```ts
 * const lucid = sdk.builder().wallet;
 * if (lucid) {
 *  const YF = new YieldFarmingLucid(lucid, 5_000_000n);
 *  const txHash = await YF.lock({ ...args }).then(({ submit }) => submit());
 * }
 * ```
 *
 * @implements {YieldFarming}
 */
export class YieldFarmingLucid implements YieldFarming {
  datumBuilder: DatumBuilderLucid;
  MIN_LOCK_ADA: bigint;

  constructor(public lucid: Lucid, minLockAda?: bigint) {
    this.MIN_LOCK_ADA = minLockAda ?? 5_000_000n;
    this.datumBuilder = new DatumBuilderLucid(
      this.lucid.network === "Mainnet" ? "mainnet" : "preview"
    );
  }

  /**
   * Builds a valid transaction for the V2 Yield Farming contract
   * that allows a user to add or update staking positions.
   * @param lockArgs
   * @returns
   */
  async lock(lockArgs: ILockConfigArgs) {
    const {
      existingPositions,
      lockedValues,
      ownerAddress,
      programs,
      referralFee,
    } = new LockConfig(lockArgs).buildArgs();

    const { YF_REFERENCE_INPUT, YF_PAYMENT_SCRIPTHASH, YF_STAKE_KEYHASH } =
      SundaeUtils.getParams(
        this.lucid.network === "Mainnet" ? "mainnet" : "preview"
      );

    const [referenceInput, existingPositionData] = await Promise.all([
      this.lucid.provider.getUtxosByOutRef([
        {
          txHash: YF_REFERENCE_INPUT.split("#")[0],
          outputIndex: Number(YF_REFERENCE_INPUT.split("#")[1]),
        },
      ]),
      (() =>
        existingPositions &&
        this.lucid.provider.getUtxosByOutRef(
          existingPositions.map(({ hash, index }) => ({
            outputIndex: index,
            txHash: hash,
          }))
        ))(),
    ]);

    if (!referenceInput?.length) {
      throw new Error(
        "Could not fetch valid UTXO from Blockfrost based on the the Yield Farming reference input."
      );
    }

    let payment: Assets = {
      lovelace: 0n,
    };

    /**
     * If lockedValues is set to null, then we are just
     * re-spending the existing assets and forwarding them
     * to the new output. This is a convenience value
     * to enforce explicit behavior.
     */
    if (lockedValues === null && existingPositionData) {
      existingPositionData.forEach(({ assets }) => {
        Object.entries(assets).forEach(([assetId, amount]) => {
          if (!payment[assetId]) {
            payment[assetId] = amount;
          } else {
            payment[assetId] += amount;
          }
        });
      });
    } else {
      lockedValues?.forEach(({ amount, metadata }) => {
        if (SundaeUtils.isAdaAsset(metadata)) {
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
    }

    // Deduct the minimum amount we started with if we've supplied at least that much.
    if (payment.lovelace < this.MIN_LOCK_ADA) {
      payment.lovelace = this.MIN_LOCK_ADA;
    }

    const contractAddress = this.lucid.utils.credentialToAddress(
      {
        hash: YF_PAYMENT_SCRIPTHASH,
        type: "Script",
      },
      {
        hash: YF_STAKE_KEYHASH,
        type: "Key",
      }
    );

    if (!contractAddress) {
      throw new Error("Could not generate a valid contract address.");
    }

    const signerKey = LucidHelper.getAddressHashes(ownerAddress);
    const txInstance = this.lucid.newTx();

    txInstance
      .readFrom(referenceInput)
      .addSignerKey(signerKey?.paymentCredentials);

    if (signerKey?.stakeCredentials) {
      txInstance.addSignerKey(signerKey?.stakeCredentials);
    }

    if (existingPositionData) {
      txInstance.collectFrom(existingPositionData, VOID_REDEEMER);
    }

    const deposit = new AssetAmount(
      (existingPositions?.length ?? 0) > 0 ? 0n : this.MIN_LOCK_ADA,
      ADA_METADATA
    );

    /**
     * If there is no lockedValues defined, or it is an empty
     * array, then we can assume we are withdrawing all of our
     * existing positions. Since those are already collected,
     * we can just submit the transaction now and spend the
     * existing positions back to our change address.
     */
    if (
      lockedValues === undefined ||
      (lockedValues && lockedValues.length === 0)
    ) {
      return this.completeTx({
        tx: txInstance,
        deposit,
        referralFee: referralFee,
      });
    }

    let inline: string | undefined;

    /**
     * If we deliberately pass in a null value for
     * delegation programs, then re-use the existing delegation
     * from the existing position data. This assumes that we
     * are updating a position, and not starting new.
     */
    if (programs === null && existingPositionData) {
      for (const { datum } of existingPositionData) {
        if (datum) {
          inline = datum;
          break;
        }
      }
    } else {
      const newDatum = this.datumBuilder.buildLockDatum({
        owner: {
          address: ownerAddress,
        },
        programs: programs || ["None"],
      });
      inline = newDatum.inline;
    }

    txInstance.payToContract(contractAddress, { inline }, payment);
    return this.completeTx({
      tx: txInstance,
      datum: inline,
      deposit,
      referralFee: referralFee,
    });
  }

  /**
   * Helper method to enforcing isolated updating of an existing
   * position. This function ensures that the delegation datum
   * stored at the existing position will be reused.
   *
   * @param positionArgs
   * @returns
   */
  updatePosition(positionArgs: Omit<ILockConfigArgs, "programs">) {
    return this.lock({
      ...positionArgs,
      programs: null,
    });
  }

  /**
   * Helper method to enforcing isolated updating of an existing
   * delegation. This function ensures that the assets
   * stored at the existing position will be reused.
   *
   * @param delegationArgs
   * @returns
   */
  updateDelegation(delegationArgs: Omit<ILockConfigArgs, "lockedValues">) {
    return this.lock({
      ...delegationArgs,
      lockedValues: null,
    });
  }

  /**
   * Unlocks a position in its entirety.
   *
   * @param unlockArgs
   * @returns
   */
  unlock(unlockArgs: Omit<ILockConfigArgs, "lockedValues">) {
    // We just reverse the lock process.
    return this.lock({
      ...unlockArgs,
      lockedValues: [],
    });
  }

  /**
   * Completes a yield farming transaction by processing referral fees,
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
   * @param {IYieldFarmingCompleteTxArgs} args - The arguments required to complete the transaction, including:
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
  }: IYieldFarmingCompleteTxArgs): Promise<
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
                  "hex"
                ).toString("utf-8")
              : "ADA"
          }`
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
          referralFee?.payment?.metadata ?? ADA_METADATA
        ),
      },
      datum,
      async build() {
        if (!finishedTx) {
          finishedTx = await tx.complete();
        }

        thisTx.fees.cardanoTxFee = new AssetAmount(
          BigInt(txFee?.to_str() ?? finishedTx?.fee?.toString() ?? "0"),
          6
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
