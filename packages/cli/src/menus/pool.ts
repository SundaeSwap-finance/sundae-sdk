/* eslint-disable no-console */
import { Core } from "@blaze-cardano/sdk";
import { parse } from "@blaze-cardano/data";
import { input, select } from "@inquirer/prompts";
import {
  DatumBuilderStableswaps,
  DatumBuilderV3,
  EContractVersion,
  EDatumType,
  ESwapType,
  TxBuilderNftCheck,
  TxBuilderV3,
  TxBuilderStableswaps,
  type IMintNftCheckPoolConfigArgs,
  type IMintPoolConfigArgs,
  type IPoolByAssetQuery,
  type IPoolData,
  type ISwapConfigArgs,
  type IDepositConfigArgs,
  type IPoolByPairQuery,
  type IUpdateProtocolFeesConfigArgs,
  type IFeesConfig,
  SundaeUtils,
  QueryProviderSundaeSwap,
  type IWithdrawConfigArgs,
  ContractTypes,
} from "@sundaeswap/core";
import type { IAppContext } from "../types.js";
import { getPoolData, prettyAssetId } from "../utils.js";
import { ensureDeployment, getAssetAmount, printHeader } from "./shared.js";

export async function swapMenu(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Swap menu ====\n");
  const swapFrom = await getAssetAmount(ctx, "Select asset to swap from", 0n);
  if (!swapFrom) {
    console.log("No asset selected, returning to main menu.");
    return;
  }
  const sdk = await ctx.sdk();
  let choices: { name: string; value: string }[] = [];
  try {
    const pools = (await sdk.queryProvider.findPoolData({
      assetId: swapFrom.id,
    } as IPoolByAssetQuery)) as IPoolData[];
    choices = pools!.map((pool) => {
      const price = SundaeUtils.getPrice(pool);
      return {
        name: `${prettyAssetId(pool.assetA.assetId.toString())} / ${prettyAssetId(
          pool.assetB.assetId.toString(),
        )} (p: ${price.toFixed(
          6,
        )}, l: (${pool.liquidity.aReserve.toString()} / ${pool.liquidity.bReserve.toString()}), id: ${
          pool.ident
        })`,
        value: pool.ident,
      };
    });
  } catch (error) {
    console.log(
      "Unable to fetch pools from API, falling back to manual input.",
    );
  }
  choices = [{ name: "Enter pool ident manually", value: "manual" }].concat(
    choices,
  );
  let choice = await select({ message: "Select pool", choices: choices });
  let pool: IPoolData;
  if (choice === "manual") {
    const ident = await input({ message: "Enter pool ident" });
    choice = ident;
    const version = await select({
      message: "What version is this pool?",
      choices: [
        { name: "V3", value: EContractVersion.V3 },
        { name: "V1", value: EContractVersion.V1 },
        { name: "Condition", value: EContractVersion.Condition },
        { name: "NftCheck", value: EContractVersion.NftCheck },
        { name: "Stableswaps", value: EContractVersion.Stableswaps },
      ],
    });
    pool = await getPoolData(ctx, ident, version);
  } else {
    pool = (await sdk.queryProvider.findPoolData({
      ident: choice,
    })) as IPoolData;
  }
  if (!pool) {
    console.log("Pool not found");
    return;
  }
  const address = ctx.sprinkle.settings.wallet.address;
  const builder = sdk.builders.get(pool.version)!;
  const swapArgs: ISwapConfigArgs = {
    suppliedAsset: swapFrom,
    pool: pool,
    orderAddresses: {
      DestinationAddress: {
        address,
        datum: { type: EDatumType.NONE },
      },
    },
    swapType: { type: ESwapType.MARKET, slippage: Number(await getSlippage()) },
  };
  await ensureDeployment("order.spend", builder, ctx);
  const tx = await builder.swap(swapArgs);
  const built = await tx.build();
  const txObj = Core.Transaction.fromCbor(Core.TxCBOR(built.cbor));
  await ctx.sprinkle.TxDialog(sdk.blaze(), txObj);
}

