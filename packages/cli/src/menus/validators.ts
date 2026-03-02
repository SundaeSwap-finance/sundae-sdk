/* eslint-disable no-console */
import { Core, makeValue } from "@blaze-cardano/sdk";
import { serialize, Void, parse } from "@blaze-cardano/data";
import { input, select, confirm, password } from "@inquirer/prompts";
import {
  EContractVersion,
  TxBuilderV3,
  TxBuilderStableswaps,
  ContractTypes,
} from "@sundaeswap/core";
import {
  Sprinkle,
  WalletSettingsSchema,
  type TExact,
} from "@sundaeswap/sprinkles";
import type { IAppContext } from "../types.js";
import { ensureDeployment, printHeader } from "./shared.js";
import { decrypt } from "../utils.js";
import * as fs from "fs";
import * as path from "path";

const { StableswapsTypes, V3Types } = ContractTypes;

const SETTINGS_NFT_NAME = "73657474696e6773"; // "settings" in hex

/**
 * The minimum number of leading zero hex chars required in the tx hash
 * so that the settings UTxO sorts first among reference inputs.
 */
const REQUIRED_HASH_PREFIX = "00";

export async function bootstrapSettingsUtxoMenu(
  ctx: IAppContext,
): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Bootstrap Settings UTxO ====\n");

  const version = await select({
    message: "Which version to bootstrap settings for?",
    choices: [
      { name: "V3", value: EContractVersion.V3 },
      { name: "Stableswaps", value: EContractVersion.Stableswaps },
    ],
  });

  const sdk = await ctx.sdk();
  const builder = sdk.builders.get(version)! as
    | TxBuilderV3
    | TxBuilderStableswaps;

  // Check if custom validators are loaded
  const customValidators = ctx.sprinkle.settings.customValidators;
  const versionKey = version as keyof NonNullable<typeof customValidators>;
  if (!customValidators?.[versionKey]?.paramsPath) {
    const proceed = await select({
      message:
        "No custom validators configured. Would you like to bootstrap from scratch?",
      choices: [
        {
          name: "Yes - generate new protocol params from a bootstrap UTxO",
          value: "scratch",
        },
        { name: "No - configure validators first", value: "cancel" },
      ],
    });

    if (proceed === "cancel") {
      return;
    }

    await bootstrapFromScratch(ctx, version);
    return;
  }

  // Ensure settings.mint script is deployed as a reference
  await ensureDeployment("settings.mint", builder, ctx);

  const { hash: settingsMintHash, compiledCode: settingsMintCode } =
    await builder.getValidatorScript("settings.mint");

  console.log(`\nSettings mint policy hash: ${settingsMintHash}`);

  // Get the settings datum
  const datumSource = await select({
    message: "How do you want to provide the settings datum?",
    choices: [
      { name: "Paste raw datum CBOR hex", value: "cbor" },
      { name: "Interactive (fill fields)", value: "interactive" },
    ],
  });

  let settingsDatumData: Core.PlutusData;

  if (datumSource === "cbor") {
    const cborHex = await input({
      message: "Enter settings datum CBOR (hex):",
      validate: (value) => {
        if (!value || value.trim().length === 0) return "CBOR cannot be empty";
        if (!/^[0-9a-fA-F]+$/.test(value.trim()))
          return "Must be valid hex string";
        return true;
      },
    });
    settingsDatumData = Core.PlutusData.fromCbor(Core.HexBlob(cborHex.trim()));
  } else {
    settingsDatumData = await buildInteractiveSettingsDatum(version);
  }

  // Build the settings script address (where the settings NFT will be locked)
  const settingsScriptAddress = Core.addressFromCredentials(
    builder.network === "mainnet"
      ? Core.NetworkId.Mainnet
      : Core.NetworkId.Testnet,
    Core.Credential.fromCore({
      hash: Core.Hash28ByteBase16(settingsMintHash),
      type: Core.CredentialType.ScriptHash,
    }),
  );

  // Provide the settings.mint script for minting
  const settingsMintScript = Core.Script.newPlutusV3Script(
    new Core.PlutusV3Script(Core.HexBlob(settingsMintCode)),
  );

  console.log(
    `\nSettings UTxO will be locked at: ${settingsScriptAddress.toBech32()}`,
  );
  console.log("\nGrinding for a low tx hash (need prefix '00')...");

  // Grind for a low tx hash by adjusting the lovelace amount
  let lovelaceAmount = 5_000_000n; // Start at 5 ADA
  let finalTx: Core.Transaction | undefined;
  let attempts = 0;

  while (!finalTx) {
    attempts++;
    try {
      const tx = builder.blaze
        .newTransaction()
        .addMint(
          Core.PolicyId(settingsMintHash),
          new Map([[Core.AssetName(SETTINGS_NFT_NAME), 1n]]),
          Void(),
        )
        .provideScript(settingsMintScript)
        .lockAssets(
          settingsScriptAddress,
          makeValue(lovelaceAmount, [
            `${settingsMintHash}${SETTINGS_NFT_NAME}`,
            1n,
          ]),
          settingsDatumData,
        );

      // Try to complete with explicit options to see more details
      let completedTx: Core.Transaction;
      try {
        completedTx = await tx.complete();
      } catch (evalError) {
        // Re-throw with more context
        if (attempts === 1) {
          console.log("tx.complete() failed:", evalError);
        }
        throw evalError;
      }
      const txHash = completedTx.body().hash();

      if (txHash.startsWith(REQUIRED_HASH_PREFIX)) {
        console.log(`\nFound satisfying tx hash after ${attempts} attempts!`);
        console.log(`Tx hash: ${txHash}`);
        console.log(`Lovelace amount: ${lovelaceAmount}`);
        finalTx = completedTx;
      } else {
        lovelaceAmount += 1n;
        if (attempts % 100 === 0) {
          console.log(
            `  ...${attempts} attempts so far (current lovelace: ${lovelaceAmount})`,
          );
        }
      }
    } catch (error) {
      console.error(`Error building tx at lovelace ${lovelaceAmount}:`, error);
      lovelaceAmount += 1_000_000n; // Jump by 1 ADA on error
      if (attempts > 50000) {
        console.error(
          "Could not find satisfying tx hash after 50000 attempts. Aborting.",
        );
        await input({ message: "Press enter to continue" });
        return;
      }
    }
  }

  await ctx.sprinkle.TxDialog(sdk.blaze(), finalTx);
}

/**
 * Update an existing settings UTxO with new datum.
 * Must be signed by the settings admin.
 */
