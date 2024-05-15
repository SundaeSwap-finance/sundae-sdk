import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  EDatumType,
  VOID_REDEEMER,
  type IComposedTx,
  type ITxBuilderReferralFee,
  type TSupportedNetworks,
} from "@sundaeswap/core";
import {
  DatumBuilderLucidV1,
  LucidHelper,
  TxBuilderLucidV1,
} from "@sundaeswap/core/lucid";
import { SundaeUtils } from "@sundaeswap/core/utilities";
import {
  type Assets,
  type Datum,
  type Lucid,
  type Tx,
  type TxComplete,
} from "lucid-cardano";

import { ILockConfigArgs, IMigrateConfigArgs } from "../../@types/configs.js";
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

interface IYieldFarmingParams {
  referenceInput: string;
  scriptHash: string;
  stakeKeyHash: string;
  minLockAda: bigint;
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
  network: TSupportedNetworks;
  datumBuilder: DatumBuilderLucid;

  static PARAMS: Record<TSupportedNetworks, IYieldFarmingParams> = {
    mainnet: {
      stakeKeyHash: "d7244b4a8777b7dc6909f4640cf02ea4757a557a99fb483b05f87dfe",
      scriptHash: "73275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c",
      referenceInput:
        "006ddd85cfc2e2d8b7238daa37b37a5db2ac63de2df35884a5e501667981e1e3#0",
      minLockAda: 5_000_000n,
    },
    preview: {
      stakeKeyHash: "045d47cac5067ce697478c11051deb935a152e0773a5d7430a11baa8",
      scriptHash: "73275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c",
      referenceInput:
        "aaaf193b8418253f4169ab869b77dedd4ee3df4f2837c226cee3c2f7fa955189#0",
      minLockAda: 5_000_000n,
    },
  };

  constructor(public lucid: Lucid) {
    const network = lucid.network === "Mainnet" ? "mainnet" : "preview";

    this.datumBuilder = new DatumBuilderLucid(network);
    this.network = network;
  }

  /**
   * Helper method to get a specific parameter of the transaction builder.
   *
   * @param {K extends keyof IYieldFarmingParams} param The parameter you want to retrieve.
   * @param {TSupportedNetworks} network The protocol network.
   * @returns {IYieldFarmingParams[K]}
   */
  static getParam<K extends keyof IYieldFarmingParams>(
    param: K,
    network: TSupportedNetworks
  ): IYieldFarmingParams[K] {
    return YieldFarmingLucid.PARAMS[network][param];
  }

  /**
   * An internal shortcut method to avoid having to pass in the network all the time.
   *
   * @param param The parameter you want to retrieve.
   * @returns {IYieldFarmingParams}
   */
  private __getParam<K extends keyof IYieldFarmingParams>(param: K) {
    return YieldFarmingLucid.getParam(param, this.network);
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

    const [referenceInput, existingPositionData] = await Promise.all([
      this.lucid.provider.getUtxosByOutRef([
        {
          txHash: this.__getParam("referenceInput").split("#")[0],
          outputIndex: Number(this.__getParam("referenceInput").split("#")[1]),
        },
      ]),
      (() =>
        existingPositions &&
        existingPositions.length > 0 &&
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
    if (payment.lovelace < this.__getParam("minLockAda")) {
      payment.lovelace = this.__getParam("minLockAda");
    }

    const contractAddress = this.lucid.utils.credentialToAddress(
      {
        hash: this.__getParam("scriptHash"),
        type: "Script",
      },
      {
        hash: this.__getParam("stakeKeyHash"),
        type: "Key",
      }
    );

    if (!contractAddress) {
      throw new Error("Could not generate a valid contract address.");
    }

    const signerKey = LucidHelper.getAddressHashes(ownerAddress.address);
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
      (existingPositions?.length ?? 0) > 0 ? 0n : this.__getParam("minLockAda"),
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
          address: ownerAddress.address,
        },
        programs: programs || [],
      });
      inline = newDatum.inline;
    }

