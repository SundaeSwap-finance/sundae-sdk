/* eslint-disable no-console */
import { Core, makeValue } from "@blaze-cardano/sdk";
import { input, select } from "@inquirer/prompts";
import type { State } from "../types.js";
import { cancelSwapMenu, mintPoolMenu, swapMenu } from "./pool.js";
import { settingsMenu } from "./settings.js";
import { getAssetAmount, printHeader } from "./shared.js";
import { strategyMenu } from "./strategy.js";
import { transactionDialog } from "./transaction.js";

export async function mainMenu(state: State): Promise<State> {
  let choice = "";
  while (choice !== "exit") {
    await printHeader(state);
    choice = await select({
      message: "Select an option",
      choices: [
        { name: "Mint Pool", value: "mintPool" },
        { name: "Swap", value: "swap" },
        { name: "Strategy", value: "strategy" },
        { name: "Add/Remove Liquidity", value: "addRemoveLiquidity" },
        { name: "Cancel Swap", value: "cancelSwap" },
        { name: "Settings", value: "settings" },
        { name: "Mint Token", value: "mintToken" },
        { name: "Simple Send", value: "simpleSend" },
        { name: "Exit", value: "exit" },
      ],
    });
    switch (choice) {
      case "mintPool":
        await mintPoolMenu(state);
        break;
      case "settings":
        await settingsMenu(state);
        break;
      case "swap":
        await swapMenu(state);
        break;
      case "strategy":
        await strategyMenu(state);
        break;
      case "cancelSwap":
        await cancelSwapMenu(state);
        break;
      case "mintToken":
        await mintToken(state);
        break;
      case "simpleSend":
        await simpleSend(state);
        break;
      default:
        console.log("Exiting...");
        break;
    }
  }
  return state;
}

export async function mintToken(state: State): Promise<State> {
  await printHeader(state);
  console.log("\t==== Mint Token ====\n");
  const tokenName = await input({
    message: "Enter token name",
  });
  const tokenAmount = await input({
    message: "Enter token amount",
  });
  const hash = Core.Ed25519KeyHashHex(
    Core.Address.fromBech32(state.settings.address!)
      .asBase()!
      .getPaymentCredential()!
      .hash!.toString(),
  );
  const tokenPolicy = new Core.ScriptPubkey(hash);
  const policy = Core.Script.newNativeScript(
    Core.NativeScript.newScriptPubkey(tokenPolicy),
  );
  console.log(
    `Token policy: ${policy.hash()}\nToken name: ${tokenName}\nToken amount: ${tokenAmount}`,
  );
  const mints = new Map<Core.AssetName, bigint>();
  mints.set(
    Core.AssetName(Core.toHex(Buffer.from(tokenName))),
    BigInt(tokenAmount),
  );
  const tx = await state
    .sdk!.blaze()
    .newTransaction()
    .addMint(Core.PolicyId(policy.hash()), mints)
    .provideScript(policy)
    .complete();
  await transactionDialog(tx.toCbor().toString(), false, state);
  return state;
}

export async function simpleSend(state: State): Promise<State> {
  await printHeader(state);
  console.log("\t==== Simple Send ====\n");
  const recipient = await input({
    message: "Enter recipient address",
  });
  const amount = await getAssetAmount(
    state,
    "Which asset do you want to send?",
    0n,
  );
  let value;
  if (amount.id === "ada.lovelace") {
    value = makeValue(amount.amount);
  } else {
    value = makeValue(0n, [amount.id, amount.amount]);
  }
  const tx = await state
    .sdk!.blaze()
    .newTransaction()
    .payAssets(Core.Address.fromBech32(recipient), value)
    .complete();
  await transactionDialog(tx.toCbor().toString(), false, state);
  return state;
}
