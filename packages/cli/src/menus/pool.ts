import { select } from "@inquirer/prompts";
import {
  EContractVersion,
  TxBuilderNftCheck,
  TxBuilderV3,
  type IMintNftCheckPoolConfigArgs,
  type IMintV3PoolConfigArgs,
} from "@sundaeswap/core";
import type { State } from "../types";
import { getAssetAmount, printHeader } from "./shared";
import { transactionDialog } from "./transaction";

export async function mintPoolMenu(state: State): Promise<State> {
  await printHeader(state);
  console.log("\t==== Mint pool menu ====\n");
  const choices = state
    .sdk!.builders.keys()
    .map((key) => {
      return {
        name: key as string,
        value: key as string,
      };
    })
    .toArray();
  choices.push({
    name: "Back",
    value: "back",
  });
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
      const args = await mintPoolV3Args(state);
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
    default:
      console.error("Unsupported pool type selected");
      return state;
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

export async function mintPoolV3Args(
  state: State,
): Promise<IMintV3PoolConfigArgs> {
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
  const v3Args = await mintPoolV3Args(state);
  const nftCheck = await getAssetAmount(state, "Select NFT asset", 1n);
  return {
    assetA: v3Args.assetA,
    assetB: v3Args.assetB,
    fees: v3Args.fees,
    ownerAddress: v3Args.ownerAddress,
    conditionDatumArgs: {
      value: [nftCheck],
      check: "Any",
    },
  } as IMintNftCheckPoolConfigArgs;
}
