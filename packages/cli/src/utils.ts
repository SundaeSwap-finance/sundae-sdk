/* eslint-disable no-console */
import { Core } from "@blaze-cardano/sdk";
import { input } from "@inquirer/prompts";
import {
  DatumBuilderNftCheck,
  DatumBuilderV3,
  EContractVersion,
  TxBuilderStableswaps,
  TxBuilderV3,
  type IPoolData,
} from "@sundaeswap/core";
import type { IAppContext } from "./types.js";
import * as crypto from "crypto";
import { setTimeout } from "timers/promises";

export function prettyAssetId(assetId: string): string {
  const assetIdParts = assetId.includes(".")
    ? assetId.split(".")
    : [assetId.substring(0, 56), assetId.substring(56)];
  const policyId = assetIdParts[0]!;
  const assetName = assetIdParts[1]!;
  const decoded = Buffer.from(assetName, "hex").toString();
  // Strip control/non-printable characters (keep printable ASCII + common unicode)
  const sanitized = decoded.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  // Fall back to hex if nothing printable remains
  const prettyAssetName = sanitized.length > 0 ? sanitized : assetName;
  return `${policyId}.${prettyAssetName}`;
}

export async function getPoolData(
  ctx: IAppContext,
  ident: string,
  version: EContractVersion,
): Promise<IPoolData> {
  if (
    version !== EContractVersion.Stableswaps &&
    version !== EContractVersion.V3
  ) {
    throw new Error("Only Stableswaps and V3 versions are supported");
  }
  const sdk = await ctx.sdk();

  if (version === EContractVersion.V3) {
    const builder = sdk.builder(version) as TxBuilderV3;
    const { hash: poolPolicyId } =
      await builder.getValidatorScript("pool.mint");
    console.log("Pool Policy ID: ", poolPolicyId);
    const poolNft = DatumBuilderV3.computePoolNftName(ident);
    console.log("Pool NFT: ", poolNft);
    const poolUtxo = await sdk
      .blaze()
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

    const assetAId =
      datum.assets[0][0] === ""
        ? "lovelace"
        : `${datum.assets[0][0]}.${datum.assets[0][1]}`;
    const assetBId =
      datum.assets[1][0] === ""
        ? "lovelace"
        : `${datum.assets[1][0]}.${datum.assets[1][1]}`;

    // Get reserves from the pool UTxO
    const getAssetReserve = (policyId: string, assetName: string): bigint => {
      if (policyId === "") {
        return poolUtxo.output().amount().coin();
      }
      const multiasset = poolUtxo.output().amount().multiasset();
      if (!multiasset) return 0n;
      const value = multiasset.get(Core.AssetId(policyId + assetName));
      return value ?? 0n;
    };

    return {
      currentFee:
        (Number(datum.bidFeesPer_10Thousand) +
          Number(datum.askFeesPer_10Thousand)) /
        2 /
        10000,
      ident,
      assetA: {
        assetId: assetAId,
        decimals: 6,
      },
      assetB: {
        assetId: assetBId,
        decimals: 6,
      },
      assetLP: {
        assetId: `${poolPolicyId}.${DatumBuilderV3.computePoolLqName(ident)}`,
        decimals: 0,
      },
      liquidity: {
        aReserve: getAssetReserve(datum.assets[0][0], datum.assets[0][1]),
        bReserve: getAssetReserve(datum.assets[1][0], datum.assets[1][1]),
        lpTotal: datum.circulatingLp,
      },
      version,
    };
  }

  // Stableswaps version
  const builder = sdk.builder(version) as TxBuilderStableswaps;
  const { hash: poolPolicyId } = await builder.getValidatorScript("pool.mint");
  console.log("Pool Policy ID: ", poolPolicyId);
  const poolNft = DatumBuilderNftCheck.computePoolNftName(ident);
  console.log("Pool NFT: ", poolNft);
  const poolUtxo = await sdk
    .blaze()
    .provider.getUnspentOutputByNFT(
      Core.AssetId.fromParts(
        Core.PolicyId(poolPolicyId),
        Core.AssetName(poolNft),
      ),
    );
  console.log(builder.datumBuilder);

  const datum = builder.datumBuilder.decodeDatum(
    poolUtxo.output().datum()!.asInlineData()!,
  );
  console.log("Datum: ", datum);
  await input({ message: "Press enter to continue" });
  return {
    currentFee: Number(datum.lpFeeBasisPoints[0]) / 10000,
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
      aReserve: poolUtxo
        .output()
        .amount()
        .multiasset()!
        .get(Core.AssetId(datum.assets[1][0] + datum.assets[1][1]))!
        .valueOf(),
      bReserve: poolUtxo
        .output()
        .amount()
        .multiasset()!
        .get(Core.AssetId(datum.assets[0][0] + datum.assets[0][1]))!
        .valueOf(),
      lpTotal: datum.circulatingLp,
    },
    version,
    linearAmplificationFactor: datum.linearAmplification,
    protocolFee: Number(datum.protocolFeeBasisPoints[0]) / 10000,
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
