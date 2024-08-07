import {
  AssetAmount,
  AssetRatio,
  type IAssetAmountMetadata,
} from "@sundaeswap/asset";
import type { EContractVersion, IPoolData } from "@sundaeswap/core";
import { useMemo, type FC } from "react";

import { SundaeUtils } from "@sundaeswap/core/utilities";
import { ErrorWrap } from "../components/ErrorWrap.js";
import { WidgetContainer } from "../components/WidgetContainer.js";
import { OrderContextProvider } from "../state/OrderContext/context.js";
import { IOrderContextProviderProps } from "../state/OrderContext/types.js";

export interface ISwapWidgetProps {
  settings: {
    // Defaults to ADA
    givenAssetMetadata?: IAssetAmountMetadata;
    pool: IPoolData;
  };
}

export const SwapComponent: FC<ISwapWidgetProps> = ({ settings }) => {
  const seed: IOrderContextProviderProps["seed"] = useMemo(() => {
    let givenAssetMetadata: IAssetAmountMetadata = settings.pool.assetA;
    let takenAssetMetadata: IAssetAmountMetadata = settings.pool.assetB;

    if (
      settings.givenAssetMetadata &&
      SundaeUtils.isAssetIdsEqual(
        settings.givenAssetMetadata.assetId,
        settings.pool.assetB.assetId
      )
    ) {
      givenAssetMetadata = settings.pool.assetB;
      takenAssetMetadata = settings.pool.assetA;
    }

    return {
      assets: {
        given: new AssetAmount(0n, givenAssetMetadata),
        taken: new AssetAmount(0n, takenAssetMetadata),
      },
      ratio: new AssetRatio(
        new AssetAmount(
          settings.pool.liquidity.aReserve,
          settings.pool.assetA as IAssetAmountMetadata
        ),
        new AssetAmount(
          settings.pool.liquidity.bReserve,
          settings.pool.assetB as IAssetAmountMetadata
        ),
        settings.pool
      ),
      flowData: {
        contractVersion: settings.pool.version as EContractVersion,
      },
    };
  }, [settings]);

  return (
    <OrderContextProvider seed={seed}>
      <ErrorWrap>
        <WidgetContainer>My widget</WidgetContainer>
      </ErrorWrap>
    </OrderContextProvider>
  );
};
