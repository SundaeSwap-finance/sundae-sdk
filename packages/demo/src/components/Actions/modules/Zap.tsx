import { AssetAmount } from "@sundaeswap/sdk-core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, defaultOrderAddresses, poolQuery } from "../Actions";
import Button from "../../Button";

export const Zap: FC<ActionArgs> = ({ setCBOR, submit }) => {
  const { SDK } = useAppState();
  const [zapping, setZapping] = useState(false);

  const handleZap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setZapping(true);
    try {
      const pool = await SDK.query().findPoolData(poolQuery);

      await SDK.zap({
        orderAddresses: defaultOrderAddresses,
        pool,
        suppliedAsset: {
          assetId: "",
          amount: new AssetAmount(10000000n, 6),
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

    setZapping(false);
  }, [SDK, submit]);

  if (!SDK) {
    return null;
  }

  return (
    <Button onClick={handleZap} loading={zapping}>
      Zap tADA to tADA/tINDY
    </Button>
  );
};
