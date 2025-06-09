import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import { EDatumType, IComposedTx, IPoolData } from "src/@types";
import { QueryProviderSundaeSwap } from "src/QueryProviders";

export abstract class TxBuilderAbstract {
  abstract getOrderAddress(address: string): Promise<string>;
  abstract getMaxScooperFeeAmount(): Promise<bigint>;
  abstract swap(args: unknown): Promise<IComposedTx>;
  abstract strategy(args: unknown): Promise<IComposedTx>;
  abstract cancel(args: unknown): Promise<IComposedTx>;
  abstract getDatumType(): EDatumType;
  abstract setQueryProvider(queryProvider: QueryProviderSundaeSwap): void;
  abstract getExtraSuppliedAssets(
    poolData: IPoolData,
  ): AssetAmount<IAssetAmountMetadata>[];
}
