interface ISwapArgs {
  poolQuery: IPoolQuery;
  suppliedAsset: TSwapAsset;
  receiverAddress: string;
  additionalCanceler?: string;
  minReceivable?: AssetAmount;
}
