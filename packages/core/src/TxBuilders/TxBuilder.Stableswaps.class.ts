import {
  Blaze,
  CoinSelector,
  Provider,
  TxBuilder,
  Wallet,
} from "@blaze-cardano/sdk";
import {
  EContractVersion,
  IComposedTx,
  IMintPoolConfigArgs,
  IUpdateProtocolFeesConfigArgs,
} from "../@types/index.js";
import { DatumBuilderStableswaps } from "../DatumBuilders/DatumBuilder.Stableswaps.class.js";
import { QueryProviderSundaeSwap } from "../QueryProviders/QueryProviderSundaeSwap.js";
import { TxBuilderV3 } from "./TxBuilder.V3.class.js";
import { Transaction } from "@blaze-cardano/core";
import { Core } from "@blaze-cardano/sdk";
import { serialize, Void } from "@blaze-cardano/data";
import { StableswapsTypes } from "../DatumBuilders/ContractTypes/index.js";
import { DatumBuilderV3 } from "../DatumBuilders/DatumBuilder.V3.class.js";

/**
 * `TxBuilderStableswaps` is a specialized transaction builder class for constructing transactions
 * against the Stableswaps protocol variant of SundaeSwap V3. It extends `TxBuilderV3` and provides
 * specific implementations for Stableswaps pool operations, including pool minting with protocol fees
 * derived from the settings datum.
 *
 * The Stableswaps protocol is designed for assets with similar values (e.g., stablecoins) and uses
 * a different AMM curve than standard constant product pools.
 *
 * @extends {TxBuilderV3}
 */
export class TxBuilderStableswaps extends TxBuilderV3 {
  /**
   * The contract version identifier for Stableswaps protocol.
   */
  contractVersion: EContractVersion = EContractVersion.Stableswaps;

  /**
   * The datum builder instance specifically for Stableswaps protocol, handling
   * datum construction and parsing for Stableswaps transactions.
   */
  datumBuilder: DatumBuilderStableswaps;

  /**
   * Constructs a new TxBuilderStableswaps instance.
   *
   * @param {Blaze<Provider, Wallet>} blaze - A configured Blaze instance for transaction building and signing.
   * @param {QueryProviderSundaeSwap} [queryProvider] - Optional custom query provider for fetching blockchain data.
   *        If not provided, a default QueryProviderSundaeSwap instance will be created.
   */
  constructor(
    public blaze: Blaze<Provider, Wallet>,
    queryProvider?: QueryProviderSundaeSwap,
  ) {
    super(blaze, queryProvider);
    this.datumBuilder = new DatumBuilderStableswaps(this.network);
  }

  /**
   * Mints a new Stableswaps liquidity pool with the specified configuration.
   * This method extends the parent `mintPool` implementation by automatically fetching
   * and applying protocol fees from the settings datum before pool creation.
   *
   * The protocol fees are required for Stableswaps pools and are retrieved from the
   * on-chain settings UTXO to ensure they match the current protocol parameters.
   *
   * @param {IMintPoolConfigArgs} args - The configuration arguments for minting the pool, including:
   *   - Pool assets and their initial amounts
   *   - Pool fees
   *   - Owner address
   *   - Other pool-specific parameters
   * @returns {Promise<IComposedTx<TxBuilder, Transaction>>} A promise that resolves to the composed transaction
   *          ready for signing and submission.
   * @throws {Error} If the settings datum cannot be retrieved or protocol fees cannot be extracted.
   */
  async mintPool(
    args: IMintPoolConfigArgs,
  ): Promise<IComposedTx<TxBuilder, Transaction>> {
    const settingsDatum = await this.getSettingsUtxoDatum();
    args.protocolFees =
      this.datumBuilder.protocolFeesFromSettingsDatum(settingsDatum);
    return super.mintPool(args);
  }

