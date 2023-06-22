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
            hash: "e2d3069ed5060c7ab266ac15f78486b12ddc0051a137c75f6628936b87938952",
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
