import type { BrowserWallet } from "@meshsdk/core";
import type { Lucid } from "lucid-cardano";

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

export type TSupportedTxBuilder = Lucid | BrowserWallet;

export type TTxBuilderLoader = {
  loader: () => Promise<TSupportedTxBuilder>;
  type: ESupportedTxBuilders;
};

export interface ISundaeSDKConstructorArgs {
  TxBuilderLoader: TTxBuilderLoader;
  Network: TSupportedNetworks;
}
