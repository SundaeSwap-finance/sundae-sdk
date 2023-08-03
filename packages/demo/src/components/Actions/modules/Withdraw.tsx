import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";
import type { Lucid } from "lucid-cardano";

import { useAppState } from "../../../state/context";
import { ActionArgs, poolQuery } from "../Actions";
import Button from "../../Button";

export const Withdraw: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, walletAddress, useReferral } = useAppState();
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setWithdrawing(true);
    try {
      const LPAssetId =
        "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702002";
      const balance = await SDK.build<any, Lucid>().wallet?.wallet.getUtxos();
      let lpBalance: bigint = 0n;
      balance?.forEach((bal) => {
        const matchingAsset = bal.assets[LPAssetId.replace(".", "")];
        if (matchingAsset) {
          lpBalance += matchingAsset;
        }
      });

      if (lpBalance === 0n) {
        throw new Error("You don't have any LP tokens! Deposit some to start.");
      }

      const pool = await SDK.query().findPoolData(poolQuery);
      await SDK.withdraw({
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
          },
        },
        pool,
        suppliedLPAsset: new AssetAmount(lpBalance, {
          assetId:
            "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702002",
          decimals: 6,
        }),
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
      }).then(async ({ sign, build, fees }) => {
        setFees(fees);
        if (submit) {
          const { cbor, submit } = await sign();
          setCBOR({
            cbor,
            hash: await submit(),
          });
        } else {
          const { cbor } = await build();
          setCBOR({
            cbor,
          });
        }
      });
    } catch (e) {
      console.log(e);
    }

    setWithdrawing(false);
  }, [SDK, submit, walletAddress, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleWithdraw} loading={withdrawing}>
      Withdraw tADA/tINDY
    </Button>
  );
};
