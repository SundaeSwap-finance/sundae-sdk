import { Core } from "@blaze-cardano/sdk";
import { input, select } from "@inquirer/prompts";
import {
  EContractVersion,
  EDatumType,
  ESwapType,
  type ISwapConfigArgs,
} from "@sundaeswap/core";
import type { State } from "../types";
import { getAssetAmount, printHeader, selectPool } from "./shared";
import { transactionDialog } from "./transaction";

export async function swapMenu(state: State): Promise<State> {
  await printHeader(state);
  console.log("\t==== Swap menu ====\n");
  const swapFrom = await getAssetAmount(state, "Select asset to swap from", 0n);
  const pool = await selectPool(swapFrom.id, state);
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
    swapType: {
      type: ESwapType.MARKET,
      slippage: Number(await getSlippage()),
    },
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
  choices.push({
    name: "Back",
    value: "back",
  });
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
