import { FC, useCallback, useState } from "react";

import { EContractVersion } from "@sundaeswap/core";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionModuleArgs } from "../Actions";

export const CancelSwap: FC<IActionModuleArgs> = ({
  setCBOR,
  setFees,
  submit,
}) => {
  const {
    SDK,
    ready,
    activeWalletAddr: walletAddress,
    useReferral,
    useV3Contracts,
  } = useAppState();
  const [updating, setUpdating] = useState(false);

  const handleCancelSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setUpdating(true);
    try {
      const hash = prompt("What is the hash?");
      const index = prompt("what is the index?");

      if (hash === null || index === null) {
        setUpdating(false);
        return;
      }

      await SDK.builder(EContractVersion.V1)
        .cancel({
          utxo: {
            hash,
            index: Number(index),
          },
          ownerAddress: walletAddress,
        })
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

    setUpdating(false);
  }, [SDK, submit, walletAddress, useReferral, useV3Contracts]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleCancelSwap} loading={updating}>
      Cancel Order ({useV3Contracts ? "V3" : "V1"})
    </Button>
  );
};
