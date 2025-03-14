import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";

import { EContractVersion, EDatumType } from "@sundaeswap/core";

import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs, newPoolQuery, poolQuery } from "../Actions";

export const Withdraw: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const {
    SDK,
    ready,
    activeWalletAddr,
    useReferral,
    useV3Contracts,
  } = useAppState();
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setWithdrawing(true);
    try {
      const pool = await SDK.query().findPoolData(
        useV3Contracts ? newPoolQuery : poolQuery,
      );

      let lpBalance: bigint = 0n;

      const blaze = SDK.blaze();
      if (!blaze) {
        return;
      }

      const balance = await blaze.wallet.getUnspentOutputs();
      const { Core } = await import("@blaze-cardano/sdk");

      balance.forEach((utxo) => {
        const assets = utxo.output().amount().multiasset();
        if (!assets) {
          return;
        }

        const matchingAsset = assets.get(
          Core.AssetId(pool.assetLP.assetId.replace(".", "")),
        );
        if (matchingAsset) {
          lpBalance += matchingAsset;
        }
      });

      if (lpBalance === 0n) {
        throw new Error("You don't have any LP tokens! Deposit some to start.");
      }

      await SDK.builder(
        useV3Contracts ? EContractVersion.V3 : EContractVersion.V1
      )
        .withdraw({
          orderAddresses: {
            DestinationAddress: {
              address: activeWalletAddr,
              datum: {
                type: EDatumType.NONE,
              },
            },
          },
          suppliedLPAsset: new AssetAmount(lpBalance, pool.assetLP),
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

    setWithdrawing(false);
  }, [SDK, submit, activeWalletAddr, useReferral, useV3Contracts]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleWithdraw} loading={withdrawing}>
      Withdraw tADA/tINDY ({useV3Contracts ? "V3" : "V1"})
    </Button>
  );
};
