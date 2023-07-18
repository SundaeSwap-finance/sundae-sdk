import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, poolQuery } from "../Actions";
import Button from "../../Button";

export const Zap: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, walletAddress } = useAppState();
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
        suppliedAsset: new AssetAmount(9999999n, pool.assetB),
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
          },
        },
      }).then(async ({ fees, sign, complete }) => {
        setFees(fees);
        if (submit) {
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
      });
    } catch (e) {
      console.log(e);
    }

    setZapping(false);
  }, [SDK, submit, walletAddress]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleZap} loading={zapping}>
      Zap tADA to tADA/tINDY
    </Button>
  );
};
