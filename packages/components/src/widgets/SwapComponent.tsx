import {
  AssetAmount,
  AssetRatio,
  type IAssetAmountMetadata,
} from "@sundaeswap/asset";
import type { EContractVersion, IPoolData } from "@sundaeswap/core";
import { useMemo, type FC } from "react";

import { ErrorWrap } from "../components/ErrorWrap.js";
import { WidgetContainer } from "../components/WidgetContainer.js";
import { OrderContextProvider } from "../state/OrderContext/context.js";
import { IOrderContextProviderProps } from "../state/OrderContext/types.js";

export interface ISwapWidgetProps {
  settings: {
    // Defaults to ADA
    givenAssetMetadata?: IAssetAmountMetadata;
    takenAssetMetadata: IAssetAmountMetadata;
    pool: IPoolData;
  };
}

export const SwapComponent: FC<ISwapWidgetProps> = ({ settings }) => {
  const seed: IOrderContextProviderProps["seed"] = useMemo(() => {
    return {
      assets: {
        given: new AssetAmount(0n, settings.givenAssetMetadata),
        taken: new AssetAmount(0n, settings.takenAssetMetadata),
      },
      ratio: new AssetRatio(
        new AssetAmount(
          settings.pool.liquidity.aReserve,
          settings.givenAssetMetadata
        ),
        new AssetAmount(
          settings.pool.liquidity.bReserve,
          settings.takenAssetMetadata
        )
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
