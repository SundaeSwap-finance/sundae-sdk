import { AssetAmount } from "@sundaeswap/asset";
import { ADA_ASSET_ID, EContractVersion } from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";

import { Core } from "@blaze-cardano/sdk";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs } from "../Actions";

interface IV4ActionArgs extends IActionArgs {
  poolIdent: string;
}

/**
 * Places a v4 swap intent: offer 5 tADA against the pool's other asset with a
 * minimal min-received, letting the scooper route the actual output.
 */
export const V4Swap: FC<IV4ActionArgs> = ({
  setCBOR,
  setFees,
  submit,
  poolIdent,
}) => {
  const { SDK, ready, activeWalletAddr, useReferral } = useAppState();
  const [swapping, setSwapping] = useState(false);

  const handleSwap = useCallback(async () => {
    if (!SDK || !poolIdent) {
      return;
    }

    setSwapping(true);
    try {
      const builder = SDK.builder(EContractVersion.V4);
      const pool = await builder.getPoolByIdent(poolIdent);
      const taken = pool.assets.find(
        ({ assetId }) => assetId !== ADA_ASSET_ID,
      );
      if (!taken) {
        throw new Error("The pool has no non-ADA asset to swap into.");
      }

      await builder
        .swap({
          ownerAddress: activeWalletAddr,
          offered: new AssetAmount(5_000_000n, {
            assetId: ADA_ASSET_ID,
            decimals: 6,
          }),
          minReceived: new AssetAmount(1n, {
            assetId: taken.assetId,
            decimals: 0,
          }),
          ...(useReferral
            ? {
                referralFee: {
                  destination: activeWalletAddr,
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

    setSwapping(false);
  }, [SDK, submit, activeWalletAddr, useReferral, poolIdent]);

  if (!SDK) {
    return null;
  }

  return (
    <Button
      disabled={!ready || !poolIdent}
      onClick={handleSwap}
      loading={swapping}
    >
      Swap 5 tADA (V4)
    </Button>
  );
};
