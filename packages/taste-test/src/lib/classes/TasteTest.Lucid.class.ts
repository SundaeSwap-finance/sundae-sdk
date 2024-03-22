import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import type { IComposedTx, ITxBuilderReferralFee } from "@sundaeswap/core";
import { SundaeUtils } from "@sundaeswap/core/utilities";
import {
  Assets,
  Data,
  Datum,
  Tx,
  TxComplete,
  UTxO,
  fromText,
  toUnit,
  type Lucid,
} from "lucid-cardano";

import {
  LiquidityNodeAction,
  LiquiditySetNode,
  NodeValidatorAction,
  SetNode,
} from "../../@types/contracts.js";
import {
  EScriptType,
  IBaseArgs,
  IClaimArgs,
  IDepositArgs,
  ITasteTestFees,
  IUpdateArgs,
  IWithdrawArgs,
  TScriptType,
  TTasteTestType,
} from "../../@types/index.js";
import {
  divCeil,
  findCoveringNode,
  findOwnNode,
  findPrevNode,
} from "../../utils.js";
import { AbstractTasteTest } from "../Abstracts/AbstractTasteTest.class.js";
import {
  FOLDING_FEE_ADA,
  MIN_COMMITMENT_ADA,
  NODE_DEPOSIT_ADA,
  SETNODE_PREFIX,
  TIME_TOLERANCE_MS,
  TT_UTXO_ADDITIONAL_ADA,
  TWENTY_FOUR_HOURS_MS,
} from "../contants.js";

/**
 * Object arguments for completing a transaction.
 */
export interface ITasteTestCompleteTxArgs {
  tx: Tx;
  referralFee?: ITxBuilderReferralFee;
  hasFees?: boolean;
  penalty?: AssetAmount<IAssetAmountMetadata>;
}

/**
 * Represents the TasteTest class capable of handling various blockchain interactions for a protocol Taste Test.
 *
 * This class encapsulates methods for common operations required in the Taste Test process on the blockchain.
 * It provides an interface to deposit assets, withdraw them, and update the commitment amounts. Each operation
 * is transaction-based and interacts with blockchain smart contracts to ensure the correct execution of business logic.
 *
 * The TasteTest class relies on the Lucid service, which can come either from your own instance or from an existing
 * SundaeSDK class instance (as shown below). The class methods handle the detailed steps of each operation, including
 * transaction preparation, fee handling, and error checking, abstracting these complexities from the end user.
 *
 * Usage example (not part of the actual documentation):
 * ```ts
 * import type { Lucid } from "lucid-cardano";
 * const tasteTest = new TasteTest(sdk.build<unknown, Lucid>().wallet);
 *
 * // For depositing assets into the taste test smart contract
 * tasteTest.deposit({ ... }).then(({ build, fees }) => console.log(fees));
 *
 * // For withdrawing assets from the taste test smart contract
 * tasteTest.withdraw({ ... }).then(({ build, fees }) => console.log(fees));;
 *
 * // For updating the committed assets in the taste test smart contract
 * tasteTest.update({ ... }).then(({ build, fees }) => console.log(fees));;
 * ```
 *
 * @public
 * @class
 * @implements {AbstractTasteTest}
 * @param {Lucid} lucid - An instance of the Lucid class, providing various utility methods for blockchain interactions.
 */
export class TasteTestLucid implements AbstractTasteTest {
  constructor(public lucid: Lucid) {}

