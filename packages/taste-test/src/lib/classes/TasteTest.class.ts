import { AssetAmount } from "@sundaeswap/asset";
import type {
  ITxBuilder,
  ITxBuilderFees,
  ITxBuilderReferralFee,
} from "@sundaeswap/core";
import {
  Assets,
  Data,
  Datum,
  SpendingValidator,
  Tx,
  TxComplete,
  UTxO,
  fromText,
  toUnit,
  type Lucid,
  type MintingPolicy,
} from "lucid-cardano";

import {
  IBaseArgs,
  IDepositArgs,
  IUpdateArgs,
  IWithdrawArgs,
} from "../../@types";
import {
  DiscoveryNodeAction,
  NodeValidatorAction,
  SetNode,
} from "../../@types/contracts";
import {
  divCeil,
  findCoveringNode,
  findOwnNode,
  findPrevNode,
} from "../../utils";
import {
  FOLDING_FEE_ADA,
  MIN_COMMITMENT_ADA,
  NODE_ADA,
  SETNODE_PREFIX,
  TIME_TOLERANCE_MS,
  TWENTY_FOUR_HOURS_MS,
} from "../contants";
import { AbstractTasteTest } from "./AbstractTasteTest.class";

/**
 * Object arguments for completing a transaction.
 */
interface ITasteTestCompleteTxArgs {
  tx: Tx;
  referralFee?: ITxBuilderReferralFee;
  datum?: string;
  complete?: boolean;
}

export class TasteTest implements AbstractTasteTest {
  constructor(public lucid: Lucid) {}

  public async deposit(
    args: IDepositArgs
  ): Promise<ITxBuilder<Tx, Datum | undefined>> {
    const walletUtxos = await this.lucid.wallet.getUtxos();
    const walletAddress = await this.lucid.wallet.address();

    if (!walletUtxos.length) {
      throw new Error("No available UTXOs found in wallet.");
    }

    if (!args.scripts) {
      throw new Error(
        "Did not receive a reference script UTXO or raw PlutusV2 CBOR script for the validator."
      );
    }

    const nodeValidator = await this.getNodeValidatorFromArgs(args);
    const nodeValidatorAddr =
      this.lucid.utils.validatorToAddress(nodeValidator);
    const nodePolicy = await this.getNodePolicyFromArgs(args);
    const nodePolicyId = this.lucid.utils.mintingPolicyToId(nodePolicy);

    const userKey =
      this.lucid.utils.getAddressDetails(walletAddress).paymentCredential?.hash;

    if (!userKey) {
      throw new Error("Missing wallet's payment credential hash.");
    }

    let coveringNode: UTxO | undefined;
    if (args.utxos) {
      coveringNode = args.utxos[0];
    } else {
      const nodeUTXOs = await this.lucid.utxosAt(nodeValidatorAddr);
      coveringNode = findCoveringNode(nodeUTXOs, userKey);
    }

    if (!coveringNode || !coveringNode.datum) {
      throw new Error("Could not find covering node.");
    }

    const coveringNodeDatum = Data.from(coveringNode.datum, SetNode);

    const prevNodeDatum = Data.to(
      {
        key: coveringNodeDatum.key,
        next: userKey,
      },
      SetNode
    );

    const nodeDatum = Data.to(
      {
        key: userKey,
        next: coveringNodeDatum.next,
      },
      SetNode
    );

    const redeemerNodePolicy = Data.to(
      {
        PInsert: {
          keyToInsert: userKey,
          coveringNode: coveringNodeDatum,
        },
      },
      DiscoveryNodeAction
    );

    const redeemerNodeValidator = Data.to("LinkedListAct", NodeValidatorAction);

    const assets = {
      [toUnit(nodePolicyId, `${fromText(SETNODE_PREFIX)}${userKey}`)]: 1n,
    };

    const correctAmount = BigInt(args.assetAmount.amount) + MIN_COMMITMENT_ADA;

    const upperBound = (args?.currentTime ?? Date.now()) + TIME_TOLERANCE_MS;
    const lowerBound = (args?.currentTime ?? Date.now()) - TIME_TOLERANCE_MS;

    const tx = this.lucid
      .newTx()
      .collectFrom([coveringNode], redeemerNodeValidator)
      .compose(this.lucid.newTx().attachSpendingValidator(nodeValidator))
      .payToContract(
        nodeValidatorAddr,
        { inline: prevNodeDatum },
        coveringNode.assets
      )
      .payToContract(
        nodeValidatorAddr,
        { inline: nodeDatum },
        { ...assets, lovelace: correctAmount }
      )
      .addSignerKey(userKey)
      .mintAssets(assets, redeemerNodePolicy)
      .compose(this.lucid.newTx().attachMintingPolicy(nodePolicy))
      .validFrom(lowerBound)
      .validTo(upperBound);

    return this.completeTx({ tx, referralFee: args.referralFee });
  }

