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
  const { SDK, ready, walletAddress, useReferral } = useAppState();
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
        ...(useReferral
          ? {
              referralFee: {
                destination:
                  "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
                minimumAmount: new AssetAmount(1000000n, {
                  assetId: "",
                  decimals: 6,
                }),
                percent: 0.01,
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

    setLocking(false);
  }, [SDK, submit, walletAddress, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleLock} loading={locking}>
      Lock 5 tADA
    </Button>
  );
};
