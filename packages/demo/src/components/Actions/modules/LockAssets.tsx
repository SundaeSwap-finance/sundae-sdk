import { AssetAmount } from "@sundaeswap/asset";
import { DelegationProgramPools, DelegationPrograms } from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs } from "../Actions";

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
                payment: new AssetAmount(1000000n, {
                  assetId: "",
                  decimals: 6,
                }),
              },
            }
          : {}),
      }).then(async ({ build, fees }) => {
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
