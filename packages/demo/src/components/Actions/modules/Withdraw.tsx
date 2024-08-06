import { AssetAmount } from "@sundaeswap/asset";
import { FC, useCallback, useState } from "react";

import { EContractVersion, EDatumType } from "@sundaeswap/core";

import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionModuleArgs, newPoolQuery, poolQuery } from "../Actions";

export const Withdraw: FC<IActionModuleArgs> = ({
  setCBOR,
  setFees,
  submit,
}) => {
  const {
    SDK,
    ready,
    activeWalletAddr: walletAddress,
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
        useV3Contracts ? newPoolQuery : poolQuery
      );

      const balance = await SDK.builder(
        useV3Contracts ? EContractVersion.V3 : EContractVersion.V1
      ).lucid.wallet.getUtxos();
      let lpBalance: bigint = 0n;

      balance?.forEach((bal) => {
        const matchingAsset = bal.assets[pool.assetLP.assetId.replace(".", "")];
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
              address: walletAddress,
              datum: {
                type: EDatumType.NONE,
              },
            },
          },
          pool,
          suppliedLPAsset: new AssetAmount(lpBalance, pool.assetLP),
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
  }, [SDK, submit, walletAddress, useReferral, useV3Contracts]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleWithdraw} loading={withdrawing}>
      Withdraw tADA/tINDY ({useV3Contracts ? "V3" : "V1"})
    </Button>
  );
};