export async function updateSettingsUtxoMenu(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Update Settings UTxO ====\n");

  const version = await select({
    message: "Which version to update settings for?",
    choices: [
      { name: "V3", value: EContractVersion.V3 },
      { name: "Stableswaps", value: EContractVersion.Stableswaps },
    ],
  });

  const sdk = await ctx.sdk();
  const builder = sdk.builders.get(version)! as
    | TxBuilderV3
    | TxBuilderStableswaps;

  // Get the settings scripts - we'll include settings.spend directly in the tx
  const { hash: settingsMintHash } =
    await builder.getValidatorScript("settings.mint");
  const { compiledCode: rawSettingsSpendCode } =
    await builder.getValidatorScript("settings.spend");

  // Build the spend script from compiled code
  // The compiledCode can be in two formats:
  // 1. Raw CBOR byte string: 58/59 + length + data
  // 2. CIP-0381 array format: 82 + version + script_bytes (used in Aiken blueprints)
  let settingsSpendCode = rawSettingsSpendCode;
  const firstByte = parseInt(settingsSpendCode.substring(0, 2), 16);
  const majorType = firstByte >> 5;
  if (majorType === 4) {
    // It's an array - extract the script bytes (second element)
    const reader = new Core.CborReader(Core.HexBlob(settingsSpendCode));
    const arrayLen = reader.readStartArray();
    if (arrayLen !== 2) {
      throw new Error(
        `Invalid compiledCode array format for settings.spend. Expected 2 elements, got ${arrayLen}.`,
      );
    }
    reader.readInt(); // Skip version
    const innerCbor = reader.readByteString();
    settingsSpendCode = Buffer.from(innerCbor).toString("hex");
  } else if (majorType !== 2) {
    throw new Error(
      `Invalid compiledCode format for settings.spend. Expected CBOR byte string (major type 2) or array (major type 4), got major type ${majorType}.`,
    );
  }

  const spendScript =
    version === EContractVersion.Stableswaps
      ? Core.Script.newPlutusV3Script(
          new Core.PlutusV3Script(Core.HexBlob(settingsSpendCode)),
        )
      : Core.Script.newPlutusV2Script(
          new Core.PlutusV2Script(Core.HexBlob(settingsSpendCode)),
        );

  console.log(`\nSettings mint hash: ${settingsMintHash}`);
  console.log(`Settings spend script hash: ${spendScript.hash()}`);
  console.log(`Scripts match: ${settingsMintHash === spendScript.hash()}`);

  // Find the current settings UTxO by NFT
  const settingsAssetId = `${settingsMintHash}${SETTINGS_NFT_NAME}`;
  console.log(`Looking for settings NFT: ${settingsAssetId}`);

  let settingsUtxo: Core.TransactionUnspentOutput;
  try {
    settingsUtxo = await builder.blaze.provider.getUnspentOutputByNFT(
      Core.AssetId(settingsAssetId),
    );
  } catch {
    console.log("\nNo settings UTxO found. You may need to bootstrap first.");
    await input({ message: "Press enter to continue" });
    return;
  }

  // Build the settings script address for the output
  const settingsScriptAddress = Core.addressFromCredentials(
    builder.network === "mainnet"
      ? Core.NetworkId.Mainnet
      : Core.NetworkId.Testnet,
    Core.Credential.fromCore({
      hash: Core.Hash28ByteBase16(settingsMintHash),
      type: Core.CredentialType.ScriptHash,
    }),
  );
  console.log(
    `\nFound settings UTxO: ${settingsUtxo.input().transactionId()}#${settingsUtxo.input().index()}`,
  );
  console.log(`UTxO address: ${settingsUtxo.output().address().toBech32()}`);

  // Get the settings admin from current datum
  const currentDatum = settingsUtxo.output().datum();
  console.log(
    `Datum type: ${currentDatum?.asInlineData() ? "inline" : currentDatum?.asDataHash() ? "hash" : "none"}`,
  );
  if (!currentDatum?.asInlineData()) {
    console.log("\nCould not read inline datum from settings UTxO.");
    await input({ message: "Press enter to continue" });
    return;
  }

  // Helper to extract key hash from MultisigScript (handles Signature variant)
  const extractKeyHash = (
    admin: { Signature: { keyHash: string } } | unknown,
  ): string | null => {
    if (admin && typeof admin === "object" && "Signature" in admin) {
      const sig = admin as { Signature: { keyHash: string } };
      return sig.Signature.keyHash;
    }
    return null;
  };

  // Parse existing datum using the SDK types
  const existingParsedDatum = parse(
    version === EContractVersion.Stableswaps
      ? ContractTypes.StableswapsTypes.SettingsDatum
      : ContractTypes.V3Types.SettingsDatum,
    currentDatum.asInlineData()!,
  );
  // Extract admin key hashes
  const settingsAdminHash = extractKeyHash(existingParsedDatum.settingsAdmin);
  const treasuryAdminHash = extractKeyHash(existingParsedDatum.treasuryAdmin);

  console.log("\n--- Existing datum (parsed) ---");
  console.log(
    `Settings admin: ${settingsAdminHash || "(multisig - not simple signature)"}`,
  );
  console.log(
    `Treasury admin: ${treasuryAdminHash || "(multisig - not simple signature)"}`,
  );
  console.log(
    "authorizedScoopers:",
    JSON.stringify(existingParsedDatum.authorizedScoopers),
  );
  console.log(
    "authorizedStakingKeys:",
    JSON.stringify(existingParsedDatum.authorizedStakingKeys),
  );
  console.log(
    "treasuryAddress:",
    JSON.stringify(existingParsedDatum.treasuryAddress),
  );
  console.log(
    "treasuryAllowance:",
    JSON.stringify(existingParsedDatum.treasuryAllowance, (_, v) =>
      typeof v === "bigint" ? v.toString() : v,
    ),
  );

  // Ask which type of update
  const updateType = await select({
    message: "Which type of update?",
    choices: [
      {
        name: "Settings Admin Update (can change: scoopers, fees, admins, metadata admin, pool creation fee, extensions)",
        value: "settings",
      },
      {
        name: "Treasury Admin Update (can change: treasury address, treasury allowance, authorized staking keys)",
        value: "treasury",
      },
    ],
  });

  // Get the new settings datum
  const datumSource = await select({
    message: "How do you want to provide the new settings datum?",
    choices: [
      { name: "Keep current datum (just re-sign)", value: "keep" },
      { name: "Re-serialize existing (test roundtrip)", value: "roundtrip" },
      { name: "Paste raw datum CBOR hex", value: "cbor" },
      { name: "Interactive (fill fields)", value: "interactive" },
    ],
  });

  let newSettingsDatum: Core.PlutusData;

  if (datumSource === "keep") {
    newSettingsDatum = currentDatum.asInlineData()!;
    console.log("Using existing datum");
    console.log("Existing datum CBOR:", newSettingsDatum.toCbor());
    console.log(
      "Existing datum size:",
      newSettingsDatum.toCbor().length / 2,
      "bytes",
    );
  } else if (datumSource === "roundtrip") {
    // Parse the existing datum and re-serialize it to test if roundtrip works
    const parsedDatum = parse(
      version === EContractVersion.Stableswaps
        ? ContractTypes.StableswapsTypes.SettingsDatum
        : ContractTypes.V3Types.SettingsDatum,
      currentDatum.asInlineData()!,
    );
    console.log(
      "Parsed existing datum:",
      JSON.stringify(
        parsedDatum,
        (_, v) => (typeof v === "bigint" ? v.toString() : v),
        2,
      ),
    );

    newSettingsDatum = serialize(
      version === EContractVersion.Stableswaps
        ? ContractTypes.StableswapsTypes.SettingsDatum
        : ContractTypes.V3Types.SettingsDatum,
      parsedDatum,
    );
    console.log("Re-serialized datum CBOR:", newSettingsDatum.toCbor());
    console.log(
      "Original datum CBOR:     ",
      currentDatum.asInlineData()!.toCbor(),
    );
    console.log(
      "Match:",
      newSettingsDatum.toCbor() === currentDatum.asInlineData()!.toCbor(),
    );
  } else if (datumSource === "cbor") {
    const cborHex = await input({
      message: "Enter new settings datum CBOR (hex):",
      validate: (value) => {
        if (!value || value.trim().length === 0) return "CBOR cannot be empty";
        if (!/^[0-9a-fA-F]+$/.test(value.trim()))
          return "Must be valid hex string";
        return true;
      },
    });
    newSettingsDatum = Core.PlutusData.fromCbor(Core.HexBlob(cborHex.trim()));
  } else {
    newSettingsDatum = await buildInteractiveSettingsDatum(
      version,
      updateType,
      existingParsedDatum,
    );
    console.log("Interactive datum CBOR:", newSettingsDatum.toCbor());
  }

  // Parse the new datum to validate field changes (only for CBOR input, interactive already enforces)
  const newParsedDatum = parse(
    version === EContractVersion.Stableswaps
      ? ContractTypes.StableswapsTypes.SettingsDatum
      : ContractTypes.V3Types.SettingsDatum,
    newSettingsDatum,
  );

  // Validate that only allowed fields are changed based on update type
  // This is mainly useful for CBOR input - interactive mode already enforces this
  const validationErrors: string[] = [];

  if (updateType === "settings") {
    // Settings Admin Update: cannot change authorized_staking_keys, treasury_address, treasury_allowance
    if (
      JSON.stringify(newParsedDatum.authorizedStakingKeys) !==
      JSON.stringify(existingParsedDatum.authorizedStakingKeys)
    ) {
      validationErrors.push(
        "authorizedStakingKeys changed (not allowed with SettingsAdminUpdate)",
      );
    }
    if (
      JSON.stringify(newParsedDatum.treasuryAddress) !==
      JSON.stringify(existingParsedDatum.treasuryAddress)
    ) {
      validationErrors.push(
        "treasuryAddress changed (not allowed with SettingsAdminUpdate)",
      );
    }
    if (
      JSON.stringify(newParsedDatum.treasuryAllowance, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ) !==
      JSON.stringify(existingParsedDatum.treasuryAllowance, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      )
    ) {
      validationErrors.push(
        "treasuryAllowance changed (not allowed with SettingsAdminUpdate)",
      );
    }
  } else {
    // Treasury Admin Update: can only change authorized_staking_keys, treasury_address, treasury_allowance
    // Everything else must stay the same
    if (
      JSON.stringify(newParsedDatum.settingsAdmin) !==
      JSON.stringify(existingParsedDatum.settingsAdmin)
    ) {
      validationErrors.push(
        "settingsAdmin changed (not allowed with TreasuryAdminUpdate)",
      );
    }
    if (
      JSON.stringify(newParsedDatum.metadataAdmin) !==
      JSON.stringify(existingParsedDatum.metadataAdmin)
    ) {
      validationErrors.push(
        "metadataAdmin changed (not allowed with TreasuryAdminUpdate)",
      );
    }
    if (
      JSON.stringify(newParsedDatum.treasuryAdmin) !==
      JSON.stringify(existingParsedDatum.treasuryAdmin)
    ) {
      validationErrors.push(
        "treasuryAdmin changed (not allowed with TreasuryAdminUpdate)",
      );
    }
    if (
      JSON.stringify(newParsedDatum.authorizedScoopers) !==
      JSON.stringify(existingParsedDatum.authorizedScoopers)
    ) {
      validationErrors.push(
        "authorizedScoopers changed (not allowed with TreasuryAdminUpdate)",
      );
    }
    if (newParsedDatum.baseFee !== existingParsedDatum.baseFee) {
      validationErrors.push(
        "baseFee changed (not allowed with TreasuryAdminUpdate)",
      );
    }
    if (newParsedDatum.simpleFee !== existingParsedDatum.simpleFee) {
      validationErrors.push(
        "simpleFee changed (not allowed with TreasuryAdminUpdate)",
      );
    }
    if (newParsedDatum.strategyFee !== existingParsedDatum.strategyFee) {
      validationErrors.push(
        "strategyFee changed (not allowed with TreasuryAdminUpdate)",
      );
    }
    if (
      newParsedDatum.poolCreationFee !== existingParsedDatum.poolCreationFee
    ) {
      validationErrors.push(
        "poolCreationFee changed (not allowed with TreasuryAdminUpdate)",
      );
    }
  }

  if (validationErrors.length > 0) {
    console.log("\n*** Validation errors ***");
    for (const err of validationErrors) {
      console.log(`  - ${err}`);
    }
    const continueAnyway = await confirm({
      message: "Continue anyway? (transaction will likely fail)",
      default: false,
    });
    if (!continueAnyway) {
      return;
    }
  }

  console.log(
    `\nSettings UTxO will remain at: ${settingsScriptAddress.toBech32()}`,
  );
  console.log("\nGrinding for a low tx hash (need prefix '00')...");

  // Build redeemer based on version and update type
  // V3 SettingsAdminUpdate: d87a9fd8799fffff = RedeemerWrapper(Constr(1))[SettingsAdminUpdate(Constr(0))]
  // V3 TreasuryAdminUpdate: d87a9fd87a9fffff = RedeemerWrapper(Constr(1))[TreasuryAdminUpdate(Constr(1))]
  const redeemerVariant =
    updateType === "settings" ? "SettingsAdminUpdate" : "TreasuryAdminUpdate";

  const settingsRedeemer =
    version === EContractVersion.Stableswaps
      ? serialize(
          ContractTypes.StableswapsTypes.SettingsRedeemer,
          redeemerVariant,
        )
      : serialize(ContractTypes.V3Types.RedeemerWrapper$SettingsRedeemer, {
          Wrapper: redeemerVariant,
        });

  console.log(`Update type: ${redeemerVariant}`);
  console.log(`Redeemer CBOR: ${settingsRedeemer.toCbor()}`);

  // Determine required signer based on update type
  const requiredSignerHash =
    updateType === "settings" ? settingsAdminHash : treasuryAdminHash;

  if (!requiredSignerHash) {
    console.log(
      `\nThe ${updateType === "settings" ? "settings" : "treasury"} admin is a multisig script, not a simple signature.`,
    );
    console.log("This CLI currently only supports simple signature admins.");
    await input({ message: "Press enter to continue" });
    return;
  }
  console.log(`Required signer: ${requiredSignerHash}`);

  // Grind for a low tx hash
  // Start with current lovelace but ensure we have enough for larger datums
  const currentLovelace = settingsUtxo.output().amount().coin();
  const datumSizeBytes = BigInt(newSettingsDatum.toCbor().length / 2);
  // Rough estimate: ~4310 lovelace per byte of UTxO size (including datum)
  const estimatedMinUtxo = 2_000_000n + datumSizeBytes * 4500n;
  let lovelaceAmount =
    currentLovelace > estimatedMinUtxo ? currentLovelace : estimatedMinUtxo;
  let finalTx: Core.Transaction | undefined;
  let attempts = 0;

  console.log(`Current lovelace: ${currentLovelace}`);
  console.log(`Datum size: ${datumSizeBytes} bytes`);
  console.log(`Estimated min UTxO: ${estimatedMinUtxo}`);
  console.log(`Starting lovelace: ${lovelaceAmount}`);
  console.log("Attempting first transaction build...");

  while (!finalTx) {
    attempts++;
    try {
      // Preserve all assets from the input, just change lovelace for grinding
      const inputValue = settingsUtxo.output().amount();
      const outputValue = new Core.Value(
        lovelaceAmount,
        inputValue.multiasset(),
      );

      if (attempts === 1) {
        console.log("\n--- Transaction build details ---");
        console.log(
          "Input address:",
          settingsUtxo.output().address().toBech32(),
        );
        console.log("Output address:", settingsScriptAddress.toBech32());
        console.log("Input lovelace:", inputValue.coin().toString());
        console.log("Output lovelace:", lovelaceAmount.toString());
        console.log("Redeemer:", settingsRedeemer.toCbor());
        console.log("Script hash:", spendScript.hash());
      }

      const tx = builder.blaze
        .newTransaction()
        .addInput(settingsUtxo, settingsRedeemer)
        .provideScript(spendScript)
        .addRequiredSigner(Core.Ed25519KeyHashHex(requiredSignerHash))
        .lockAssets(settingsScriptAddress, outputValue, newSettingsDatum);

      const completedTx = await tx.complete();
      const txHash = completedTx.body().hash();

      if (txHash.startsWith(REQUIRED_HASH_PREFIX)) {
        console.log(`\nFound satisfying tx hash after ${attempts} attempts!`);
        console.log(`Tx hash: ${txHash}`);
        console.log(`Lovelace amount: ${lovelaceAmount}`);
        finalTx = completedTx;
      } else {
        lovelaceAmount += 1n;
        if (attempts % 100 === 0) {
          console.log(
            `  ...${attempts} attempts so far (current lovelace: ${lovelaceAmount})`,
          );
        }
      }
    } catch (error) {
      console.error(
        `Error building tx at lovelace ${lovelaceAmount}:`,
        error instanceof Error ? error.message : error,
      );

      // On first error, try to get the actual Blockfrost error
      if (attempts === 1) {
        console.log("\nTrying to get detailed error from Blockfrost...");
        console.log(
          "Spend script language:",
          spendScript.asPlutusV2()
            ? "PlutusV2"
            : spendScript.asPlutusV3()
              ? "PlutusV3"
              : "unknown",
        );
        try {
          // Build tx without evaluation
          const inputValue = settingsUtxo.output().amount();
          const outputValue = new Core.Value(
            lovelaceAmount,
            inputValue.multiasset(),
          );

          const txBuilder = builder.blaze.newTransaction();
          txBuilder.addInput(settingsUtxo, settingsRedeemer);
          txBuilder.provideScript(spendScript);
          txBuilder.addRequiredSigner(
            Core.Ed25519KeyHashHex(requiredSignerHash),
          );
          txBuilder.lockAssets(
            settingsScriptAddress,
            outputValue,
            newSettingsDatum,
          );

          // Get current tx cbor without completing
          const txCbor = txBuilder.toCbor();

          // Call Blockfrost directly
          const provider = builder.blaze.provider as unknown as {
            url: string;
            projectId: string;
          };
          const response = await fetch(
            `${provider.url}/utils/txs/evaluate/utxos`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                project_id: provider.projectId,
              },
              body: JSON.stringify({
                cbor: txCbor,
                additionalUtxoSet: [],
              }),
            },
          );
          const result = await response.json();
          console.log(
            "Blockfrost evaluation result:",
            JSON.stringify(result, null, 2),
          );

          // If empty ScriptFailures, the issue is likely phase-1 validation
          if (
            result.result?.EvaluationFailure?.ScriptFailures &&
            Object.keys(result.result.EvaluationFailure.ScriptFailures)
              .length === 0
          ) {
            console.log(
              "\n*** Empty ScriptFailures indicates phase-1 validation failure ***",
            );
            console.log(
              "This typically means the transaction structure is invalid.",
            );
            console.log("Possible causes:");
            console.log("1. Minimum UTxO not met for output");
            console.log("2. Balance error (inputs != outputs + fee)");
            console.log("3. Missing witness/collateral");

            // Try to get more info from submit endpoint
            console.log("\nTrying submit endpoint for more details...");
            const submitResp = await fetch(`${provider.url}/tx/submit`, {
              method: "POST",
              headers: {
                "Content-Type": "application/cbor",
                project_id: provider.projectId,
              },
              body: Buffer.from(txCbor, "hex"),
            });
            const submitResult = await submitResp.json();
            console.log(
              "Submit response:",
              JSON.stringify(submitResult, null, 2),
            );
          }
        } catch (e) {
          console.log("Could not get detailed error:", e);
        }
        await input({ message: "Press enter to continue or Ctrl+C to abort" });
      }

      lovelaceAmount += 1_000_000n;
      if (attempts > 50000) {
        console.error(
          "Could not find satisfying tx hash after 50000 attempts. Aborting.",
        );
        await input({ message: "Press enter to continue" });
        return;
      }
    }
  }

  console.log(
    "\nThis transaction requires signature from:",
    requiredSignerHash,
  );
  await multiSigTxDialog(ctx, sdk.blaze(), finalTx);
}

