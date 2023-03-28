import { AssetAmount } from "@sundaeswap/sdk-core";
import { FC, useCallback, useState } from "react";

import { useAppState } from "../../../state/context";
import { ActionArgs, poolQuery } from "../Actions";
import Button from "../../Button";
import type { Lucid } from "lucid-cardano";

export const Withdraw: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, walletAddress } = useAppState();
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setWithdrawing(true);
    try {
      const LPAssetId =
        "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702002";
      const balance = await SDK.build<Lucid>().wallet?.wallet.getUtxos();
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
        suppliedLPAsset: {
          assetId:
            "4086577ed57c514f8e29b78f42ef4f379363355a3b65b9a032ee30c9.6c702002",
          amount: new AssetAmount(lpBalance, 6),
        },
      }).then(async (res) => {
        if (submit) {
          const { cbor, submit, fees } = await res.sign().complete();
          setFees(fees);
          setCBOR({
            cbor,
            hash: await submit(),
          });
        } else {
          const { cbor, fees } = await res.complete();
          setFees(fees);
          setCBOR({
            cbor,
          });
        }
      });
    } catch (e) {
      console.log(e);
    }

    setWithdrawing(false);
  }, [SDK, submit, walletAddress]);

  if (!SDK) {
    return null;
  }

  return (
    <Button onClick={handleWithdraw} loading={withdrawing}>
      Withdraw tADA/tINDY
    </Button>
  );
};
