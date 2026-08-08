import { AssetAmount } from "@sundaeswap/asset";
import { EContractVersion } from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";

import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs } from "../Actions";

interface IV4ActionArgs extends IActionArgs {
  poolIdent: string;
}

/**
 * Places a v4 withdraw intent: offer LP tokens and demand a minimal amount of
 * each pool asset (v4 withdrawals pay out proportionally at execution).
 */
export const V4Withdraw: FC<IV4ActionArgs> = ({
  setCBOR,
  setFees,
  submit,
  poolIdent,
}) => {
  const { SDK, ready, activeWalletAddr } = useAppState();
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = useCallback(async () => {
    if (!SDK || !poolIdent) {
      return;
    }

    setWithdrawing(true);
    try {
      const builder = SDK.builder(EContractVersion.V4);
      const pool = await builder.getPoolByIdent(poolIdent);

      await builder
        .withdraw({
          ownerAddress: activeWalletAddr,
          offered: [
            new AssetAmount(1_000_000n, {
              assetId: pool.lpAssetId,
              decimals: 0,
            }),
          ],
          minReceived: pool.assets.map(
            ({ assetId }) => new AssetAmount(1n, { assetId, decimals: 0 }),
          ),
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
  }, [SDK, submit, activeWalletAddr, poolIdent]);

  if (!SDK) {
    return null;
  }

  return (
    <Button
      disabled={!ready || !poolIdent}
      onClick={handleWithdraw}
      loading={withdrawing}
    >
      Withdraw (V4)
    </Button>
  );
};