/**
 * Multi-sig aware transaction dialog.
 * Allows partial signing, exporting, and importing signatures.
 */
async function multiSigTxDialog(
  _ctx: IAppContext,
  blaze: {
    wallet: unknown;
    provider: {
      postTransactionToChain: (tx: Core.Transaction) => Promise<string>;
    };
  },
  tx: Core.Transaction,
): Promise<void> {
  const currentTx = tx;

  const showMenu = async (): Promise<void> => {
    console.log("\n--- Transaction Ready ---");
    console.log(`Tx hash: ${currentTx.body().hash()}`);

    // Show current signatures
    const witnesses = currentTx.witnessSet().vkeys();
    const sigCount = witnesses?.size() ?? 0;
    console.log(`Current signatures: ${sigCount}`);

    // Show required signers
    const requiredSigners = currentTx.body().requiredSigners();
    if (requiredSigners) {
      console.log("Required signers:");
      for (const signer of requiredSigners.values()) {
        console.log(`  - ${signer}`);
      }
    }

    const action = await select({
      message: "What would you like to do?",
      choices: [
        { name: "Sign with this wallet", value: "sign" },
        { name: "Show CBOR (for external signing)", value: "show" },
        { name: "Copy CBOR to clipboard", value: "copy" },
        { name: "Add signature from CBOR (paste signed tx)", value: "import" },
        { name: "Submit transaction", value: "submit" },
        { name: "Cancel", value: "cancel" },
      ],
    });

    switch (action) {
      case "sign": {
        try {
          const wallet = blaze.wallet;
          if ("signTransaction" in wallet) {
            const signed = await (
              wallet as {
                signTransaction: (
                  tx: Core.Transaction,
                  partialSign?: boolean,
                ) => Promise<Core.TransactionWitnessSet>;
              }
            ).signTransaction(currentTx, true);

            // Merge new signatures with existing ones
            const existingWitnesses = currentTx.witnessSet();
            const existingVkeys = existingWitnesses.vkeys()?.toCore() ?? [];
            const newVkeys = signed.vkeys()?.toCore() ?? [];

            // Combine, avoiding duplicates
            const allVkeys = [...existingVkeys];
            for (const newVkey of newVkeys) {
              if (!allVkeys.some(([vk]) => vk === newVkey[0])) {
                allVkeys.push(newVkey);
              }
            }

            existingWitnesses.setVkeys(
              Core.CborSet.fromCore(allVkeys, Core.VkeyWitness.fromCore),
            );
            currentTx.setWitnessSet(existingWitnesses);
            console.log("Signature added successfully.");
          } else {
            console.log("This wallet does not support signing (cold wallet).");
          }
        } catch (e) {
          console.error("Failed to sign:", e instanceof Error ? e.message : e);
        }
        await showMenu();
        break;
      }

      case "show": {
        const txCbor = currentTx.toCbor();
        console.log("\n--- Transaction CBOR ---");
        console.log(txCbor);
        console.log("--- End CBOR ---\n");
        await input({ message: "Press enter to continue" });
        await showMenu();
        break;
      }

      case "copy": {
        const txCbor = currentTx.toCbor();
        try {
          const { default: clipboard } = await import("clipboardy");
          clipboard.writeSync(String(txCbor));
          console.log("\nTransaction CBOR copied to clipboard.");
        } catch {
          console.log(
            "\nFailed to copy to clipboard. Use 'Show CBOR' instead.",
          );
        }
        await input({ message: "Press enter to continue" });
        await showMenu();
        break;
      }

      case "import": {
        const signedCbor = await input({
          message: "Paste the signed transaction CBOR:",
          validate: (v) => {
            if (!v.trim()) return "CBOR cannot be empty";
            if (!/^[0-9a-fA-F]+$/.test(v.trim())) return "Must be valid hex";
            return true;
          },
        });

        try {
          const importedTx = Core.Transaction.fromCbor(
            Core.TxCBOR(signedCbor.trim()),
          );

          // Verify it's the same transaction (same body hash)
          if (importedTx.body().hash() !== currentTx.body().hash()) {
            console.log(
              "Warning: The imported transaction has a different body hash!",
            );
            console.log(`Expected: ${currentTx.body().hash()}`);
            console.log(`Got: ${importedTx.body().hash()}`);
            const proceed = await confirm({
              message: "Continue anyway?",
              default: false,
            });
            if (!proceed) {
              await showMenu();
              return;
            }
          }

          // Merge signatures from imported tx
          const existingWitnesses = currentTx.witnessSet();
          const existingVkeys = existingWitnesses.vkeys()?.toCore() ?? [];
          const importedVkeys = importedTx.witnessSet().vkeys()?.toCore() ?? [];

          const allVkeys = [...existingVkeys];
          let added = 0;
          for (const importedVkey of importedVkeys) {
            if (!allVkeys.some(([vk]) => vk === importedVkey[0])) {
              allVkeys.push(importedVkey);
              added++;
            }
          }

          existingWitnesses.setVkeys(
            Core.CborSet.fromCore(allVkeys, Core.VkeyWitness.fromCore),
          );
          currentTx.setWitnessSet(existingWitnesses);
          console.log(
            `Added ${added} new signature(s). Total: ${allVkeys.length}`,
          );
        } catch (e) {
          console.error(
            "Failed to import:",
            e instanceof Error ? e.message : e,
          );
        }
        await showMenu();
        break;
      }

      case "submit": {
        const witnesses = currentTx.witnessSet().vkeys();
        const sigCount = witnesses?.size() ?? 0;
        if (sigCount === 0) {
          console.log("Warning: Transaction has no signatures!");
          const proceed = await confirm({
            message: "Submit anyway?",
            default: false,
          });
          if (!proceed) {
            await showMenu();
            return;
          }
        }

        try {
          const txId = await blaze.provider.postTransactionToChain(currentTx);
          console.log(`\nTransaction submitted successfully!`);
          console.log(`Tx ID: ${txId}`);
        } catch (e) {
          console.error(
            "Failed to submit:",
            e instanceof Error ? e.message : e,
          );
          await input({ message: "Press enter to continue" });
          await showMenu();
        }
        break;
      }

      case "cancel":
        console.log("Transaction cancelled.");
        break;
    }
  };

  await showMenu();
}

