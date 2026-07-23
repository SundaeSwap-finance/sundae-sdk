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
 * Places a v4 deposit intent: offer a small amount of each pool asset and
 * demand a minimal amount of the pool's LP token (the scooper computes the
 * actual LP at execution).
 */
export const V4Deposit: FC<IV4ActionArgs> = ({
  setCBOR,
  setFees,
  submit,
  poolIdent,
}) => {
  const { SDK, ready, activeWalletAddr } = useAppState();
  const [depositing, setDepositing] = useState(false);

  const handleDeposit = useCallback(async () => {
    if (!SDK || !poolIdent) {
      return;
    }

    setDepositing(true);
    try {
      const builder = SDK.builder(EContractVersion.V4);
      const pool = await builder.getPoolByIdent(poolIdent);

      await builder
        .deposit({
          ownerAddress: activeWalletAddr,
          offered: pool.assets.map(
            ({ assetId }) =>
              new AssetAmount(1_000_000n, { assetId, decimals: 0 }),
          ),
          minReceived: [
            new AssetAmount(1n, { assetId: pool.lpAssetId, decimals: 0 }),
          ],
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
  }, [SDK, submit, activeWalletAddr, poolIdent]);

  if (!SDK) {
    return null;
  }

  return (
    <Button
      disabled={!ready || !poolIdent}
      onClick={handleDeposit}
      loading={depositing}
    >
      Deposit (V4)
    </Button>
  );
};
