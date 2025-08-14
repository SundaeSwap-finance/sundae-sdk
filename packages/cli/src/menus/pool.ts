/* eslint-disable no-console */
import { Core } from "@blaze-cardano/sdk";
import { input, select } from "@inquirer/prompts";
import {
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
} from "@sundaeswap/core";
import type { State } from "../types";
import { getPoolData, prettyAssetId } from "../utils.js";
import { ensureDeployment, getAssetAmount, printHeader } from "./shared.js";
import { transactionDialog } from "./transaction.js";

export async function swapMenu(state: State): Promise<State> {
  await printHeader(state);
  console.log("\t==== Swap menu ====\n");
  const swapFrom = await getAssetAmount(state, "Select asset to swap from", 0n);
  if (!swapFrom) {
    console.log("No asset selected, returning to main menu.");
    return state;
  }
  const pools = (await state.sdk!.queryProvider.findPoolData({
    assetId: swapFrom.id,
  } as IPoolByAssetQuery)) as IPoolData[];
  let choices = pools!.map((pool) => {
    const price =
      Number(pool.liquidity.aReserve) / Number(pool.liquidity.bReserve);
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
      ],
    });
    pool = await getPoolData(state, ident, version);
  } else {
    pool = (await state.sdk!.queryProvider.findPoolData({
      ident: choice,
    })) as IPoolData;
  }
  if (!pool) {
    console.log("Pool not found");
    return state;
  }
  const builder = state.sdk!.builders.get(pool.version)!;
  const swapArgs: ISwapConfigArgs = {
    suppliedAsset: swapFrom,
    pool: pool,
    orderAddresses: {
      DestinationAddress: {
        address: state.settings.address!,
        datum: { type: EDatumType.NONE },
      },
    },
    swapType: { type: ESwapType.MARKET, slippage: Number(await getSlippage()) },
  };
  const tx = await builder.swap(swapArgs);
  await transactionDialog((await tx.build()).cbor, false, state);
  return state;
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

export async function mintPoolMenu(state: State): Promise<State> {
  await printHeader(state);
  console.log("\t==== Mint pool menu ====\n");
  const choices = [...state.sdk!.builders.keys()] // IterableIterator doesn't have .map until ES2025
    .map((key) => {
      return { name: key as string, value: key as string };
    });
  choices.push({ name: "Back", value: "back" });
  const choice = await select({
    message: "Select pool type",
    choices: choices,
  });
  switch (choice) {
    case "back":
      return state;
    case "V3":
      const builder = state.sdk!.builders.get(
        EContractVersion.V3,
      )! as TxBuilderV3;
      const args = await mintPoolArgs(state);
      if (!args) {
        console.log("No args provided, returning to main menu.");
        return state;
      }
      const tx = (await builder.mintPool(args)).build();
      await transactionDialog((await tx).cbor, false, state);
      break;
    case "NftCheck":
      const builderNftCheck = state.sdk!.builders.get(
        EContractVersion.NftCheck,
      )! as TxBuilderNftCheck;
      const argsNftCheck = await mintPoolNftCheckArgs(state);
      if (!argsNftCheck) {
        console.log("No args provided, returning to main menu.");
        return state;
      }
      const txNftCheck = (await builderNftCheck.mintPool(argsNftCheck)).build();
      await transactionDialog((await txNftCheck).cbor, false, state);
      break;
    case "Stableswaps":
      const stableSwapBuilder = state.sdk!.builders.get(
        EContractVersion.Stableswaps,
      )! as TxBuilderStableswaps;
      await ensureDeployment("pool.spend", stableSwapBuilder, state);
      const argsStable = await mintStablePoolArgs(state);
      stableSwapBuilder.enableTracing(true);
      const txStable = (await stableSwapBuilder.mintPool(argsStable)).build();
      await transactionDialog((await txStable).cbor, false, state);
      break;
    default:
      break;
  }
  return state;
}

async function mintStablePoolArgs(state: State): Promise<IMintPoolConfigArgs> {
  const v3Args = await mintPoolArgs(state);
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
  return {
    ...v3Args,
    protocolFees: await getFeeChoice(),
    linearAmplification: BigInt(linearAmplification),
  } as IMintPoolConfigArgs;
}

export async function getFeeChoice(): Promise<bigint> {
  const choice = await select({
    message: "Select fee",
    choices: [
      { name: "0.05%", value: 5n },
      { name: "0.3%", value: 30n },
      { name: "1%", value: 100n },
    ],
  });
  return choice;
}

export async function cancelSwapMenu(state: State): Promise<State> {
  await printHeader(state);
  console.log("\t==== Cancel swap menu ====\n");
  const v3OrderScriptAddress = await state
    .sdk!.builders.get(EContractVersion.V3)!
    .getOrderScriptAddress(state.settings.address!);
  console.log(
    `order address: ${Core.Address.fromBech32(v3OrderScriptAddress).toBech32()}`,
  );
  const orderUtxos = await state
    .sdk!.blaze()
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
    return state;
  }
  const tx = await state.sdk?.builders.get(EContractVersion.V3)!.cancel({
    ownerAddress: state.settings.address,
    utxo: {
      hash: choice.input().transactionId(),
      index: Number(choice.input().index()),
    },
  });
  const txCbor = (await tx?.build())?.cbor;
  await transactionDialog(txCbor!, false, state);
  return state;
}

export async function mintPoolArgs(
  state: State,
): Promise<IMintPoolConfigArgs | undefined> {
  const assetA = await getAssetAmount(state, "Select asset A", 2n);
  if (!assetA) {
    console.log("No asset A selected, returning to main menu.");
    return {} as IMintPoolConfigArgs;
  }
  const assetB = await getAssetAmount(state, "Select asset B", 2n);
  if (!assetB) {
    console.log("No asset B selected, returning to main menu.");
    return {} as IMintPoolConfigArgs;
  }
  return {
    assetA,
    assetB,
    fees: await getFeeChoice(),
    ownerAddress: state.settings.address!,
  };
}

async function mintPoolNftCheckArgs(
  state: State,
): Promise<IMintNftCheckPoolConfigArgs | undefined> {
  const v3Args = await mintPoolArgs(state);
  if (!v3Args) {
    console.log("No args provided, returning to main menu.");
    return undefined;
  }
  const nftCheck = await getAssetAmount(state, "Select NFT asset", 1n);
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