async function buildInteractiveSettingsDatum(
  version: EContractVersion,
  updateType?: "settings" | "treasury",
  existingDatum?: unknown,
): Promise<Core.PlutusData> {
  // Type the existing datum properly
  type TParsedSettingsDatum = {
    settingsAdmin: unknown;
    metadataAdmin: unknown;
    treasuryAdmin: unknown;
    treasuryAddress: unknown;
    treasuryAllowance: [bigint, bigint];
    authorizedScoopers: string[] | undefined;
    authorizedStakingKeys: unknown[];
    baseFee: bigint;
    simpleFee: bigint;
    strategyFee: bigint;
    poolCreationFee: bigint;
    extensions: unknown;
  };
  const existing = existingDatum as TParsedSettingsDatum | undefined;

  // For updates, show which fields can be changed
  if (updateType === "settings") {
    console.log("\n--- Settings Admin Update ---");
    console.log(
      "You can change: scoopers, fees, admins, metadata admin, pool creation fee",
    );
    console.log(
      "Cannot change: treasury address, treasury allowance, authorized staking keys\n",
    );
  } else if (updateType === "treasury") {
    console.log("\n--- Treasury Admin Update ---");
    console.log(
      "You can change: treasury address, treasury allowance, authorized staking keys",
    );
    console.log("Cannot change: everything else\n");
  } else {
    console.log("\n--- Settings Datum Fields (Bootstrap) ---\n");
  }

  // Settings Admin fields - only ask if settings update or bootstrap
  let settingsAdmin = existing?.settingsAdmin;
  let metadataAdmin = existing?.metadataAdmin;
  let treasuryAdmin = existing?.treasuryAdmin;
  let baseFee = existing?.baseFee;
  let simpleFee = existing?.simpleFee;
  let strategyFee = existing?.strategyFee;
  let poolCreationFee = existing?.poolCreationFee;
  let authorizedScoopers = existing?.authorizedScoopers;
  let extensions = existing?.extensions;

  // Treasury Admin fields - only ask if treasury update or bootstrap
  let treasuryAddress = existing?.treasuryAddress;
  let treasuryAllowance = existing?.treasuryAllowance;
  let authorizedStakingKeys = existing?.authorizedStakingKeys;

  if (updateType !== "treasury") {
    // Settings admin can change these fields
    const settingsAdminHash = await input({
      message: "Settings admin key hash (hex, 56 chars):",
      default:
        existing?.settingsAdmin &&
        "Signature" in (existing.settingsAdmin as object)
          ? (existing.settingsAdmin as { Signature: { keyHash: string } })
              .Signature.keyHash
          : undefined,
      validate: (v) =>
        /^[0-9a-fA-F]{56}$/.test(v.trim()) || "Must be 56 hex chars",
    });
    settingsAdmin = { Signature: { keyHash: settingsAdminHash.trim() } };

    const metadataAdminHash = await input({
      message: "Metadata admin key hash (hex, 56 chars):",
      default:
        existing?.metadataAdmin &&
        "paymentCredential" in (existing.metadataAdmin as object)
          ? (() => {
              const ma = existing.metadataAdmin as {
                paymentCredential: {
                  VerificationKeyCredential?: [string];
                  VerificationKey?: [string];
                };
              };
              return (
                ma.paymentCredential.VerificationKeyCredential?.[0] ||
                ma.paymentCredential.VerificationKey?.[0]
              );
            })()
          : undefined,
      validate: (v) =>
        /^[0-9a-fA-F]{56}$/.test(v.trim()) || "Must be 56 hex chars",
    });
    metadataAdmin = {
      paymentCredential:
        version === EContractVersion.Stableswaps
          ? { VerificationKey: [metadataAdminHash.trim()] as [string] }
          : {
              VerificationKeyCredential: [metadataAdminHash.trim()] as [string],
            },
      stakeCredential: undefined,
    };

    const treasuryAdminHash = await input({
      message: "Treasury admin key hash (hex, 56 chars):",
      default:
        existing?.treasuryAdmin &&
        "Signature" in (existing.treasuryAdmin as object)
          ? (existing.treasuryAdmin as { Signature: { keyHash: string } })
              .Signature.keyHash
          : undefined,
      validate: (v) =>
        /^[0-9a-fA-F]{56}$/.test(v.trim()) || "Must be 56 hex chars",
    });
    treasuryAdmin = { Signature: { keyHash: treasuryAdminHash.trim() } };

    const baseFeeInput = await input({
      message: "Base fee (lovelace):",
      default: existing?.baseFee?.toString(),
      validate: (v) => (!isNaN(Number(v)) ? true : "Must be a number"),
    });
    baseFee = BigInt(baseFeeInput);

    const simpleFeeInput = await input({
      message: "Simple fee (lovelace):",
      default: existing?.simpleFee?.toString(),
      validate: (v) => (!isNaN(Number(v)) ? true : "Must be a number"),
    });
    simpleFee = BigInt(simpleFeeInput);

    const strategyFeeInput = await input({
      message: "Strategy fee (lovelace):",
      default: existing?.strategyFee?.toString(),
      validate: (v) => (!isNaN(Number(v)) ? true : "Must be a number"),
    });
    strategyFee = BigInt(strategyFeeInput);

    const poolCreationFeeInput = await input({
      message: "Pool creation fee (lovelace):",
      default: existing?.poolCreationFee?.toString(),
      validate: (v) => (!isNaN(Number(v)) ? true : "Must be a number"),
    });
    poolCreationFee = BigInt(poolCreationFeeInput);

    // Authorized scoopers
    const existingScoopersStr = existing?.authorizedScoopers?.join(",") || "";
    const scoopersInput = await input({
      message:
        "Authorized scoopers (comma-separated pub key hashes, or empty for open):",
      default: existingScoopersStr,
      validate: (v) => {
        if (!v.trim()) return true;
        const hashes = v.split(",").map((h) => h.trim());
        for (const h of hashes) {
          if (!/^[0-9a-fA-F]{56}$/.test(h)) {
            return `Invalid hash: ${h} (must be 56 hex chars)`;
          }
        }
        return true;
      },
    });
    authorizedScoopers = scoopersInput.trim()
      ? scoopersInput
          .split(",")
          .map((h) => h.trim())
          .filter((h) => h.length > 0)
      : undefined;
  }

  if (updateType !== "settings") {
    // Treasury admin can change these fields
    const treasuryAddressStr = await input({
      message: "Treasury address (bech32):",
      // No good way to show default for complex address, user needs to re-enter
      validate: (v) => {
        try {
          Core.Address.fromBech32(v.trim());
          return true;
        } catch {
          return "Invalid bech32 address";
        }
      },
    });
    const parsedTreasuryAddr = Core.Address.fromBech32(
      treasuryAddressStr.trim(),
    );
    const treasuryPayment = parsedTreasuryAddr.getProps().paymentPart!;
    const treasuryStake = parsedTreasuryAddr.getProps().delegationPart;

    if (version === EContractVersion.Stableswaps) {
      const paymentCred =
        treasuryPayment.type === Core.CredentialType.KeyHash
          ? { VerificationKey: [treasuryPayment.hash] as [string] }
          : { Script: [treasuryPayment.hash] as [string] };
      const stakeCred = treasuryStake
        ? {
            Inline: [
              treasuryStake.type === Core.CredentialType.KeyHash
                ? { VerificationKey: [treasuryStake.hash] as [string] }
                : { Script: [treasuryStake.hash] as [string] },
            ] as [{ VerificationKey: [string] } | { Script: [string] }],
          }
        : undefined;
      treasuryAddress = {
        paymentCredential: paymentCred,
        stakeCredential: stakeCred,
      };
    } else {
      const paymentCred =
        treasuryPayment.type === Core.CredentialType.KeyHash
          ? { VerificationKeyCredential: [treasuryPayment.hash] as [string] }
          : { ScriptCredential: [treasuryPayment.hash] as [string] };
      const stakeCred = treasuryStake
        ? {
            Inline: [
              treasuryStake.type === Core.CredentialType.KeyHash
                ? {
                    VerificationKeyCredential: [treasuryStake.hash] as [string],
                  }
                : { ScriptCredential: [treasuryStake.hash] as [string] },
            ] as [
              | { VerificationKeyCredential: [string] }
              | { ScriptCredential: [string] },
            ],
          }
        : undefined;
      treasuryAddress = {
        paymentCredential: paymentCred,
        stakeCredential: stakeCred,
      };
    }

    const treasuryAllowanceNumInput = await input({
      message: "Treasury allowance numerator:",
      default: existing?.treasuryAllowance?.[0]?.toString(),
      validate: (v) => (!isNaN(Number(v)) ? true : "Must be a number"),
    });
    const treasuryAllowanceDenInput = await input({
      message: "Treasury allowance denominator:",
      default: existing?.treasuryAllowance?.[1]?.toString(),
      validate: (v) => (!isNaN(Number(v)) ? true : "Must be a number"),
    });
    treasuryAllowance = [
      BigInt(treasuryAllowanceNumInput),
      BigInt(treasuryAllowanceDenInput),
    ] as [bigint, bigint];

    // Authorized staking keys
    const extractStakingKeyHashes = (keys: unknown[]): string[] => {
      return keys
        .map((k) => {
          if (k && typeof k === "object") {
            if ("VerificationKeyCredential" in k) {
              return (k as { VerificationKeyCredential: [string] })
                .VerificationKeyCredential[0];
            }
            if ("ScriptCredential" in k) {
              return `script:${
                (k as { ScriptCredential: [string] }).ScriptCredential[0]
              }`;
            }
          }
          return "";
        })
        .filter(Boolean);
    };
    const existingStakingKeysStr = existing?.authorizedStakingKeys
      ? extractStakingKeyHashes(existing.authorizedStakingKeys).join(",")
      : "";

    const stakingKeysInput = await input({
      message:
        "Authorized staking key hashes (comma-separated, prefix with 'script:' for script creds, or empty for none):",
      default: existingStakingKeysStr,
      validate: (v) => {
        if (!v.trim()) return true;
        const hashes = v.split(",").map((h) => h.trim());
        for (const h of hashes) {
          const hash = h.startsWith("script:") ? h.slice(7) : h;
          if (!/^[0-9a-fA-F]{56}$/.test(hash)) {
            return `Invalid hash: ${hash} (must be 56 hex chars)`;
          }
        }
        return true;
      },
    });

    if (stakingKeysInput.trim()) {
      authorizedStakingKeys = stakingKeysInput
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h.length > 0)
        .map((h) => {
          if (h.startsWith("script:")) {
            return version === EContractVersion.Stableswaps
              ? { Script: [h.slice(7)] as [string] }
              : { ScriptCredential: [h.slice(7)] as [string] };
          }
          return version === EContractVersion.Stableswaps
            ? { VerificationKey: [h] as [string] }
            : { VerificationKeyCredential: [h] as [string] };
        });
    } else {
      authorizedStakingKeys = [];
    }
  }

  // Handle extensions for bootstrap (not during updates)
  if (!updateType && version === EContractVersion.Stableswaps) {
    const protocolFeeBid = await input({
      message: "Protocol fee bid (basis points, e.g., 100 = 1%; 0 for none):",
      validate: (v) => (!isNaN(Number(v)) ? true : "Must be a number"),
    });
    const protocolFeeAsk = await input({
      message: "Protocol fee ask (basis points, e.g., 100 = 1%; 0 for none):",
      validate: (v) => (!isNaN(Number(v)) ? true : "Must be a number"),
    });
    extensions = {
      0: serialize(
        ContractTypes.StableswapsTypes.ProtocolFeeBasisPointsExtension,
        {
          protocol_fee_basis_points: [
            BigInt(protocolFeeBid),
            BigInt(protocolFeeAsk),
          ] as [bigint, bigint],
        },
      ),
    };
  } else if (!updateType) {
    extensions = Core.PlutusData.fromCbor(Core.HexBlob("80")); // empty list for V3
  }

  // Build the datum
  const datum = {
    settingsAdmin,
    metadataAdmin,
    treasuryAdmin,
    treasuryAddress,
    treasuryAllowance,
    authorizedScoopers,
    authorizedStakingKeys,
    baseFee,
    simpleFee,
    strategyFee,
    poolCreationFee,
    extensions,
  };

  const serialized = serialize(
    version === EContractVersion.Stableswaps
      ? ContractTypes.StableswapsTypes.SettingsDatum
      : ContractTypes.V3Types.SettingsDatum,
    datum,
  );
  return serialized;
}

