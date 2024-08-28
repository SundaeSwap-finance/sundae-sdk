import { AssetAmount } from "@sundaeswap/asset";
import {
  EContractVersion,
  ESwapType,
  IOrderRouteSwapArgs,
  QueryProviderSundaeSwap,
  QueryProviderSundaeSwapLegacy,
} from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";
import { IActionArgs, poolQuery } from "../Actions";

import { useAppState } from "../../../state/context";
import Button from "../../Button";

enum ERoute {
  V1TOV1 = "V1 to V1",
  V1TOV3 = "V1 to V3",
  V3TOV3 = "v3 to V3",
  V3TOV1 = "v3 to V1",
}

type TDirection = "forward" | "backward";

export const OrderRouting: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, activeWalletAddr, useReferral, builderLib } =
    useAppState();

  const [direction, setDirection] = useState<TDirection>("forward");
  const [route, setRoute] = useState<ERoute>(ERoute.V1TOV1);
  const [swapping, setSwapping] = useState(false);

  const handleSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setSwapping(true);
    try {
      const v1PoolTIndy = await new QueryProviderSundaeSwapLegacy(
        "preview"
      ).findPoolData(poolQuery);
      const v1PoolRberry = await new QueryProviderSundaeSwapLegacy(
        "preview"
      ).findPoolData({
        pair: [
          "",
          "d441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf.524245525259",
        ],
        fee: "0.05",
        ident: "00",
      });
      const v3PoolTIndy = await new QueryProviderSundaeSwap(
        "preview"
      ).findPoolData({
        ident: "2e74e6af9739616dd021f547bca1f68c937b566bb6ca2e4782e76001",
      });
      const v3PoolRberry = await new QueryProviderSundaeSwap(
        "preview"
      ).findPoolData({
        ident: "bd9437d9ec1a559d053f05dc38d337c32d1d0746952ea961f874c39a",
      });

      // Determine the appropriate pool for swapA based on the route
      const swapAPool =
        route === ERoute.V1TOV1 || route === ERoute.V1TOV3
          ? v1PoolTIndy
          : v3PoolTIndy;

      // Determine the appropriate pool for swapB based on the route
      const swapBPool =
        route === ERoute.V3TOV3 || route === ERoute.V1TOV3
          ? v3PoolRberry
          : v1PoolRberry;

      const args: IOrderRouteSwapArgs = {
        ownerAddress: activeWalletAddr,
        swapA: {
          swapType: {
            type: ESwapType.MARKET,
            slippage: 0.3,
          },
          pool: direction === "forward" ? swapAPool : swapBPool,
          suppliedAsset: new AssetAmount(
            25000000n,
            direction === "forward" ? swapAPool.assetB : swapBPool.assetB
          ),
        },
        swapB: {
          swapType: {
            type: ESwapType.MARKET,
            slippage: 0.3,
          },
          pool: direction === "forward" ? swapBPool : swapAPool,
        },
      };

      if (useReferral) {
        args.swapA.referralFee = {
          destination:
            "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
          payment: new AssetAmount(1000000n, {
            assetId: "",
            decimals: 6,
          }),
          feeLabel: "Test Fee",
        };

        args.swapB.referralFee = {
          destination:
            "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
          payment: new AssetAmount(1000000n, {
            assetId: "",
            decimals: 6,
          }),
          feeLabel: "Test Fee",
        };
      }

      await SDK.builder(
        route === ERoute.V3TOV1 || route === ERoute.V3TOV3
          ? EContractVersion.V3
          : EContractVersion.V1,
        builderLib
      )
        .orderRouteSwap(args)
        .then(async ({ build, fees }) => {
          setFees(fees);
          const builtTx = await build();
          setCBOR({
            cbor: builtTx.cbor,
          });

          if (submit) {
            const { cbor, submit } = await builtTx.sign();
            setCBOR({
              cbor,
              hash: await submit(),
            });
          }
        });
    } catch (e) {
      console.log(e);
    }

    setSwapping(false);
  }, [
    SDK,
    submit,
    activeWalletAddr,
    useReferral,
    route,
    direction,
    builderLib,
  ]);

  if (!SDK) {
    return null;
  }

  return (
    <>
      <Button disabled={!ready} onClick={handleSwap} loading={swapping}>
        {direction === "forward"
          ? "Swap TINDY for RBERRY"
          : "Swap RBERRY for TINDY"}
      </Button>
      <div className="flex justify-between items-center gap-4">
        <select
          className="mr-4 w-full rounded-md bg-slate-800 px-4 py-2"
          value={route}
          onChange={(e) => {
            setRoute(e.target.value as ERoute);
          }}
        >
          <option value={ERoute.V1TOV1}>{ERoute.V1TOV1}</option>
          <option value={ERoute.V1TOV3}>{ERoute.V1TOV3}</option>
          <option value={ERoute.V3TOV3}>{ERoute.V3TOV3}</option>
          <option value={ERoute.V3TOV1}>{ERoute.V3TOV1}</option>
        </select>
        <select
          className="mr-4 w-full rounded-md bg-slate-800 px-4 py-2"
          value={direction}
          onChange={(e) => {
            setDirection(e.target.value as TDirection);
          }}
        >
          <option value="forward">TINDY to RBERRY</option>
          <option value="backward">RBERRY to TINDY</option>
        </select>
      </div>
    </>
  );
};
