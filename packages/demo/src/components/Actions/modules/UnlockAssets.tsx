import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs } from "../Actions";

import Button from "../../Button";

export const Unlock: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, walletAddress } = useAppState();
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setUnlocking(true);
    try {
      await SDK.unlock({
        ownerAddress: walletAddress,
        existingPositions: [
          {
            hash: "d211adc4de0633448eab33aa5292a97d4dc0815ce4d17114c9d850959800d6b3",
            index: 0,
          },
        ],
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

    setUnlocking(false);
  }, [SDK, submit, walletAddress]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleUnlock} loading={unlocking}>
      Unlock 5 tADA
    </Button>
  );
};
