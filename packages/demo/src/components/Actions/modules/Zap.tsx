import { AssetAmount } from "@sundaeswap/asset";
import { EContractVersion, EDatumType } from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";

import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs, newPoolQuery, poolQuery } from "../Actions";

export const Zap: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, activeWalletAddr, useReferral, useV3Contracts } =
    useAppState();
  const [zapping, setZapping] = useState(false);

  const handleZap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setZapping(true);
    try {
      const pool = await SDK.query().findPoolData(
        useV3Contracts ? newPoolQuery : poolQuery
      );

      console.log(activeWalletAddr);

      await SDK.builder(
        useV3Contracts ? EContractVersion.V3 : EContractVersion.V1
      )
        .zap({
          pool,
          suppliedAsset: new AssetAmount(9999999n, pool.assetA),
          orderAddresses: {
            DestinationAddress: {
              address: activeWalletAddr,
              datum: {
                type: EDatumType.NONE,
              },
            },
          },
          swapSlippage: 0.3,
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

    setZapping(false);
  }, [SDK, submit, activeWalletAddr, useV3Contracts, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleZap} loading={zapping}>
      Zap tADA to tADA/tINDY ({useV3Contracts ? "V3" : "V1"})
    </Button>
  );
};
