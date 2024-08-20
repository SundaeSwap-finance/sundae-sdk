import { AssetAmount } from "@sundaeswap/asset";
import { ETxBuilderType } from "@sundaeswap/core";
import type { YieldFarmingBlaze } from "@sundaeswap/yield-farming/blaze";
import type { YieldFarmingLucid } from "@sundaeswap/yield-farming/lucid";
import { FC, useCallback, useState } from "react";

import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs } from "../Actions";

export const UnlockV1: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const {
    SDK,
    ready,
    activeWalletAddr: walletAddress,
    useReferral,
    builderLib,
    network,
  } = useAppState();
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (!SDK) {
      return;
    }

    let YF: YieldFarmingBlaze | YieldFarmingLucid | undefined;

    const hash = prompt("Transaction hash:");
    const index = prompt("Transaction index:");

    if (!hash || !index) {
      throw new Error("No hash or index.");
    }

    setUnlocking(true);
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

        const utxos = await lucid.provider.getUtxosByOutRef([
          {
            outputIndex: Number(index),
            txHash: hash,
          },
        ]);

        try {
          await YF.unlock_v1({
            destination: walletAddress,
            positions: utxos,
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
        const { Core } = await import("@blaze-cardano/sdk");
        YF = new YieldFarmingBlaze(blaze, network);

        const utxos = await blaze.provider.resolveUnspentOutputs([
          Core.TransactionInput.fromCore({
            index: Number(index),
            txId: Core.TransactionId(hash),
          }),
        ]);

        try {
          await YF.unlock_v1({
            destination: walletAddress,
            positions: utxos,
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
        break;
      }
      default:
        throw new Error("No TxBuilder type defined.");
    }

    setUnlocking(false);
  }, [SDK, submit, walletAddress, useReferral, builderLib, network]);

  if (!SDK) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleUnlock} loading={unlocking}>
      Unlock V1 Position
    </Button>
  );
};
