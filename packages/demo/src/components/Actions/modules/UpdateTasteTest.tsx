import { AssetAmount } from "@sundaeswap/asset";
import { EScriptType, TasteTestBuilder } from "@sundaeswap/taste-test";
import { FC, useCallback, useState } from "react";

import { Core } from "@blaze-cardano/sdk";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs } from "../Actions";

export const UpdateTasteTest: FC<IActionArgs> = ({
  setCBOR,
  setFees,
  submit,
}) => {
  const {
    SDK,
    ready,
    activeWalletAddr,
    useReferral,
  } = useAppState();
  const [updating, setUpdating] = useState(false);

  const handleDeposit = useCallback(async () => {
    if (!SDK) {
      return;
    }

    const tt = new TasteTestBuilder(SDK.blaze());
    setUpdating(true);
    try {
      await tt
        .update({
          tasteTestType: "Direct",
          assetAmount: new AssetAmount(5000000n, 6),
          scripts: {
            policy: {
              type: EScriptType.OUTREF,
              value: {
                hash: "",
                outRef: Core.TransactionInput.fromCore({
                  txId:
                    Core.TransactionId("ba464546272ac37694ba86d3e2021a63189704259a708d83ded54b6eba9b721d"),
                  index: 0,
                }),
              },
            },
            validator: {
              type: EScriptType.OUTREF,
              value: {
                hash: "",
                outRef: Core.TransactionInput.fromCore({
                  txId:
                    Core.TransactionId("5ce83772dabedc1eeea992b68eb232c42dbd59ba260e057c890bfa77364bc7f3"),
                  index: 0,
                }),
              },
            },
          },
          validatorAddress: "",
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
  }, [SDK, submit, activeWalletAddr, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleDeposit} loading={updating}>
      Add 5 ADA to Existing Deposit
    </Button>
  );
};
