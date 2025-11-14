/* eslint-disable no-console */
import { input, select } from "@inquirer/prompts";
import clipboard from "clipboardy";
import type { State } from "../types";
import { Core } from "@blaze-cardano/sdk";

export async function transactionDialog(
  txCbor: string,
  expanded: boolean,
  state: State,
): Promise<void> {
  let choices = [
    { name: "Copy tx cbor", value: "copy" },
    { name: "Back", value: "back" },
  ];
  if (expanded) {
    console.log("Transaction cbor: ", txCbor);
  } else {
    console.log("Transaction cbor: ", `${txCbor.slice(0, 50)}...`);
    choices = [{ name: "Expand", value: "expand" }, ...choices];
  }
  if (state.settings.walletType && state.settings.walletType === "hot") {
    choices = [{ name: "Sign transaction", value: "sign" }, ...choices];
  }
  const choice = await select({
    message: "Select an option",
    choices: choices,
  });
  switch (choice) {
    case "sign":
      const blaze = state.sdk().blaze();
      if (!blaze) {
        console.error("Blaze instance is not available.");
        return;
      }
      const signedTx = await blaze.signTransaction(
        Core.Transaction.fromCbor(Core.TxCBOR(txCbor)),
      );
      const txId = await blaze.submitTransaction(signedTx);
      console.log(`Transaction submitted: ${txId}`);
      await input({
        message: "Press enter to continue.",
      });
      break;
    case "copy":
      try {
        clipboard.writeSync(txCbor);
        await select({
          message: "Transaction cbor copied to clipboard.",
          choices: [{ name: "Press enter to continue.", value: "continue" }],
        });
      } catch (e) {
        console.log("Failed to copy to clipboard, expanding instead.");
        await transactionDialog(txCbor, true, state);
      }
      break;
    case "back":
      return;
    case "expand":
      await transactionDialog(txCbor, true, state);
      break;
    default:
      break;
  }
}
