/* eslint-disable no-console */
import { input, select } from "@inquirer/prompts";
import {
  EContractVersion,
  EDatumType,
  EDestinationType,
  TxBuilderV3,
  type IStrategyConfigInputArgs,
  type TDestination,
} from "@sundaeswap/core";
import { Core } from "@blaze-cardano/sdk";
import type { IAppContext } from "../types.js";
import {
  getAssetAmount,
  maybeInput,
  printHeader,
  selectPool,
} from "./shared.js";

async function getDestination(): Promise<TDestination> {
  const choice = await select({
    message: "Select destination type for the strategy",
    choices: [
      { name: "Self", value: "self" },
      { name: "Fixed", value: "fixed" },
    ],
  });
  switch (choice) {
    case "self":
      return {
        type: EDestinationType.SELF,
      };
    case "fixed":
      return {
        type: EDestinationType.FIXED,
        address: await input({
          message: "Enter the address for the fixed destination",
          validate: (input) => {
            return input.length > 0 ? true : "Address cannot be empty";
          },
        }),
        datum: {
          type: EDatumType.NONE,
        },
      };
    default:
      throw new Error("Invalid destination type selected");
  }
}

export async function strategyMenu(ctx: IAppContext): Promise<void> {
  await printHeader(ctx);
  console.log("\t==== Strategy menu ====\n");
  const swapFrom = await getAssetAmount(
    ctx,
    "Select asset to swap from with this strategy",
    0n,
  );
  if (!swapFrom) {
    console.log("No asset selected, returning to main menu.");
    return;
  }
  const pool = await selectPool(swapFrom.id, ctx, [EContractVersion.V3]);
  if (!pool) {
    console.log("Pool not found");
    return;
  }
  const signingKeyOrScript = await select({
    message: "Select signing key or script for the strategy",
    choices: [
      { name: "Use signing key", value: "signingKey" },
      { name: "Use script", value: "script", disabled: true },
    ],
  });
  const authScript =
    signingKeyOrScript === "script"
      ? await input({
          message: "Enter the authorized script hash for the strategy",
        })
      : undefined;
  const authKey =
    signingKeyOrScript === "signingKey"
      ? await input({
          message:
            "Enter the signing public key (NOT the key hash) for the strategy",
        })
      : undefined;
  const address = ctx.sprinkle.settings.wallet.address;
  const sdk = await ctx.sdk();
  const builder = sdk.builders.get(EContractVersion.V3)! as TxBuilderV3;
  const strategyArgs: IStrategyConfigInputArgs = {
    suppliedAsset: swapFrom,
    pool: pool,
    destination: await getDestination(),
    ownerAddress: await maybeInput({
      message: "Enter the owner address for the strategy",
      default: address,
    }),
    authScript: authScript,
    authSigner: authKey,
  };
  const tx = await builder.strategy(strategyArgs);
  const built = await tx.build();
  const txObj = Core.Transaction.fromCbor(Core.TxCBOR(built.cbor));
  await ctx.sprinkle.TxDialog(sdk.blaze(), txObj);
}
