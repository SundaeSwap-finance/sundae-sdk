import { AssetAmount } from "@sundaeswap/asset";
import {
  EContractVersion,
  EDatumType,
  ESwapType,
  ISwapConfigArgs,
} from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs, newPoolQuery, poolQuery } from "../Actions";

export const SwapAB: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const {
    SDK,
    ready,
    activeWalletAddr: walletAddress,
    useReferral,
    useV3Contracts,
    builderLib,
  } = useAppState();
  const [reverseSwapping, setReverseSwapping] = useState(false);

  const handleSwap = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setReverseSwapping(true);
    try {
      const pool = await SDK.query().findPoolData(
        useV3Contracts ? newPoolQuery : poolQuery,
      );
      const args: ISwapConfigArgs = {
        swapType: {
          type: ESwapType.MARKET,
          slippage: 0.03,
        },
        pool,
        orderAddresses: {
          DestinationAddress: {
            address: walletAddress,
            datum: {
              type: EDatumType.NONE,
            },
          },
        },
        suppliedAsset: new AssetAmount(25000000n, pool.assetA),
      };

      if (useReferral) {
        args.referralFee = {
          destination:
            "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
          payment: new AssetAmount(1000000n, {
            assetId: "",
            decimals: 6,
          }),
          feeLabel: "Test Fee",
        };
      }

      await SDK.builder(
        useV3Contracts ? EContractVersion.V3 : EContractVersion.V1,
        builderLib,
      )
        .swap(args)
        .then(async ({ build, fees }) => {
          setFees(fees);
          const builtTx = await build();
          setCBOR({
            cbor: builtTx.cbor,
          });

          if (submit) {
            const { cbor, submit } = await builtTx.sign();
            setCBOR({
              cbor,
              hash: await submit(),
            });
          }
        });
    } catch (e) {
      console.log(e);
    }

    setReverseSwapping(false);
  }, [
    SDK,
    submit,
    walletAddress,
    useReferral,
    useV3Contracts,
    poolQuery,
    builderLib,
  ]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleSwap} loading={reverseSwapping}>
      Swap tADA for tINDY ({useV3Contracts ? "V3" : "V1"})
    </Button>
  );
};