/**
 * Instantiate all validators for a given version using the bootstrap UTxO reference.
 * Returns an array of {title, hash, compiledCode, script} for each validator.
 */
function instantiateValidators(
  version: EContractVersion,
  bootstrapTxId: string,
  bootstrapTxIdx: bigint,
): Array<{
  title: string;
  hash: string;
  compiledCode: string;
  script: Core.Script;
}> {
  const validators: Array<{
    title: string;
    hash: string;
    compiledCode: string;
    script: Core.Script;
  }> = [];

  if (version === EContractVersion.Stableswaps) {
    // Stableswaps uses OutputReference = {transaction_id: string, output_index: bigint}
    const outputRef = {
      transaction_id: bootstrapTxId,
      output_index: bootstrapTxIdx,
    };

    // Settings validators (parameterized by bootstrap UTxO)
    const settingsMint = new StableswapsTypes.SettingsSettingsMint(outputRef);
    const settingsSpend = new StableswapsTypes.SettingsSettingsSpend(outputRef);

    const settingsPolicyId = settingsMint.Script.hash();

    validators.push({
      title: "settings.mint",
      hash: settingsPolicyId,
      compiledCode: settingsMint.Script.toCbor(),
      script: settingsMint.Script,
    });
    validators.push({
      title: "settings.spend",
      hash: settingsSpend.Script.hash(),
      compiledCode: settingsSpend.Script.toCbor(),
      script: settingsSpend.Script,
    });

    // Pool manage (parameterized by settings policy ID)
    const poolManage = new StableswapsTypes.PoolManageElse(settingsPolicyId);
    const poolManageHash = poolManage.Script.hash();

    validators.push({
      title: "pool.manage",
      hash: poolManageHash,
      compiledCode: poolManage.Script.toCbor(),
      script: poolManage.Script,
    });

    // Pool validators (parameterized by pool manage hash + settings policy ID)
    const poolMint = new StableswapsTypes.PoolPoolMint(
      poolManageHash,
      settingsPolicyId,
    );
    const poolSpend = new StableswapsTypes.PoolPoolSpend(
      poolManageHash,
      settingsPolicyId,
    );
    const poolMintHash = poolMint.Script.hash();

    validators.push({
      title: "pool.mint",
      hash: poolMintHash,
      compiledCode: poolMint.Script.toCbor(),
      script: poolMint.Script,
    });
    validators.push({
      title: "pool.spend",
      hash: poolSpend.Script.hash(),
      compiledCode: poolSpend.Script.toCbor(),
      script: poolSpend.Script,
    });

    // Stake validators (parameterized by pool mint hash)
    const stakeStake = new StableswapsTypes.StakeStakeElse(poolMintHash);
    const stakeScriptHash = stakeStake.Script.hash();

    validators.push({
      title: "stake.stake",
      hash: stakeScriptHash,
      compiledCode: stakeStake.Script.toCbor(),
      script: stakeStake.Script,
    });

    // Order validator (parameterized by stake script hash)
    const orderSpend = new StableswapsTypes.OrderOrderSpend(stakeScriptHash);
    validators.push({
      title: "order.spend",
      hash: orderSpend.Script.hash(),
      compiledCode: orderSpend.Script.toCbor(),
      script: orderSpend.Script,
    });

    // Pool stake (parameterized by settings policy ID + instance)
    const poolStake = new StableswapsTypes.PoolStakePoolStakeElse(
      settingsPolicyId,
      0n,
    );
    validators.push({
      title: "pool_stake.stake",
      hash: poolStake.Script.hash(),
      compiledCode: poolStake.Script.toCbor(),
      script: poolStake.Script,
    });
  } else {
    // V3 uses OutputReference = {transaction_id: {hash: string}, output_index: bigint}
    const outputRef = {
      transaction_id: { hash: bootstrapTxId },
      output_index: bootstrapTxIdx,
    };

    // Settings validators (parameterized by bootstrap UTxO)
    const settingsMint = new V3Types.SettingsMintundefined(outputRef);
    const settingsSpend = new V3Types.SettingsSpendundefined(outputRef);

    const settingsPolicyId = settingsMint.Script.hash();

    validators.push({
      title: "settings.mint",
      hash: settingsPolicyId,
      compiledCode: settingsMint.Script.toCbor(),
      script: settingsMint.Script,
    });
    validators.push({
      title: "settings.spend",
      hash: settingsSpend.Script.hash(),
      compiledCode: settingsSpend.Script.toCbor(),
      script: settingsSpend.Script,
    });

    // Pool manage (parameterized by settings policy ID)
    const poolManage = new V3Types.PoolManageundefined(settingsPolicyId);
    const poolManageHash = poolManage.Script.hash();

    validators.push({
      title: "pool.manage",
      hash: poolManageHash,
      compiledCode: poolManage.Script.toCbor(),
      script: poolManage.Script,
    });

    // Pool validators (parameterized by pool manage hash + settings policy ID)
    const poolMint = new V3Types.PoolMintundefined(
      poolManageHash,
      settingsPolicyId,
    );
    const poolSpend = new V3Types.PoolSpendundefined(
      poolManageHash,
      settingsPolicyId,
    );
    const poolMintHash = poolMint.Script.hash();

    validators.push({
      title: "pool.mint",
      hash: poolMintHash,
      compiledCode: poolMint.Script.toCbor(),
      script: poolMint.Script,
    });
    validators.push({
      title: "pool.spend",
      hash: poolSpend.Script.hash(),
      compiledCode: poolSpend.Script.toCbor(),
      script: poolSpend.Script,
    });

    // Stake validator (parameterized by pool mint hash)
    const stakeStake = new V3Types.StakeStakeundefined(poolMintHash);
    const stakeScriptHash = stakeStake.Script.hash();

    validators.push({
      title: "stake.stake",
      hash: stakeScriptHash,
      compiledCode: stakeStake.Script.toCbor(),
      script: stakeStake.Script,
    });

    // Order validator (parameterized by stake script hash)
    const orderSpend = new V3Types.OrderSpendundefined(stakeScriptHash);
    validators.push({
      title: "order.spend",
      hash: orderSpend.Script.hash(),
      compiledCode: orderSpend.Script.toCbor(),
      script: orderSpend.Script,
    });

    // Pool stake (parameterized by settings policy ID + instance)
    const poolStake = new V3Types.PoolStakeStakeundefined(settingsPolicyId, 0n);
    validators.push({
      title: "pool_stake.stake",
      hash: poolStake.Script.hash(),
      compiledCode: poolStake.Script.toCbor(),
      script: poolStake.Script,
    });
  }

  return validators;
}

