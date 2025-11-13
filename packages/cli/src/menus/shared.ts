/* eslint-disable no-console */
import { cborToScript, Core } from "@blaze-cardano/sdk";
import { input, search, select } from "@inquirer/prompts";
import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  EContractVersion,
  type IPoolByAssetQuery,
  type IPoolData,
  type TTxBuilder,
} from "@sundaeswap/core";
import path from "path";
import { fileURLToPath } from "url";
import packageJson from "../../package.json" assert { type: "json" };
import type { State } from "../types.js";
import { getPoolData, prettyAssetId } from "../utils.js";
import { makeValue } from "@blaze-cardano/sdk";
import { transactionDialog } from "./transaction.js";

const asciify = (await import("asciify-image")).default;

let asciiLogo: string[] = [];

// Get the directory of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct path to logo file in the package
// When built, this file is in dist/cli/, so we need to go up to package root then into data/
const logoPath = path.join(__dirname, "..", "..", "data", "sundae.png");

export async function ensureDeployment<g extends TTxBuilder>(
  validator: string,
  txBuilder: g,
  state: State,
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
    await transactionDialog(deployTx.toCbor(), false, state);
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
  try {
    const asciified = await asciify(logoPath, {
      fit: "box",
      height: size,
    });
    asciiLogo = (asciified as string).split("\n");
  } catch (err) {
    console.error("Could not load logo, using fallback:", err);
    // Fallback to a simple ASCII logo if the image fails to load
    asciiLogo = [
      "   ____                 _            ",
      "  / ___| _   _ _ __   __| | __ _  ___ ",
      "  \\___ \\| | | | '_ \\ / _` |/ _` |/ _ \\",
      "   ___) | |_| | | | | (_| | (_| |  __/",
      "  |____/ \\__,_|_| |_|\\__,_|\\__,_|\\___|",
      "                                     ",
      "           ____  ____  _  __         ",
      "          / ___||  _ \\| |/ /         ",
      "          \\___ \\| | | | ' /          ",
      "           ___) | |_| | . \\          ",
      "          |____/|____/|_|\\_\\         ",
      "                                     ",
    ];
    // Adjust the fallback logo size to match requested height
    while (asciiLogo.length < size) {
      asciiLogo.push("                                     ");
    }
    if (asciiLogo.length > size) {
      asciiLogo = asciiLogo.slice(0, size);
    }
  }
}

export async function printHeader(state: State): Promise<void> {
  console.clear();
  const version = packageJson.devDependencies["@sundaeswap/core"];
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
  filterFn?: (assetId: string, amount: bigint) => boolean,
): Promise<AssetAmount<IAssetAmountMetadata> | undefined> {
  let bal: Core.Value;
  try {
    bal = await state.sdk!.blaze().wallet.getBalance();
  } catch (err) {
    bal = makeValue(0n);
    console.log(
      `The wallet's balance could not be retrieved, it is probably empty. Make sure to fund the wallet with address: ${state.settings.address}\nA faucet exists for testnet at https://docs.cardano.org/cardano-testnets/tools/faucet`,
    );
    await input({
      message: "Press enter to continue",
    });
    return undefined;
  }
  let choices = [
    {
      name: `ADA (${bal.coin().toString()})`,
      value: "ada.lovelace",
    },
  ];
  if (bal.multiasset()) {
    choices = [
      ...choices,
      ...[...bal.multiasset()!.entries()] // NOTE: .filter was only added to IterableIterator in ES2025
        .filter(([id, amt]: [Core.AssetId, bigint]) => {
          if (filterFn) {
            return filterFn(id.toString(), amt);
          }
          return amt! >= minAmt;
        })
        .map(([assetId, amt]: [Core.AssetId, bigint]) => {
          return {
            name: `${prettyAssetId(assetId.toString())} (${amt.toString()})`,
            value: assetId.toString(),
          };
        }),
    ];
  }
  const choice = await search({
    message: message,
    source: (prompt) =>
      prompt
        ? choices.filter((c: { name: string }) => c.name.includes(prompt))
        : choices,
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

export async function addressOrHexToHash(
  address_str: string,
  expectedType: Core.CredentialType,
): Promise<string> {
  if (/[0-9a-fA-F]{56}/.test(address_str)) {
    return address_str;
  }
  if (address_str.startsWith("addr") || address_str.startsWith("stake")) {
    const address = Core.Address.fromBech32(address_str);
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
  default?: string;
}): Promise<string | undefined> {
  const resp = await input(opts);
  if (resp === "") {
    return undefined;
  }
  return resp;
}

export async function selectPool(
  assetId: string,
  state: State,
  typeFilter?: EContractVersion[],
): Promise<IPoolData | undefined> {
  let choices: { name: string; value: string }[] = [];
  try {
    const pools = (await state.sdk!.queryProvider.findPoolData({
      assetId,
      minimal: true,
    } as IPoolByAssetQuery)) as IPoolData[];
    choices = poolsToChoices(pools, typeFilter);
  } catch (err) {
    console.warn("Something went wrong when fetching pools: ", err);
  }
  choices.push({ name: "Enter pool ident manually", value: "manual" });
  let choice = await search({
    message: "Select pool",
    source: async (term) => {
      if (!term) {
        return choices;
      }
      const pools = (await state.sdk!.queryProvider.findPoolData({
        search: term,
        minimal: true,
      })) as IPoolData[];
      return poolsToChoices(
        pools.filter(
          (p) => p.assetA.assetId === assetId || p.assetB.assetId === assetId,
        ),
        typeFilter,
      );
    },
  });
  let pool: IPoolData;
  if (choice === "manual") {
    const ident = await input({
      message: "Enter pool ident",
    });
    choice = ident;
    const version = await select({
      message: "What version is this pool?",
      choices: [
        { name: "V3", value: EContractVersion.V3 },
        { name: "V1", value: EContractVersion.V1 },
        { name: "Condition", value: EContractVersion.Condition },
        { name: "NftCheck", value: EContractVersion.NftCheck },
      ],
    });
    pool = await getPoolData(state, ident, version);
  } else {
    pool = (await state.sdk!.queryProvider.findPoolData({
      ident: choice,
    })) as IPoolData;
  }
  return pool;
}

function poolsToChoices(
  pools: IPoolData[],
  typeFilter?: EContractVersion[],
): { name: string; value: string }[] {
  return pools
    .filter(
      (pool) =>
        !typeFilter || typeFilter.includes(pool.version as EContractVersion),
    )
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
}
