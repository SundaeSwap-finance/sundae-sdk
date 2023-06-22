import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs } from "../Actions";
import {
  DelegationPrograms,
  DelegationProgramPools,
} from "@sundaeswap/sdk-core";

import Button from "../../Button";

export const Lock: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, walletAddress } = useAppState();
  const [locking, setLocking] = useState(false);

  const handleLock = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setLocking(true);
    try {
      const djedProgram: DelegationProgramPools = new Map();
      const sundaeProgram: DelegationProgramPools = new Map();
      const delegations: DelegationPrograms = new Map();

      sundaeProgram.set("01", 1n);
      djedProgram.set("02", 2n);
      delegations.set("SUNDAE", sundaeProgram);

      await SDK.lock({
        ownerAddress: walletAddress,
        lockedValues: [new AssetAmount(5000000n, { assetId: "", decimals: 6 })],
        delegation: delegations,
      }).then(async ({ sign, fees, complete }) => {
        setFees(fees);
        if (submit) {
          console.log("submitted");
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

    setLocking(false);
  }, [SDK, submit, walletAddress]);

  if (!SDK) {
    return null;
  }

  return (
    <Button onClick={handleLock} loading={locking}>
      Lock 10 tADA
    </Button>
  );
};
