import {
  Blaze,
  Blockfrost,
  ColdWallet,
  Core,
  Maestro,
  Wallet,
  type Provider,
} from "@blaze-cardano/sdk";
import { input } from "@inquirer/prompts";
import {
  DatumBuilderNftCheck,
  EContractVersion,
  TxBuilderNftCheck,
  type IPoolData,
} from "@sundaeswap/core";
import type { State } from "./types";

export async function getWallet(
  state: State,
  provider: Provider,
): Promise<Wallet> {
  const address = Core.Address.fromBech32(state.settings.address!);
  const wallet = new ColdWallet(address, provider.network, provider);
  return wallet;
}

export async function getProvider(state: State): Promise<Provider> {
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
  const builder = state.sdk!.builders.get(
    EContractVersion.NftCheck,
  )! as TxBuilderNftCheck;
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
    currentFee: Number(datum.askFeePer10Thousand) / 10000,
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
    currentFee: Number(datum.askFeePer10Thousand / 10000n),
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
