import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, poolQuery } from "../Actions";
import Button from "../../Button";

export const Zap: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, walletAddress } = useAppState();
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
        suppliedAsset: {
          assetId: "",
          amount: new AssetAmount(10000000n, 6),
        },
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
          },
        },
      }).then(async ({ fees, sign, complete }) => {
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
    <Button onClick={handleZap} loading={zapping}>
      Zap tADA to tADA/tINDY
    </Button>
  );
};
