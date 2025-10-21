/* eslint-disable no-console */
import {
  Blaze,
  Blockfrost,
  ColdWallet,
  Core,
  HotWallet,
  Maestro,
  Wallet,
  type Provider,
} from "@blaze-cardano/sdk";
import { input, password, select } from "@inquirer/prompts";
import {
  DatumBuilderNftCheck,
  EContractVersion,
  type IPoolData,
} from "@sundaeswap/core";
import * as crypto from "crypto";
import { setTimeout } from "timers/promises";
import { setWallet } from "./menus/settings.js";
import type { State } from "./types.js";

export async function getWallet(
  state: State,
  provider: Provider,
): Promise<Wallet> {
  if (!state.settings.address) {
    state = await setWallet(state);
  }
  if (state.settings.walletType && state.settings.walletType === "hot") {
    if (!state.settings.privateKey) {
      console.log(
        "Something is wrong with the stored wallet, please re-import your wallet.",
      );
      state = await setWallet(state);
    }
    let privateKey;
    do {
      const pw = await password({
        message: "Enter wallet password",
      });
      privateKey = await decrypt(state.settings.privateKey!, pw);
    } while (!privateKey);
    const wallet = await HotWallet.fromMasterkey(
      Core.Bip32PrivateKeyHex(privateKey!),
      provider,
    );
    return wallet;
  } else {
    const address = Core.Address.fromBech32(state.settings.address!);
    const wallet = new ColdWallet(address, provider.network, provider);
    return wallet;
  }
}

export async function getProvider(state: State): Promise<Provider> {
  if (!("providerType" in state.settings) || !state.settings.providerType) {
    state.settings.providerType = await select({
      message: "Enter provider type (blockfrost, maestro, kupmios):",
      choices: [
        { name: "blockfrost", value: "blockfrost" },
        { name: "maestro", value: "maestro" },
        { name: "kupmios", value: "kupmios" },
      ],
    });
    state.settings.network = await select({
      message: "Select network",
      choices: [
        { name: "mainnet", value: "mainnet" },
        { name: "preview", value: "preview" },
      ],
    });
    state.settings.providerKey = await password({
      message: "Enter provider key",
    });
  }
  switch (state.settings.providerType) {
    case "blockfrost":
      const bfNetwork: "cardano-mainnet" | "cardano-preview" =
        state.settings.network === "mainnet"
          ? "cardano-mainnet"
          : "cardano-preview";
      return new Blockfrost({
        network: bfNetwork,
        projectId: state.settings.providerKey!,
      });
    case "maestro":
      return new Maestro({
        network: state.settings.network! as "mainnet" | "preview",
        apiKey: state.settings.providerKey!,
      });
    case "kupmios":
      throw new Error("Kupmios provider not implemented yet");
    default:
      throw new Error("Invalid provider type");
  }
}

export async function getBlazeInstance(
  state: State,
): Promise<Blaze<Provider, Wallet>> {
  const provider = await getProvider(state);
  const wallet = await getWallet(state, provider);
  const blazeInstance = Blaze.from(provider, wallet);
  return blazeInstance;
}

export function prettyAssetId(assetId: string): string {
  const assetIdParts = assetId.includes(".")
    ? assetId.split(".")
    : [assetId.substring(0, 56), assetId.substring(56)];
  const policyId = assetIdParts[0]!;
  const assetName = assetIdParts[1]!;
  const prettyAssetName = Buffer.from(assetName, "hex")
    .toString()
    .replaceAll("\v", "");
  return `${policyId}.${prettyAssetName}`;
}

