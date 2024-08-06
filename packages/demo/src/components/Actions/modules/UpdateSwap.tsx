import { AssetAmount } from "@sundaeswap/asset";
import {
  EContractVersion,
  EDatumType,
  ESwapType,
  ICancelConfigArgs,
  ISwapConfigArgs,
} from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";

import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionModuleArgs, newPoolQuery, poolQuery } from "../Actions";

export const UpdateSwap: FC<IActionModuleArgs> = ({
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
  const [updating, setUpdating] = useState(false);

  const handleUpdateSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setUpdating(true);
    try {
      const hash = prompt("What is the hash?");
      const index = prompt("what is the index?");

      if (hash === null || index === null) {
        setUpdating(false);
        return;
      }

      const pool = await SDK.query().findPoolData(
        useV3Contracts ? newPoolQuery : poolQuery
      );

      const cancelConfig: ICancelConfigArgs = {
        utxo: {
          hash,
          index: Number(index),
        },
        ownerAddress: walletAddress,
      };

      const suppliedAsset = new AssetAmount(30_000_000n, {
        assetId: "",
        decimals: 6,
      });

      const updatedSwapConfig: ISwapConfigArgs = {
        pool,
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
            datum: {
              type: EDatumType.NONE,
            },
          },
        },
        swapType: {
          type: ESwapType.MARKET,
          slippage: 0.03,
        },
        suppliedAsset,
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
      };

      await SDK.builder(
        useV3Contracts ? EContractVersion.V3 : EContractVersion.V1
      )
        .update({
          cancelArgs: cancelConfig,
          swapArgs: updatedSwapConfig,
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

    setUpdating(false);
  }, [SDK, submit, walletAddress, useReferral, useV3Contracts]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleUpdateSwap} loading={updating}>
      Update Order ({useV3Contracts ? "V3" : "V1"})
    </Button>
  );
};
