import {
  Blaze,
  Blockfrost,
  ColdWallet,
  Core,
  Maestro,
  Wallet,
  type Provider,
} from "@blaze-cardano/sdk";
import { SundaeSDK } from "@sundaeswap/core";
import type { IState } from "./types";

export async function getSDK(state: IState): Promise<SundaeSDK> {
  if (!state.blaze) {
    state.blaze = await getBlazeInstance(state);
  }
  return SundaeSDK.new({
    blazeInstance: state.blaze!,
  });
}

export async function getWallet(
  state: IState,
  provider: Provider,
): Promise<Wallet> {
  const address = Core.Address.fromBech32(state.settings.address!);
  const wallet = new ColdWallet(address, provider.network, provider);
  return wallet;
}

export async function getProvider(state: IState): Promise<Provider> {
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
  state: IState,
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