  /**
   * Updates the protocol fees on a Stableswaps pool. This operation requires spending
   * the pool UTXO with a "Manage" redeemer and adding a withdrawal from the pool.manage.else
   * validator with a "WithdrawFees" redeemer (with all withdraw amounts set to 0).
   *
   * The protocol fees determine the percentage taken by the protocol from swap fees and are
   * represented as basis points (1 basis point = 0.01%). The new fees must be within the
   * legal range of 0-10000 basis points.
   *
   * @param {IUpdateProtocolFeesConfigArgs} args - The configuration arguments for updating protocol fees:
   *   - poolUtxo: The UTXO containing the current pool state
   *   - protocolFees: The new protocol fees with bid and ask values
   *   - signers: Optional array of signer key hashes to attach to the transaction
   *   - referralFee: Optional referral fee for the transaction
   * @returns {Promise<IComposedTx<TxBuilder, Transaction>>} A promise that resolves to the composed transaction
   *          ready for signing and submission.
   * @throws {Error} If the protocol fees are outside the valid range (0-10000 basis points).
   * @throws {Error} If the pool UTXO cannot be resolved or doesn't contain a valid datum.
   */
  async updateProtocolFees(
    args: IUpdateProtocolFeesConfigArgs,
  ): Promise<IComposedTx<TxBuilder, Transaction>> {
    const { poolUtxo, protocolFees, signers, referralFee } = args;

    // Validate protocol fees are in legal range (0-10000 basis points)
    const MAX_BASIS_POINTS = 10000n;
    if (
      protocolFees.bid < 0n ||
      protocolFees.bid > MAX_BASIS_POINTS ||
      protocolFees.ask < 0n ||
      protocolFees.ask > MAX_BASIS_POINTS
    ) {
      throw new Error(
        `Protocol fees must be between 0 and ${MAX_BASIS_POINTS} basis points. Received: bid=${protocolFees.bid}, ask=${protocolFees.ask}`,
      );
    }

    // Resolve the pool UTXO
    const poolUtxos = await this.blaze.provider.resolveUnspentOutputs([
      new Core.TransactionInput(
        Core.TransactionId(poolUtxo.hash),
        BigInt(poolUtxo.index),
      ),
    ]);

    const poolUtxoToSpend = poolUtxos?.[0];
    if (!poolUtxoToSpend) {
      throw new Error(
        `Pool UTXO not found with parameters: ${JSON.stringify(poolUtxo)}`,
      );
    }

    // Get the pool datum
    const poolDatum =
      poolUtxoToSpend.output().datum()?.asInlineData() ||
      (poolUtxoToSpend.output().datum()?.asDataHash() &&
        (await this.blaze.provider.resolveDatum(
          Core.DatumHash(
            poolUtxoToSpend.output().datum()?.asDataHash() as string,
          ),
        )));

    if (!poolDatum) {
      throw new Error(
        "Pool UTXO does not contain a valid datum. Cannot update protocol fees.",
      );
    }

    // Decode the current pool datum
    const currentPoolDatum = this.datumBuilder.decodeDatum(poolDatum);

    // Create updated pool datum with new protocol fees
    const updatedPoolDatum: StableswapsTypes.StablePoolDatum = {
      ...currentPoolDatum,
      protocolFeeBasisPoints: [protocolFees.bid, protocolFees.ask],
    };

    const updatedDatumData = serialize(
      StableswapsTypes.StablePoolDatum,
      updatedPoolDatum,
    );

    // Get reference scripts
    const references = await this.getAllReferenceUtxos();

    // Get settings datum to extract treasury address
    const settingsDatum = await this.getSettingsUtxoDatum();
    if (!settingsDatum) {
      throw new Error(
        "Could not retrieve settings datum to get treasury address",
      );
    }

    const treasuryAddress = DatumBuilderV3.getTreasuryAddress(
      settingsDatum,
      this.network === "mainnet"
        ? Core.NetworkId.Mainnet
        : Core.NetworkId.Testnet,
    );

    // Find a wallet UTXO with at least 5 ADA to cover fees and create change
    const walletUtxos = await this.blaze.wallet.getUnspentOutputs();

    const MIN_ADA_FOR_FEES = 5_000_000n; // 5 ADA
    const walletUtxo = walletUtxos.find((utxo) => {
      const lovelaceAmount = utxo.output().amount().coin();
      return lovelaceAmount >= MIN_ADA_FOR_FEES;
    });

    if (!walletUtxo) {
      throw new Error(
        `No wallet UTXO found with at least ${MIN_ADA_FOR_FEES / 1_000_000n} ADA to cover transaction fees`,
      );
    }

    // Sort inputs manually using Cardano's standard sorting (by txHash then by index)
    const allInputs = [poolUtxoToSpend, walletUtxo].sort((a, b) => {
      // Sort by txHash first
      if (a.input().transactionId() < b.input().transactionId()) return -1;
      if (a.input().transactionId() > b.input().transactionId()) return 1;
      // If same txHash, sort by index
      if (a.input().index() < b.input().index()) return -1;
      if (a.input().index() > b.input().index()) return 1;
      return 0;
    });

    // Find the pool input index in the sorted inputs
    let poolInputIndex = -1;
    for (let i = 0; i < allInputs.length; i++) {
      if (
        allInputs[i].input().transactionId() ===
          poolUtxoToSpend.input().transactionId() &&
        allInputs[i].input().index() === poolUtxoToSpend.input().index()
      ) {
        poolInputIndex = i;
        break;
      }
    }

    if (poolInputIndex === -1) {
      throw new Error(
        "Pool input not found in sorted inputs. This should not happen.",
      );
    }

    // Build the Manage redeemer for the pool spend
    const poolManageRedeemer: StableswapsTypes.PoolRedeemer = "Manage";
    const poolRedeemerData = serialize(
      StableswapsTypes.PoolRedeemer,
      poolManageRedeemer,
    );

    // Build the WithdrawFees redeemer with amounts set to 0. The WithdrawFees
    // execution path in the pool validator is what allows updating protocol fees,
    // even when no fees are actually withdrawn.
    const manageRedeemer: StableswapsTypes.ManageRedeemer = {
      WithdrawFees: {
        amount: [0n, 0n, 0n],
        treasuryOutput: 1n,
        poolInput: BigInt(poolInputIndex),
      },
    };
    const manageRedeemerData = serialize(
      StableswapsTypes.ManageRedeemer,
      manageRedeemer,
    );

    // Get the pool.manage.else validator script
    const poolManageElseScript =
      await this.getValidatorScript("pool.manage.else");

    // Create the withdrawal address for pool.manage.else
    const poolManageElseAddress = Core.RewardAccount.fromCredential(
      {
        hash: Core.Hash28ByteBase16(poolManageElseScript.hash),
        type: Core.CredentialType.ScriptHash,
      },
      this.network === "mainnet"
        ? Core.NetworkId.Mainnet
        : Core.NetworkId.Testnet,
    );

    // Build the transaction with all components in the correct order
    const tx = this.newTxInstance(referralFee);

    // Add inputs in sorted order
    allInputs.forEach((utxo) => {
      // Use the pool redeemer for pool input, undefined for wallet input
      const isPoolInput =
        utxo.input().transactionId() ===
          poolUtxoToSpend.input().transactionId() &&
        utxo.input().index() === poolUtxoToSpend.input().index();
      tx.addInput(utxo, isPoolInput ? poolRedeemerData : undefined);
    });

    // Add reference inputs
    references.forEach((utxo) => {
      const cbor = utxo.toCbor();
      const newInstance = Core.TransactionUnspentOutput.fromCbor(cbor);
      tx.addReferenceInput(newInstance);
    });
    const instance = await this.getSettingsUtxo();
    tx.addReferenceInput(instance);

    // Attach the pool.manage.else validator script to the transaction
    const poolManageElseScriptCbor = Core.Script.newPlutusV3Script(
      new Core.PlutusV3Script(Core.HexBlob(poolManageElseScript.compiledCode)),
    );
    tx.provideScript(poolManageElseScriptCbor);

    // Add withdrawal from pool.manage.else validator
    tx.addWithdrawal(poolManageElseAddress, 0n, manageRedeemerData);

    // Pay the pool UTXO back to the pool address with updated datum (output index 0)
    const poolAddress = poolUtxoToSpend.output().address();
    const poolValue = poolUtxoToSpend.output().amount();
    tx.lockAssets(poolAddress, poolValue, updatedDatumData);

    // Add treasury output with inline Void datum (output index 1)
    const MIN_TREASURY_ADA = 1_000_000n; // 1 ADA
    tx.lockLovelace(
      Core.Address.fromBech32(treasuryAddress),
      MIN_TREASURY_ADA,
      Void(),
    );

    // Attach any provided signers
    if (signers && signers.length > 0) {
      signers.forEach((signer) => {
        tx.addRequiredSigner(Core.Ed25519KeyHashHex(signer));
      });
    }

    // Add collateral since coin selection is disabled.
    // Exclude the wallet UTXO used as input from collateral selection.
    const collateralCandidates = walletUtxos.filter(
      (utxo) =>
        utxo.input().transactionId() !== walletUtxo.input().transactionId() ||
        utxo.input().index() !== walletUtxo.input().index(),
    );

    if (collateralCandidates.length === 0) {
      throw new Error(
        "No eligible wallet UTXOs available for collateral. " +
          "The wallet needs at least one additional UTXO besides the spending input.",
      );
    }

    const { selectedInputs } = CoinSelector.hvfSelector(
      collateralCandidates,
      Core.Value.fromCore({ coins: 5_000_000n }),
    );
    tx.provideCollateral(selectedInputs.slice(0, 3));

    return this.completeTx({
      tx,
      datum: updatedDatumData.toCbor(),
      referralFee: referralFee?.payment,
      deposit: 0n,
      scooperFee: 0n,
      coinSelection: false,
    });
  }
}
