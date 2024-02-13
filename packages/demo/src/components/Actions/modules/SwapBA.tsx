import { AssetAmount } from "@sundaeswap/asset";
import { EContractVersion, EDatumType, ESwapType } from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs, newPoolQuery, poolQuery } from "../Actions";

export const SwapBA: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const {
    SDK,
    ready,
    activeWalletAddr: walletAddress,
    useReferral,
    useV3Contracts,
  } = useAppState();
  const [swapping, setSwapping] = useState(false);

  const handleSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setSwapping(true);
    try {
      const pool = await SDK.query().findPoolData(
        useV3Contracts ? newPoolQuery : poolQuery
      );
      await SDK.builder(
        useV3Contracts ? EContractVersion.V3 : EContractVersion.V1
      )
        .swap({
          swapType: {
            type: ESwapType.MARKET,
            slippage: 0.03,
          },
          pool,
          orderAddresses: {
            DestinationAddress: {
              address: walletAddress,
              datum: {
                type: EDatumType.NONE,
              },
            },
          },
          suppliedAsset: new AssetAmount(20000000n, pool.assetB),
          ...(useReferral
            ? {
                referralFee: {
                  destination:
                    "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
                  payment: new AssetAmount(1000000n, {
                    assetId: "",
                    decimals: 6,
                  }),
                },
              }
            : {}),
        })
        .then(async ({ build, fees }) => {
          setFees(fees);
          const builtTx = await build();

          if (submit) {
            const { cbor, submit } = await builtTx.sign();
            setCBOR({
              cbor,
              hash: await submit(),
            });
          } else {
            setCBOR({
              cbor: builtTx.cbor,
            });
          }
        });
    } catch (e) {
      console.log(e);
    }

    setSwapping(false);
  }, [SDK, submit, walletAddress, useReferral, useV3Contracts]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleSwap} loading={swapping}>
      Swap tINDY for tADA ({useV3Contracts ? "V3" : "V1"})
    </Button>
  );
};
