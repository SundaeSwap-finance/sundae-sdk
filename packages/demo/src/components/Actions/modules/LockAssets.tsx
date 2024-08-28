import { AssetAmount } from "@sundaeswap/asset";
import { ETxBuilderType } from "@sundaeswap/core";
import type {
  TDelegationPrograms,
  YieldFarmingBlaze,
} from "@sundaeswap/yield-farming/blaze";
import type { YieldFarmingLucid } from "@sundaeswap/yield-farming/lucid";
import { FC, useCallback, useState } from "react";

import { useAppState } from "../../../state/context";
import { IActionArgs } from "../Actions";

import Button from "../../Button";

export const Lock: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const {
    SDK,
    ready,
    activeWalletAddr: walletAddress,
    useReferral,
    builderLib,
    network,
  } = useAppState();
  const [locking, setLocking] = useState(false);

  const handleLock = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setLocking(true);
    try {
      const delegation: TDelegationPrograms = [
        { Delegation: [Buffer.from("SUNDAE").toString("hex"), "01", 1n] },
        { Delegation: [Buffer.from("DJED").toString("hex"), "02", 2n] },
      ];

      let YF: YieldFarmingBlaze | YieldFarmingLucid | undefined;

      switch (builderLib) {
        case ETxBuilderType.LUCID: {
          const lucid = SDK.lucid();
          if (!lucid) {
            return;
          }

          const { YieldFarmingLucid } = await import(
            "@sundaeswap/yield-farming/lucid"
          );
          YF = new YieldFarmingLucid(lucid);
          break;
        }
        case ETxBuilderType.BLAZE: {
          const blaze = SDK.blaze();
          if (!blaze) {
            return;
          }

          const { YieldFarmingBlaze } = await import(
            "@sundaeswap/yield-farming/blaze"
          );
          YF = new YieldFarmingBlaze(blaze, network);
          break;
        }
        default:
          throw new Error("No TxBuilder type defined.");
      }

      await YF.lock({
        ownerAddress: walletAddress,
        lockedValues: [new AssetAmount(5000000n, { assetId: "", decimals: 6 })],
        programs: delegation,
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
        // @ts-ignore
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

    setLocking(false);
  }, [SDK, submit, walletAddress, useReferral, builderLib, network]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleLock} loading={locking}>
      Lock 5 tADA
    </Button>
  );
};