    if (!inline) {
      throw new Error(
        "A datum was not constructed for this lockup, which can brick the funds! Aborting."
      );
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

  async migrateToV3(migrationArgs: IMigrateConfigArgs) {
    const { ownerAddress, migrations, existingPositions } = migrationArgs;
    const txBuilder = new TxBuilderLucidV1(
      this.lucid,
      new DatumBuilderLucidV1(this.network)
    );
    const withdrawAssetsList = migrations.reduce((list, { withdrawPool }) => {
      list.push(withdrawPool.assetLP.assetId.replace(".", ""));
      return list;
    }, [] as string[]);
    const newLockedAssets: Record<
      string,
      IAssetAmountMetadata & { amount: bigint }
    > = {};
    const migrationAssets: Record<
      string,
      IAssetAmountMetadata & { amount: bigint }
    > = {};

    if (!existingPositions || existingPositions.length === 0) {
      throw new Error("There must be a list of existing positions to migrate!");
    }

    const existingPositionsData = await this.lucid.provider.getUtxosByOutRef(
      existingPositions.map(({ hash, index }) => ({
        outputIndex: index,
        txHash: hash,
      }))
    );

    existingPositionsData.forEach(({ assets }) => {
      for (const [id, amount] of Object.entries(assets)) {
        if (withdrawAssetsList.includes(id)) {
          if (!migrationAssets[id]) {
            migrationAssets[id] = {
              amount,
              assetId: id,
              decimals: 0, // Decimals aren't required since we just use the raw amount.
            };
          } else {
            migrationAssets[id].amount += amount;
          }
        } else {
          if (!newLockedAssets[id]) {
            newLockedAssets[id] = {
              amount,
              assetId: id,
              decimals: 0, // Decimals aren't required since we just use the raw amount.
            };
          } else {
            newLockedAssets[id].amount += amount;
          }
        }
      }
    });

    if (Object.keys(migrationAssets).length === 0) {
      throw new Error(
        "There were no eligible assets to migrate within the provided existing positions. Please check your migration config, and try again."
      );
    }

    const lockContractAddress = this.lucid.utils.credentialToAddress(
      {
        hash: this.__getParam("scriptHash"),
        type: "Script",
      },
      {
        hash: this.__getParam("stakeKeyHash"),
        type: "Key",
      }
    );

    const { tx } = await txBuilder.migrateLiquidityToV3(
      migrations.map(({ withdrawPool, depositPool }) => {
        const oldDelegation = existingPositionsData.find(({ assets }) => {
          if (assets[withdrawPool.assetLP.assetId.replace(".", "")]) {
            return true;
          }
        });

        if (!oldDelegation) {
          throw new Error("Could not find a matching delegation!");
        }

        return {
          depositPool,
          withdrawConfig: {
            orderAddresses: {
              DestinationAddress: {
                address: lockContractAddress,
                datum: {
                  type: EDatumType.INLINE,
                  value: oldDelegation.datum as string,
                },
              },
              AlternateAddress: ownerAddress.address,
            },
            pool: withdrawPool,
            suppliedLPAsset: new AssetAmount(
              migrationAssets[
                withdrawPool.assetLP.assetId.replace(".", "")
              ].amount,
              withdrawPool.assetLP
            ),
          },
        };
      })
    );

    const newPayment: Assets = {};
    Object.values(newLockedAssets).forEach(({ amount, assetId }) => {
      if (newPayment[assetId.replace(".", "")]) {
        newPayment[assetId.replace(".", "")] += amount;
      } else {
        newPayment[assetId.replace(".", "")] = amount;
      }
    });

    const updatedTx = await tx
      .collectFrom(existingPositionsData)
      .payToContract(
        lockContractAddress,
        { inline: existingPositionsData[0].datum as string },
        newPayment
      );

    return this.completeTx({
      tx: updatedTx,
      deposit: new AssetAmount(
        BigInt(migrations.length) * this.__getParam("minLockAda"),
        ADA_METADATA
      ),
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
