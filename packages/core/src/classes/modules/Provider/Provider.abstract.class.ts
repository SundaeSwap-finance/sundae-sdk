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

export abstract class Provider {
  protected abstract baseUrl: string;

  abstract findPoolData(
    tickerA: string,
    tickerB: string,
    fee: string
  ): Promise<IPoolData>;

  abstract findPoolIdent(
    tickerA: string,
    tickerB: string,
    fee: string
  ): Promise<string>;
}