export async function removeLiquidityMenu(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Remove Liquidity ====\n");
  const sdk = await ctx.sdk();
  const protocols = await (
    sdk.queryProvider as QueryProviderSundaeSwap
  ).getProtocolParamsWithScriptHashes(undefined);
  const lpAsset = await getAssetAmount(
    ctx,
    "Select the liquidity you want to remove",
    0n,
    (assetId: string) => {
      return SundaeUtils.isAnyLPAsset({
        assetId: assetId,
        protocols: protocols,
      });
    },
  );
  let pool: IPoolData;
  if (true) {
    console.log("Pool not found");
    const version = await select({
      message: "What version is this pool?",
      choices: [
        { name: "V3", value: EContractVersion.V3 },
        { name: "V1", value: EContractVersion.V1 },
        { name: "Condition", value: EContractVersion.Condition },
        { name: "NftCheck", value: EContractVersion.NftCheck },
        { name: "Stableswaps", value: EContractVersion.Stableswaps },
      ],
    });
    pool = await getPoolData(
      ctx,
      SundaeUtils.getIdentFromAssetId(lpAsset!.id),
      version,
    );
    if (!pool) {
      return;
    }
  }
  const address = ctx.sprinkle.settings.wallet.address;
  const builder = sdk.builders.get(pool.version)!;
  const withdrawArgs: IWithdrawConfigArgs = {
    suppliedLPAsset: lpAsset!,
    orderAddresses: {
      DestinationAddress: {
        address,
        datum: { type: EDatumType.NONE },
      },
    },
  };
  await ensureDeployment("order.spend", builder, ctx);
  const tx = await builder.withdraw(withdrawArgs);
  const built = await tx.build();
  const txObj = Core.Transaction.fromCbor(Core.TxCBOR(built.cbor));
  await ctx.sprinkle.TxDialog(sdk.blaze(), txObj);
}

export async function addLiquidityMenu(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Add Liquidity ====\n");
  const asset1 = await getAssetAmount(
    ctx,
    "Select the first half of the pair you want to add liquidity",
    0n,
  );
  const asset2 = await getAssetAmount(
    ctx,
    "Select the second half of the pair you want to add liquidity",
    0n,
  );
  const sdk = await ctx.sdk();
  let choices: { name: string; value: string }[] = [];
  try {
    const pools = (await sdk.queryProvider.findPoolData({
      pair: [asset1!.id, asset2!.id],
    } as IPoolByPairQuery)) as IPoolData[];
    choices = pools!.map((pool) => {
      const price = SundaeUtils.getPrice(pool);
      return {
        name: `${prettyAssetId(pool.assetA.assetId.toString())} / ${prettyAssetId(
          pool.assetB.assetId.toString(),
        )} (p: ${price.toFixed(
          6,
        )}, l: (${pool.liquidity.aReserve.toString()} / ${pool.liquidity.bReserve.toString()}), id: ${
          pool.ident
        })`,
        value: pool.ident,
      };
    });
  } catch (error) {
    console.log(
      "Unable to fetch pools from API, falling back to manual input.",
    );
  }
  choices = [{ name: "Enter pool ident manually", value: "manual" }].concat(
    choices,
  );
  const choice = await select({ message: "Select pool", choices: choices });
  let pool: IPoolData;
  if (choice === "manual") {
    const ident = await input({ message: "Enter pool ident" });
    const version = await select({
      message: "What version is this pool?",
      choices: [
        { name: "V3", value: EContractVersion.V3 },
        { name: "V1", value: EContractVersion.V1 },
        { name: "Condition", value: EContractVersion.Condition },
        { name: "NftCheck", value: EContractVersion.NftCheck },
        { name: "Stableswaps", value: EContractVersion.Stableswaps },
      ],
    });
    pool = await getPoolData(ctx, ident, version);
  } else {
    pool = (await sdk.queryProvider.findPoolData({
      ident: choice,
    })) as IPoolData;
  }
  if (!pool) {
    console.log("Pool not found");
    return;
  }
  const address = ctx.sprinkle.settings.wallet.address;
  const builder = sdk.builders.get(pool.version)!;
  const depositArgs: IDepositConfigArgs = {
    suppliedAssets: [asset1!, asset2!],
    pool: pool,
    orderAddresses: {
      DestinationAddress: {
        address,
        datum: { type: EDatumType.NONE },
      },
    },
  };
  await ensureDeployment("order.spend", builder, ctx);
  const tx = await builder.deposit(depositArgs);
  const built = await tx.build();
  const txObj = Core.Transaction.fromCbor(Core.TxCBOR(built.cbor));
  await ctx.sprinkle.TxDialog(sdk.blaze(), txObj);
}

