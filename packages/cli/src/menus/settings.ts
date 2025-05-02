import { input, select } from "@inquirer/prompts";
import { existsSync, readFileSync, writeFileSync } from "fs";
import type { ISettings, State } from "../types";
import { printHeader } from "./shared";

const settingsPath = `${__dirname}/../../settings.json`;

export async function readSettings(state: State): Promise<State> {
  if (existsSync(settingsPath)) {
    const data = readFileSync(settingsPath);
    state.settings = JSON.parse(data.toString()) as ISettings;
  }
  await state.setSdk();
  return state;
}

export async function fillRemainingSettings(state: State): Promise<State> {
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
  await saveSettings(state);
  return state;
}

export async function addCustomProtocolParams(state: State): Promise<State> {
  const customProtocolParams = await input({
    message: "Enter path to custom protocol params",
  });
  state.settings.customProtocolParams = JSON.parse(customProtocolParams);
  await saveSettings(state);
  return state;
}

export async function setNetwork(state: State): Promise<State> {
  state.settings.network = await select({
    message: `Select network (Current: ${state.settings.network})`,
    choices: [
      { name: "mainnet", value: "mainnet" },
      { name: "preview", value: "preview" },
    ],
  });
  return state;
}

export async function setAddress(state: State): Promise<State> {
  state.settings.address = await input({
    message: `Enter address (Current: ${state.settings.address})`,
  });
  return state;
}

export async function setProviderType(state: State): Promise<State> {
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

export async function setProviderKey(state: State): Promise<State> {
  state.settings.providerKey = await input({
    message: `Enter provider key (Current: ${state.settings.providerKey})`,
  });
  return state;
}

export async function settingsMenu(state: State): Promise<State> {
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
        {
          name: "Add custom protocol params",
          value: "addCustomProtocolParams",
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
      case "addCustomProtocolParams":
        await addCustomProtocolParams(state);
        break;
      case "exit":
        break;
    }
    console.log(`Choice: ${choice}`);
  }
  await saveSettings(state);
  return state;
}

export async function saveSettings(state: State): Promise<void> {
  writeFileSync(settingsPath, JSON.stringify(state.settings, null, 2), {
    encoding: "utf-8",
  });
  await state.setSdk();
  console.log("Settings saved to settings.json");
}
