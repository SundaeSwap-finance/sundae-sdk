import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";

import { YieldFarmingLucid } from "@sundaeswap/yield-farming";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs } from "../Actions";

export const UnlockV1: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const {
    SDK,
    ready,
    activeWalletAddr: walletAddress,
    useReferral,
  } = useAppState();
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (!SDK) {
      return;
    }

    const lucid = SDK.lucid();
    if (!lucid) {
      throw new Error("Not using lucid.");
    }

    const YF = new YieldFarmingLucid(lucid);

    const hash = prompt("Transaction hash:");
    const index = prompt("Transaction index:");

    if (!hash || !index) {
      throw new Error("No hash or index.");
    }

    const utxos = await lucid.provider.getUtxosByOutRef([
      {
        outputIndex: Number(index),
        txHash: hash,
      },
    ]);

    setUnlocking(true);
    try {
      await YF.unlock_v1({
        destination: walletAddress,
        positions: utxos,
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
  }, [SDK, submit, walletAddress, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleUnlock} loading={unlocking}>
      Unlock V1 Position
    </Button>
  );
};
