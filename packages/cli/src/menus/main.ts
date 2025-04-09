import { select } from "@inquirer/prompts";
import type { IState } from "../types";
import { settingsMenu } from "./settings";
import { printHeader } from "./shared";
import { cancelSwapMenu, mintPoolMenu, swapMenu } from "./pool";

export async function mainMenu(state: IState): Promise<IState> {
  let choice = "";
  while (choice !== "exit") {
    await printHeader(state);
    choice = await select({
      message: "Select an option",
      choices: [
        { name: "Mint Pool", value: "mintPool" },
        { name: "Swap", value: "swap" },
        { name: "Add/Remove Liquidity", value: "addRemoveLiquidity" },
        { name: "Cancel Swap", value: "cancelSwap" },
        { name: "Settings", value: "settings" },
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
      case "cancelSwap":
        await cancelSwapMenu(state);
        break;
    }
  }
  return state;
}
