import { input, select } from "@inquirer/prompts";
import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import { ADA_METADATA } from "@sundaeswap/core";
import packageJson from "../../package.json" assert { type: "json" };
import type { IState } from "../types";
import { prettyAssetId } from "../utils";

const asciify = (await import("asciify-image")).default;

let asciiLogo: string[] = [];

const logoPath = `${__dirname}/../../data/sundae.png`;

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

export async function printHeader(state: IState): Promise<void> {
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
  if (asciiLogo.length != headerText.length) {
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
  state: IState,
  message: string,
  minAmt: bigint,
): Promise<AssetAmount<IAssetAmountMetadata>> {
  const bal = await state.blaze?.wallet.getBalance();
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
    name: `ADA` + ` (${bal!.coin().toString()})`,
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