export async function getPoolData(
  state: State,
  ident: string,
  version: EContractVersion,
): Promise<IPoolData> {
  const builder = state.sdk!.builders.get(version)!;
  const { hash: poolPolicyId } = await builder.getValidatorScript("pool.mint");
  console.log("Pool Policy ID: ", poolPolicyId);
  const poolNft = DatumBuilderNftCheck.computePoolNftName(ident);
  console.log("Pool NFT: ", poolNft);
  const poolUtxo = await state
    .sdk!.blaze()
    .provider.getUnspentOutputByNFT(
      Core.AssetId.fromParts(
        Core.PolicyId(poolPolicyId),
        Core.AssetName(poolNft),
      ),
    );

  const datum = builder.datumBuilder.decodeDatum(
    poolUtxo.output().datum()!.asInlineData()!,
  );

  console.log("Datum: ", datum);
  await input({ message: "Press enter to continue" });
  const conData = datum.conditionDatum as Core.PlutusData;
  console.log("Condition Datum: ", conData.toCbor().toString());
  console.log("Pool data:", {
    currentFee: Number(datum.askFeesPer_10Thousand) / 10000,
    /** The pool identification hash. */
    ident,
    assetA: {
      assetId: `${datum.assets[0][0]}.${datum.assets[0][1]}`,
      decimals: 6,
    },
    assetB: {
      assetId: `${datum.assets[1][0]}.${datum.assets[1][1]}`,
      decimals: 0,
    },
    assetLP: {
      assetId: DatumBuilderNftCheck.computePoolLqName(ident),
      decimals: 0,
    },
    liquidity: {
      aReserve: poolUtxo.output().amount().coin().valueOf(),
      bReserve: poolUtxo
        .output()
        .amount()
        .multiasset()!
        .get(Core.AssetId(datum.assets[1][0] + datum.assets[1][1]))!
        .valueOf(),
      lpTotal: datum.circulatingLp,
    },
    version,
    conditionDatum: `d8799f${conData.toCbor().toString()}ff`,
  });
  return {
    currentFee: Number(datum.askFeesPer_10Thousand / 10000n),
    /** The pool identification hash. */
    ident,
    assetA: {
      assetId: `${datum.assets[0][0]}.${datum.assets[0][1]}`,
      decimals: 6,
    },
    assetB: {
      assetId: `${datum.assets[1][0]}.${datum.assets[1][1]}`,
      decimals: 0,
    },
    assetLP: {
      assetId: DatumBuilderNftCheck.computePoolLqName(ident),
      decimals: 0,
    },
    liquidity: {
      aReserve: poolUtxo.output().amount().coin().valueOf(),
      bReserve: poolUtxo
        .output()
        .amount()
        .multiasset()!
        .get(Core.AssetId(datum.assets[1][0] + datum.assets[1][1]))!
        .valueOf(),
      lpTotal: datum.circulatingLp,
    },
    version,
    conditionDatum: `d8799f${conData.toCbor().toString()}ff`,
  };
}

function splitEncryptedText(encryptedText: string) {
  return {
    encryptedDataString: encryptedText.slice(56, -32),
    ivString: encryptedText.slice(0, 24),
    assocDataString: encryptedText.slice(24, 56),
    tagString: encryptedText.slice(-32),
  };
}

function passwordToHash(password: string): Buffer {
  return crypto.createHash("sha256").update(password).digest();
}

export function encrypt(
  plaintext: string,
  password: string,
  encoding:
    | "ascii"
    | "utf8"
    | "utf-8"
    | "utf16le"
    | "ucs2"
    | "ucs-2"
    | "base64"
    | "base64url"
    | "latin1"
    | "binary"
    | "hex" = "hex",
): string {
  const key = passwordToHash(password);
  try {
    const iv = crypto.randomBytes(12);
    const assocData = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv, {
      authTagLength: 16,
    });

    cipher.setAAD(assocData, { plaintextLength: Buffer.byteLength(plaintext) });

    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf-8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return (
      iv.toString(encoding) +
      assocData.toString(encoding) +
      encrypted.toString(encoding) +
      tag.toString(encoding)
    );
  } catch (e) {
    console.error(e);
    return "";
  }
}

export async function decrypt(
  cipherText: string,
  password: string,
  encoding:
    | "ascii"
    | "utf8"
    | "utf-8"
    | "utf16le"
    | "ucs2"
    | "ucs-2"
    | "base64"
    | "base64url"
    | "latin1"
    | "binary"
    | "hex" = "hex",
): Promise<string | undefined> {
  const key = passwordToHash(password);

  const { encryptedDataString, ivString, assocDataString, tagString } =
    splitEncryptedText(cipherText);

  try {
    const iv = Buffer.from(ivString, encoding);
    const encryptedText = Buffer.from(encryptedDataString, encoding);
    const tag = Buffer.from(tagString, encoding);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv, {
      authTagLength: 16,
    });
    decipher.setAAD(Buffer.from(assocDataString, encoding), {
      plaintextLength: encryptedDataString.length,
    });
    decipher.setAuthTag(Buffer.from(tag));

    const decrypted = decipher.update(encryptedText);
    return Buffer.concat([decrypted, decipher.final()]).toString();
  } catch (e) {
    console.log("Password incorrect!");
    console.log("Waiting 3 seconds before retry...");
    await setTimeout(3000);
    return undefined;
  }
}
