import type { BrowserWallet, Data, Transaction } from "@meshsdk/core";
import type { Constr, Lucid, Tx } from "lucid-cardano";
import { IPoolData } from "src/classes/modules/Provider/Provider.abstract.class";

export type TSupportedNetworks = "mainnet" | "preview";

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

export type TSupportedTxBuilders = "lucid" | "mesh";

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

export type TSupportedTxBuilderLibs = Lucid | BrowserWallet;
export type TSupportedTxBuilderOptions = TLucidArgs | TMeshArgs;
export type TSupportedTxBuilderTxTypes = Tx | Transaction;

export interface ITxBuilderLoaderOptions {
  lucid?: TLucidArgs;
  mesh?: TMeshArgs;
}

export type TLucidArgs = {
  wallet: ESupportedWallets;
  network: TSupportedNetworks;
  provider: "blockfrost";
  blockfrost?: {
    url: string;
    apiKey: string;
  };
};

export type TMeshArgs = {
  wallet: ESupportedWallets;
  network: TSupportedNetworks;
};

export type TDatumType<T = any> = Constr<T> | Data;
export type TTxBuilderComplete = {
  cbor: string;
  submit: () => Promise<string>;
};

export type TSwapAsset = {
  name: string;
  amount: bigint;
};

export interface IBuildSwapArgs {
  givenAsset: TSwapAsset;
  receiverAddress: string;
  poolData: IPoolData;
  additionalCanceler?: string;
  minReceivable?: bigint;
}
