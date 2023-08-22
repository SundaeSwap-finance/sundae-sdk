import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import { ActionArgs, poolQuery } from "../Actions";
import Button from "../../Button";

export const Deposit: FC<ActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, walletAddress, useReferral } = useAppState();
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
          new AssetAmount(baseAmount, { assetId: "", decimals: 6 }),
          new AssetAmount(baseAmount * ratio, {
            assetId:
              "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
            decimals: 6,
          }),
        ],
        ...(useReferral
          ? {
              referralFee: {
                destination:
                  "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
                payment: new AssetAmount(1000000n, {
                  assetId: "",
                  decimals: 6,
                }),
              },
            }
          : {}),
      }).then(async ({ build, fees }) => {
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

    setDepositing(false);
  }, [SDK, submit, walletAddress, useReferral]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleDeposit} loading={depositing}>
      Deposit tADA/tINDY
    </Button>
  );
};
