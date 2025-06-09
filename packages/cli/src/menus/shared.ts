import { Address, CredentialType } from "@blaze-cardano/core";
import { input, select } from "@inquirer/prompts";
import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  EContractVersion,
  type IPoolByAssetQuery,
  type IPoolData,
} from "@sundaeswap/core";
import packageJson from "../../package.json" assert { type: "json" };
import type { State } from "../types";
import { getPoolData, prettyAssetId } from "../utils";

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

export async function addressOrHexToHash(
  address_str: string,
  expectedType: CredentialType,
): Promise<string> {
  if (/[0-9a-fA-F]{56}/.test(address_str)) {
    return address_str;
  }
  if (address_str.startsWith("addr") || address_str.startsWith("stake")) {
    const address = Address.fromBech32(address_str);
    if (address_str.startsWith("addr")) {
      const credType = address.getProps().paymentPart?.type;
      if (credType !== expectedType) {
        throw new Error(
          `Expecting a ${expectedType} address, but got ${credType}`,
        );
      }
      return address.getProps().paymentPart!.hash;
    } else {
      const credType = address.asReward()!.getPaymentCredential().type;
      if (credType !== expectedType) {
        throw new Error(
          `Expecting a ${expectedType} address, but got ${credType}`,
        );
      }
      return address.asReward()!.getPaymentCredential().hash;
    }
  }
  throw new Error("Unrecognized format");
}

export async function maybeInput(opts: {
  message: string;
  validate?: (a: string) => boolean | string | Promise<boolean | string>;
}): Promise<string | undefined> {
  const resp = await input(opts);
  if (resp === "") {
    return undefined;
  }
  return resp;
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

export async function selectPool(
  assetId: string,
  state: State,
  typeFilter?: EContractVersion[],
): Promise<IPoolData | undefined> {
  const pools = (await state.sdk!.queryProvider.findPoolData({
    assetId,
  } as IPoolByAssetQuery)) as IPoolData[];
  let choices = pools!
    .filter((pool) => {
      if (
        typeFilter &&
        !typeFilter.includes(pool.version as EContractVersion)
      ) {
        return false;
      }
      return true;
    })
    .map((pool) => {
      const price =
        Number(pool.liquidity.aReserve) / Number(pool.liquidity.bReserve);
      return {
        name: `${prettyAssetId(pool.assetA.assetId.toString())} / ${prettyAssetId(
          pool.assetB.assetId.toString(),
        )} (p: ${price.toFixed(
          6,
        )}, l: (${pool.liquidity.aReserve.toString()} / ${pool.liquidity.bReserve.toString()}), id: ${
          pool.ident
        })`,
        value: pool.ident,
      };
    });
  choices = [{ name: "Enter pool ident manually", value: "manual" }].concat(
    choices,
  );
  let choice = await select({
    message: "Select pool",
    choices: choices,
  });
  let pool: IPoolData;
  if (choice === "manual") {
    const ident = await input({
      message: "Enter pool ident",
    });
    choice = ident;
    pool = await getPoolData(state, ident, EContractVersion.NftCheck);
  } else {
    pool = (await state.sdk!.queryProvider.findPoolData({
      ident: choice,
    })) as IPoolData;
  }
  return pool;
}
