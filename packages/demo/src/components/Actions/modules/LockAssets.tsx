import { AssetAmount } from "@sundaeswap/asset";
import {
  TDelegationPrograms,
  YieldFarmingBuilder
} from "@sundaeswap/yield-farming";
import { FC, useCallback, useState } from "react";

import { useAppState } from "../../../state/context";
import { IActionArgs } from "../Actions";

import { Core } from "@blaze-cardano/sdk";
import Button from "../../Button";

export const Lock: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const {
    SDK,
    ready,
    activeWalletAddr,
    useReferral,
  } = useAppState();
  const [locking, setLocking] = useState(false);

  const handleLock = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setLocking(true);
    try {
      const delegation: TDelegationPrograms = [
        { Delegation: [Buffer.from("SUNDAE").toString("hex"), "01", 1n] },
        { Delegation: [Buffer.from("DJED").toString("hex"), "02", 2n] },
      ];

      const YF = new YieldFarmingBuilder(SDK.blaze());

      await YF.lock({
        ownerAddress: activeWalletAddr,
        lockedValues: [new AssetAmount(5000000n, { assetId: "", decimals: 6 })],
        programs: delegation,
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

    setLocking(false);
  }, [SDK, submit, activeWalletAddr, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleLock} loading={locking}>
      Lock 5 tADA
    </Button>
  );
};
