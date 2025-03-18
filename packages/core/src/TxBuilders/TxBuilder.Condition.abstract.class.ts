import { TxBuilder as BlazeTx, Core, Data, makeValue } from "@blaze-cardano/sdk";
import { EContractVersion, IComposedTx, IMintConditionPoolConfigArgs, ISundaeProtocolParamsFull, TDatumResult } from "src/@types";
import { MintConditionPoolConfig } from "src/Configs/MintConditionPoolConfig.class";
import { ORDER_DEPOSIT_DEFAULT, POOL_MIN_ADA } from "src/constants";
import { TPoolDatum } from "src/DatumBuilders/ContractTypes/Contract.Condition";
import { SettingsDatum } from "src/DatumBuilders/ContractTypes/Contract.v3";
import { DatumBuilderCondition, IDatumBuilderMintPoolConditionArgs } from "src/DatumBuilders/DatumBuilder.Condition.abstract.class";
import { SundaeUtils } from "src/Utilities";
import { TxBuilderV3 } from "./TxBuilder.V3.class";

export abstract class TxBuilderCondition extends TxBuilderV3 {

      /**
       * Retrieves the basic protocol parameters from the SundaeSwap API
       * and fills in a place-holder for the compiled code of any validators.
       *
       * This is to keep things lean until we really need to attach a validator,
       * in which case, a subsequent method call to {@link TxBuilderV3#getValidatorScript}
       * will re-populate with real data.
       *
       * @returns {Promise<ISundaeProtocolParamsFull>}
       */
      public async getProtocolParams(): Promise<ISundaeProtocolParamsFull> {
        if (!this.protocolParams) {
          this.protocolParams =
            await this.queryProvider.getProtocolParamsWithScripts(
              EContractVersion.Condition,
            );
        }
    
        return this.protocolParams;
      }

      public abstract buildMintPoolDatum({
              assetA,
              assetB,
              fees,
              marketOpen,
              depositFee,
              seedUtxo,
              condition,
              conditionDatumArgs
            }: IDatumBuilderMintPoolConditionArgs): TDatumResult<TPoolDatum>;

