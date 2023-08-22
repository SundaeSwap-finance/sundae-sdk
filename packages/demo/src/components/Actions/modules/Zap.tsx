import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, poolQuery } from "../Actions";
import Button from "../../Button";

export const Zap: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, walletAddress, useReferral } = useAppState();
  const [zapping, setZapping] = useState(false);

  const handleZap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setZapping(true);
    try {
      const pool = await SDK.query().findPoolData(poolQuery);

      await SDK.zap({
        pool,
        suppliedAsset: new AssetAmount(9999999n, pool.assetA),
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
          },
        },
        swapSlippage: 0.3,
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

    setZapping(false);
  }, [SDK, submit, walletAddress, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleZap} loading={zapping}>
      Zap tADA to tADA/tINDY
    </Button>
  );
};