/**
 * Bootstrap settings UTxO from scratch - no pre-existing protocol params needed.
 * User selects a UTxO from their wallet to use as the bootstrap reference.
 */
async function bootstrapFromScratch(
  ctx: IAppContext,
  version: EContractVersion,
): Promise<void> {
  console.log("\n--- Bootstrap From Scratch ---\n");
  console.log(
    "This will use a UTxO from your wallet to parameterize all validators.",
  );
  console.log(
    "The selected UTxO will be consumed in the bootstrap transaction.\n",
  );

  // Get Blaze instance directly (without SDK, since we don't have protocol params yet)
  const settings = ctx.sprinkle.settings;
  const network = settings.network;

  // Build wallet settings for Sprinkle.GetBlaze
  let walletSettings: TExact<typeof WalletSettingsSchema>;
  if (settings.wallet.type === "hot") {
    let privateKey: string | undefined;
    do {
      const pw = await password({
        message: "Enter wallet password",
      });
      privateKey = await decrypt(settings.wallet.privateKey, pw);
    } while (!privateKey);
    walletSettings = { type: "hot", privateKey };
  } else {
    walletSettings = {
      type: "cold",
      address: settings.wallet.address,
    };
  }

  const blaze = await Sprinkle.GetBlaze(
    network,
    settings.provider,
    walletSettings,
  );

  // Get user's UTxOs
  const utxos = await blaze.wallet.getUnspentOutputs();
  if (utxos.length === 0) {
    console.log("No UTxOs found in wallet. Please fund your wallet first.");
    await input({ message: "Press enter to continue" });
    return;
  }

  // Let user select a UTxO
  const utxoChoices = utxos.map(
    (utxo: Core.TransactionUnspentOutput, i: number) => {
      const txId = utxo.input().transactionId();
      const idx = utxo.input().index();
      const lovelace = utxo.output().amount().coin();
      const ada = Number(lovelace) / 1_000_000;
      return {
        name: `${txId.slice(0, 16)}...#${idx} (${ada.toFixed(2)} ADA)`,
        value: i,
      };
    },
  );

  const selectedIdx = await select({
    message: "Select a UTxO to use for bootstrap (will be consumed):",
    choices: utxoChoices,
  });

  const bootstrapUtxo = utxos[selectedIdx]!;
  const txId = bootstrapUtxo.input().transactionId().toString();
  const txIdx = BigInt(bootstrapUtxo.input().index());

  console.log(`\nUsing UTxO: ${txId}#${txIdx}`);

  // Instantiate all validators
  console.log("Instantiating validators...");
  const validators = instantiateValidators(version, txId, txIdx);

  const settingsMint = validators.find((v) => v.title === "settings.mint")!;
  console.log(`\nSettings mint policy hash: ${settingsMint.hash}`);

  // Show all validator hashes
  console.log("\nGenerated validators:");
  for (const v of validators) {
    console.log(`  ${v.title}: ${v.hash}`);
  }

  // Get the settings datum
  const datumSource = await select({
    message: "\nHow do you want to provide the settings datum?",
    choices: [
      { name: "Paste raw datum CBOR hex", value: "cbor" },
      { name: "Interactive (fill fields)", value: "interactive" },
    ],
  });

  let settingsDatumData: Core.PlutusData;

  if (datumSource === "cbor") {
    const cborHex = await input({
      message: "Enter settings datum CBOR (hex):",
      validate: (value) => {
        if (!value || value.trim().length === 0) return "CBOR cannot be empty";
        if (!/^[0-9a-fA-F]+$/.test(value.trim()))
          return "Must be valid hex string";
        return true;
      },
    });
    settingsDatumData = Core.PlutusData.fromCbor(Core.HexBlob(cborHex.trim()));
  } else {
    settingsDatumData = await buildInteractiveSettingsDatum(version);
  }

  // Build the settings script address
  const settingsScriptAddress = Core.addressFromCredentials(
    network === "mainnet" ? Core.NetworkId.Mainnet : Core.NetworkId.Testnet,
    Core.Credential.fromCore({
      hash: Core.Hash28ByteBase16(settingsMint.hash),
      type: Core.CredentialType.ScriptHash,
    }),
  );

  // Use the settings.mint script for minting
  const settingsMintScript = settingsMint.script;

  console.log(
    `\nSettings UTxO will be locked at: ${settingsScriptAddress.toBech32()}`,
  );
  console.log("\nGrinding for a low tx hash (need prefix '00')...");

  // Grind for a low tx hash by adjusting the lovelace amount
  let lovelaceAmount = 5_000_000n;
  let finalTx: Core.Transaction | undefined;
  let attempts = 0;

  while (!finalTx) {
    attempts++;
    try {
      const tx = blaze
        .newTransaction()
        .addInput(bootstrapUtxo) // Consume the bootstrap UTxO
        .addMint(
          Core.PolicyId(settingsMint.hash),
          new Map([[Core.AssetName(SETTINGS_NFT_NAME), 1n]]),
          Void(),
        )
        .provideScript(settingsMintScript)
        .lockAssets(
          settingsScriptAddress,
          makeValue(lovelaceAmount, [
            `${settingsMint.hash}${SETTINGS_NFT_NAME}`,
            1n,
          ]),
          settingsDatumData,
        );

      const completedTx = await tx.complete();
      const txHash = completedTx.body().hash();

      if (txHash.startsWith(REQUIRED_HASH_PREFIX)) {
        console.log(`\nFound satisfying tx hash after ${attempts} attempts!`);
        console.log(`Tx hash: ${txHash}`);
        console.log(`Lovelace amount: ${lovelaceAmount}`);
        finalTx = completedTx;
      } else {
        lovelaceAmount += 1n;
        if (attempts % 100 === 0) {
          console.log(
            `  ...${attempts} attempts so far (current lovelace: ${lovelaceAmount})`,
          );
        }
      }
    } catch (error) {
      console.error(`Error building tx at lovelace ${lovelaceAmount}:`, error);
      lovelaceAmount += 1_000_000n;
      if (attempts > 50000) {
        console.error(
          "Could not find satisfying tx hash after 50000 attempts. Aborting.",
        );
        await input({ message: "Press enter to continue" });
        return;
      }
    }
  }

  // Ask where to save protocol params before submitting
  const outputPath = await input({
    message: "Save protocol params JSON to:",
    default: `./protocol-params-${version.toLowerCase()}.json`,
  });

  // Generate protocol params structure
  const protocolParams = {
    version,
    blueprint: {
      validators,
    },
    references: [] as Array<{
      key: string;
      txIn: { hash: string; index: number };
    }>,
  };

  // Save the file
  const resolvedPath = path.resolve(outputPath.trim());
  const dir = path.dirname(resolvedPath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolvedPath, JSON.stringify(protocolParams, null, 2));
    console.log(`\nProtocol params saved to: ${resolvedPath}`);
  } catch (err) {
    console.error(`\nFailed to save protocol params: ${err}`);
    console.log("You can manually save the following JSON to a file:\n");
    console.log(JSON.stringify(protocolParams, null, 2));
    await input({ message: "Press enter to continue" });
    return;
  }

  // Ask to configure CLI
  const configureCli = await confirm({
    message: "Configure CLI to use this file for custom validators?",
    default: true,
  });

  if (configureCli) {
    const settings = ctx.sprinkle.settings;
    if (!settings.customValidators) {
      (settings as Record<string, unknown>).customValidators = {};
    }
    settings.customValidators![
      version as keyof NonNullable<typeof settings.customValidators>
    ] = {
      paramsPath: resolvedPath,
    };
    await ctx.sprinkle.saveSettings();
    console.log(`CLI configured to use ${resolvedPath} for ${version}`);
  }

  // Submit the transaction
  await ctx.sprinkle.TxDialog(blaze, finalTx);
}

