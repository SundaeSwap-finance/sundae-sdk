import { Core } from "@blaze-cardano/sdk";
import { input, select } from "@inquirer/prompts";
import type { State } from "../types";
import { mintPoolMenu } from "./pool";
import { settingsMenu } from "./settings";
import { printHeader } from "./shared";
import { strategyMenu } from "./strategy";
import { cancelSwapMenu, swapMenu } from "./swap";
import { transactionDialog } from "./transaction";

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
      default:
        if (choice !== "exit") {
          console.log(`Unknown option: ${choice}`);
        }
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
  await transactionDialog(tx.toCbor().toString(), false);
  return state;
}