export async function getSlippage(): Promise<number> {
  const slippage = await input({
    message: "Enter slippage:",
    validate: (input) => {
      const num = Number(input);
      if (isNaN(num)) {
        return "Please enter a number";
      }
      if (num < 0) {
        return "Please enter a positive number";
      }
      if (num > 100) {
        return "Please enter a number less than 100";
      }
      return true;
    },
  });
  return Number(slippage) / 100;
}

export async function mintPoolMenu(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Mint pool menu ====\n");
  const sdk = await ctx.sdk();
  const choices = [...sdk.builders.keys()].map((key) => {
    return { name: key as string, value: key as string };
  });
  choices.push({ name: "Back", value: "back" });
  const choice = await select({
    message: "Select pool type",
    choices: choices,
  });
  switch (choice) {
    case "back":
      return;
    case "V3": {
      const builder = sdk.builders.get(EContractVersion.V3)! as TxBuilderV3;
      await ensureDeployment("pool.mint", builder, ctx);
      await ensureDeployment("pool.spend", builder, ctx);
      const args = await mintPoolArgs(ctx);
      if (!args) {
        console.log("No args provided, returning to main menu.");
        return;
      }
      const built = await (await builder.mintPool(args)).build();
      const txObj = Core.Transaction.fromCbor(Core.TxCBOR(built.cbor));
      await ctx.sprinkle.TxDialog(sdk.blaze(), txObj);
      break;
    }
    case "NftCheck": {
      const builderNftCheck = sdk.builders.get(
        EContractVersion.NftCheck,
      )! as TxBuilderNftCheck;
      const argsNftCheck = await mintPoolNftCheckArgs(ctx);
      if (!argsNftCheck) {
        console.log("No args provided, returning to main menu.");
        return;
      }
      const built = await (
        await builderNftCheck.mintPool(argsNftCheck)
      ).build();
      const txObj = Core.Transaction.fromCbor(Core.TxCBOR(built.cbor));
      await ctx.sprinkle.TxDialog(sdk.blaze(), txObj);
      break;
    }
    case "Stableswaps": {
      const stableSwapBuilder = sdk.builders.get(
        EContractVersion.Stableswaps,
      )! as TxBuilderStableswaps;
      await ensureDeployment("pool.mint", stableSwapBuilder, ctx);
      await ensureDeployment("pool.spend", stableSwapBuilder, ctx);
      await ensureDeployment("order.spend", stableSwapBuilder, ctx);
      const argsStable = await mintStablePoolArgs(ctx);
      console.log(argsStable);
      stableSwapBuilder.enableTracing(true);
      const built = await (
        await stableSwapBuilder.mintPool(argsStable)
      ).build();
      const txObj = Core.Transaction.fromCbor(Core.TxCBOR(built.cbor));
      await ctx.sprinkle.TxDialog(sdk.blaze(), txObj);
      break;
    }
    default:
      break;
  }
}

async function mintStablePoolArgs(
  ctx: IAppContext,
): Promise<IMintPoolConfigArgs> {
  const v3Args = await mintPoolArgs(ctx);
  const linearAmplification = await input({
    message: "Enter linear amplification factor (>0):",
    validate: (input) => {
      const num = Number(input);
      if (isNaN(num)) {
        return "Please enter a number";
      }
      if (num <= 0) {
        return "Please enter a number greater than 0";
      }
      return true;
    },
  });

  const addLinearAmpManager = await select({
    message: "Do you want to specify a linear amplification manager?",
    choices: [
      { name: "No (use pool owner as manager)", value: false },
      { name: "Yes", value: true },
    ],
  });

  let linearAmplificationManager: string | undefined;
  if (addLinearAmpManager) {
    linearAmplificationManager = await input({
      message: "Enter linear amplification manager address:",
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return "Linear amplification manager address cannot be empty";
        }
        try {
          Core.Address.fromBech32(value.trim());
          return true;
        } catch {
          return "Invalid Cardano address";
        }
      },
    });
  }

  return {
    ...v3Args,
    linearAmplification: BigInt(linearAmplification),
    linearAmplificationManager: linearAmplificationManager?.trim(),
  } as IMintPoolConfigArgs;
}

export async function getFeeChoice(): Promise<bigint> {
  const choice = await select({
    message: "Select fee",
    choices: [
      { name: "0.02%", value: 2n },
      { name: "0.05%", value: 5n },
      { name: "0.08%", value: 8n },
      { name: "0.1%", value: 10n },
      { name: "0.3%", value: 30n },
      { name: "1%", value: 100n },
    ],
  });
  return choice;
}