      /**
         * Mints a new liquidity pool on the Cardano blockchain. This method
         * constructs and submits a transaction that includes all the necessary generation
         * of pool NFTs, metadata, pool assets, and initial liquidity tokens,
         *
         * @param {IMintConditionPoolConfigArgs} mintPoolArgs - Configuration arguments for minting the pool, including assets,
         * fee parameters, owner address, protocol fee, and referral fee.
         *  - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
         *  - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
         *  - fee: The desired pool fee, denominated out of 10 thousand.
         *  - marketOpen: The POSIX timestamp for when the pool should allow trades (market open).
         *  - ownerAddress: Who the generated LP tokens should be sent to.
         * @returns {Promise<IComposedTx<BlazeTx, Core.Transaction>>} A completed transaction object.
         *
         * @throws {Error} Throws an error if the transaction fails to build or submit.
         */
        async mintPool(
          mintPoolArgs: IMintConditionPoolConfigArgs,
        ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
          const {
            assetA,
            assetB,
            fees,
            marketOpen,
            ownerAddress,
            referralFee,
            donateToTreasury,
            condition,
            conditionDatumArgs
          } = new MintConditionPoolConfig(mintPoolArgs).buildArgs();
      
          const sortedAssets = SundaeUtils.sortSwapAssetsWithAmounts([
            assetA,
            assetB,
          ]);
      
          const exoticPair = !SundaeUtils.isAdaAsset(sortedAssets[0].metadata);
      
          const [userUtxos, { hash: poolPolicyId }, references, settings] =
            await Promise.all([
              this.getUtxosForPoolMint(sortedAssets),
              this.getValidatorScript("pool.mint"),
              this.getAllReferenceUtxos(),
              this.getSettingsUtxo(),
            ]);
      
          const seedUtxo = {
            outputIndex: Number(userUtxos[0].input().index().toString()),
            txHash: userUtxos[0].input().transactionId(),
          };
      
          const newPoolIdent = DatumBuilderCondition.computePoolId(seedUtxo);
      
          const nftAssetName = DatumBuilderCondition.computePoolNftName(newPoolIdent);
          const poolNftAssetIdHex = `${poolPolicyId + nftAssetName}`;
      
          const refAssetName = DatumBuilderCondition.computePoolRefName(newPoolIdent);
          const poolRefAssetIdHex = `${poolPolicyId + refAssetName}`;
      
          const poolLqAssetName = DatumBuilderCondition.computePoolLqName(newPoolIdent);
          const poolLqAssetIdHex = `${poolPolicyId + poolLqAssetName}`;
      
          const poolAssets = {
            lovelace: POOL_MIN_ADA,
            [poolNftAssetIdHex]: 1n,
            [sortedAssets[1].metadata.assetId.replace(".", "")]:
              sortedAssets[1].amount,
          };
      
          if (exoticPair) {
            // Add non-ada asset.
            poolAssets[sortedAssets[0].metadata.assetId.replace(".", "")] =
              sortedAssets[0].amount;
          } else {
            poolAssets.lovelace += sortedAssets[0].amount;
          }
      
          const {
            inline: mintPoolDatum,
            schema: { circulatingLp },
          } = this.buildMintPoolDatum({
            assetA: sortedAssets[0],
            assetB: sortedAssets[1],
            fees,
            marketOpen,
            depositFee: POOL_MIN_ADA,
            seedUtxo,
            condition,
            conditionDatumArgs
          });
      
          const { inline: mintRedeemerDatum } =
            this.datumBuilder.buildPoolMintRedeemerDatum({
              assetA: sortedAssets[0],
              assetB: sortedAssets[1],
              // The metadata NFT is in the second output.
              metadataOutput: 1n,
              // The pool output is the first output.
              poolOutput: 0n,
            });
      
          const settingsDatum = await this.getSettingsUtxoDatum();
          if (!settingsDatum) {
            throw new Error("Could not retrieve the datum from the settings UTXO.");
          }
      
          const {
            metadataAdmin: { paymentCredential, stakeCredential },
            authorizedStakingKeys: [poolStakingCredential],
          } = Data.from(
            Core.PlutusData.fromCbor(Core.HexBlob(settingsDatum)),
            SettingsDatum,
          );
          const metadataAddress = DatumBuilderCondition.addressSchemaToBech32(
            { paymentCredential, stakeCredential },
            this.network === "mainnet"
              ? Core.NetworkId.Mainnet
              : Core.NetworkId.Testnet,
          );
      
          const { blueprint } = await this.getProtocolParams();
          const poolContract = blueprint.validators.find(
            ({ title }) => title === "pool.mint",
          );
      
          const sundaeStakeAddress = DatumBuilderCondition.addressSchemaToBech32(
            {
              paymentCredential: {
                SCredential: {
                  bytes: poolContract?.hash as string,
                },
              },
              stakeCredential: {
                keyHash: poolStakingCredential,
              },
            },
            this.network === "mainnet"
              ? Core.NetworkId.Mainnet
              : Core.NetworkId.Testnet,
          );
      
          const tx = this.newTxInstance(referralFee);
          const mints = new Map<Core.AssetName, bigint>();
          mints.set(Core.AssetName(nftAssetName), 1n);
          mints.set(Core.AssetName(refAssetName), 1n);
          mints.set(Core.AssetName(poolLqAssetName), circulatingLp);
      
          [...references, settings].forEach((utxo) => {
            tx.addReferenceInput(
              Core.TransactionUnspentOutput.fromCore(utxo.toCore()),
            );
          });
          userUtxos.forEach((utxo) => tx.addInput(utxo));
      
          // Mint our assets.
          tx.addMint(
            Core.PolicyId(poolPolicyId),
            mints,
            Core.PlutusData.fromCbor(Core.HexBlob(mintRedeemerDatum)),
          );
      
          // Lock the pool assets at the pool script.
          tx.lockAssets(
            Core.addressFromBech32(sundaeStakeAddress),
            makeValue(
              poolAssets.lovelace,
              ...Object.entries(poolAssets).filter(([key]) => key !== "lovelace"),
            ),
            Core.PlutusData.fromCbor(Core.HexBlob(mintPoolDatum)),
          );
      
          // Send the metadata reference NFT to the metadata address.
          const address = Core.addressFromBech32(metadataAddress);
          const type = address.getProps().paymentPart?.type;
          if (type === Core.CredentialType.ScriptHash) {
            tx.lockAssets(
              address,
              makeValue(ORDER_DEPOSIT_DEFAULT, [poolRefAssetIdHex, 1n]),
              Data.void(),
            );
          } else {
            tx.payAssets(
              address,
              makeValue(ORDER_DEPOSIT_DEFAULT, [poolRefAssetIdHex, 1n]),
              Data.void(),
            );
          }
      
          if (donateToTreasury) {
            const datum = Data.from(
              Core.PlutusData.fromCbor(Core.HexBlob(settingsDatum)),
              SettingsDatum,
            );
            const realTreasuryAddress = DatumBuilderCondition.addressSchemaToBech32(
              datum.treasuryAddress,
              this.network === "mainnet"
                ? Core.NetworkId.Mainnet
                : Core.NetworkId.Testnet,
            );
      
            if (donateToTreasury === 100n) {
              tx.payAssets(
                Core.addressFromBech32(realTreasuryAddress),
                makeValue(ORDER_DEPOSIT_DEFAULT, [poolLqAssetIdHex, circulatingLp]),
                Data.void(),
              );
            } else {
              const donation = (circulatingLp * donateToTreasury) / 100n;
              tx.provideDatum(Data.void()).payAssets(
                Core.addressFromBech32(realTreasuryAddress),
                makeValue(ORDER_DEPOSIT_DEFAULT, [poolLqAssetIdHex, donation]),
                Data.void(),
              );
      
              tx.payAssets(
                Core.addressFromBech32(ownerAddress),
                makeValue(ORDER_DEPOSIT_DEFAULT, [
                  poolLqAssetIdHex,
                  circulatingLp - donation,
                ]),
              );
            }
          } else {
            tx.payAssets(
              Core.addressFromBech32(ownerAddress),
              makeValue(ORDER_DEPOSIT_DEFAULT, [poolLqAssetIdHex, circulatingLp]),
            );
          }
      
          // Add collateral since coin selection is false.
          tx.provideCollateral(userUtxos);
      
          return this.completeTx({
            tx,
            datum: mintPoolDatum,
            referralFee: referralFee?.payment,
            deposit: ORDER_DEPOSIT_DEFAULT * (exoticPair ? 3n : 2n),
            /**
             * We avoid Blaze's version of coinSelection because we need to ensure
             * that the first input is also the seed input for determining the pool
             * ident.
             */
            coinSelection: false,
            /**
             * There are some issues with the way Blaze evaluates scripts sometimes,
             * so we just use the Haskell Plutus core engine since we use Blockfrost.
             */
            nativeUplc: false,
          });
        }

}