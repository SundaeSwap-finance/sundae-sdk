export type TSupportedNetworks = "Mainnet" | "Preview";

export interface IParams {
  ESCROW_ADDRESS: string;
  SCOOPER_FEE: bigint;
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
  walletHash: string;
  swapFromAsset?: boolean;
  minimumReceivableAsset?: bigint;
}
