import { AssetAmount } from "@sundaeswap/asset";
import type {
  ITxBuilder,
  ITxBuilderFees,
  ITxBuilderReferralFee,
} from "@sundaeswap/core";
import {
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

import { IDepositArgs } from "./@types";
import {
  DiscoveryNodeAction,
  NodeValidatorAction,
  SetNode,
} from "./@types/contracts";
import { AbstractTasteTest } from "./lib/classes/AbstractTasteTest.class";
import {
  FOLDING_FEE_ADA,
  MIN_COMMITMENT_ADA,
  NODE_ADA,
  SETNODE_PREFIX,
  TIME_TOLERANCE_MS,
} from "./lib/contants";
import { findCoveringNode } from "./utils";

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

    let nodeValidator: SpendingValidator;
    if ("txHash" in args.scripts.validator) {
      const script = (
        await this.lucid.provider.getUtxosByOutRef([args.scripts.validator])
      )?.[0];
      if (!script?.scriptRef) {
        throw new Error(
          "Could not derive UTXO from supplied OutRef in scripts.validator."
        );
      }
      nodeValidator = script.scriptRef;
    } else {
      nodeValidator = args.scripts.validator;
    }

    const nodeValidatorAddr =
      this.lucid.utils.validatorToAddress(nodeValidator);

    let nodePolicy: MintingPolicy;
    if ("txHash" in args.scripts.policy) {
      const script = (
        await this.lucid.provider.getUtxosByOutRef([args.scripts.policy])
      )?.[0];
      if (!script?.scriptRef) {
        throw new Error(
          "Could not derive UTXO from supplied OutRef in scripts.policy."
        );
      }
      nodePolicy = script.scriptRef;
    } else {
      nodePolicy = args.scripts.policy;
    }

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
}
