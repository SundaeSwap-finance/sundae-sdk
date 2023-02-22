import { AssetAmount } from "@sundaeswap/sdk-core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, defaultOrderAddresses, poolQuery } from "../Actions";
import Button from "../../Button";

export const Zap: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK } = useAppState();
  const [zapping, setZapping] = useState(false);

  const handleZap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setZapping(true);
    try {
      const pool = await SDK.query().findPoolData(poolQuery);

      await SDK.unstable_zap({
        orderAddresses: defaultOrderAddresses,
        pool,
        suppliedAsset: {
          assetId: "",
          amount: new AssetAmount(10000000n, 6),
        },
      }).then(async (res) => {
        if (submit) {
          const { cbor, submit, fees } = await res.sign().complete();
          setFees(fees);
          setCBOR({
            cbor,
            hash: await submit(),
          });
        } else {
          const { cbor, fees } = await res.complete();
          setFees(fees);
          setCBOR({
            cbor,
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
