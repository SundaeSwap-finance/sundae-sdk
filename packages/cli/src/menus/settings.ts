/* eslint-disable no-console */
import {
  Bip32PrivateKey,
  generateMnemonic,
  mnemonicToEntropy,
  wordlist,
} from "@blaze-cardano/core";
import { HotWallet } from "@blaze-cardano/wallet";
import { input, password, select } from "@inquirer/prompts";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { ISettings, State } from "../types.js";
import { printHeader } from "./shared.js";
import { getProvider, encrypt } from "../utils.js";

// Create cross-platform config directory
const configDir = join(homedir(), ".sundaeswap-cli");
const settingsPath = join(configDir, "settings.json");

// Ensure config directory exists
if (!existsSync(configDir)) {
  mkdirSync(configDir, { recursive: true });
}

export async function readSettings(state: State): Promise<State> {
  if (existsSync(settingsPath)) {
    const data = readFileSync(settingsPath);
    state.settings = JSON.parse(data.toString()) as ISettings;
  }
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
  if (!state.settings.address) {
    state = await setWallet(state);
  }

  await saveSettings(state);

  return state;
}

export async function setWallet(state: State): Promise<State> {
  const hotOrCold = await select({
    message: "Select wallet type",
    choices: [
      { name: "Hot wallet (can sign from within this cli)", value: "hot" },
      { name: "Cold wallet (sign transactions externally)", value: "cold" },
    ],
  });
  switch (hotOrCold) {
    case "hot":
      state.settings.walletType = hotOrCold;
      return await setHotWallet(state);
    case "cold":
      state.settings.walletType = hotOrCold;
      state.settings.address = await input({
        message: `Enter address for the wallet:`,
      });
      break;
    default:
      console.log("Invalid choice, please try again.");
      return setWallet(state);
  }
  return state;
}

export async function setHotWallet(state: State): Promise<State> {
  const newOrImport = await select({
    message: "Select hot wallet type",
    choices: [
      { name: "New wallet", value: "new" },
      { name: "Import existing wallet", value: "import" },
    ],
  });
  let mnemonic = "";
  switch (newOrImport) {
    case "new":
      mnemonic = generateMnemonic(wordlist);
      console.log(`Generated mnemonic (store it safely!):\n${mnemonic}`);
      await input({
        message: "Press Enter to continue after storing the mnemonic",
      });
      break;
    case "import":
      mnemonic = await input({
        message: "Enter mnemonic phrase (12, 15 or 24 words)",
        validate: (input: string) => {
          const words = input.trim().split(/\s+/);
          for (const word of words) {
            if (!wordlist.includes(word)) {
              return `Invalid word: ${word}. Please use a valid bip39 mnemonic`;
            }
          }
          if (
            words.length !== 12 &&
            words.length !== 15 &&
            words.length !== 24
          ) {
            return "Mnemonic must be 12, 15 or 24 words.";
          }
          return true;
        },
      });
      break;
    default:
      console.log("Invalid choice, please try again.");
      return setHotWallet(state);
  }
  const entropy: Uint8Array = mnemonicToEntropy(mnemonic, wordlist);
  const privateKey = Bip32PrivateKey.fromBip39Entropy(Buffer.from(entropy), "");
  let pw;
  let repeatedPw;
  do {
    pw = await password({
      message: "Enter a password to encrypt your private key",
    });
    repeatedPw = await password({
      message: "Repeat the password",
    });
    if (pw !== repeatedPw) {
      console.log("Passwords do not match, please try again.");
    }
  } while (pw !== repeatedPw);
  state.settings.privateKey = encrypt(privateKey.hex(), pw);

  const provider = await getProvider(state);
  const wallet = await HotWallet.fromMasterkey(privateKey.hex(), provider);
  state.settings.address = (await wallet.getChangeAddress()).toBech32();

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
  state = await setWallet(state);
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
  let changed = false;
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
        changed = true;
        break;
      case "address":
        await setAddress(state);
        changed = true;
        break;
      case "providerType":
        await setProviderType(state);
        changed = true;
        break;
      case "providerKey":
        await setProviderKey(state);
        changed = true;
        break;
      case "addCustomProtocolParams":
        await addCustomProtocolParams(state);
        changed = true;
        break;
      default:
        break;
    }
    console.log(`Choice: ${choice}`);
  }

  if (changed) {
    await saveSettings(state);
  }

  return state;
}

export async function saveSettings(state: State): Promise<void> {
  console.log(`Settings saving to ${settingsPath}`);
  writeFileSync(settingsPath, JSON.stringify(state.settings, null, 2), {
    encoding: "utf-8",
  });
  console.log(`Settings saved to ${settingsPath}`);
  await state.setSdk();
  console.log(`Settings saved to ${settingsPath}`);
}
