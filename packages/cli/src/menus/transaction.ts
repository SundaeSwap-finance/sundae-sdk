import { select } from "@inquirer/prompts";
import clipboard from "clipboardy";

export async function transactionDialog(
  txCbor: string,
  expanded: boolean,
): Promise<void> {
  const choices = [
    { name: "Copy tx cbor", value: "copy" },
    { name: "Back", value: "back" },
  ];
  if (expanded) {
    console.log("Transaction cbor: ", txCbor);
  } else {
    console.log("Transaction cbor: ", `${txCbor.slice(0, 50)}...`);
    choices.push({ name: "Expand", value: "expand" });
  }
  const choice = await select({
    message: "Select an option",
    choices: choices,
  });
  switch (choice) {
    case "copy":
      clipboard.writeSync(txCbor);
      await select({
        message: "Transaction cbor copied to clipboard.",
        choices: [{ name: "Press enter to continue.", value: "continue" }],
      });
      break;
    case "back":
      return;
    case "expand":
      await transactionDialog(txCbor, true);
      break;
  }
}