  public async update(
    args: IUpdateArgs
  ): Promise<ITxBuilder<unknown, unknown>> {
    const nodeValidator = await this.getNodeValidatorFromArgs(args);
    const nodeValidatorAddr =
      this.lucid.utils.validatorToAddress(nodeValidator);

    const userKey = this.lucid.utils.getAddressDetails(
      await this.lucid.wallet.address()
    ).paymentCredential?.hash;

    if (!userKey) {
      throw new Error("Missing wallet's payment credential hash.");
    }

    let ownNode: UTxO | undefined;
    if (args.utxos) {
      ownNode = args.utxos[0];
    } else {
      const nodeUTXOs = await this.lucid.utxosAt(nodeValidatorAddr);
      ownNode = findOwnNode(nodeUTXOs, userKey);
    }

    if (!ownNode || !ownNode.datum) {
      throw new Error("Could not find covering node.");
    }

    const redeemerNodeValidator = Data.to(
      "ModifyCommitment",
      NodeValidatorAction
    );

    const newNodeAssets: Assets = {};
    Object.entries(ownNode.assets).forEach(([key, value]) => {
      newNodeAssets[key] = BigInt(value);
    });

    newNodeAssets["lovelace"] =
      newNodeAssets["lovelace"] + args.assetAmount.amount;

    const tx = this.lucid
      .newTx()
      .collectFrom([ownNode], redeemerNodeValidator)
      .compose(this.lucid.newTx().attachSpendingValidator(nodeValidator))
      .payToContract(
        nodeValidatorAddr,
        { inline: ownNode.datum },
        newNodeAssets
      );

    return this.completeTx({ tx, referralFee: args.referralFee });
  }

