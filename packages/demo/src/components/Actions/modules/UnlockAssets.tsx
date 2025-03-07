import { YieldFarmingBuilder } from "@sundaeswap/yield-farming";
import { FC, useCallback, useState } from "react";

import { Core } from "@blaze-cardano/sdk";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs } from "../Actions";

export const Unlock: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const {
    SDK,
    ready,
    activeWalletAddr,
    useReferral,
    network,
  } = useAppState();
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (!SDK) {
      return;
    }
      
    const YF = new YieldFarmingBuilder(SDK.blaze(), network);
    setUnlocking(true);
    const hash = prompt("Hash:");
    const id = prompt("Index:");

    if (!hash || !id) {
      throw new Error("Need a position to withdraw.");
    }

    try {
      await YF.unlock({
        ownerAddress: activeWalletAddr,
        existingPositions: [
          {
            hash,
            index: Number(id),
          },
        ],
        ...(useReferral
          ? {
              referralFee: {
                destination:
                  "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
                payment: new Core.Value(1000000n),
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
  }, [SDK, submit, activeWalletAddr, useReferral, network]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleUnlock} loading={unlocking}>
      Unlock Position
    </Button>
  );
};
