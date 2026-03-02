/* eslint-disable no-console */
import { Core } from "@blaze-cardano/sdk";
import { input, select } from "@inquirer/prompts";
import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  EContractVersion,
  type IPoolByAssetQuery,
  type IPoolData,
  type TTxBuilder,
} from "@sundaeswap/core";
import { Sprinkle } from "@sundaeswap/sprinkles";
import path from "path";
import { fileURLToPath } from "url";
import packageJson from "../../package.json" assert { type: "json" };
import type { IAppContext } from "../types.js";
import { getPoolData, prettyAssetId } from "../utils.js";
import { makeValue } from "@blaze-cardano/sdk";

const asciify = (await import("asciify-image")).default;

let asciiLogo: string[] = [];

// Get the directory of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct path to logo file in the package
const logoPath = path.join(__dirname, "..", "..", "data", "sundae.png");

export async function ensureDeployment<g extends TTxBuilder>(
  validator: string,
  txBuilder: g,
  ctx: IAppContext,
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
  // resolveScriptRef and deployScript both default to burn address
  let refUtxo = await txBuilder.blaze.provider.resolveScriptRef(
    Core.Hash28ByteBase16(validatorScript.hash),
  );
  if (!refUtxo) {
    // Create script from compiled code based on contract version
    // The compiledCode can be in two formats:
    // 1. Raw CBOR byte string: 58/59 + length + data
    // 2. CIP-0381 array format: 82 + version + script_bytes (used in Aiken blueprints)
    let compiledCode = validatorScript.compiledCode;
    if (!compiledCode) {
      throw new Error(
        `No compiledCode found for validator "${validator}". ` +
          `Make sure custom validators are configured with a params file containing compiledCode.`,
      );
    }

    // Check if it's in CIP-0381 array format [version, script_bytes]
    const firstByte = parseInt(compiledCode.substring(0, 2), 16);
    const majorType = firstByte >> 5;
    if (majorType === 4) {
      // It's an array - extract the script bytes (second element)
      // Format: 82 + version_byte + outer_byte_string(inner_byte_string)
      // The outer byte string contains the inner CBOR byte string (double-wrapped)
      const reader = new Core.CborReader(Core.HexBlob(compiledCode));
      const arrayLen = reader.readStartArray();
      if (arrayLen !== 2) {
        throw new Error(
          `Invalid compiledCode array format for validator "${validator}". ` +
            `Expected 2 elements, got ${arrayLen}.`,
        );
      }
      reader.readInt(); // Skip version (we determine from contractVersion)
      // Read the outer byte string to get the inner CBOR byte string
      const innerCbor = reader.readByteString();
      compiledCode = Buffer.from(innerCbor).toString("hex");
    } else if (majorType !== 2) {
      throw new Error(
        `Invalid compiledCode format for validator "${validator}". ` +
          `Expected CBOR byte string (major type 2) or array (major type 4), got major type ${majorType}. ` +
          `First 40 chars: ${compiledCode.substring(0, 40)}.`,
      );
    }

    const script =
      txBuilder.contractVersion === EContractVersion.V1
        ? Core.Script.newPlutusV1Script(
            new Core.PlutusV1Script(Core.HexBlob(compiledCode)),
          )
        : txBuilder.contractVersion === EContractVersion.Stableswaps
          ? Core.Script.newPlutusV3Script(
              new Core.PlutusV3Script(Core.HexBlob(compiledCode)),
            )
          : Core.Script.newPlutusV2Script(
              new Core.PlutusV2Script(Core.HexBlob(compiledCode)),
            );

    const deployTx = await txBuilder.blaze
      .newTransaction()
      .deployScript(script)
      .complete();
    console.log(deployTx.toCore().body);
    await ctx.sprinkle.TxDialog(txBuilder.blaze, deployTx);
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
  const refTxIn = {
    hash: refUtxo.input().transactionId().toString(),
    index: Number(refUtxo.input().index()),
  };
  // Check if this UTxO is already in the references (might be shared by multiple validators)
  const existingRef = protocolParams.references.find(
    (ref) => ref.txIn.hash === refTxIn.hash && ref.txIn.index === refTxIn.index,
  );
  if (!existingRef) {
    protocolParams.references.push({
      key: validator,
      txIn: refTxIn,
    });
  }
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
    while (asciiLogo.length < size) {
      asciiLogo.push("                                     ");
    }
    if (asciiLogo.length > size) {
      asciiLogo = asciiLogo.slice(0, size);
    }
  }
}

export async function printHeader(ctx: IAppContext): Promise<void> {
  console.clear();
  const version = packageJson.devDependencies["@sundaeswap/core"];
  const settings = ctx.sprinkle.settings;
  const address =
    settings.wallet.type === "hot"
      ? settings.wallet.address
      : settings.wallet.address;
  const providerType = settings.provider.type;
  const providerKey =
    settings.provider.type === "blockfrost"
      ? settings.provider.projectId
      : settings.provider.apiKey;
  const headerText: string[] = [
    "",
    "----------------------",
    "|",
    "| SundaeSDK",
    `| Version:\t${version}`,
    "|",
    "|---------------------",
    "|",
    `| Network:\t${settings.network}`,
    `| Address:\t${address}`,
    `| Provider:\t${providerType}`,
    `| Provider Key:\t${providerKey?.substring(0, 5)}*****`,
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
  ctx: IAppContext,
  message: string,
  minAmt: bigint,
  filterFn?: (assetId: string, amount: bigint) => boolean,
): Promise<AssetAmount<IAssetAmountMetadata> | undefined> {
  let bal: Core.Value;
  const address =
    ctx.sprinkle.settings.wallet.type === "hot"
      ? ctx.sprinkle.settings.wallet.address
      : ctx.sprinkle.settings.wallet.address;
  try {
    const sdk = await ctx.sdk();
    bal = await sdk.blaze().wallet.getBalance();
  } catch (err) {
    bal = makeValue(0n);
    console.log(
      `The wallet's balance could not be retrieved, it is probably empty. Make sure to fund the wallet with address: ${address}\nA faucet exists for testnet at https://docs.cardano.org/cardano-testnets/tools/faucet`,
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
      ...[...bal.multiasset()!.entries()]
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
  const choice = await Sprinkle.SearchSelect({
    message: message,
    source: (prompt) =>
      prompt
        ? choices.filter((c: { name: string }) => c.name.includes(prompt))
        : choices,
  });
  const assetId = choice as string;

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
  ctx: IAppContext,
  typeFilter?: EContractVersion[],
): Promise<IPoolData | undefined> {
  const sdk = await ctx.sdk();
  let choices: { name: string; value: string }[] = [];
  try {
    const pools = (await sdk.queryProvider.findPoolData({
      assetId,
      minimal: true,
    } as IPoolByAssetQuery)) as IPoolData[];
    choices = poolsToChoices(pools, typeFilter);
  } catch (err) {
    console.warn("Something went wrong when fetching pools: ", err);
  }
  choices.push({ name: "Enter pool ident manually", value: "manual" });
  let choice = await Sprinkle.SearchSelect({
    message: "Select pool",
    source: async (term) => {
      if (!term) {
        return choices;
      }
      const pools = (await sdk.queryProvider.findPoolData({
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
    pool = await getPoolData(ctx, ident, version);
  } else {
    pool = (await sdk.queryProvider.findPoolData({
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
