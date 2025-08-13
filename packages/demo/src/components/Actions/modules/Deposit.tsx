import { AssetAmount } from "@sundaeswap/asset";
import { EContractVersion, EDatumType } from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";

import { Core } from "@blaze-cardano/sdk";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs, newPoolQuery, poolQuery } from "../Actions";
import { ConstantProductPool } from "@sundaeswap/math";
import { IPoolData } from "@sundaeswap/core";

export const Deposit: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, activeWalletAddr, useReferral, useV3Contracts } =
    useAppState();
  const [depositing, setDepositing] = useState(false);

  const handleDeposit = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setDepositing(true);
    try {
      const pool = (await SDK.query().findPoolData(
        useV3Contracts ? newPoolQuery : poolQuery,
      )) as IPoolData;
      const baseAmount = 25000000n;
      const altPairAmount = ConstantProductPool.getSwapOutput(
        baseAmount,
        pool.liquidity.aReserve,
        pool.liquidity.bReserve,
        pool.currentFee,
      ).output;

      await SDK.builder(
        useV3Contracts ? EContractVersion.V3 : EContractVersion.V1,
      )
        .deposit({
          orderAddresses: {
            DestinationAddress: {
              address: activeWalletAddr,
              datum: {
                type: EDatumType.NONE,
              },
            },
          },
          pool,
          suppliedAssets: [
            new AssetAmount(baseAmount, {
              assetId: pool.assetA.assetId,
              decimals: pool.assetA.decimals,
            }),
            new AssetAmount(altPairAmount, {
              assetId: pool.assetB.assetId,
              decimals: pool.assetB.decimals,
            }),
          ],
          ...(useReferral
            ? {
                referralFee: {
                  destination:
                    "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
                  payment: new Core.Value(1000000n),
                },
              }
            : {}),
        })
        .then(async ({ build, fees }) => {
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
  }, [SDK, submit, activeWalletAddr, useReferral, useV3Contracts]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleDeposit} loading={depositing}>
      Deposit tADA/tINDY ({useV3Contracts ? "V3" : "V1"})
    </Button>
  );
};