export async function cancelSwapMenu(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Cancel swap menu ====\n");
  const sdk = await ctx.sdk();
  const address = ctx.sprinkle.settings.wallet.address;
  const v3OrderScriptAddress = await sdk.builders
    .get(EContractVersion.Stableswaps)!
    .getOrderScriptAddress(address);
  console.log(
    `order address: ${Core.Address.fromBech32(v3OrderScriptAddress).toBech32()}`,
  );
  const orderUtxos = await sdk
    .blaze()
    .provider.getUnspentOutputs(Core.Address.fromBech32(v3OrderScriptAddress));
  const choices: {
    name: string;
    value: Core.TransactionUnspentOutput | undefined;
  }[] = orderUtxos!.map((utxo) => {
    return {
      name: `${utxo.input().transactionId()}#${utxo.input().index()}`,
      value: utxo,
    };
  });
  choices.push({ name: "Back", value: undefined });
  const choice = await select({
    message: "Select order to cancel",
    choices: choices,
  });
  if (choice === undefined) {
    return;
  }
  const tx = await sdk.builders.get(EContractVersion.Stableswaps)!.cancel({
    ownerAddress: address,
    utxo: {
      hash: choice.input().transactionId(),
      index: Number(choice.input().index()),
    },
  });
  const built = await tx?.build();
  const txObj = Core.Transaction.fromCbor(Core.TxCBOR(built!.cbor));
  await ctx.sprinkle.TxDialog(sdk.blaze(), txObj);
}

export async function mintPoolArgs(
  ctx: IAppContext,
): Promise<IMintPoolConfigArgs | undefined> {
  const assetA = await getAssetAmount(ctx, "Select asset A", 2n);
  if (!assetA) {
    console.log("No asset A selected, returning to main menu.");
    return {} as IMintPoolConfigArgs;
  }
  const assetB = await getAssetAmount(ctx, "Select asset B", 2n);
  if (!assetB) {
    console.log("No asset B selected, returning to main menu.");
    return {} as IMintPoolConfigArgs;
  }

  const addFeeManager = await select({
    message: "Do you want to specify a fee manager?",
    choices: [
      { name: "No (use pool owner as fee manager)", value: false },
      { name: "Yes", value: true },
    ],
  });

  let feeManager: string | undefined;
  if (addFeeManager) {
    feeManager = await input({
      message: "Enter fee manager address:",
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return "Fee manager address cannot be empty";
        }
        try {
          Core.Address.fromBech32(value.trim());
          return true;
        } catch {
          return "Invalid Cardano address";
        }
      },
    });
  }

  const address = ctx.sprinkle.settings.wallet.address;
  return {
    assetA,
    assetB,
    fees: await getFeeChoice(),
    ownerAddress: address,
    feeManager: feeManager?.trim(),
  };
}

async function mintPoolNftCheckArgs(
  ctx: IAppContext,
): Promise<IMintNftCheckPoolConfigArgs | undefined> {
  const v3Args = await mintPoolArgs(ctx);
  if (!v3Args) {
    console.log("No args provided, returning to main menu.");
    return undefined;
  }
  const nftCheck = await getAssetAmount(ctx, "Select NFT asset", 1n);
  if (!nftCheck) {
    console.log("No NFT asset selected, returning to main menu.");
    return undefined;
  }
  return {
    assetA: v3Args.assetA,
    assetB: v3Args.assetB,
    fees: v3Args.fees,
    ownerAddress: v3Args.ownerAddress,
    conditionDatumArgs: { value: [nftCheck], check: "Any" },
  } as IMintNftCheckPoolConfigArgs;
}

/**
 * Recursively extracts all key hashes from a MultisigScript.
 */
function extractKeyHashes(
  script: ContractTypes.StableswapsTypes.MultisigScript,
): string[] {
  const keyHashes: string[] = [];

  if ("Signature" in script) {
    keyHashes.push(script.Signature.keyHash);
  } else if ("AllOf" in script) {
    script.AllOf.scripts.forEach(
      (s: ContractTypes.StableswapsTypes.MultisigScript) => {
        keyHashes.push(...extractKeyHashes(s));
      },
    );
  } else if ("AnyOf" in script) {
    script.AnyOf.scripts.forEach(
      (s: ContractTypes.StableswapsTypes.MultisigScript) => {
        keyHashes.push(...extractKeyHashes(s));
      },
    );
  } else if ("AtLeast" in script) {
    script.AtLeast.scripts.forEach(
      (s: ContractTypes.StableswapsTypes.MultisigScript) => {
        keyHashes.push(...extractKeyHashes(s));
      },
    );
  }

  return keyHashes;
}