  public async withdraw(
    args: IWithdrawArgs
  ): Promise<ITxBuilder<Tx, Datum | undefined>> {
    const nodeValidator = await this.getNodeValidatorFromArgs(args);
    const nodeValidatorAddr =
      this.lucid.utils.validatorToAddress(nodeValidator);

    const nodePolicy = await this.getNodePolicyFromArgs(args);
    const nodePolicyId = this.lucid.utils.mintingPolicyToId(nodePolicy);

    const userKey = this.lucid.utils.getAddressDetails(
      await this.lucid.wallet.address()
    ).paymentCredential?.hash;

    if (!userKey) {
      throw new Error("Missing wallet's payment credential hash.");
    }

    const nodeUTXOS = args.utxos
      ? args.utxos
      : await this.lucid.utxosAt(nodeValidatorAddr);

    let ownNode: UTxO | undefined;
    if (args.utxos) {
      ownNode = nodeUTXOS[0];
    } else {
      const nodeUTXOs = await this.lucid.utxosAt(nodeValidatorAddr);
      ownNode = findOwnNode(nodeUTXOs, userKey);
    }

    if (!ownNode || !ownNode.datum) {
      throw new Error("Could not find covering node.");
    }

    const nodeDatum = Data.from(ownNode.datum, SetNode);

    let prevNode: UTxO | undefined;
    if (args.utxos) {
      prevNode = args.utxos[0];
    } else {
      prevNode = findPrevNode(nodeUTXOS, userKey);
    }

    if (!prevNode || !prevNode.datum) {
      throw new Error("Could not find previous node.");
    }

    const prevNodeDatum = Data.from(prevNode.datum, SetNode);

    const assets = {
      [toUnit(nodePolicyId, fromText(SETNODE_PREFIX) + userKey)]: -1n,
    };

    const newPrevNode: SetNode = {
      key: prevNodeDatum.key,
      next: nodeDatum.next,
    };

    const newPrevNodeDatum = Data.to(newPrevNode, SetNode);

    const redeemerNodePolicy = Data.to(
      {
        PRemove: {
          keyToRemove: userKey,
          coveringNode: newPrevNode,
        },
      },
      DiscoveryNodeAction
    );

    const redeemerNodeValidator = Data.to("LinkedListAct", NodeValidatorAction);
    const upperBound = (args?.currentTime ?? Date.now()) + TIME_TOLERANCE_MS;
    const lowerBound = (args?.currentTime ?? Date.now()) - TIME_TOLERANCE_MS;

    const beforeDeadline = upperBound < args.deadline;
    const beforeTwentyFourHours =
      upperBound < args.deadline - TWENTY_FOUR_HOURS_MS;

    if (beforeDeadline && beforeTwentyFourHours) {
      const tx = this.lucid
        .newTx()
        .collectFrom([ownNode, prevNode], redeemerNodeValidator)
        .compose(this.lucid.newTx().attachSpendingValidator(nodeValidator))
        .payToContract(
          nodeValidatorAddr,
          { inline: newPrevNodeDatum },
          prevNode.assets
        )
        .addSignerKey(userKey)
        .mintAssets(assets, redeemerNodePolicy)
        // .attachMintingPolicy(nodePolicy)
        .compose(this.lucid.newTx().attachMintingPolicy(nodePolicy))
        .validFrom(lowerBound)
        .validTo(upperBound);

      return this.completeTx({ tx, referralFee: args.referralFee });
    } else if (beforeDeadline && !beforeTwentyFourHours) {
      const penaltyAmount = divCeil(ownNode.assets["lovelace"], 4n);

      const tx = this.lucid
        .newTx()
        .collectFrom([ownNode, prevNode], redeemerNodeValidator)
        // .attachSpendingValidator(nodeValidator)
        .compose(this.lucid.newTx().attachSpendingValidator(nodeValidator))
        .payToContract(
          nodeValidatorAddr,
          { inline: newPrevNodeDatum },
          prevNode.assets
        )
        .payToAddress(args.penaltyAddress, {
          lovelace: penaltyAmount,
        })
        .addSignerKey(userKey)
        .mintAssets(assets, redeemerNodePolicy)
        // .attachMintingPolicy(nodePolicy)
        .compose(this.lucid.newTx().attachMintingPolicy(nodePolicy))
        .validFrom(lowerBound)
        .validTo(upperBound);

      return this.completeTx({ tx, referralFee: args.referralFee });
    }

    const tx = this.lucid
      .newTx()
      .collectFrom([ownNode, prevNode], redeemerNodeValidator)
      .compose(this.lucid.newTx().attachSpendingValidator(nodeValidator))
      .payToContract(
        nodeValidatorAddr,
        { inline: newPrevNodeDatum },
        prevNode.assets
      )
      .addSignerKey(userKey)
      .mintAssets(assets, redeemerNodePolicy)
      .compose(this.lucid.newTx().attachMintingPolicy(nodePolicy))
      .validFrom(lowerBound)
      .validTo(upperBound);

    return this.completeTx({ tx, referralFee: args.referralFee });
  }