export async function manageCustomValidatorsMenu(
  ctx: IAppContext,
): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Manage Custom Validators ====\n");

  const action = await select({
    message: "What would you like to do?",
    choices: [
      { name: "View current configuration", value: "view" },
      { name: "Set custom validators for a version", value: "set" },
      { name: "Clear custom validators for a version", value: "clear" },
      { name: "Back", value: "back" },
    ],
  });

  switch (action) {
    case "view":
      await viewCustomValidators(ctx);
      break;
    case "set":
      await setCustomValidators(ctx);
      break;
    case "clear":
      await clearCustomValidators(ctx);
      break;
    case "back":
      return;
  }
}

async function viewCustomValidators(ctx: IAppContext): Promise<void> {
  const customValidators = ctx.sprinkle.settings.customValidators;
  if (!customValidators) {
    console.log("\nNo custom validators configured.");
    await input({ message: "Press enter to continue" });
    return;
  }

  console.log("\nCurrent custom validator configuration:\n");
  for (const [version, entry] of Object.entries(customValidators)) {
    if (!entry) continue;
    console.log(`  ${version}:`);
    console.log(`    Path: ${entry.paramsPath}`);
    if (entry.settingsSource) {
      console.log(
        `    Settings source: ${entry.settingsSource} (borrows settings.mint)`,
      );
    }

    // Show validator details if file exists
    try {
      const paramsJson = fs.readFileSync(
        path.resolve(entry.paramsPath),
        "utf-8",
      );
      const params = JSON.parse(paramsJson);
      if (params.blueprint?.validators) {
        console.log(`    Validators:`);
        for (const v of params.blueprint.validators) {
          console.log(`      - ${v.title} (${v.hash})`);
        }
      }
    } catch {
      console.log(`    (could not read file)`);
    }
    console.log();
  }

  await input({ message: "Press enter to continue" });
}

