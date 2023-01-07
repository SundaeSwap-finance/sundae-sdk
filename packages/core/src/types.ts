export interface IProtocolParams {
  ESCROW_ADDRESS: string;
  SCOOPER_FEE: bigint;
  RIDER_FEE: bigint;
}

export interface IPoolDataAsset {
  assetId: string;
  decimals: number;
}

export interface IPoolData {
  fee: string;
  ident: string;
  assetA: IPoolDataAsset;
  assetB: IPoolDataAsset;
}

export interface IPoolQuery {
  pair: [string, string];
  fee: string;
}

export interface IProviderClass {
  /**
   * Finds a matching pool on the SundaeSwap protocol.
   *
   * @param pair An array of the hex-encoded assetIDs in the pool, separated by a period (i.e. POLICY_ID.ASSET_NAME).
   * @param fee A string representation of the pool fee, as a float (i.e. "0.03").
   */
  findPoolData: (query: IPoolQuery) => Promise<IPoolData>;

  /**
   * Finds a matching pool on the SundaeSwap protocol and returns only the ident.
   *
   * @param pair An array of the hex-encoded assetIDs in the pool, separated by a period (i.e. POLICY_ID.ASSET_NAME).
   * @param fee A string representation of the pool fee, as a float (i.e. "0.03").
   */
  findPoolIdent: (query: IPoolQuery) => Promise<string>;
}

export interface ISwapArgs {
  poolQuery: IPoolQuery;
  suppliedAsset: TSwapAsset;
  receiverAddress: string;
  additionalCanceler?: string;
  minReceivable?: IAssetAmountClass;
}

export interface SundaeSDKClass {
  swap: ({
    poolQuery,
    suppliedAsset,
    receiverAddress,
    additionalCanceler,
    minReceivable,
  }: ISwapArgs) => Promise<TTxBuilderComplete>;
}

export type TSupportedWallets =
  | "nami"
  | "eternl"
  | "typhoncip30"
  | "ccvault"
  | "typhon"
  | "yoroi"
  | "flint"
  | "gerowallet"
  | "cardwallet"
  | "nufi"
  | "begin";

export type TTxBuilderComplete = {
  cbor: string;
  submit: () => Promise<string>;
};

export interface IParams {
  ESCROW_ADDRESS: string;
  SCOOPER_FEE: bigint;
  RIDER_FEE: bigint;
}

export type TSupportedNetworks = "mainnet" | "preview";

export interface ITxBuilderOptions {
  wallet: TSupportedWallets;
  network: TSupportedNetworks;
}

export interface ITxBuilderLucidOptions extends ITxBuilderOptions {
  provider: "blockfrost";
  blockfrost?: {
    url: string;
    apiKey: string;
  };
}

export interface IAssetAmountClass {
  amount: bigint;
  decimals: number;

  getRawAmount(decimals?: number): bigint;

  getAmount(): bigint;

  getDecimals(): number;
}

export interface IBuildSwapArgs {
  pool: IPoolData;
  suppliedAsset: TSwapAsset;
  receiverAddress: string;
  additionalCanceler?: string;
  minReceivable?: IAssetAmountClass;
}

export type TSwapAsset = {
  assetID: string;
  amount: IAssetAmountClass;
};

export interface ITxBuilderClass<
  Options = Object,
  Lib = unknown,
  Data = unknown,
  Tx = unknown
> {
  provider: IProviderClass;
  options: Options;
  lib?: Lib;
  currentTx?: Tx;
  currentDatum?: Data;

  // Main builder methods.
  buildSwap: (args: IBuildSwapArgs) => Promise<TTxBuilderComplete>;

  buildDatumDestination: (
    paymentCred: string,
    stakeCred?: string,
    datum?: Data
  ) => Promise<Data>;

  buildDatumCancelSignatory: (address?: string) => Promise<Data>;

  buildSwapDatum: (
    givenAsset: TSwapAsset,
    assetA: IPoolDataAsset,
    assetB: IPoolDataAsset,
    minimumReceivable: IAssetAmountClass
  ) => Promise<Data>;

  asyncGetLib: () => Promise<Lib>;
}
