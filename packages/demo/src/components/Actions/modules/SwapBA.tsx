import { AssetAmount } from "@sundaeswap/sdk-core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, defaultOrderAddresses, poolQuery } from "../Actions";
import Button from "../../Button";

export const SwapBA: FC<ActionArgs> = ({ setCBOR, submit }) => {
  const { SDK } = useAppState();
  const [swapping, setSwapping] = useState(false);

  const handleSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setSwapping(true);
    try {
      const pool = await SDK.query().findPoolData(poolQuery);
      await SDK.swap({
        pool,
        orderAddresses: defaultOrderAddresses,
        suppliedAsset: {
          assetId:
            "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
          amount: new AssetAmount(20000000n, 6),
        },
      }).then(async (res) => {
        if (submit) {
          const hash = await res.submit();
          setCBOR({
            cbor: res.cbor,
            hash,
          });
        } else {
          setCBOR({
            cbor: res.cbor,
          });
        }
      });
    } catch (e) {
      console.log(e);
    }

    setSwapping(false);
  }, [SDK, submit]);

  if (!SDK) {
    return null;
  }

  return (
    <Button onClick={handleSwap} loading={swapping}>
      Swap tADA for tINDY
    </Button>
  );
};
