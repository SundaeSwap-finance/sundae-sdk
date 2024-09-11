import { AssetAmount } from "@sundaeswap/asset";
import {
  EContractVersion,
  EDatumType,
  IPoolData,
  IWithdrawConfigArgs,
  QueryProviderSundaeSwapLegacy,
} from "@sundaeswap/core";
import { FC, useCallback, useState } from "react";

import {
  V3_CONTRACT_POOL_RBERRY,
  V3_CONTRACT_POOL_TINDY,
} from "../../../constants";
import { useAppState } from "../../../state/context";
import Button from "../../Button";
import { IActionArgs, poolQuery } from "../Actions";

export const Migrate: FC<IActionArgs> = ({ setCBOR, setFees, submit }) => {
  const {
    SDK,
    ready,
    activeWalletAddr: walletAddress,
    useReferral,
    useV3Contracts,
    builderLib,
  } = useAppState();
  const [migrating, setMigrating] = useState(false);

  const handleMigrating = useCallback(async () => {
    if (!SDK) {
      return;
    }

    setMigrating(true);
    try {
      const v1PoolTIndy = await new QueryProviderSundaeSwapLegacy(
        "preview",
      ).findPoolData(poolQuery);
      const v1PoolRberry = await new QueryProviderSundaeSwapLegacy(
        "preview",
      ).findPoolData({
        pair: [
          "",
          "d441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf.524245525259",
        ],
        fee: "0.05",
        ident: "00",
      });

      let tINdyLpBalance: bigint = 0n;
      let rRberryLpBalance: bigint = 0n;

      const lucid = SDK.lucid();
      if (lucid) {
        const balance = await lucid.wallet.getUtxos();

        balance?.forEach(({ assets }) => {
          const matchingTindyAsset =
            assets[v1PoolTIndy.assetLP.assetId.replace(".", "")];
          const matchingRberryAsset =
            assets[v1PoolRberry.assetLP.assetId.replace(".", "")];

          if (matchingTindyAsset) {
            tINdyLpBalance += matchingTindyAsset;
          }

          if (matchingRberryAsset) {
            rRberryLpBalance += matchingRberryAsset;
          }
        });
      } else {
        const blaze = SDK.blaze();
        if (!blaze) {
          return;
        }

        const balance = await blaze.wallet.getUnspentOutputs();
        const { Core } = await import("@blaze-cardano/sdk");

        balance.forEach((utxo) => {
          const assets = utxo.output().amount().multiasset();
          if (!assets) {
            return;
          }

          const matchingTindyAsset = assets.get(
            Core.AssetId(v1PoolTIndy.assetLP.assetId.replace(".", "")),
          );
          const matchingRberryAsset = assets.get(
            Core.AssetId(v1PoolRberry.assetLP.assetId.replace(".", "")),
          );

          if (matchingTindyAsset) {
            tINdyLpBalance += matchingTindyAsset;
          }

          if (matchingRberryAsset) {
            rRberryLpBalance += matchingRberryAsset;
          }
        });
      }

      if (!tINdyLpBalance && !rRberryLpBalance) {
        throw new Error("You don't have any LP tokens to migrate!");
      }

      const withdrawTindyConfig: IWithdrawConfigArgs | undefined =
        tINdyLpBalance > 0
          ? {
              pool: v1PoolTIndy,
              orderAddresses: {
                DestinationAddress: {
                  address: walletAddress,
                  datum: {
                    type: EDatumType.NONE,
                  },
                },
              },
              suppliedLPAsset: new AssetAmount(
                tINdyLpBalance,
                v1PoolTIndy.assetLP,
              ),
            }
          : undefined;

      const withdrawRberryConfig: IWithdrawConfigArgs | undefined =
        rRberryLpBalance > 0
          ? {
              pool: v1PoolRberry,
              orderAddresses: {
                DestinationAddress: {
                  address: walletAddress,
                  datum: {
                    type: EDatumType.NONE,
                  },
                },
              },
              suppliedLPAsset: new AssetAmount(
                rRberryLpBalance,
                v1PoolRberry.assetLP,
              ),
            }
          : undefined;

      if (useReferral) {
        if (withdrawTindyConfig) {
          withdrawTindyConfig.referralFee = {
            destination:
              "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
            payment: new AssetAmount(1000000n, {
              assetId: "",
              decimals: 6,
            }),
            feeLabel: "Test Fee",
          };
        }

        if (withdrawRberryConfig) {
          withdrawRberryConfig.referralFee = {
            destination:
              "addr_test1qp6crwxyfwah6hy7v9yu5w6z2w4zcu53qxakk8ynld8fgcpxjae5d7xztgf0vyq7pgrrsk466xxk25cdggpq82zkpdcsdkpc68",
            payment: new AssetAmount(1000000n, {
              assetId: "",
              decimals: 6,
            }),
            feeLabel: "Test Fee",
          };
        }
      }

      const migrations: {
        withdrawConfig: IWithdrawConfigArgs;
        depositPool: IPoolData;
      }[] = [];

      withdrawTindyConfig &&
        migrations.push({
          withdrawConfig: withdrawTindyConfig,
          depositPool: V3_CONTRACT_POOL_TINDY,
        });
      withdrawRberryConfig &&
        migrations.push({
          withdrawConfig: withdrawRberryConfig,
          depositPool: V3_CONTRACT_POOL_RBERRY,
        });

      if (!migrations.length) {
        throw new Error("Nothing to migrate!");
      }

      await SDK.builder(EContractVersion.V1, builderLib)
        .migrateLiquidityToV3(migrations)
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

    setMigrating(false);
  }, [
    SDK,
    submit,
    walletAddress,
    useReferral,
    useV3Contracts,
    poolQuery,
    builderLib,
  ]);

  if (!SDK || useV3Contracts) {
    return null;
  }

  return (
    <Button disabled={!ready} onClick={handleMigrating} loading={migrating}>
      Migrate Liquidity ({useV3Contracts ? "V3" : "V1"})
    </Button>
  );
};
