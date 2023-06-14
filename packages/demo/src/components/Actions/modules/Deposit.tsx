import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, poolQuery } from "../Actions";
import Button from "../../Button";

export const Deposit: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, walletAddress } = useAppState();
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
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
          },
        },
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
      }).then(async ({ sign, fees, complete }) => {
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

    setDepositing(false);
  }, [SDK, submit, walletAddress]);

  if (!SDK) {
    return null;
  }

  return (
    <Button onClick={handleDeposit} loading={depositing}>
      Deposit tADA/tINDY
    </Button>
  );
};
