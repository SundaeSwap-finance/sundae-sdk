import { AssetAmount } from "@sundaeswap/asset";
import { EContractVersion } from "@sundaeswap/core";
import { PREVIEW_DATA } from "@sundaeswap/core/testing";
import { FC, useCallback, useState } from "react";

import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs } from "../Actions";

export const CreatePool: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, activeWalletAddr, useReferral, useV3Contracts } =
    useAppState();
  const [createPooling, setCreatePooling] = useState(false);

  const handleCreatePool = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setCreatePooling(true);
    try {
      const fiveDaysLater = Date.now() + 1000 * 60 * 60 * 24 * 5;
      await SDK.builder(EContractVersion.V3)
        .mintPool({
          assetA: PREVIEW_DATA.assets.tada,
          assetB: PREVIEW_DATA.assets.tindy,
          fees: [5n, 5n],
          marketTimings: [Date.now(), fiveDaysLater],
          ownerAddress: activeWalletAddr,
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

    setCreatePooling(false);
  }, [SDK, submit, activeWalletAddr, useReferral]);

  if (!SDK || !useV3Contracts) {
    return null;
  }

  return (
    <Button
      disabled={!ready}
      onClick={handleCreatePool}
      loading={createPooling}
    >
      Create tADA/tINDY Pool (V3)
    </Button>
  );
};
