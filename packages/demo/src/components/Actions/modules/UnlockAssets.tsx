import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs } from "../Actions";

import Button from "../../Button";

export const Unlock: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, walletAddress } = useAppState();
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
      }).then(async ({ sign, fees, complete }) => {
        setFees(fees);
        if (submit) {
          const { cbor, submit } = await sign().complete();
          setCBOR({
            cbor,
            hash: await submit(),
          });
        } else {
          const { cbor } = await complete();
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
    <Button onClick={handleUnlock} loading={unlocking}>
      Unlock 10 tADA
    </Button>
  );
};