export async function updateProtocolFeesMenu(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Update Protocol Fees (Stableswaps) ====\n");
  console.log(
    "Note: This operation is only supported for Stableswaps pools.\n",
  );

  const poolIdent = await input({
    message: "Enter pool ident:",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "Pool ident cannot be empty";
      }
      return true;
    },
  });

  const pool = (await getPoolData(
    ctx,
    poolIdent,
    EContractVersion.Stableswaps,
  )) as IPoolData;

  if (!pool) {
    console.log("Pool not found");
    return;
  }

  if (pool.version !== EContractVersion.Stableswaps) {
    console.log(
      `Error: Pool ${poolIdent} is not a Stableswaps pool (version: ${pool.version})`,
    );
    await input({ message: "Press enter to continue" });
    return;
  }

  const sdk = await ctx.sdk();
  const builder = sdk.builders.get(
    EContractVersion.Stableswaps,
  )! as TxBuilderStableswaps;

  await ensureDeployment("pool.spend", builder, ctx);

  const { hash: poolPolicyId } = await builder.getValidatorScript("pool.mint");
  const poolNft = DatumBuilderStableswaps.computePoolNftName(poolIdent);
  const poolUtxo = await sdk
    .blaze()
    .provider.getUnspentOutputByNFT(
      Core.AssetId.fromParts(
        Core.PolicyId(poolPolicyId),
        Core.AssetName(poolNft),
      ),
    );

  if (!poolUtxo) {
    console.log("Could not find pool UTXO");
    return;
  }

  const poolUtxoRef = {
    hash: poolUtxo.input().transactionId().toString(),
    index: Number(poolUtxo.input().index()),
  };

  console.log(`\nPool UTXO: ${poolUtxoRef.hash}#${poolUtxoRef.index}`);
  console.log(
    `Current protocol fee: ${pool.protocolFee !== undefined ? `${(pool.protocolFee * 100).toFixed(2)}%` : "N/A"}`,
  );

  console.log(
    "\nProtocol fees are specified in basis points (1 basis point = 0.01%).",
  );
  console.log("Valid range: 0 - 10000 (0% - 100%)\n");

  const bidFeeInput = await input({
    message: "Enter new bid fee (basis points, e.g., 100 = 1%):",
    validate: (value) => {
      const num = Number(value);
      if (isNaN(num)) return "Please enter a valid number";
      if (num < 0 || num > 10000)
        return "Fee must be between 0 and 10000 basis points";
      if (!Number.isInteger(num)) return "Fee must be a whole number";
      return true;
    },
  });

  const askFeeInput = await input({
    message: "Enter new ask fee (basis points, e.g., 100 = 1%):",
    validate: (value) => {
      const num = Number(value);
      if (isNaN(num)) return "Please enter a valid number";
      if (num < 0 || num > 10000)
        return "Fee must be between 0 and 10000 basis points";
      if (!Number.isInteger(num)) return "Fee must be a whole number";
      return true;
    },
  });

  const protocolFees: IFeesConfig = {
    bid: BigInt(bidFeeInput),
    ask: BigInt(askFeeInput),
  };

  console.log("\nFetching settings datum to get treasury admin signers...");
  const settingsDatum = await builder.getSettingsUtxoDatum();

  if (!settingsDatum) {
    console.log("Error: Could not fetch settings datum");
    await input({ message: "Press enter to continue" });
    return;
  }

  const parsedSettings = Core.PlutusData.fromCbor(Core.HexBlob(settingsDatum));
  const settingsData = parse(
    ContractTypes.StableswapsTypes.SettingsDatum,
    parsedSettings,
  );

  const availableKeyHashes = extractKeyHashes(settingsData.treasuryAdmin);

  if (availableKeyHashes.length === 0) {
    console.log(
      "\nWarning: No key hashes found in treasuryAdmin from settings datum.",
    );
    console.log("Transaction may fail without proper authorization.");
  } else {
    console.log(
      `\nFound ${availableKeyHashes.length} key hash(es) in treasuryAdmin:`,
    );
    availableKeyHashes.forEach((hash, idx) => {
      console.log(`  ${idx + 1}. ${hash}`);
    });
  }

  let signers: string[] | undefined;
  if (availableKeyHashes.length > 0) {
    console.log("\nSelect one or more signers to authorize this transaction:");
    console.log(
      "(You can enter multiple numbers separated by commas, e.g., 1,2)",
    );

    const signerInput = await input({
      message: "Enter signer numbers (comma-separated, or 'none' to skip):",
      validate: (value) => {
        if (value.toLowerCase() === "none") return true;
        const indices = value.split(",").map((s) => s.trim());
        for (const idx of indices) {
          const num = Number(idx);
          if (isNaN(num) || num < 1 || num > availableKeyHashes.length) {
            return `Invalid selection: ${idx}. Must be between 1 and ${availableKeyHashes.length}, or 'none'`;
          }
        }
        return true;
      },
    });

    if (signerInput.toLowerCase() !== "none") {
      const selectedIndices = signerInput
        .split(",")
        .map((s) => Number(s.trim()) - 1);
      signers = selectedIndices
        .map((idx) => availableKeyHashes[idx])
        .filter((hash): hash is string => hash !== undefined);

      if (signers.length > 0) {
        console.log(`\nSelected ${signers.length} signer(s):`);
        signers.forEach((hash) => {
          console.log(`  - ${hash}`);
        });
      }
    }
  }

  const poolManageElseCbor = await input({
    message: "Enter pool manage else CBOR (leave blank if not applicable):",
  });

  const poolManageElseHash = await input({
    message:
      "Enter pool manage else datum hash (leave blank if not applicable):",
  });

  console.log("\nBuilding transaction...");

  const updateArgs: IUpdateProtocolFeesConfigArgs = {
    poolUtxo: poolUtxoRef,
    protocolFees,
    signers,
    poolManageElse: poolManageElseCbor.trim(),
    poolManageElseHash,
  };

  try {
    const tx = await builder.updateProtocolFees(updateArgs);
    const built = await tx.build();
    const txObj = Core.Transaction.fromCbor(Core.TxCBOR(built.cbor));
    await ctx.sprinkle.TxDialog(sdk.blaze(), txObj);
  } catch (error) {
    console.error("Failed to build transaction:", error);
    await input({ message: "Press enter to continue" });
  }
}

