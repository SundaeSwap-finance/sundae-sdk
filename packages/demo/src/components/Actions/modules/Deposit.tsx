import { AssetAmount } from "@sundaeswap/sdk-core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, defaultOrderAddresses, poolQuery } from "../Actions";
import Button from "../../Button";

export const Deposit: FC<ActionArgs> = ({ setCBOR, submit }) => {
  const { SDK } = useAppState();
  const [depositing, setDepositing] = useState(false);

  const handleDeposit = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setDepositing(true);
    try {
      const pool = await SDK.query().findPoolData(poolQuery);
      const ratio = BigInt(pool.quantityA) / BigInt(pool.quantityB);
      const baseAmount = 25000000n;

      await SDK.deposit({
        orderAddresses: defaultOrderAddresses,
        pool,
        suppliedAssets: [
          {
            assetId: "",
            amount: new AssetAmount(baseAmount, 6),
          },
          {
            assetId:
              "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
            amount: new AssetAmount(baseAmount * ratio, 6),
          },
        ],
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

    setDepositing(false);
  }, [SDK, submit]);

  if (!SDK) {
    return null;
  }

  return (
    <Button onClick={handleDeposit} loading={depositing}>
      Deposit tADA/tINDY
    </Button>
  );
};
