import type { BrowserWallet } from "@meshsdk/core";
import type { Lucid } from "lucid-cardano";
import { TxBuilderLucid } from "./classes/modules/TxBuilder/TxBuilder.Lucid.class";
import { TxBuilderMesh } from "./classes/modules/TxBuilder/TxBuilder.Mesh.class";

export type TSupportedNetworks = "Mainnet" | "Preview";

export interface IParams {
  ESCROW_ADDRESS: string;
  SCOOPER_FEE: bigint;
  RIDER_FEE: bigint;
}

export interface IAssetMetadata extends Record<string, unknown> {
  assetID: string;
  decimals: number;
}

export interface IAssetParsedID {
  name: string;
  policy: string;
  concatenated: string;
}

export interface IAsset {
  amount: bigint;
  metadata: IAssetMetadata;
}

export interface IGetSwapArgs {
  poolIdent: string;
  asset: IAsset;
  minimumReceivableAsset?: bigint;
  submit?: boolean;
  swapDirection?: 0 | 1;
}

export interface ISwapResponse {
  data: string;
  ttl: number;
}

export enum ESupportedTxBuilders {
  Lucid = "lucid",
  Mesh = "mesh",
}

export enum ESupportedWallets {
  Nami = "nami",
  Eternl = "eternl",
  TyphonCip30 = "typhoncip30",
  CCVault = "ccvault",
  Typhon = "typhon",
  Yoroi = "yoroi",
  Flint = "flint",
  Gero = "gerowallet",
  CardWallet = "cardwallet",
  NuFi = "nufi",
  Begin = "begin",
}

export type TTxBuilderInstances = TxBuilderMesh | TxBuilderLucid;
export type TSupportedTxBuilderLibs = Lucid | BrowserWallet;

export type TTxBuilderLoader = {
  loader: () => Promise<TSupportedTxBuilderLibs>;
  type: ESupportedTxBuilders;
};

export interface ISundaeSDKConstructorArgs {
  TxBuilderLoader: TTxBuilderLoader;
  Network: TSupportedNetworks;
  wallet: ESupportedWallets;
}
