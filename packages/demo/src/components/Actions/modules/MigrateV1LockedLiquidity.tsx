import {
  EDatumType,
  QueryProviderSundaeSwap,
  QueryProviderSundaeSwapLegacy,
} from "@sundaeswap/core";
import { YieldFarmingLucid } from "@sundaeswap/yield-farming";
import { FC, useCallback, useState } from "react";

import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs, poolQuery } from "../Actions";

export const MigrateYF: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const { SDK, ready, activeWalletAddr, useReferral, useV3Contracts } =
    useAppState();
  const [migrating, setMigrating] = useState(false);

  const handleMigrating = useCallback(async () => {
    if (!SDK) {
      return;
    }

    const existingPositionTxHash = prompt("Existing position txHash?");
    const existingPositionIndex = prompt("Existing position index?");

    if (!existingPositionTxHash || !existingPositionIndex) {
      throw new Error("Need and existing position to migrate.");
    }

    setMigrating(true);
    try {
      const v1PoolTIndy = await new QueryProviderSundaeSwapLegacy(
        "preview"
      ).findPoolData(poolQuery);
      const v3PoolTIndy = await new QueryProviderSundaeSwap(
        "preview"
      ).findPoolData({
        ident: "2e74e6af9739616dd021f547bca1f68c937b566bb6ca2e4782e76001",
      });

      const YF = new YieldFarmingLucid(SDK.builder().lucid);
      await YF.migrateToV3({
        migrations: [
          {
            withdrawPool: v1PoolTIndy,
            depositPool: v3PoolTIndy,
          },
        ],
        ownerAddress: {
          address: activeWalletAddr,
          datum: {
            type: EDatumType.NONE,
          },
        },
        existingPositions: [
          {
            hash: existingPositionTxHash,
            index: Number(existingPositionIndex),
          },
        ],
      }).then(async ({ build, fees }) => {
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

    setMigrating(false);
  }, [SDK, submit, activeWalletAddr, useReferral, useV3Contracts, poolQuery]);

  if (!SDK || useV3Contracts) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleMigrating} loading={migrating}>
      Migrate YF Liquidity ("V1")
    </Button>
  );
};
