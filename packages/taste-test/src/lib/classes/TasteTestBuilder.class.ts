import { Blaze, Core, Provider, TxBuilder, Wallet } from "@blaze-cardano/sdk";
import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import type { IComposedTx, ITxBuilderReferralFee } from "@sundaeswap/core";
import { ADA_METADATA } from "@sundaeswap/core/utilities";

import { parse, serialize } from "@blaze-cardano/data";
import {
  LiquidityNodeAction,
  LiquidityNodeValidatorAction,
  LiquiditySetNode,
  NodeValidatorAction,
  TLiquiditySetNode,
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
  TT_UTXO_ADDITIONAL_ADA,
  TWENTY_FOUR_HOURS_MS,
  VALID_FROM_TOLERANCE_MS,
  VALID_TO_TOLERANCE_MS,
} from "../contants.js";

/**
 * Object arguments for completing a transaction.
 */
export interface ITasteTestCompleteTxArgs {
  tx: TxBuilder;
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
 * The TasteTest class relies on the Blaze service, which can come either from your own instance or from an existing
 * SundaeSDK class instance (as shown below). The class methods handle the detailed steps of each operation, including
 * transaction preparation, fee handling, and error checking, abstracting these complexities from the end user.
 *
 * Usage example (not part of the actual documentation):
 * ```ts
 * import type { Blaze } from "@blaze-cardano/sdk";
 * const blazeInstance = Blaze.from(
 *   ..args
 * );
 * const tasteTest = new TasteTestBuilder(blazeInstance);
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
 * @extends {AbstractTasteTest}
 * @param {Blaze} blazeInstance - An instance of the Blaze class, providing various utility methods for blockchain interactions.
 */
export class TasteTestBuilder implements AbstractTasteTest {
  blaze: Blaze<Provider, Wallet>;
  tracing: boolean = false;

  constructor(blazeInstance: Blaze<Provider, Wallet>) {
    this.blaze = blazeInstance;
  }

  /**
   * Enables tracing in the Blaze transaction builder.
   *
   * @param {boolean} enable True to enable tracing, false to turn it off. (default: false)
   * @returns {TasteTestBuilder}
   */
  public enableTracing(enable: boolean): TasteTestBuilder {
    this.tracing = enable;
    return this;
  }

  /**
   * Builds a new transaction and enables tracing if set.
   *
   * @returns {TxBuilder}
   */
  private newTransaction(): TxBuilder {
    const tx = this.blaze.newTransaction();
    tx.enableTracing(this.tracing);
    return tx;
  }

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
   * @returns {Promise<IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>>} - Returns a promise that resolves with a transaction builder object,
   * which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   *
   * @throws {Error} Throws an error if no UTXOs are available, if reference scripts are missing, or if a covering node cannot be found.
   */
  public async deposit(
    args: IDepositArgs,
  ): Promise<
    IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>
  > {
    const walletUtxos = await this.blaze.wallet.getUnspentOutputs();
    const { updateFallback = false } = args;
    const validatorAddress = Core.addressFromBech32(args.validatorAddress);

    if (!walletUtxos.length) {
      throw new Error("No available UTXOs found in wallet.");
    }

    if (!args.scripts) {
      throw new Error(
        "Did not receive a reference script UTXO or raw PlutusV2 CBOR script for the validator.",
      );
    }

    const userKey = await this.getUserKey();

    let coveringNode: Core.TransactionUnspentOutput | undefined;
    const nodeUTXOs =
      await this.blaze.provider.getUnspentOutputs(validatorAddress);

    if (args.utxos) {
      coveringNode = args.utxos[0];
    } else {
      coveringNode = findCoveringNode(nodeUTXOs, userKey, "Liquidity");
    }

    if (!coveringNode || !coveringNode.output().datum()) {
      const hasOwnNode = findOwnNode(nodeUTXOs, userKey, "Liquidity");
      if (hasOwnNode && updateFallback) {
        return this.update({ ...args });
      }

      throw new Error("Could not find covering node.");
    }

    const plutusData = coveringNode.output().datum()?.asInlineData();
    if (!plutusData) {
      throw new Error("Could not find datum from covering node.");
    }

    const coveringNodeDatum = parse(LiquiditySetNode, plutusData);

    const prevNodeDatum = serialize(LiquiditySetNode, {
      key: coveringNodeDatum.key,
      next: userKey,
      commitment: 0n,
    });

    const nodeDatum = serialize(LiquiditySetNode, {
      key: userKey,
      next: coveringNodeDatum.next,
      commitment: 0n,
    });

    const redeemerNodePolicy = serialize(LiquidityNodeAction, {
      PInsert: {
        keyToInsert: userKey,
        coveringNode: coveringNodeDatum,
      },
    });

    const redeemerNodeValidator = serialize(
      LiquidityNodeValidatorAction,
      "LinkedListAct",
    );

    let nodePolicyId: string | undefined;
    if (args.scripts.policy.type === EScriptType.OUTREF) {
      nodePolicyId = args.scripts.policy.value.hash;
    } else if (args.scripts.policy.type === EScriptType.POLICY) {
      nodePolicyId = args.scripts.policy.value.hash();
    }

    if (!nodePolicyId) {
      throw new Error("Could not derive a PolicyID for burning the node NFT!");
    }

    const nodeAssetName = `${Buffer.from(SETNODE_PREFIX).toString("hex")}${userKey}`;
    const assets: Core.TokenMap = new Map([
      [Core.AssetId(`${nodePolicyId}${nodeAssetName}`), 1n],
    ]);

    const correctAmount = Core.Value.fromCore({
      coins: BigInt(args.assetAmount.amount) + TT_UTXO_ADDITIONAL_ADA,
      assets,
    });

    if (args.assetAmount.amount < MIN_COMMITMENT_ADA) {
      throw new Error("Amount deposited is less than the minimum amount.");
    }

    const [lowerBound, upperBound] = this._getTxBounds(
      args.time,
      args.deadline,
    );

    const tx = this.newTransaction()
      .addInput(coveringNode, redeemerNodeValidator)
      .lockAssets(
        validatorAddress,
        coveringNode.output().amount(),
        prevNodeDatum,
      )
      .lockAssets(validatorAddress, correctAmount, nodeDatum)
      .addRequiredSigner(Core.Ed25519KeyHashHex(userKey))
      .addMint(
        Core.PolicyId(nodePolicyId),
        new Map([[Core.AssetName(nodeAssetName), 1n]]),
        redeemerNodePolicy,
      )
      .setValidFrom(Core.Slot(lowerBound))
      .setValidUntil(Core.Slot(upperBound));

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
   * @returns {Promise<IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>>} - Returns a promise that resolves with a transaction builder object,
   * equipped with the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   *
   * @throws {Error} Throws an error if the user's payment credential hash is missing or if the node with the required datum cannot be found.
   */
  public async update(
    args: IUpdateArgs,
  ): Promise<
    IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>
  > {
    const userKey = await this.getUserKey();
    const validatorAddress = Core.addressFromBech32(args.validatorAddress);

    if (!userKey) {
      throw new Error("Missing wallet's payment credential hash.");
    }

    let ownNode: Core.TransactionUnspentOutput | undefined;
    if (args.utxos) {
      ownNode = args.utxos[0];
    } else {
      const nodeUTXOs =
        await this.blaze.provider.getUnspentOutputs(validatorAddress);
      ownNode = findOwnNode(
        nodeUTXOs,
        userKey,
        this._getTasteTestTypeFromArgs(args),
      );
    }

    const plutusData = ownNode?.output().datum()?.asInlineData();
    if (!ownNode || !plutusData) {
      throw new Error("Could not find covering node.");
    }

    const redeemerNodeValidator = serialize(
      LiquidityNodeValidatorAction,
      "ModifyCommitment",
    );

    const newNodeAssets = new Core.Value(
      ownNode.output().amount().coin() + args.assetAmount.amount,
      ownNode.output().amount().multiasset(),
    );

    const [lowerBound, upperBound] = this._getTxBounds(
      args.time,
      args.deadline,
    );

    const tx = this.newTransaction()
      .addInput(ownNode, redeemerNodeValidator)
      .lockAssets(validatorAddress, newNodeAssets, plutusData)
      .setValidFrom(Core.Slot(lowerBound))
      .setValidUntil(Core.Slot(upperBound));

    await this._attachScriptsOrReferenceInputs(tx, args.scripts.validator);

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
   * @returns {Promise<IComposedTx<Tx, TxComplete, Datum |<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>>} - Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   *
   * @throws {Error} Throws errors if the withdrawal conditions are not met, such as missing keys, inability to find nodes, or ownership issues.
   */
  public async withdraw(
    args: IWithdrawArgs,
  ): Promise<
    IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>
  > {
    const userKey = await this.getUserKey();
    const validatorAddress = Core.addressFromBech32(args.validatorAddress);
    const penaltyAddress = Core.addressFromBech32(args.penaltyAddress);

    if (!userKey) {
      throw new Error("Missing wallet's payment credential hash.");
    }

    const nodeUTXOS = args.utxos
      ? args.utxos
      : await this.blaze.provider.getUnspentOutputs(validatorAddress);

    const ownNode = findOwnNode(nodeUTXOS, userKey, "Liquidity");

    const ownNodesPlutusData = ownNode?.output().datum()?.asInlineData();
    if (!ownNode || !ownNodesPlutusData) {
      throw new Error("Could not find covering node.");
    }

    const prevNode = findPrevNode(nodeUTXOS, userKey, "Liquidity");

    const prevNodesPlutusData = prevNode?.output().datum()?.asInlineData();
    if (!prevNode || !prevNodesPlutusData) {
      throw new Error("Could not find previous node.");
    }

    const ownNodeDatum = parse(LiquiditySetNode, ownNodesPlutusData);
    const prevNodeDatum = parse(LiquiditySetNode, prevNodesPlutusData);

    let nodePolicyId: string | undefined;
    if (args.scripts.policy.type === EScriptType.OUTREF) {
      nodePolicyId = args.scripts.policy.value.hash;
    } else if (args.scripts.policy.type === EScriptType.POLICY) {
      nodePolicyId = args.scripts.policy.value.hash();
    }

    if (!nodePolicyId) {
      throw new Error("Could not derive a PolicyID for burning the node NFT!");
    }

    const assetsToBurn = new Map([
      [
        Core.AssetName(
          `${Buffer.from(SETNODE_PREFIX).toString("hex")}${userKey}`,
        ),
        -1n,
      ],
    ]);

    const newPrevNodeSchema: TLiquiditySetNode = {
      key: prevNodeDatum.key,
      next: ownNodeDatum.next,
      commitment: 0n,
    };

    const newPrevNodeDatum = serialize(LiquiditySetNode, newPrevNodeSchema);

    const redeemerNodePolicy = serialize(LiquidityNodeAction, {
      PRemove: {
        keyToRemove: userKey,
        coveringNode: newPrevNodeSchema,
      },
    });

    const redeemerNodeValidator = serialize(
      NodeValidatorAction,
      "LinkedListAct",
    );

    const [lowerBound, upperBound] = this._getTxBounds(
      args.time,
      args.deadline,
    );
    const beforeDeadline = upperBound < args.deadline;
    const beforeTwentyFourHours =
      upperBound < args.deadline - TWENTY_FOUR_HOURS_MS;

    if (beforeDeadline && !beforeTwentyFourHours) {
      const quarterPenalty = divCeil(
        ownNode.output().amount().coin() - TT_UTXO_ADDITIONAL_ADA,
        4n,
      );
      const penaltyAmount = BigInt(
        Math.max(Number(quarterPenalty), Number(TT_UTXO_ADDITIONAL_ADA)),
      );

      const tx = this.newTransaction()
        .addInput(ownNode, redeemerNodeValidator)
        .addInput(prevNode, redeemerNodeValidator)
        .lockAssets(
          validatorAddress,
          prevNode.output().amount(),
          newPrevNodeDatum,
        )
        .payLovelace(penaltyAddress, penaltyAmount)
        .addRequiredSigner(Core.Ed25519KeyHashHex(userKey))
        .addMint(Core.PolicyId(nodePolicyId), assetsToBurn, redeemerNodePolicy)
        .setValidFrom(Core.Slot(lowerBound))
        .setValidUntil(Core.Slot(upperBound));

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

    const tx = this.newTransaction()
      .addInput(ownNode, redeemerNodeValidator)
      .addInput(prevNode, redeemerNodeValidator)
      .lockAssets(
        validatorAddress,
        prevNode.output().amount(),
        newPrevNodeDatum,
      )
      .addRequiredSigner(Core.Ed25519KeyHashHex(userKey))
      .addMint(Core.PolicyId(nodePolicyId), assetsToBurn, redeemerNodePolicy)
      .setValidFrom(Core.Slot(lowerBound))
      .setValidUntil(Core.Slot(upperBound));

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
   * @returns {Promise<IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>>} - Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   *
   * @throws {Error} Throws errors if the claim conditions are not met, such as missing keys, inability to find nodes, or ownership issues.
   */
  public async claim(
    args: IClaimArgs,
  ): Promise<
    IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>
  > {
    const rewardFoldPolicyId = Core.PolicyId(args.rewardFoldPolicyId);
    const rewardFoldAssetName = Core.AssetName(
      Buffer.from("RFold").toString("hex"),
    );
    const rewardFoldUtxo = await this.blaze.provider.getUnspentOutputByNFT(
      Core.AssetId(`${rewardFoldPolicyId}${rewardFoldAssetName}`),
    );

    const userKey = await this.getUserKey();
    const validatorAddress = Core.addressFromBech32(args.validatorAddress);

    let ownNode: Core.TransactionUnspentOutput | undefined;
    if (args.utxos) {
      ownNode = args.utxos[0];
    } else {
      const nodeUTXOs =
        await this.blaze.provider.getUnspentOutputs(validatorAddress);
      ownNode = findOwnNode(nodeUTXOs, userKey, "Liquidity");
    }

    if (!ownNode) {
      throw new Error("Could not find the user's node.");
    }

    const redeemerNodeValidator = serialize(
      LiquidityNodeValidatorAction,
      "ClaimAct",
    );

    const burnRedeemer = serialize(LiquidityNodeAction, {
      PRemove: {
        keyToRemove: userKey,
        coveringNode: {
          commitment: 0n,
          key: undefined,
          next: undefined,
        },
      },
    });

    let nodePolicyId: string | undefined;
    if (args.scripts.policy.type === EScriptType.OUTREF) {
      nodePolicyId = args.scripts.policy.value.hash;
    } else if (args.scripts.policy.type === EScriptType.POLICY) {
      nodePolicyId = args.scripts.policy.value.hash();
    }

    if (!nodePolicyId) {
      throw new Error("Could not derive a PolicyID for burning the node NFT!");
    }

    const [lowerBound, upperBound] = this._getTxBounds(args.time);

    const tx = this.newTransaction()
      .addInput(ownNode, redeemerNodeValidator)
      .addReferenceInput(rewardFoldUtxo)
      .addRequiredSigner(Core.Ed25519KeyHashHex(userKey))
      .setValidFrom(Core.Slot(lowerBound))
      .setValidUntil(Core.Slot(upperBound));

    if (args?.burnFoldToken) {
      tx.addMint(
        Core.PolicyId(nodePolicyId),
        new Map([
          [
            Core.AssetName(
              `${Buffer.from(SETNODE_PREFIX).toString("hex")}${userKey}`,
            ),
            -1n,
          ],
        ]),
        burnRedeemer,
      );
    }

    await Promise.all([
      this._attachScriptsOrReferenceInputs(tx, args.scripts.policy),
      this._attachScriptsOrReferenceInputs(tx, args.scripts.validator),
    ]);

    return this.completeTx({
      tx,
      referralFee: args.referralFee,
    });
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
   * @returns {Promise<IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>|<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>>} - Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.
   *
   * @throws {Error} Throws an error if the transaction cannot be completed or if there are issues with the fee calculation.
   */
  private async completeTx({
    hasFees = false,
    penalty,
    referralFee,
    tx,
  }: ITasteTestCompleteTxArgs): Promise<
    IComposedTx<TxBuilder, Core.Transaction, string | undefined, ITasteTestFees>
  > {
    if (referralFee) {
      const destination = Core.Address.fromBech32(referralFee.destination);
      tx.payAssets(destination, referralFee.payment);
    }

    const draft_tx = Core.Transaction.fromCbor(Core.TxCBOR(tx.toCbor()));
    const txFee = draft_tx.body().fee();
    const that = this;
    let finishedTx: Core.Transaction | undefined;
    const thisTx: IComposedTx<
      TxBuilder,
      Core.Transaction,
      string | undefined,
      ITasteTestFees
    > = {
      tx,
      fees: {
        cardanoTxFee: new AssetAmount(0n, 6),
        deposit: new AssetAmount(hasFees ? NODE_DEPOSIT_ADA : 0n, 6),
        foldFee: new AssetAmount(hasFees ? FOLDING_FEE_ADA * 2n : 0n, 6),
        penaltyFee: penalty ?? new AssetAmount(0n, 6),
        referral: new AssetAmount(
          referralFee?.payment.coin() || 0n,
          ADA_METADATA,
        ),
        scooperFee: new AssetAmount(0n, 6),
      },
      datum: draft_tx.body().outputs()[0].datum()?.asInlineData()?.toCbor(),
      async build() {
        if (!finishedTx) {
          finishedTx = await tx.complete();
        }

        thisTx.fees.cardanoTxFee = new AssetAmount(txFee, 6);

        return {
          cbor: finishedTx.toCbor(),
          builtTx: finishedTx,
          sign: async () => {
            const signedTx = await that.blaze.signTransaction(
              finishedTx as Core.Transaction,
            );
            return {
              cbor: signedTx.toCbor(),
              submit: async () => await that.blaze.submitTransaction(signedTx),
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
    const address = await this.blaze.wallet.getChangeAddress();
    const userKey =
      address.getProps().delegationPart?.hash ??
      address.getProps().paymentPart?.hash;
    if (!userKey) {
      throw new Error(
        `Could not determine the key hash of the user's address: ${address}`,
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
  private async _attachScriptsOrReferenceInputs(
    tx: TxBuilder,
    script: TScriptType,
  ) {
    switch (script.type) {
      case EScriptType.VALIDATOR:
        tx.provideScript(script.value);
        break;
      case EScriptType.POLICY:
        tx.provideScript(script.value);
        break;
      default:
      case EScriptType.OUTREF:
        const outputs = await this.blaze.provider.resolveUnspentOutputs([
          script.value.outRef,
        ]);
        outputs.forEach((output) => tx.addReferenceInput(output));
    }
  }

