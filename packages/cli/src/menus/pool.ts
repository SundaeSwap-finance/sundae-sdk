import { Core } from "@blaze-cardano/sdk";
import { input, select } from "@inquirer/prompts";
import {
  EContractVersion,
  EDatumType,
  ESwapType,
  TxBuilderNftCheck,
  TxBuilderV3,
  type IMintNftCheckPoolConfigArgs,
  type IMintPoolConfigArgs,
  type IPoolByAssetQuery,
  type IPoolData,
  type ISwapConfigArgs,
} from "@sundaeswap/core";
import type { State } from "../types";
import { getPoolData, prettyAssetId } from "../utils";
import { getAssetAmount, printHeader } from "./shared";
import { transactionDialog } from "./transaction";

export async function swapMenu(state: State): Promise<State> {
  await printHeader(state);
  console.log("\t==== Swap menu ====\n");
  const swapFrom = await getAssetAmount(state, "Select asset to swap from", 0n);
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
    pool = await getPoolData(state, ident, EContractVersion.NftCheck);
  } else {
    pool = (await state.sdk!.queryProvider.findPoolData({
      ident: choice,
    })) as IPoolData;
  }
  if (!pool) {
    console.log("Pool not found");
    return state;
  }
  const builder = state.sdk!.builders.get(pool.version as EContractVersion)!;
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
  await transactionDialog((await tx.build()).cbor, false);
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
  const choices = state
    .sdk!.builders.keys()
    .map((key) => {
      return { name: key as string, value: key as string };
    })
    .toArray();
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
      const tx = (await builder.mintPool(args)).build();
      await transactionDialog((await tx).cbor, false);
      break;
    case "NftCheck":
      const builderNftCheck = state.sdk!.builders.get(
        EContractVersion.NftCheck,
      )! as TxBuilderNftCheck;
      const argsNftCheck = await mintPoolNftCheckArgs(state);
      const txNftCheck = (await builderNftCheck.mintPool(argsNftCheck)).build();
      await transactionDialog((await txNftCheck).cbor, false);
      break;
  }
  return state;
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
    .getOrderAddress(state.settings.address!);
  const orderUtxos = await state
    .sdk!.blaze()
    .provider.getUnspentOutputs(Core.Address.fromBech32(v3OrderScriptAddress));
  const choices: { name: string; value: any }[] = orderUtxos!.map((utxo) => {
    return {
      name: `${utxo.input().transactionId()}#${utxo.input().index()}`,
      value: utxo,
    };
  });
  choices.push({ name: "Back", value: "back" });
  const choice = await select({
    message: "Select order to cancel",
    choices: choices,
  });
  if (choice === "back") {
    return state;
  }
  const tx = await state.sdk?.builders.get(EContractVersion.V3)!.cancel({
    ownerAddress: state.settings.address,
    utxo: {
      hash: choice.input().transactionId(),
      index: choice.input().index(),
    },
  });
  const txCbor = (await tx?.build())?.cbor;
  await transactionDialog(txCbor!, false);
  return state;
}

export async function mintPoolArgs(state: State): Promise<IMintPoolConfigArgs> {
  return {
    assetA: await getAssetAmount(state, "Select asset A", 2n),
    assetB: await getAssetAmount(state, "Select asset B", 2n),
    fees: await getFeeChoice(),
    ownerAddress: state.settings.address!,
  };
}

async function mintPoolNftCheckArgs(
  state: State,
): Promise<IMintNftCheckPoolConfigArgs> {
  const v3Args = await mintPoolArgs(state);
  const nftCheck = await getAssetAmount(state, "Select NFT asset", 1n);
  return {
    assetA: v3Args.assetA,
    assetB: v3Args.assetB,
    fees: v3Args.fees,
    ownerAddress: v3Args.ownerAddress,
    conditionDatumArgs: { value: [nftCheck], check: "Any" },
  } as IMintNftCheckPoolConfigArgs;
}
