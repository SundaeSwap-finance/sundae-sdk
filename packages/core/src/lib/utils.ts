import type { Provider } from "lucid-cardano";
import {
  ESupportedTxBuilders,
  ESupportedWallets,
  IAsset,
  IAssetParsedID,
  TSupportedNetworks,
  TTxBuilderLoader,
} from "../types";
import { ERROR_CODES } from "./errors";

export const toLovelace = (val: BigInt, decimals: number) =>
  Math.floor(Number(val) * Math.pow(10, decimals));
export const fromLovelace = (val: BigInt, decimals: number) =>
  Math.floor(Number(val) / Math.pow(10, decimals));
export const getAssetIDs = (asset: IAsset): IAssetParsedID => {
  const {
    metadata: { assetID },
  } = asset;

  if (assetID.length > 56 && 56 !== assetID.indexOf(".")) {
    console.error(ERROR_CODES[2]);
    throw new Error(ERROR_CODES[2].message);
  }

  const policy = assetID.slice(0, 56);
  const name = assetID.slice(58);

  return {
    name,
    policy,
    concatenated: `${policy}${name}`,
  };
};

export const makeLucidLoader = ({
  provider,
  network,
}: {
  provider: Provider;
  network: TSupportedNetworks;
}): TTxBuilderLoader => ({
  type: ESupportedTxBuilders.Lucid,
  loader: () =>
    import("lucid-cardano").then(({ Lucid }) => Lucid.new(provider, network)),
});

export const makeMeshLoader = ({
  wallet,
}: {
  wallet: ESupportedWallets;
}): TTxBuilderLoader => ({
  type: ESupportedTxBuilders.Mesh,
  loader: () =>
    import("@meshsdk/core").then(({ BrowserWallet }) =>
      BrowserWallet.enable(wallet)
    ),
});
