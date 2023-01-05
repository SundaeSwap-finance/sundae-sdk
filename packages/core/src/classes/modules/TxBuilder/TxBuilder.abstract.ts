import type { Data as MeshData } from "@meshsdk/core";
import type { Data } from "lucid-cardano";

import {
  TDatumType,
  TSupportedTxBuilderLibs,
  TTxBuilderComplete,
  TSupportedTxBuilderOptions,
  TSupportedTxBuilderTxTypes,
  IBuildSwapArgs,
  TSupportedNetworks,
  IParams,
  TSwapAsset,
} from "../../../types";
import { AssetAmount } from "../../../classes/utilities/AssetAmount.class";
import { IPoolDataAsset, Provider } from "../Provider/Provider.abstract.class";

export abstract class TxBuilder {
  protected protocolParams: Record<TSupportedNetworks, IParams> = {
    mainnet: {
      ESCROW_ADDRESS: "",
      SCOOPER_FEE: 2500000n,
      RIDER_FEE: 2000000n,
    },
    preview: {
      ESCROW_ADDRESS:
        "addr_test1wpesulg5dtt5y73r4zzay9qmy3wnlrxdg944xg4rzuvewls7nrsf0",
      SCOOPER_FEE: 2500000n,
      RIDER_FEE: 2000000n,
    },
  };

  abstract provider: Provider;
  abstract options: TSupportedTxBuilderOptions;
  protected abstract lib?: TSupportedTxBuilderLibs;
  protected abstract currentTx?: TSupportedTxBuilderTxTypes;
  protected abstract currentDatum?: TDatumType;

  // Main builder methods.
  abstract buildSwap(args: IBuildSwapArgs): Promise<TTxBuilderComplete>;

  protected abstract buildDatumDestination(
    paymentCred: string,
    stakeCred?: string,
    datum?: Data | MeshData
  ): Promise<Data | MeshData>;

  protected abstract buildDatumCancelSignatory(
    address?: string
  ): Promise<Data | MeshData>;

  protected abstract buildSwapDatum(
    givenAsset: TSwapAsset,
    assetA: IPoolDataAsset,
    assetB: IPoolDataAsset,
    minimumReceivable: AssetAmount
  ): Promise<Data | MeshData>;

  // Class utility methods.
  protected abstract getLib(): Promise<TSupportedTxBuilderLibs>;
  protected abstract createCurrentTx(): Promise<TSupportedTxBuilderTxTypes>;

  protected sortSwapAssets(assets: [IPoolDataAsset, IPoolDataAsset]) {
    return assets.sort((a, b) => a.assetId.localeCompare(b.assetId));
  }

  protected getSwapDirection(
    { assetID }: TSwapAsset,
    assets: [IPoolDataAsset, IPoolDataAsset]
  ): 0 | 1 {
    const sorted = this.sortSwapAssets(assets);
    if (Object.values(sorted[1]).includes(assetID)) {
      return 1;
    }

    return 0;
  }

  getParams(): IParams {
    return this.protocolParams[this.options.network];
  }
}
