import {
  AssetAmount,
  CancelConfigArgs,
  SwapConfigArgs,
} from "@sundaeswap/sdk-core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, poolQuery } from "../Actions";
import Button from "../../Button";

export const UpdateSwap: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, walletAddress } = useAppState();
  const [updating, setUpdating] = useState(false);

  const handleUpdateSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setUpdating(true);
    try {
      const utxo = {
        hash: "81dab47ba9e15f4a0db63e05f6148304086bbbf1b6577f06936d48d2fe8a30ad",
        index: 0,
      };

      const { datum, datumHash } = await SDK.query().findOpenOrderDatum(utxo);
      const pool = await SDK.query().findPoolData({
        fee: "0.05",
        pair: [
          "",
          "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
        ],
      });

      const cancelConfig: CancelConfigArgs = {
        datum,
        datumHash,
        utxo,
        address: walletAddress,
      };

      const updatedSwapConfig: SwapConfigArgs = {
        pool,
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
          },
        },
        slippage: 0.3,
        suppliedAsset: {
          assetId:
            "2fe3c3364b443194b10954771c95819b8d6ed464033c21f03f8facb5.69555344",
          amount: new AssetAmount(1000000n, 6),
        },
      };

      await SDK.updateSwap(cancelConfig, updatedSwapConfig).then(
        async ({ fees, sign, complete }) => {
          if (submit) {
            setFees(fees);
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
        }
      );
    } catch (e) {
      console.log(e);
    }

    setUpdating(false);
  }, [SDK, submit, walletAddress]);

  if (!SDK) {
    return null;
  }

  return (
    <Button onClick={handleUpdateSwap} loading={updating}>
      Update Order
    </Button>
  );
};
