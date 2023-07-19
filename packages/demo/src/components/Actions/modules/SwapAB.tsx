import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, poolQuery } from "../Actions";
import Button from "../../Button";

export const SwapAB: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, walletAddress } = useAppState();
  const [reverseSwapping, setReverseSwapping] = useState(false);

  const handleSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setReverseSwapping(true);
    try {
      const pool = await SDK.query().findPoolData(poolQuery);

      await SDK.swap({
        pool,
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
          },
        },
        suppliedAsset: new AssetAmount(25000000n, { assetId: "", decimals: 6 }),
      }).then(async ({ sign, build, fees }) => {
        setFees(fees);
        if (submit) {
          const { cbor, submit } = await sign();
          setCBOR({
            cbor,
            hash: await submit(),
          });
        } else {
          const { cbor } = await build();
          setCBOR({
            cbor,
          });
        }
      });
    } catch (e) {
      console.log(e);
    }

    setReverseSwapping(false);
  }, [SDK, submit, walletAddress]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleSwap} loading={reverseSwapping}>
      Swap tADA for tINDY
    </Button>
  );
};
