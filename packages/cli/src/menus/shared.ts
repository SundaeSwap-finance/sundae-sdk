/* eslint-disable no-console */
import { cborToScript, Core } from "@blaze-cardano/sdk";
import { input, select } from "@inquirer/prompts";
import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import { ADA_METADATA, type TTxBuilder } from "@sundaeswap/core";
import packageJson from "../../package.json" assert { type: "json" };
import type { State } from "../types";
import { prettyAssetId } from "../utils";
import { transactionDialog } from "./transaction.ts";

const asciify = (await import("asciify-image")).default;

let asciiLogo: string[] = [];

const logoPath = `${__dirname}/../../data/sundae.png`;

export async function ensureDeployment<g extends TTxBuilder>(
  validator: string,
  txBuilder: g,
): Promise<g> {
  const protocolParams = await txBuilder.getProtocolParams();
  if (!protocolParams) {
    throw new Error(
      "Protocol parameters not found. Please ensure the SDK is properly initialized.",
    );
  }
  const validatorScript = protocolParams.blueprint.validators.find(
    (v) => v.title === validator,
  );
  if (!validatorScript) {
    throw new Error(
      `Validator script with title "${validator}" not found in protocol parameters.`,
    );
  }
  if (protocolParams.references.find((ref) => ref.key === validator)) {
    return txBuilder;
  }

  let refUtxo = await txBuilder.blaze.provider.resolveScriptRef(
    Core.Hash28ByteBase16(validatorScript.hash),
  );
  if (!refUtxo) {
    const deployTx = await txBuilder.blaze
      .newTransaction()
      .deployScript(cborToScript(validatorScript.compiledCode, "PlutusV3"))
      .complete();
    await transactionDialog(deployTx.toCbor(), false);
    await input({
      message:
        "Press enter to continue after the deployment transaction is confirmed.",
    });
    refUtxo = await txBuilder.blaze.provider.resolveScriptRef(
      Core.Hash28ByteBase16(validatorScript.hash),
    );
    if (!refUtxo) {
      throw new Error(
        `Failed to resolve script reference for validator "${validator}".`,
      );
    }
  }
  protocolParams.references.push({
    key: validator,
    txIn: {
      hash: refUtxo.input().transactionId().toString(),
      index: Number(refUtxo.input().index()),
    },
  });
  txBuilder.protocolParams = protocolParams;
  return txBuilder;
}

export async function setAsciiLogo(size: number): Promise<void> {
  await asciify(logoPath, {
    fit: "box",
    height: size,
  })
    .then(function (asciified) {
      asciiLogo = (asciified as string).split("\n");
    })
    .catch(function (err) {
      console.error(err);
    });
}

export async function printHeader(state: State): Promise<void> {
  console.clear();
  const version = packageJson.dependencies["@sundaeswap/core"];
  const headerText: string[] = [
    "",
    "----------------------",
    "|",
    "| SundaeSDK",
    `| Version:\t${version}`,
    "|",
    "|---------------------",
    "|",
    `| Network:\t${state.settings.network}`,
    `| Address:\t${state.settings.address}`,
    `| Provider:\t${state.settings.providerType}`,
    `| Provider Key:\t${state.settings.providerKey?.substring(0, 5)}*****`,
    "|",
    "----------------------",
    "",
  ];
  const lines: string[] = [];
  if (asciiLogo.length !== headerText.length) {
    await setAsciiLogo(headerText.length);
  }
  for (let i = 0; i < headerText.length; i++) {
    lines[i] = `${asciiLogo[i]}\t${headerText[i]}`;
  }
  for (const line in lines) {
    console.log(lines[line]);
  }
  console.log("");
}

export async function getAssetAmount(
  state: State,
  message: string,
  minAmt: bigint,
): Promise<AssetAmount<IAssetAmountMetadata>> {
  const bal = await state.sdk!.blaze().wallet.getBalance();
  const choices = bal!
    .multiasset()!
    .entries()
    .filter((entry) => {
      return entry[1] >= minAmt;
    })
    .map((entry) => {
      return {
        name: `${prettyAssetId(entry[0].toString())} (${entry[1].toString()})`,
        value: entry[0].toString(),
      };
    })
    .toArray();
  choices?.push({
    name: `ADA (${bal!.coin().toString()})`,
    value: "ada.lovelace",
  });
  const choice = await select({
    message: message,
    choices: choices,
  });
  const assetId = choice as string;

  ///TODO: fetch decimals
  return choice === "ada.lovelace"
    ? new AssetAmount<IAssetAmountMetadata>(
        Number(await input({ message: "Enter amount" })),
        ADA_METADATA,
      )
    : new AssetAmount<IAssetAmountMetadata>(
        Number(await input({ message: "Enter amount" })),
        { decimals: 0, assetId: assetId },
      );
}