  /**
   * Calculates and returns the lower and upper bounds for a transaction based on the provided time and deadline.
   * If the `time` parameter is not provided, the current timestamp (`Date.now()`) is used. The lower bound is calculated
   * by subtracting a predefined tolerance value (`VALID_FROM_TOLERANCE_MS`) from the `time`. The natural upper bound
   * is calculated by adding another predefined tolerance value (`VALID_TO_TOLERANCE_MS`) to the `time`. If a `deadline`
   * is provided, the actual upper bound is the minimum between the `deadline - 1` and the natural upper bound; otherwise,
   * the natural upper bound is used.
   *
   * @private
   * @param {number} time - The reference time for the bounds calculation. Defaults to the current timestamp if not provided.
   * @param {number} deadline - An optional deadline that may cap the upper bound.
   * @returns {[number, number]} An array containing two elements: the lower and upper bounds for the transaction.
   */
  private _getTxBounds(time?: number, deadline?: number): [number, number] {
    const lowerBound = (time ?? Date.now()) - VALID_FROM_TOLERANCE_MS;
    const naturalUpperBound = (time ?? Date.now()) + VALID_TO_TOLERANCE_MS;
    const upperBound = !!deadline
      ? Math.min(deadline - 1, naturalUpperBound)
      : naturalUpperBound;

    return [lowerBound, upperBound];
  }
}
