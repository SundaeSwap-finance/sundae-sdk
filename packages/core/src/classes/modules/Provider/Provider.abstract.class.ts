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

export abstract class Provider {
  protected abstract baseUrl: string;

  /**
   * Finds a matching pool on the SundaeSwap protocol.
   *
   * @param pair An array of the hex-encoded assetIDs in the pool, separated by a period (i.e. POLICY_ID.ASSET_NAME).
   * @param fee A string representation of the pool fee, as a float (i.e. "0.03").
   */
  abstract findPoolData({
    pair: [coinA, coinB],
    fee,
  }: IPoolQuery): Promise<IPoolData>;

  /**
   * Finds a matching pool on the SundaeSwap protocol and returns only the ident.
   *
   * @param pair An array of the hex-encoded assetIDs in the pool, separated by a period (i.e. POLICY_ID.ASSET_NAME).
   * @param fee A string representation of the pool fee, as a float (i.e. "0.03").
   */
  abstract findPoolIdent({
    pair: [coinA, coinB],
    fee,
  }: IPoolQuery): Promise<string>;
}
