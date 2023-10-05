import {
  Data,
  toUnit,
  type Lucid,
  type MintingPolicy,
  fromText,
} from "lucid-cardano";

import { IDepositArgs } from "./@types";
import { AbstractTasteTest } from "./lib/classes/AbstractTasteTest.class";
import {
  DiscoveryNodeAction,
  NodeValidatorAction,
  SetNode,
} from "./@types/contracts";
import { findCoveringNode } from "./utils";
import { SETNODE_PREFIX } from "./lib/contants";

export class TasteTest<T = Lucid> implements AbstractTasteTest {
  constructor(public lucid: Lucid) {}

  public async deposit(args: IDepositArgs): Promise<ITxBuilderSign> {
    const walletUtxos = await this.lucid.wallet.getUtxos();
    const walletAddress = await this.lucid.wallet.address();

    if (!walletUtxos.length) {
      throw new Error("No available UTXOs found in wallet.");
    }

    const nodeValidatorAddr = this.lucid.utils.validatorToAddress({
      type: "PlutusV2",
      script: args.scripts.validator,
    });

    const nodePolicyId = this.lucid.utils.mintingPolicyToId({
      type: "PlutusV2",
      script: args.scripts.policy,
    });

    const userKey =
      this.lucid.utils.getAddressDetails(walletAddress).paymentCredential?.hash;

    if (!userKey) {
      throw new Error("Missing wallet's payment credential hash.");
    }

    const nodeUTXOs =
      args.utxos.length > 0
        ? args.utxos
        : await this.lucid.utxosAt(nodeValidatorAddr);

    const coveringNode = findCoveringNode(nodeUTXOs, userKey);

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

    const upperBound = config.currenTime + TIME_TOLERANCE_MS;
    const lowerBound = config.currenTime - TIME_TOLERANCE_MS;

    try {
      const tx = await lucid
        .newTx()
        .collectFrom([coveringNode], redeemerNodeValidator)
        .compose(
          config.refScripts?.nodeValidator
            ? lucid.newTx().readFrom([config.refScripts.nodeValidator])
            : lucid.newTx().attachSpendingValidator(nodeValidator)
        )
        // .attachSpendingValidator(nodeValidator)
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
        // .attachMintingPolicy(nodePolicy)
        .compose(
          config.refScripts?.nodePolicy
            ? lucid.newTx().readFrom([config.refScripts.nodePolicy])
            : lucid.newTx().attachMintingPolicy(nodePolicy)
        )
        .validFrom(lowerBound)
        .validTo(upperBound)
        .complete();

      return { type: "ok", data: tx };
    } catch (error) {
      if (error instanceof Error) return { type: "error", error: error };

      return { type: "error", error: new Error(`${JSON.stringify(error)}`) };
    }
  }
}