async function setCustomValidators(ctx: IAppContext): Promise<void> {
  const version = await select({
    message: "Which version to configure?",
    choices: [
      { name: "V3", value: "V3" as const },
      { name: "Stableswaps", value: "Stableswaps" as const },
      { name: "NftCheck", value: "NftCheck" as const },
    ],
  });

  const paramsPath = await input({
    message: "Path to protocol params JSON file:",
    validate: (v) => {
      if (!v || v.trim().length === 0) return "Path cannot be empty";
      const resolved = path.resolve(v.trim());
      if (!fs.existsSync(resolved)) return `File not found: ${resolved}`;
      try {
        const content = JSON.parse(fs.readFileSync(resolved, "utf-8"));
        if (!content.blueprint?.validators) {
          return "Invalid format: missing blueprint.validators";
        }
        return true;
      } catch {
        return "Could not parse JSON file";
      }
    },
  });

  const useSettingsSource = await select({
    message: "Should this version borrow settings.mint from another version?",
    choices: [
      { name: "No (use its own settings.mint)", value: undefined },
      { name: "V3", value: "V3" as const },
      { name: "Stableswaps", value: "Stableswaps" as const },
      { name: "NftCheck", value: "NftCheck" as const },
    ],
  });

  const settings = ctx.sprinkle.settings;
  if (!settings.customValidators) {
    (settings as Record<string, unknown>).customValidators = {};
  }

  settings.customValidators![version] = {
    paramsPath: paramsPath.trim(),
    settingsSource: useSettingsSource || undefined,
  };

  await ctx.sprinkle.saveSettings();
  console.log(`\nCustom validators for ${version} saved. Refreshing SDK...`);
  await ctx.refreshSdk();
  console.log("SDK refreshed with new validators.");
  await input({ message: "Press enter to continue" });
}

async function clearCustomValidators(ctx: IAppContext): Promise<void> {
  const customValidators = ctx.sprinkle.settings.customValidators;
  if (!customValidators) {
    console.log("\nNo custom validators configured.");
    await input({ message: "Press enter to continue" });
    return;
  }

  const configuredVersions = Object.entries(customValidators)
    .filter(([, entry]) => entry !== undefined)
    .map(([version]) => ({
      name: version,
      value: version,
    }));

  if (configuredVersions.length === 0) {
    console.log("\nNo custom validators configured.");
    await input({ message: "Press enter to continue" });
    return;
  }

  const version = await select({
    message: "Which version to clear?",
    choices: [...configuredVersions, { name: "Cancel", value: "cancel" }],
  });

  if (version === "cancel") return;

  (
    customValidators as Record<
      string,
      { paramsPath: string; settingsSource?: string } | undefined
    >
  )[version] = undefined;

  await ctx.sprinkle.saveSettings();
  console.log(`\nCleared custom validators for ${version}. Refreshing SDK...`);
  await ctx.refreshSdk();
  console.log("SDK refreshed.");
  await input({ message: "Press enter to continue" });
}
