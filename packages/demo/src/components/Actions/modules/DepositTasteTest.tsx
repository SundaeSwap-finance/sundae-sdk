import { AssetAmount } from "@sundaeswap/asset";
import { EScriptType, TasteTestBuilder } from "@sundaeswap/taste-test";
import { FC, useCallback, useState } from "react";

import { Core } from "@blaze-cardano/sdk";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs } from "../Actions";

export const DepositTasteTest: FC<IActionArgs> = ({
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
  const [depositing, setDepositing] = useState(false);

  const handleDeposit = useCallback(async () => {
    if (!SDK) {
      return;
    }

    const tt = new TasteTestBuilder(SDK.blaze());
    setDepositing(true);
    try {
      await tt
        .deposit({
          tasteTestType: "Direct",
          updateFallback: true,
          assetAmount: new AssetAmount(1000000n, 6),
          scripts: {
            policy: {
              type: EScriptType.OUTREF,
              value: {
                hash: "",
                outRef: Core.TransactionInput.fromCore({
                  txId:
                    Core.TransactionId("0d88fdba9d3fa1182177c8907d8dc23a7cc0f111d402c12016e36017b6f16fb9"),
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
                    Core.TransactionId("e9eeb2da7a528faffb20e195d15f67ae23a7a56498edcf47c41aee388cadc374"),
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

    setDepositing(false);
  }, [SDK, submit, activeWalletAddr, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleDeposit} loading={depositing}>
      Deposit 1 ADA into Taste Test
    </Button>
  );
};