export async function updatePoolFeesMenu(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Update Pool Fees ====\n");
  console.log(
    "Note: This operation updates the LP fees on a pool. The fee manager must sign.\n",
  );

  const poolIdent = await input({
    message: "Enter pool ident:",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "Pool ident cannot be empty";
      }
      return true;
    },
  });

  const version = await select({
    message: "What version is this pool?",
    choices: [
      { name: "V3", value: EContractVersion.V3 },
      { name: "Stableswaps", value: EContractVersion.Stableswaps },
    ],
  });

  const pool = (await getPoolData(ctx, poolIdent, version)) as IPoolData;

  if (!pool) {
    console.log("Pool not found");
    return;
  }

  const sdk = await ctx.sdk();
  const builder = sdk.builders.get(version)! as
    | TxBuilderV3
    | TxBuilderStableswaps;

  await ensureDeployment("pool.spend", builder, ctx);

  const { hash: poolPolicyId } = await builder.getValidatorScript("pool.mint");
  const poolNft =
    version === EContractVersion.Stableswaps
      ? DatumBuilderStableswaps.computePoolNftName(poolIdent)
      : DatumBuilderV3.computePoolNftName(poolIdent);
  const poolUtxo = await sdk
    .blaze()
    .provider.getUnspentOutputByNFT(
      Core.AssetId.fromParts(
        Core.PolicyId(poolPolicyId),
        Core.AssetName(poolNft),
      ),
    );

  if (!poolUtxo) {
    console.log("Could not find pool UTXO");
    return;
  }

  const poolUtxoRef = {
    hash: poolUtxo.input().transactionId().toString(),
    index: Number(poolUtxo.input().index()),
  };

  console.log(`\nPool UTXO: ${poolUtxoRef.hash}#${poolUtxoRef.index}`);
  console.log(
    `Current LP fee: ${pool.currentFee !== undefined ? `${(pool.currentFee * 100).toFixed(2)}%` : "N/A"}`,
  );

  const poolDatum =
    poolUtxo.output().datum()?.asInlineData() ||
    (poolUtxo.output().datum()?.asDataHash() &&
      (await sdk
        .blaze()
        .provider.resolveDatum(
          Core.DatumHash(poolUtxo.output().datum()?.asDataHash() as string),
        )));

  if (!poolDatum) {
    console.log("Pool UTXO does not contain a valid datum");
    return;
  }

  const currentPoolDatum = builder.datumBuilder.decodeDatum(poolDatum);

  let feeManagerAddress: string | undefined;
  if (currentPoolDatum.feeManager) {
    feeManagerAddress = builder.datumBuilder.getAddressFromMultiSig(
      currentPoolDatum.feeManager,
    );
    console.log(`\nFee manager address: ${feeManagerAddress}`);
  } else {
    console.log("\nWarning: No fee manager found in pool datum");
    console.log("Transaction may fail without proper authorization.");
  }

  console.log(
    "\nLP fees are specified in basis points (1 basis point = 0.01%).",
  );
  console.log("Valid range: 0 - 10000 (0% - 100%)\n");

  const bidFeeInput = await input({
    message: "Enter new bid fee (basis points, e.g., 30 = 0.3%):",
    validate: (value) => {
      const num = Number(value);
      if (isNaN(num)) return "Please enter a valid number";
      if (num < 0 || num > 10000)
        return "Fee must be between 0 and 10000 basis points";
      if (!Number.isInteger(num)) return "Fee must be a whole number";
      return true;
    },
  });

  const askFeeInput = await input({
    message: "Enter new ask fee (basis points, e.g., 30 = 0.3%):",
    validate: (value) => {
      const num = Number(value);
      if (isNaN(num)) return "Please enter a valid number";
      if (num < 0 || num > 10000)
        return "Fee must be between 0 and 10000 basis points";
      if (!Number.isInteger(num)) return "Fee must be a whole number";
      return true;
    },
  });

  const poolFees: IFeesConfig = {
    bid: BigInt(bidFeeInput),
    ask: BigInt(askFeeInput),
  };

  let availableKeyHashes: string[] = [];
  if (currentPoolDatum.feeManager) {
    availableKeyHashes = extractKeyHashes(currentPoolDatum.feeManager);
  }

  if (availableKeyHashes.length === 0) {
    console.log(
      "\nWarning: No key hashes found in fee manager from pool datum.",
    );
    console.log("Transaction may fail without proper authorization.");
  } else {
    console.log(
      `\nFound ${availableKeyHashes.length} key hash(es) in fee manager:`,
    );
    availableKeyHashes.forEach((hash, idx) => {
      console.log(`  ${idx + 1}. ${hash}`);
    });
  }

  let signers: string[] | undefined;
  if (availableKeyHashes.length > 0) {
    console.log("\nSelect one or more signers to authorize this transaction:");
    console.log(
      "(You can enter multiple numbers separated by commas, e.g., 1,2)",
    );

    const signerInput = await input({
      message: "Enter signer numbers (comma-separated, or 'none' to skip):",
      validate: (value) => {
        if (value.toLowerCase() === "none") return true;
        const indices = value.split(",").map((s) => s.trim());
        for (const idx of indices) {
          const num = Number(idx);
          if (isNaN(num) || num < 1 || num > availableKeyHashes.length) {
            return `Invalid selection: ${idx}. Must be between 1 and ${availableKeyHashes.length}, or 'none'`;
          }
        }
        return true;
      },
    });

    if (signerInput.toLowerCase() !== "none") {
      const selectedIndices = signerInput
        .split(",")
        .map((s) => Number(s.trim()) - 1);
      signers = selectedIndices
        .map((idx) => availableKeyHashes[idx])
        .filter((hash): hash is string => hash !== undefined);

      if (signers.length > 0) {
        console.log(`\nSelected ${signers.length} signer(s):`);
        signers.forEach((hash) => {
          console.log(`  - ${hash}`);
        });
      }
    }
  }

  console.log("\nBuilding transaction...");

  const updateArgs = {
    poolIdent,
    fees: poolFees,
    signers,
  };

  try {
    const tx = await builder.updatePoolFees(updateArgs);
    const built = await tx.build();
    const txObj = Core.Transaction.fromCbor(Core.TxCBOR(built.cbor));
    await ctx.sprinkle.TxDialog(sdk.blaze(), txObj);
  } catch (error) {
    console.error("Failed to build transaction:", error);
    await input({ message: "Press enter to continue" });
  }
}
