import { AssetAmount, IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  EContractVersion,
  ESwapType,
  IOrderRouteSwapV4Args,
  QueryProviderSundaeSwap,
  SundaeUtils,
  TChainLeg,
} from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";

import { Core } from "@blaze-cardano/sdk";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs } from "../Actions";

// Preview assets and pools. Every v4 pool holding ADA is a banded
// concentrated-liquidity pool, which the SDK cannot quote client-side, so the
// v4 orders are priced from the API's own quotes.
const PREVIEW_API = "https://api.preview.sundae.fi/graphql";
const USDM: IAssetAmountMetadata = {
  assetId:
    "d8906ca5c7ba124a0407a32dab37b2c82b13b3dcd9111e42940dcea4.0014df105553444d",
  decimals: 6,
};
const MINT: IAssetAmountMetadata = {
  assetId: "09169bb6f5ff5b246d65d65935b2222cc53b5e677d7ed22771878972.4d494e54",
  decimals: 6,
};
const V3_ADA_USDM = "35a34996f515c5a28c8df9eada81f03f4f2756d92e7f73cde1f4e593";

const OFFERED_ADA = 25_000_000n;
const SLIPPAGE = 0.05;

enum ERoute {
  V4TOV3 = "v4 ADA→USDM, v3 USDM→ADA",
  V4TOV3TOV4 = "v4 ADA→USDM, v3 USDM→ADA, v4 ADA→MINT",
}

/**
 * The least a v4 order swapping `amount` of `given` into `taken` should get:
 * the worst of the API's plans that use only v4 pools, less slippage. Taking
 * the worst plan keeps the order fillable however the scooper routes it.
 */
const v4Floor = async (
  given: IAssetAmountMetadata,
  taken: IAssetAmountMetadata,
  amount: bigint,
): Promise<AssetAmount<IAssetAmountMetadata>> => {
  const response = await fetch(PREVIEW_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($given: ID!, $taken: ID!, $amount: BigInteger!, $maxFee: BigInteger!) {
        pools { quote(givenAsset: $given, takenAsset: $taken, amount: $amount, maxFee: $maxFee) {
          output { quantity }
          steps { pool { version } }
        } }
      }`,
      variables: {
        given: given.assetId,
        taken: taken.assetId,
        amount: amount.toString(),
        maxFee: "5000000",
      },
    }),
  });
  const { data } = (await response.json()) as {
    data?: {
      pools: {
        quote: {
          output: { quantity: string };
          steps: { pool: { version: string } }[];
        }[];
      };
    };
  };
  const outputs = (data?.pools.quote ?? [])
    .filter((plan) => plan.steps.every(({ pool }) => pool.version === "V4"))
    .map((plan) => BigInt(plan.output.quantity));
  if (outputs.length === 0) {
    throw new Error(
      `No v4-only quote for ${given.assetId} -> ${taken.assetId}.`,
    );
  }
  const worst = outputs.reduce((a, b) => (a < b ? a : b));
  const keepBps = BigInt(Math.round((1 - SLIPPAGE) * 10_000));
  return new AssetAmount((worst * keepBps) / 10_000n, taken);
};

/**
 * Places a chain that starts on v4 with `TxBuilderV4.orderRouteSwap`, so it
 * can be run end to end on preview with nothing but tADA.
 */
export const V4OrderRouting: FC<IActionArgs> = ({
  setCBOR,
  setFees,
  submit,
}) => {
  const { SDK, ready, activeWalletAddr, useReferral } = useAppState();
  const [route, setRoute] = useState<ERoute>(ERoute.V4TOV3);
  const [swapping, setSwapping] = useState(false);

  const handleSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setSwapping(true);
    try {
      const v3Pool = await new QueryProviderSundaeSwap("preview").findPoolData({
        ident: V3_ADA_USDM,
      });

      const usdmFloor = await v4Floor(ADA_METADATA, USDM, OFFERED_ADA);
      const v3Leg = {
        swapType: { type: ESwapType.MARKET as const, slippage: SLIPPAGE },
        pool: v3Pool,
      };
      const legs: IOrderRouteSwapV4Args["legs"] = [
        {
          offered: new AssetAmount(OFFERED_ADA, ADA_METADATA),
          minReceived: usdmFloor,
          ...(useReferral
            ? {
                referralFee: {
                  destination: activeWalletAddr,
                  payment: new Core.Value(1_000_000n),
                  feeLabel: "Demo Fee",
                },
              }
            : {}),
        },
        v3Leg,
      ];

      if (route === ERoute.V4TOV3TOV4) {
        // The last order is priced from the least the v3 order can deliver.
        const adaFloor = SundaeUtils.getMinReceivableFromSlippage(
          v3Pool,
          usdmFloor,
          SLIPPAGE,
        );
        const lastLeg: TChainLeg = {
          contractVersion: EContractVersion.V4,
          minReceived: await v4Floor(ADA_METADATA, MINT, adaFloor.amount),
        };
        legs.push(lastLeg);
      }

      const { build, fees } = await SDK.builder(
        EContractVersion.V4,
      ).orderRouteSwap({ ownerAddress: activeWalletAddr, legs });
      setFees(fees);
      const builtTx = await build();

      if (submit) {
        const { cbor, submit: submitTx } = await builtTx.sign();
        setCBOR({ cbor, hash: await submitTx() });
      } else {
        setCBOR({ cbor: builtTx.cbor });
      }
    } catch (e) {
      console.log(e);
    }

    setSwapping(false);
  }, [SDK, submit, activeWalletAddr, useReferral, route]);

  if (!SDK) {
    return null;
  }

  return (
    <>
      <Button disabled={!ready} onClick={handleSwap} loading={swapping}>
        Chain from v4: swap 25 tADA
      </Button>
      <select
        className="w-full rounded-md bg-slate-800 px-4 py-2"
        value={route}
        onChange={(e) => setRoute(e.target.value as ERoute)}
      >
        <option value={ERoute.V4TOV3}>{ERoute.V4TOV3}</option>
        <option value={ERoute.V4TOV3TOV4}>{ERoute.V4TOV3TOV4}</option>
      </select>
    </>
  );
};
