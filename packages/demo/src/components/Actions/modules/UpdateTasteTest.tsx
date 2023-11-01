import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";

import { TasteTest } from "@sundaeswap/taste-test";
import { Lucid } from "lucid-cardano";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { ActionArgs } from "../Actions";

export const UpdateTasteTest: FC<ActionArgs> = ({
  setCBOR,
  setFees,
  submit,
}) => {
  const { SDK, ready, walletAddress, useReferral } = useAppState();
  const [updating, setUpdating] = useState(false);

  const handleDeposit = useCallback(async () => {
    if (!SDK) {
      return;
    }

    const builderWallet = SDK.build<unknown, Lucid>().wallet;
    if (!builderWallet) {
      return;
    }

    const tt = new TasteTest(builderWallet);
    setUpdating(true);
    try {
      await tt
        .update({
          tasteTestType: "basic",
          assetAmount: new AssetAmount(5000000n, 6),
          scripts: {
            policy: {
              txHash:
                "ba464546272ac37694ba86d3e2021a63189704259a708d83ded54b6eba9b721d",
              outputIndex: 0,
            },
            validator: {
              txHash:
                "5ce83772dabedc1eeea992b68eb232c42dbd59ba260e057c890bfa77364bc7f3",
              outputIndex: 0,
            },
          },
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
  }, [SDK, submit, walletAddress, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleDeposit} loading={updating}>
      Add 5 ADA to Existing Deposit
    </Button>
  );
};
