import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import type { ITxBuilder, ITxBuilderReferralFee } from "@sundaeswap/core";
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
  TTasteTestType,
} from "../../@types";
import {
  DiscoveryNodeAction,
  LiquidityNodeAction,
  LiquiditySetNode,
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
  NODE_DEPOSIT_ADA,
  SETNODE_PREFIX,
  TIME_TOLERANCE_MS,
  TWENTY_FOUR_HOURS_MS,
} from "../contants";
import { AbstractTasteTest } from "./AbstractTasteTest.class";

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
 * Object containing the extended fees.
 */
export interface ITasteTestFees {
  foldFee: AssetAmount<IAssetAmountMetadata>;
  penaltyFee: AssetAmount<IAssetAmountMetadata>;
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
export class TasteTest implements AbstractTasteTest {
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
   * @returns {Promise<ITxBuilder<Tx, Datum | undefined>>} - Returns a promise that resolves with a transaction builder object,
   * which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   * @async
   * @throws {Error} Throws an error if no UTXOs are available, if reference scripts are missing, or if a covering node cannot be found.
   */
  public async deposit(
    args: IDepositArgs
  ): Promise<ITxBuilder<Tx, Datum | undefined, ITasteTestFees>> {
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

    const isLiquidityTasteTest =
      this._getTasteTestTypeFromArgs(args) === "liquidity";
    const nodeValidator = await this.getNodeValidatorFromArgs(args);
    const nodeValidatorAddr =
      this.lucid.utils.validatorToAddress(nodeValidator);
    const nodePolicy = await this.getNodePolicyFromArgs(args);
    const nodePolicyId = this.lucid.utils.mintingPolicyToId(nodePolicy);

    const userKey = await this.getUserKey();

    let coveringNode: UTxO | undefined;
    const nodeUTXOs = await this.lucid.utxosAt(nodeValidatorAddr);

    if (args.utxos) {
      coveringNode = args.utxos[0];
    } else {
      coveringNode = findCoveringNode(
        nodeUTXOs,
        userKey,
        this._getTasteTestTypeFromArgs(args)
      );
    }

    if (!coveringNode || !coveringNode.datum) {
      const hasOwnNode = findOwnNode(
        nodeUTXOs,
        userKey,
        this._getTasteTestTypeFromArgs(args)
      );
      if (hasOwnNode && updateFallback) {
        return this.update({ ...args });
      }

      throw new Error("Could not find covering node.");
    }

    const coveringNodeDatum = Data.from(
      coveringNode.datum,
      isLiquidityTasteTest ? LiquiditySetNode : SetNode
    );

    let prevNodeDatum: string = "";
    if (isLiquidityTasteTest) {
      prevNodeDatum = Data.to(
        {
          key: coveringNodeDatum.key,
          next: userKey,
          commitment: BigInt(0),
        },
        LiquiditySetNode
      );
    } else {
      prevNodeDatum = Data.to(
        {
          key: coveringNodeDatum.key,
          next: userKey,
        },
        SetNode
      );
    }

    let nodeDatum: string = "";
    if (isLiquidityTasteTest) {
      nodeDatum = Data.to(
        {
          key: userKey,
          next: coveringNodeDatum.next,
          commitment: BigInt(0),
        },
        LiquiditySetNode
      );
    } else {
      nodeDatum = Data.to(
        {
          key: userKey,
          next: coveringNodeDatum.next,
        },
        SetNode
      );
    }

    const redeemerNodePolicy = Data.to(
      {
        PInsert: {
          keyToInsert: userKey,
          coveringNode: coveringNodeDatum,
        },
      },
      isLiquidityTasteTest ? LiquidityNodeAction : DiscoveryNodeAction
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
   * @returns {Promise<ITxBuilder<Tx, string | undefined>>} - Returns a promise that resolves with a transaction builder object,
   * equipped with the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   * @async
   * @throws {Error} Throws an error if the user's payment credential hash is missing or if the node with the required datum cannot be found.
   */
  public async update(
    args: IUpdateArgs
  ): Promise<ITxBuilder<Tx, Datum | undefined, ITasteTestFees>> {
    const nodeValidator = await this.getNodeValidatorFromArgs(args);
    const nodeValidatorAddr =
      this.lucid.utils.validatorToAddress(nodeValidator);

    const userKey = await this.getUserKey();

    if (!userKey) {
      throw new Error("Missing wallet's payment credential hash.");
    }

    let ownNode: UTxO | undefined;
    if (args.utxos) {
      ownNode = args.utxos[0];
    } else {
      const nodeUTXOs = await this.lucid.utxosAt(nodeValidatorAddr);
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
      .compose(this.lucid.newTx().attachSpendingValidator(nodeValidator))
      .payToContract(
        nodeValidatorAddr,
        { inline: ownNode.datum },
        newNodeAssets
      );

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
   * @returns {Promise<ITxBuilder<Tx, Datum | undefined>>} - Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   * @async
   * @throws {Error} Throws errors if the withdrawal conditions are not met, such as missing keys, inability to find nodes, or ownership issues.
   */
  public async withdraw(
    args: IWithdrawArgs
  ): Promise<ITxBuilder<Tx, Datum | undefined, ITasteTestFees>> {
    const nodeValidator = await this.getNodeValidatorFromArgs(args);
    const nodeValidatorAddr =
      this.lucid.utils.validatorToAddress(nodeValidator);

    const nodePolicy = await this.getNodePolicyFromArgs(args);
    const nodePolicyId = this.lucid.utils.mintingPolicyToId(nodePolicy);

    const userKey = await this.getUserKey();

    if (!userKey) {
      throw new Error("Missing wallet's payment credential hash.");
    }

    const isLiquidityTasteTest =
      this._getTasteTestTypeFromArgs(args) === "liquidity";
    const nodeUTXOS = args.utxos
      ? args.utxos
      : await this.lucid.utxosAt(nodeValidatorAddr);

    let ownNode: UTxO | undefined;
    if (args.utxos) {
      ownNode = nodeUTXOS[0];
    } else {
      const nodeUTXOs = await this.lucid.utxosAt(nodeValidatorAddr);
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

    const assets = {
      [toUnit(nodePolicyId, fromText(SETNODE_PREFIX) + userKey)]: -1n,
    };

    let newPrevNode: SetNode | LiquiditySetNode | undefined;
    if (isLiquidityTasteTest) {
      newPrevNode = {
        key: prevNodeDatum.key,
        next: nodeDatum.next,
        commitment: BigInt(0),
      };
    } else {
      newPrevNode = {
        key: prevNodeDatum.key,
        next: nodeDatum.next,
      };
    }

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
      isLiquidityTasteTest ? LiquidityNodeAction : DiscoveryNodeAction
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
        .compose(this.lucid.newTx().attachMintingPolicy(nodePolicy))
        .validFrom(lowerBound)
        .validTo(upperBound);

      return this.completeTx({ tx, referralFee: args.referralFee });
    } else if (beforeDeadline && !beforeTwentyFourHours) {
      const penaltyAmount = divCeil(ownNode.assets["lovelace"], 4n);

      const tx = this.lucid
        .newTx()
        .collectFrom([ownNode, prevNode], redeemerNodeValidator)
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
        .compose(this.lucid.newTx().attachMintingPolicy(nodePolicy))
        .validFrom(lowerBound)
        .validTo(upperBound);

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
   * @param {boolean} params.hasFees - Indicates whether the transaction has fees associated with it.
   * @param {IReferralFee | null} params.referralFee - The referral fee information, if applicable.
   * @param {Tx} params.tx - The initial transaction object that needs to be completed.
   * @returns {Promise<ITxBuilder<Tx, Datum | undefined>>} - Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   * @async
   * @throws {Error} Throws an error if the transaction cannot be completed or if there are issues with the fee calculation.
   */
  private async completeTx({
    hasFees = false,
    penalty,
    referralFee,
    tx,
  }: ITasteTestCompleteTxArgs): Promise<
    ITxBuilder<Tx, Datum | undefined, ITasteTestFees>
  > {
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

    const txFee = tx.txBuilder.get_fee_if_set();
    let finishedTx: TxComplete | undefined;
    const thisTx: ITxBuilder<Tx, Datum | undefined, ITasteTestFees> = {
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
  public async getNodeValidatorFromArgs({
    scripts,
  }: IBaseArgs): Promise<SpendingValidator> {
    let nodeValidator: SpendingValidator;

    // If we're using a txHash property, then we know to fetch the UTXO, otherwise, we already have the data.
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
  public async getNodePolicyFromArgs({
    scripts,
  }: IBaseArgs): Promise<MintingPolicy> {
    let nodePolicy: MintingPolicy;

    // If we're using a txHash property, then we know to fetch the UTXO, otherwise, we already have the data.
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
      args.tasteTestType = "liquidity";
    }

    return args.tasteTestType as TTasteTestType;
  }
}
