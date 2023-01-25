import { AssetAmount } from "@sundaeswap/sdk-core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, defaultOrderAddresses, poolQuery } from "../Actions";
import Button from "../../Button";

export const SwapAB: FC<ActionArgs> = ({ setCBOR, submit }) => {
  const { SDK } = useAppState();
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
        orderAddresses: defaultOrderAddresses,
        suppliedAsset: {
          assetId: "",
          amount: new AssetAmount(25000000n, 6),
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

    setReverseSwapping(false);
  }, [SDK, submit]);

  if (!SDK) {
    return null;
  }

  return (
    <Button onClick={handleSwap} loading={reverseSwapping}>
      Swap tADA for tINDY
    </Button>
  );
};
