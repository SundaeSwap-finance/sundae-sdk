/* eslint-disable no-console */
import {
  Bip32PrivateKey,
  generateMnemonic,
  mnemonicToEntropy,
  wordlist,
} from "@blaze-cardano/core";
import { HotWallet } from "@blaze-cardano/wallet";
import { input, password, select } from "@inquirer/prompts";
import { Sprinkle } from "@sundaeswap/sprinkles";
import type { CliSettingsSchema } from "./schema.js";
import { encrypt } from "./utils.js";

export async function setWallet(
  sprinkle: Sprinkle<typeof CliSettingsSchema>,
): Promise<void> {
  const hotOrCold = await select({
    message: "Select wallet type",
    choices: [
      { name: "Hot wallet (can sign from within this cli)", value: "hot" },
      { name: "Cold wallet (sign transactions externally)", value: "cold" },
    ],
  });
  switch (hotOrCold) {
    case "hot":
      await setHotWallet(sprinkle);
      break;
    case "cold":
      const address = await input({
        message: "Enter address for the wallet:",
      });
      sprinkle.settings.wallet = { type: "cold", address };
      break;
    default:
      console.log("Invalid choice, please try again.");
      await setWallet(sprinkle);
      return;
  }
  sprinkle.saveSettings();
}

async function setHotWallet(
  sprinkle: Sprinkle<typeof CliSettingsSchema>,
): Promise<void> {
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
        validate: (value: string) => {
          const words = value.trim().split(/\s+/);
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
      await setHotWallet(sprinkle);
      return;
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

  const encryptedKey = encrypt(privateKey.hex(), pw);

  const provider = await Sprinkle.GetProvider(
    sprinkle.settings.network,
    sprinkle.settings.provider,
  );
  const wallet = await HotWallet.fromMasterkey(privateKey.hex(), provider);
  const address = (await wallet.getChangeAddress()).toBech32();

  sprinkle.settings.wallet = {
    type: "hot",
    privateKey: encryptedKey,
    address,
  };
}
