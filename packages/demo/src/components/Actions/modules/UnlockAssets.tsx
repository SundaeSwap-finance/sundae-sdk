import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";

import { EDatumType } from "@sundaeswap/core";
import { YieldFarmingLucid } from "@sundaeswap/yield-farming";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs } from "../Actions";

export const Unlock: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, activeWalletAddr, useReferral } = useAppState();
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (!SDK) {
      return;
    }

    const txHash = prompt("txHash");
    const index = prompt("index");

    if (!txHash || !index) {
      return;
    }

    const YF = new YieldFarmingLucid(SDK.builder().lucid);

    setUnlocking(true);
    try {
      await YF.unlock({
        ownerAddress: {
          address: activeWalletAddr,
          datum: {
            type: EDatumType.NONE,
          },
        },
        existingPositions: [
          {
            hash: txHash,
            index: Number(index),
          },
        ],
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
        // @ts-ignore
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

    setUnlocking(false);
  }, [SDK, submit, activeWalletAddr, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleUnlock} loading={unlocking}>
      Unlock 5 tADA
    </Button>
  );
};