  private async completeTx({
    tx,
    referralFee,
  }: ITasteTestCompleteTxArgs): Promise<ITxBuilder<Tx, Datum | undefined>> {
    if (referralFee) {
      if (referralFee.payment.metadata.assetId !== "") {
        tx.payToAddress(referralFee.destination, {
          [referralFee.payment.metadata.assetId]: referralFee.payment.amount,
        });
      } else {
        tx.payToAddress(referralFee.destination, {
          lovelace: referralFee.payment.amount,
        });
      }
    }

    const baseFees: Omit<ITxBuilderFees, "cardanoTxFee"> = {
      deposit: new AssetAmount(NODE_ADA, 6),
      referral: referralFee?.payment,
      foldFee: new AssetAmount(FOLDING_FEE_ADA, 6),
      scooperFee: new AssetAmount(0n),
    };

    const txFee = tx.txBuilder.get_fee_if_set();
    let finishedTx: TxComplete | undefined;
    const thisTx: ITxBuilder<Tx, Datum | undefined> = {
      tx,
      fees: baseFees,
      datum: Buffer.from(tx.txBuilder.to_bytes()).toString("hex"),
      async build() {
        if (!finishedTx) {
          finishedTx = await tx.complete();
          thisTx.fees.cardanoTxFee = new AssetAmount(
            BigInt(txFee?.to_str() ?? finishedTx?.fee?.toString() ?? "0"),
            6
          );
        }

        return {
          cbor: Buffer.from(finishedTx.txComplete.to_bytes()).toString("hex"),
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

  /**
   * Retrieves the node validator based on the provided arguments.
   * It either fetches the validator directly from the arguments or derives it from a transaction hash.
   *
   * @param {IBaseArgs} args - The arguments containing information about scripts.
   * @param {Object} args.scripts - Contains the scripts information.
   * @param {Object} args.scripts.validator - The validator script or information to derive the script.
   * @returns {Promise<SpendingValidator>} - Returns a SpendingValidator.
   * @throws Will throw an error if unable to derive UTXO from the provided OutRef in `scripts.validator`.
   * @async
   * @private
   */
  private async getNodeValidatorFromArgs({
    scripts,
  }: IBaseArgs): Promise<SpendingValidator> {
    let nodeValidator: SpendingValidator;
    if ("txHash" in scripts.validator) {
      const script = (
        await this.lucid.provider.getUtxosByOutRef([scripts.validator])
      )?.[0];
      if (!script?.scriptRef) {
        throw new Error(
          "Could not derive UTXO from supplied OutRef in scripts.validator."
        );
      }
      nodeValidator = script.scriptRef;
    } else {
      nodeValidator = scripts.validator;
    }

    return nodeValidator;
  }

  /**
   * Retrieves the node minting policy ID based on the provided arguments.
   * It either fetches the policy ID directly from the arguments or derives it from a transaction hash.
   *
   * @param {IBaseArgs} args - The arguments containing information about scripts.
   * @param {Object} args.scripts - Contains the scripts information.
   * @param {Object} args.scripts.policy - The policy script or information to derive the script.
   * @returns {Promise<MintingPolicy>} - Returns a MintingPolicy.
   * @throws Will throw an error if unable to derive UTXO from the provided OutRef in `scripts.policy`.
   * @async
   * @private
   */
  private async getNodePolicyFromArgs({
    scripts,
  }: IBaseArgs): Promise<MintingPolicy> {
    let nodePolicy: MintingPolicy;
    if ("txHash" in scripts.policy) {
      const script = (
        await this.lucid.provider.getUtxosByOutRef([scripts.policy])
      )?.[0];
      if (!script?.scriptRef) {
        throw new Error(
          "Could not derive UTXO from supplied OutRef in scripts.policy."
        );
      }
      nodePolicy = script.scriptRef;
    } else {
      nodePolicy = scripts.policy;
    }

    return nodePolicy;
  }
}
