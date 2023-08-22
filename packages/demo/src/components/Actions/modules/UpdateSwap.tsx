import { CancelConfigArgs, SwapConfigArgs, Utils } from "@sundaeswap/sdk-core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, poolQuery } from "../Actions";
import Button from "../../Button";
import { AssetAmount } from "@sundaeswap/asset";

export const UpdateSwap: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, walletAddress, useReferral } = useAppState();
  const [updating, setUpdating] = useState(false);

  const handleUpdateSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setUpdating(true);
    try {
      const utxo = {
        hash: "fb1169adf43a5888b4e15ffef6db839705b2ffab7057fc3ea0a6713479307be0",
        index: 0,
      };

      const { datum, datumHash } = await SDK.query().findOpenOrderDatum(utxo);
      const pool = await SDK.query().findPoolData({
        fee: "0.05",
        pair: [
          "",
          "99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15.524245525259",
        ],
      });

      const cancelConfig: CancelConfigArgs = {
        datum,
        datumHash,
        utxo,
        address: walletAddress,
      };

      const suppliedAsset = new AssetAmount(100000000n, {
        assetId: "",
        decimals: 6,
      });

      const updatedSwapConfig: SwapConfigArgs = {
        pool,
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
          },
        },
        slippage: 0.3,
        minReceivable: Utils.getMinReceivableFromSlippage(
          pool,
          suppliedAsset,
          0.3
        ),
        suppliedAsset,
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
      };

      await SDK.updateSwap(cancelConfig, updatedSwapConfig).then(
        async ({ build, fees }) => {
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
        }
      );
    } catch (e) {
      console.log(e);
    }

    setUpdating(false);
  }, [SDK, submit, walletAddress, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleUpdateSwap} loading={updating}>
      Update Order
    </Button>
  );
};
