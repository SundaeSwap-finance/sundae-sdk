import { AssetAmount } from "@sundaeswap/asset";
import { SwapConfigArgs } from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { ActionArgs, poolQuery } from "../Actions";

export const SwapAB: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, walletAddress, useReferral } = useAppState();
  const [reverseSwapping, setReverseSwapping] = useState(false);

  const handleSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setReverseSwapping(true);
    try {
      const pool = await SDK.query().findPoolData(poolQuery);
      const args: SwapConfigArgs = {
        pool,
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
          },
        },
        suppliedAsset: new AssetAmount(25000000n, { assetId: "", decimals: 6 }),
      };

      if (useReferral) {
        args.referralFee = {
          destination:
            "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
          payment: new AssetAmount(1000000n, {
            assetId: "",
            decimals: 6,
          }),
          feeLabel: "Test Fee",
        };
      }

      await SDK.swap(args).then(async ({ build, fees }) => {
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

    setReverseSwapping(false);
  }, [SDK, submit, walletAddress, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleSwap} loading={reverseSwapping}>
      Swap tADA for tINDY
    </Button>
  );
};
