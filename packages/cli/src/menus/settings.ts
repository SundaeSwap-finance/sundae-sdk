import { input, select } from "@inquirer/prompts";
import { existsSync, readFileSync, writeFileSync } from "fs";
import type { ISettings, IState } from "../types";
import { printHeader } from "./shared";

const settingsPath = `${__dirname}/../../settings.json`;

export function readSettings(state: IState): IState {
  if (existsSync(settingsPath)) {
    const data = readFileSync(settingsPath);
    state.settings = JSON.parse(data.toString()) as ISettings;
  }
  return state;
}

export async function fillRemainingSettings(state: IState): Promise<IState> {
  if (!state.settings.network) {
    state.settings.network = await select({
      message: "Select network",
      choices: [
        { name: "mainnet", value: "mainnet" },
        { name: "preview", value: "preview" },
      ],
    });
  }
  if (!state.settings.address) {
    state.settings.address = await input({
      message: "Enter address",
    });
  }
  if (!state.settings.providerType) {
    state.settings.providerType = await select({
      message: "Select provider type",
      choices: [
        { name: "blockfrost", value: "blockfrost" },
        { name: "maestro", value: "maestro" },
        { name: "kupmios", value: "kupmios" },
      ],
    });
  }
  if (!state.settings.providerKey) {
    state.settings.providerKey = await input({
      message: "Enter provider key",
    });
  }
  saveSettings(state);
  return state;
}

export async function setNetwork(state: IState): Promise<IState> {
  state.settings.network = await select({
    message: `Select network (Current: ${state.settings.network})`,
    choices: [
      { name: "mainnet", value: "mainnet" },
      { name: "preview", value: "preview" },
    ],
  });
  return state;
}

export async function setAddress(state: IState): Promise<IState> {
  state.settings.address = await input({
    message: `Enter address (Current: ${state.settings.address})`,
  });
  return state;
}

export async function setProviderType(state: IState): Promise<IState> {
  state.settings.providerType = await select({
    message: `Select provider type (Current: ${state.settings.providerType})`,
    choices: [
      { name: "blockfrost", value: "blockfrost" },
      { name: "maestro", value: "maestro" },
      { name: "kupmios", value: "kupmios" },
    ],
  });
  return state;
}

export async function setProviderKey(state: IState): Promise<IState> {
  state.settings.providerKey = await input({
    message: `Enter provider key (Current: ${state.settings.providerKey})`,
  });
  return state;
}

export async function settingsMenu(state: IState): Promise<IState> {
  let choice = "";
  while (choice !== "exit") {
    await printHeader(state);
    choice = await select({
      message: "Select setting to change",
      choices: [
        { name: `Network: ${state.settings.network}`, value: "network" },
        { name: `Address: ${state.settings.address}`, value: "address" },
        {
          name: `Provider Type: ${state.settings.providerType}`,
          value: "providerType",
        },
        {
          name: `Provider Key: ${state.settings.providerKey}`,
          value: "providerKey",
        },
        { name: "Exit", value: "exit" },
      ],
    });
    switch (choice) {
      case "network":
        await setNetwork(state);
        break;
      case "address":
        await setAddress(state);
        break;
      case "providerType":
        await setProviderType(state);
        break;
      case "providerKey":
        await setProviderKey(state);
        break;
      case "exit":
        break;
    }
    console.log(`Choice: ${choice}`);
  }
  saveSettings(state);
  return state;
}

export function saveSettings(state: IState): void {
  writeFileSync(settingsPath, JSON.stringify(state.settings, null, 2), {
    encoding: "utf-8",
  });
  console.log("Settings saved to settings.json");
}