  /**
   * Initiates a deposit transaction, conducting various checks and orchestrating the transaction construction.
   *
   * This method is in charge of initiating a deposit operation. It first verifies the availability of UTXOs in the wallet
   * and checks for the presence of necessary scripts. It retrieves the node validator and policy, determines the user's key,
   * and identifies the covering node based on the provided or found UTXOs.
   *
   * If a covering node is not identified, the method checks whether the user already owns a node and, based on the `updateFallback`
   * flag, either updates the node or throws an error. After identifying the covering node, it prepares the necessary data structures
   * and transaction components, including the redeemer policy and validator actions.
   *
   * The transaction is then constructed, incorporating various elements such as assets, validators, and minting policies.
   * It ensures the transaction falls within a valid time frame and completes it by setting the appropriate fees and preparing
   * it for submission.
   *
   * @public
   * @param {IDepositArgs} args - The required arguments for the deposit operation.
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} - Returns a promise that resolves with a transaction builder object,
   * which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   * @async
   * @throws {Error} Throws an error if no UTXOs are available, if reference scripts are missing, or if a covering node cannot be found.
   */
  public async deposit(
    args: IDepositArgs
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined, ITasteTestFees>> {
    const walletUtxos = await this.lucid.wallet.getUtxos();
    const { updateFallback = false } = args;

    if (!walletUtxos.length) {
      throw new Error("No available UTXOs found in wallet.");
    }

    if (!args.scripts) {
      throw new Error(
        "Did not receive a reference script UTXO or raw PlutusV2 CBOR script for the validator."
      );
    }

    const userKey = await this.getUserKey();

    let coveringNode: UTxO | undefined;
    const nodeUTXOs = await this.lucid.utxosAt(args.validatorAddress);

    if (args.utxos) {
      coveringNode = args.utxos[0];
    } else {
      coveringNode = findCoveringNode(nodeUTXOs, userKey, "Liquidity");
    }

    if (!coveringNode || !coveringNode.datum) {
      const hasOwnNode = findOwnNode(nodeUTXOs, userKey, "Liquidity");
      if (hasOwnNode && updateFallback) {
        return this.update({ ...args });
      }

      throw new Error("Could not find covering node.");
    }

    const coveringNodeDatum = Data.from(coveringNode.datum, LiquiditySetNode);

    const prevNodeDatum = Data.to(
      {
        key: coveringNodeDatum.key,
        next: userKey,
        commitment: 0n,
      },
      LiquiditySetNode
    );

    const nodeDatum = Data.to(
      {
        key: userKey,
        next: coveringNodeDatum.next,
        commitment: 0n,
      },
      LiquiditySetNode
    );

    const redeemerNodePolicy = Data.to(
      {
        PInsert: {
          keyToInsert: userKey,
          coveringNode: coveringNodeDatum,
        },
      },
      LiquidityNodeAction
    );

    const redeemerNodeValidator = Data.to("LinkedListAct", NodeValidatorAction);

    let nodePolicyId: string | undefined;
    if (args.scripts.policy.type === EScriptType.OUTREF) {
      nodePolicyId = args.scripts.policy.value.hash;
    } else if (args.scripts.policy.type === EScriptType.POLICY) {
      nodePolicyId = this.lucid.utils.mintingPolicyToId(
        args.scripts.policy.value
      );
    }

    if (!nodePolicyId) {
      throw new Error("Could not derive a PolicyID for burning the node NFT!");
    }

    const assets = {
      [toUnit(nodePolicyId, `${fromText(SETNODE_PREFIX)}${userKey}`)]: 1n,
    };

    if (args.assetAmount.amount < MIN_COMMITMENT_ADA) {
      throw new Error("Amount deposited is less than the minimum amount.");
    }

    const correctAmount =
      BigInt(args.assetAmount.amount) + TT_UTXO_ADDITIONAL_ADA;

    const tx = this.lucid
      .newTx()
      .collectFrom([coveringNode], redeemerNodeValidator)
      .payToContract(
        args.validatorAddress,
        { inline: prevNodeDatum },
        coveringNode.assets
      )
      .payToContract(
        args.validatorAddress,
        { inline: nodeDatum },
        { ...assets, lovelace: correctAmount }
      )
      .addSignerKey(userKey)
      .mintAssets(assets, redeemerNodePolicy)
      .validFrom(Date.now() - TIME_TOLERANCE_MS)
      .validTo(Date.now() + TIME_TOLERANCE_MS);

    await Promise.all([
      this._attachScriptsOrReferenceInputs(tx, args.scripts.policy),
      this._attachScriptsOrReferenceInputs(tx, args.scripts.validator),
    ]);

    return this.completeTx({
      tx,
      referralFee: args.referralFee,
      hasFees: true,
    });
  }

  /**
   * Initiates an update transaction for a node's assets, ensuring various checks and constructing the transaction.
   *
   * This method is responsible for initiating an update operation for a node. It starts by retrieving the node validator
   * and determining the user's key. It then searches for the user's own node, either based on provided UTXOs or by querying
   * the blockchain, and throws an error if the node isn't found or doesn't have a datum.
   *
   * Upon successfully identifying the node, the method prepares the redeemer for the node validator action and recalculates
   * the node's assets based on the new input amount. It then constructs a transaction that collects from the identified node
   * and repays it to the contract with updated assets.
   *
   * The transaction is assembled with appropriate components and redeemer information, ensuring the updated assets are correctly
   * set and the transaction is valid. The method completes the transaction by applying the necessary fees and preparing it for
   * submission.
   *
   * @public
   * @param {IUpdateArgs} args - The arguments required for the update operation, including potential UTXOs and the amount to add.
   * @returns {Promise<IComposedTx<Tx, TxComplete, string | undefined>>} - Returns a promise that resolves with a transaction builder object,
   * equipped with the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   * @async
   * @throws {Error} Throws an error if the user's payment credential hash is missing or if the node with the required datum cannot be found.
   */
  public async update(
    args: IUpdateArgs
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined, ITasteTestFees>> {
    const userKey = await this.getUserKey();

    if (!userKey) {
      throw new Error("Missing wallet's payment credential hash.");
    }

    let ownNode: UTxO | undefined;
    if (args.utxos) {
      ownNode = args.utxos[0];
    } else {
      const nodeUTXOs = await this.lucid.utxosAt(args.validatorAddress);
      ownNode = findOwnNode(
        nodeUTXOs,
        userKey,
        this._getTasteTestTypeFromArgs(args)
      );
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
      .payToContract(
        args.validatorAddress,
        { inline: ownNode.datum },
        newNodeAssets
      )
      .validFrom(Date.now() - TIME_TOLERANCE_MS)
      .validTo(Date.now() + TIME_TOLERANCE_MS);

    this._attachScriptsOrReferenceInputs(tx, args.scripts.validator);

    return this.completeTx({ tx, referralFee: args.referralFee });
  }

  /**
   * Processes a withdrawal transaction, handling various pre-conditions and state checks.
   *
   * This method is responsible for orchestrating a withdrawal operation, including validating nodes,
   * ensuring proper policy adherence, and constructing the necessary transaction steps. It checks
   * for the user's participation in the network, retrieves the associated validator and policy information,
   * and determines the rightful ownership of assets.
   *
   * Depending on the transaction's timing relative to certain deadlines, different transaction paths may be taken.
   * This could involve simply completing the transaction or applying a penalty in certain conditions. The method
   * handles these variations and constructs the appropriate transaction type.
   *
   * After preparing the necessary information and constructing the transaction steps, it completes the transaction
   * by setting the appropriate fees and preparing it for submission.
   *
   * @public
   * @param {IWithdrawArgs} args - The required arguments for the withdrawal operation.
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} - Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   * @async
   * @throws {Error} Throws errors if the withdrawal conditions are not met, such as missing keys, inability to find nodes, or ownership issues.
   */
  public async withdraw(
    args: IWithdrawArgs
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined, ITasteTestFees>> {
    const userKey = await this.getUserKey();

    if (!userKey) {
      throw new Error("Missing wallet's payment credential hash.");
    }

    const isLiquidityTasteTest =
      this._getTasteTestTypeFromArgs(args) === "Liquidity";
    const nodeUTXOS = args.utxos
      ? args.utxos
      : await this.lucid.utxosAt(args.validatorAddress);

    let ownNode: UTxO | undefined;
    if (args.utxos) {
      ownNode = nodeUTXOS[0];
    } else {
      const nodeUTXOs = await this.lucid.utxosAt(args.validatorAddress);
      ownNode = findOwnNode(
        nodeUTXOs,
        userKey,
        this._getTasteTestTypeFromArgs(args)
      );
    }

    if (!ownNode || !ownNode.datum) {
      throw new Error("Could not find covering node.");
    }

    const nodeDatum = Data.from(
      ownNode.datum,
      isLiquidityTasteTest ? LiquiditySetNode : SetNode
    );

    let prevNode: UTxO | undefined;
    if (args.utxos) {
      prevNode = args.utxos[0];
    } else {
      prevNode = findPrevNode(
        nodeUTXOS,
        userKey,
        this._getTasteTestTypeFromArgs(args)
      );
    }

    if (!prevNode || !prevNode.datum) {
      throw new Error("Could not find previous node.");
    }

    const prevNodeDatum = Data.from(
      prevNode.datum,
      isLiquidityTasteTest ? LiquiditySetNode : SetNode
    );

    let nodePolicyId: string | undefined;
    if (args.scripts.policy.type === EScriptType.OUTREF) {
      nodePolicyId = args.scripts.policy.value.hash;
    } else if (args.scripts.policy.type === EScriptType.POLICY) {
      nodePolicyId = this.lucid.utils.mintingPolicyToId(
        args.scripts.policy.value
      );
    }

    if (!nodePolicyId) {
      throw new Error("Could not derive a PolicyID for burning the node NFT!");
    }

    const assets = {
      [toUnit(nodePolicyId, fromText(SETNODE_PREFIX) + userKey)]: -1n,
    };

    const newPrevNode = {
      key: prevNodeDatum.key,
      next: nodeDatum.next,
      commitment: 0n,
    };

    const newPrevNodeDatum = Data.to(
      newPrevNode,
      isLiquidityTasteTest ? LiquiditySetNode : SetNode
    );

    const redeemerNodePolicy = Data.to(
      {
        PRemove: {
          keyToRemove: userKey,
          coveringNode: newPrevNode,
        },
      },
      LiquidityNodeAction
    );

    const redeemerNodeValidator = Data.to("LinkedListAct", NodeValidatorAction);

    const beforeDeadline = Date.now() < args.deadline;
    const beforeTwentyFourHours =
      Date.now() < args.deadline - TWENTY_FOUR_HOURS_MS;

    if (beforeDeadline && !beforeTwentyFourHours) {
      const penaltyAmount = divCeil(
        ownNode.assets["lovelace"] - MIN_COMMITMENT_ADA,
        4n
      );

      const tx = this.lucid
        .newTx()
        .collectFrom([ownNode, prevNode], redeemerNodeValidator)
        .payToContract(
          args.validatorAddress,
          { inline: newPrevNodeDatum },
          prevNode.assets
        )
        .payToAddress(args.penaltyAddress, {
          lovelace: penaltyAmount,
        })
        .addSignerKey(userKey)
        .mintAssets(assets, redeemerNodePolicy)
        .validFrom(Date.now() - TIME_TOLERANCE_MS)
        .validTo(Date.now() + TIME_TOLERANCE_MS);

      await Promise.all([
        this._attachScriptsOrReferenceInputs(tx, args.scripts.policy),
        this._attachScriptsOrReferenceInputs(tx, args.scripts.validator),
      ]);

      return this.completeTx({
        tx,
        referralFee: args.referralFee,
        penalty: new AssetAmount(penaltyAmount, {
          assetId: "",
          decimals: 6,
          ticker: "ADA",
          assetName: "Cardano",
        }),
      });
    }

    const tx = this.lucid
      .newTx()
      .collectFrom([ownNode, prevNode], redeemerNodeValidator)
      .payToContract(
        args.validatorAddress,
        { inline: newPrevNodeDatum },
        prevNode.assets
      )
      .addSignerKey(userKey)
      .mintAssets(assets, redeemerNodePolicy);

    await Promise.all([
      this._attachScriptsOrReferenceInputs(tx, args.scripts.policy),
      this._attachScriptsOrReferenceInputs(tx, args.scripts.validator),
    ]);

    return this.completeTx({ tx, referralFee: args.referralFee });
  }

  /**
   * Processes a claim transaction, handling various pre-conditions and state checks.
   *
   * This method is responsible for orchestrating a claim operation, including validating nodes,
   * ensuring proper policy adherence, and constructing the necessary transaction steps. It checks
   * for the user's participation in the network, retrieves the associated validator and policy information,
   * and determines the rightful ownership of claimable assets.
   *
   * After preparing the necessary information and constructing the transaction steps, it completes the transaction
   * by setting the appropriate fees and preparing it for submission.
   *
   * @public
   * @param {IClaimArgs} args - The required arguments for the claim operation.
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum | undefined>>} - Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   * @async
   * @throws {Error} Throws errors if the claim conditions are not met, such as missing keys, inability to find nodes, or ownership issues.
   */
  public async claim(
    args: IClaimArgs
  ): Promise<IComposedTx<Tx, TxComplete, Datum | undefined, ITasteTestFees>> {
    const rewardFoldUtxo = await this.lucid.utxoByUnit(
      toUnit(args.rewardFoldPolicyId, Buffer.from("RFold").toString("hex"))
    );

    const userKey = await this.getUserKey();

    let ownNode: UTxO | undefined;
    if (args.utxos) {
      ownNode = args.utxos[0];
    } else {
      const nodeUTXOs = await this.lucid.utxosAt(args.validatorAddress);
      ownNode = findOwnNode(
        nodeUTXOs,
        userKey,
        this._getTasteTestTypeFromArgs(args)
      );
    }

    if (!ownNode) {
      throw new Error("Could not find the user's node.");
    }

    const redeemerNodeValidator = Data.to("LinkedListAct", NodeValidatorAction);

    const burnRedeemer = Data.to(
      {
        PRemove: {
          keyToRemove: userKey,
          coveringNode: {
            commitment: 0n,
            key: null,
            next: null,
          },
        },
      },
      LiquidityNodeAction
    );

    let nodePolicyId: string | undefined;
    if (args.scripts.policy.type === EScriptType.OUTREF) {
      nodePolicyId = args.scripts.policy.value.hash;
    } else if (args.scripts.policy.type === EScriptType.POLICY) {
      nodePolicyId = this.lucid.utils.mintingPolicyToId(
        args.scripts.policy.value
      );
    }

    if (!nodePolicyId) {
      throw new Error("Could not derive a PolicyID for burning the node NFT!");
    }

    const upperBound = Date.now() + TIME_TOLERANCE_MS;
    const lowerBound = Date.now() - TIME_TOLERANCE_MS;

    const tx = this.lucid
      .newTx()
      .collectFrom([ownNode], redeemerNodeValidator)
      .readFrom([rewardFoldUtxo])
      .addSignerKey(userKey)
      .mintAssets(
        {
          [toUnit(nodePolicyId, `${fromText(SETNODE_PREFIX)}${userKey}`)]: -1n,
        },
        burnRedeemer
      )
      .validFrom(lowerBound)
      .validTo(upperBound);

    await Promise.all([
      this._attachScriptsOrReferenceInputs(tx, args.scripts.policy),
      this._attachScriptsOrReferenceInputs(tx, args.scripts.validator),
    ]);

    return this.completeTx({ tx, referralFee: args.referralFee });
  }

  /**
   * Finalizes the construction of a transaction with the necessary operations and fees.
   *
   * This function takes a constructed transaction and applies the final necessary steps to make it ready for submission.
   * These steps include setting the referral fee if it's part of the transaction, calculating the necessary transaction fees,
   * and preparing the transaction for signing. The function adapts to the presence of asset-specific transactions by
   * handling different referral payment types.
   *
   * The base fees for the transaction are calculated based on a boolean for whether to include them, specifically for deposit and fold.
   * The only fees that are always set are referral fees and the native Cardano transaction fee.
   *
   * Once the transaction is built, it's completed, and the actual Cardano network transaction fee is retrieved and set.
   * The built transaction is then ready for signing and submission.
   *
   * @private
   * @param {ITasteTestCompleteTxArgs} params - The arguments required for completing the transaction, including the transaction itself, the referral fee, and a flag indicating if the transaction includes fees.
   *  - `hasFees`: Indicates whether the transaction has fees associated with it.
   *  - `referralFee`: The referral fee information, if applicable.
   *  - `tx`: The initial transaction object that needs to be completed.
   * @returns {Promise<IComposedTx<Tx, TxComplete, TxComplete, Datum | undefined>>} - Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   * @async
   * @throws {Error} Throws an error if the transaction cannot be completed or if there are issues with the fee calculation.
   */
  private async completeTx({
    hasFees = false,
    penalty,
    referralFee,
    tx,
  }: ITasteTestCompleteTxArgs): Promise<
    IComposedTx<Tx, TxComplete, Datum | undefined, ITasteTestFees>
  > {
    if (referralFee) {
      if (!SundaeUtils.isAdaAsset(referralFee.payment.metadata)) {
        tx.payToAddress(referralFee.destination, {
          [referralFee.payment.metadata.assetId]: referralFee.payment.amount,
        });
      } else {
        tx.payToAddress(referralFee.destination, {
          lovelace: referralFee.payment.amount,
        });
      }
    }

    const txFee = tx.txBuilder.get_fee_if_set();
    let finishedTx: TxComplete | undefined;
    const thisTx: IComposedTx<
      Tx,
      TxComplete,
      Datum | undefined,
      ITasteTestFees
    > = {
      tx,
      fees: {
        cardanoTxFee: new AssetAmount(0n, 6),
        deposit: new AssetAmount(hasFees ? NODE_DEPOSIT_ADA : 0n, 6),
        foldFee: new AssetAmount(hasFees ? FOLDING_FEE_ADA : 0n, 6),
        penaltyFee: penalty ?? new AssetAmount(0n, 6),
        referral: new AssetAmount(
          referralFee?.payment?.amount ?? 0n,
          referralFee?.payment?.metadata ?? 6
        ),
        scooperFee: new AssetAmount(0n, 6),
      },
      datum: Buffer.from(tx.txBuilder.to_bytes()).toString("hex"),
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

  /**
   * Retrieves the user key (hash) from a given Cardano address.
   *
   * This method processes the Cardano address, attempts to extract the stake credential or payment credential hash,
   * and returns it as the user's key. If neither stake nor payment credentials are found, an error is thrown.
   *
   * It utilizes the `lucid.utils.getAddressDetails` method to parse and extract details from the Cardano address.
   *
   * @private
   * @returns {Promise<string>} - The user key hash extracted from the address.
   * @throws {Error} If neither stake nor payment credentials could be determined from the address.
   */
  public async getUserKey(): Promise<string> {
    const address = await this.lucid.wallet.address();
    const details = this.lucid.utils.getAddressDetails(address);
    const userKey =
      details?.stakeCredential?.hash ?? details?.paymentCredential?.hash;
    if (!userKey) {
      throw new Error(
        `Could not determine the key hash of the user's address: ${address}`
      );
    }

    return userKey;
  }

  /**
   * A utility method to default the Taste Test type to liquidity if not set.
   *
   * @param {IBaseArgs} args The base arguments.
   * @returns {TTasteTestType}
   */
  private _getTasteTestTypeFromArgs(args: IBaseArgs): TTasteTestType {
    if (!args.tasteTestType) {
      args.tasteTestType = "Liquidity";
    }

    return args.tasteTestType as TTasteTestType;
  }

  /**
   * Utility function to attach the correct validators or reference inputs
   * to a transaction.
   * @param {Tx} tx The Lucid Transaction instance.
   * @param {TScriptType} script The script passed by the config.
   */
  private async _attachScriptsOrReferenceInputs(tx: Tx, script: TScriptType) {
    switch (script.type) {
      case EScriptType.VALIDATOR:
        tx.attachSpendingValidator(script.value);
        break;
      case EScriptType.POLICY:
        tx.attachMintingPolicy(script.value);
        break;
      default:
      case EScriptType.OUTREF:
        tx.readFrom(await this.lucid.utxosByOutRef([script.value.outRef]));
    }
  }
}
