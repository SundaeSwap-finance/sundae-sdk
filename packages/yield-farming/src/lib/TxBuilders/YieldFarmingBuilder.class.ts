import {
  type Blaze,
  type TxBuilder as BlazeTx,
  Core,
  makeValue,
  type Provider,
  TxBuilder,
  type Wallet,
} from "@blaze-cardano/sdk";
import { AssetAmount, type IAssetAmountMetadata } from "@sundaeswap/asset";
import {
  ADA_METADATA,
  BlazeHelper,
  CANCEL_REDEEMER,
  type IComposedTx,
  type ITxBuilderReferralFee,
  type TSupportedNetworks,
} from "@sundaeswap/core";
import { SundaeUtils } from "@sundaeswap/core/utilities";

import { serialize } from "@blaze-cardano/data";
import { PositionRedeemer, TDelegationPrograms } from "../../@types/blaze.js";
import { ILockConfigArgs } from "../../@types/configs.js";
import { YieldFarmingAbstract } from "../Abstracts/YieldFarmingAbstract.class.js";
import { LockConfig } from "../Configs/LockConfig.js";
import { YieldFarmingDatumBuilder } from "../DatumBuilder/YieldFarmingDatumBuilder.class.js";

/**
 * Object arguments for completing a transaction.
 */
export interface IYieldFarmingCompleteTxArgs {
  datum?: string;
  deposit: AssetAmount<IAssetAmountMetadata>;
  referralFee?: ITxBuilderReferralFee;
  tx: BlazeTx;
}

interface IYieldFarmingParams {
  referenceInput: string;
  scriptHash: string;
  stakeKeyHash: string;
  minLockAda: bigint;
}

/**
 * Represents the YieldFarmingBuilder class, capable of handling various blockchain interactions for interacting with the
 * Yield Farming V2 contracts on the SundaeSwap protocol.
 *
 * This class encapsulates methods for common operations required in the Yield Farming process on the blockchain.
 * It provides an interface to lock and unlock assets, including updating their respective delegation datums.
 *
 * The YieldFarmingBuilder class relies on the Blaze service, which can come either from your own instance or from an existing
 * @module Core.SundaeSDK class instance (as shown below). The class methods handle the detailed steps of each operation, including
 * transaction preparation, fee handling, and error checking, abstracting these complexities from the end user.
 *
 * ```ts
 * const YF = new YieldFarmingBuilder(SundaeSDKInstance.blaze());
 * const txHash = await YF.lock({ ...args }).then(({ submit }) => submit());
 * ```
 *
 * @extends {YieldFarmingAbstract}
 */
export class YieldFarmingBuilder implements YieldFarmingAbstract {
  network: TSupportedNetworks;
  datumBuilder: YieldFarmingDatumBuilder;
  tracing: boolean = false;

  static PARAMS: Record<TSupportedNetworks, IYieldFarmingParams> = {
    mainnet: {
      stakeKeyHash: "d7244b4a8777b7dc6909f4640cf02ea4757a557a99fb483b05f87dfe",
      scriptHash: "73275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c",
      referenceInput:
        "5af2bc2b1c983f65122d8737755d1de6e88c4d24797fdfac2c01e5156c15256f#0",
      minLockAda: 5_000_000n,
    },
    preview: {
      stakeKeyHash: "045d47cac5067ce697478c11051deb935a152e0773a5d7430a11baa8",
      scriptHash: "73275b9e267fd927bfc14cf653d904d1538ad8869260ab638bf73f5c",
      referenceInput:
        "aaaf193b8418253f4169ab869b77dedd4ee3df4f2837c226cee3c2f7fa955189#0",
      minLockAda: 5_000_000n,
    },
    preprod: {
      stakeKeyHash: "",
      scriptHash: "",
      referenceInput: "",
      minLockAda: 5_000_000n,
    },
  };

  constructor(public blaze: Blaze<Provider, Wallet>) {
    const network: TSupportedNetworks = blaze.provider.network
      ? "mainnet"
      : "preview";
    this.network = network;
    this.datumBuilder = new YieldFarmingDatumBuilder(network);
  }

  /**
   * Enables tracing in the Blaze transaction builder.
   *
   * @param {boolean} enable True to enable tracing, false to turn it off. (default: false)
   * @returns {YieldFarmingBuilder}
   */
  public enableTracing(enable: boolean): YieldFarmingBuilder {
    this.tracing = enable;
    return this;
  }

  /**
   * Helper method to get a specific parameter of the transaction builder.
   *
   * @param {K extends keyof IYieldFarmingParams} param The parameter you want to retrieve.
   * @param {TSupportedNetworks} network The protocol network.
   * @returns {IYieldFarmingParams[K]}
   */
  static getParam<K extends keyof IYieldFarmingParams>(
    param: K,
    network: TSupportedNetworks,
  ): IYieldFarmingParams[K] {
    return YieldFarmingBuilder.PARAMS[network][param];
  }

  /**
   * An internal shortcut method to avoid having to pass in the network all the time.
   *
   * @param param The parameter you want to retrieve.
   * @returns {IYieldFarmingParams}
   */
  private __getParam<K extends keyof IYieldFarmingParams>(param: K) {
    return YieldFarmingBuilder.getParam(param, this.network);
  }

  /**
   * Builds a new transaction and enables tracing if set.
   *
   * @returns {TxBuilder}
   */
  private newTransaction(): TxBuilder {
    const tx = this.blaze.newTransaction();
    tx.enableTracing(this.tracing);
    return tx;
  }

  /**
   * Builds a valid transaction for the V2 Yield Farming contract
   * that allows a user to add or update staking positions.
   * @param lockArgs
   * @returns
   */
  async lock(
    lockArgs: ILockConfigArgs<TDelegationPrograms>,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const {
      existingPositions,
      lockedValues,
      ownerAddress,
      programs,
      referralFee,
    } = new LockConfig<TDelegationPrograms>(lockArgs).buildArgs();

    const [referenceInputs, existingPositionData] = await Promise.all([
      this.blaze.provider.resolveUnspentOutputs([
        new Core.TransactionInput(
          Core.TransactionId(this.__getParam("referenceInput").split("#")[0]),
          BigInt(this.__getParam("referenceInput").split("#")[1]),
        ),
      ]),
      (() =>
        existingPositions &&
        existingPositions.length > 0 &&
        this.blaze.provider.resolveUnspentOutputs(
          existingPositions.map(
            ({ hash, index }) =>
              new Core.TransactionInput(
                Core.TransactionId(hash),
                BigInt(index),
              ),
          ),
        ))(),
    ]);

    if (!referenceInputs?.length) {
      throw new Error(
        "Could not fetch valid UTXO from Blockfrost based on the the Yield Farming reference input.",
      );
    }

    const payment: Record<string, bigint> = {
      lovelace: 0n,
    };

    /**
     * If lockedValues is set to null, then we are just
     * re-spending the existing assets and forwarding them
     * to the new output. This is a convenience value
     * to enforce explicit behavior.
     */
    if (lockedValues === null && existingPositionData) {
      existingPositionData.forEach((position) => {
        payment.lovelace += position.output().amount().coin();

        const assets = position.output().amount().multiasset() || new Map();
        assets.forEach((amount, assetId) => {
          if (!payment[assetId]) {
            payment[assetId] = amount;
          } else {
            payment[assetId] += amount;
          }
        });
      });
    } else {
      lockedValues?.forEach(({ amount, metadata }) => {
        if (SundaeUtils.isAdaAsset(metadata)) {
          payment.lovelace += amount;
        } else {
          const assetIdRef = metadata?.assetId?.replace(".", "");
          if (!payment[assetIdRef]) {
            payment[assetIdRef] = amount;
          } else {
            payment[assetIdRef] += amount;
          }
        }
      });
    }

    // Deduct the minimum amount we started with if we've supplied at least that much.
    if (payment.lovelace < this.__getParam("minLockAda")) {
      payment.lovelace = this.__getParam("minLockAda");
    }

    const contractAddress = Core.addressFromCredentials(
      this.network === "mainnet"
        ? Core.NetworkId.Mainnet
        : Core.NetworkId.Testnet,
      Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16(this.__getParam("scriptHash")),
        type: Core.CredentialType.ScriptHash,
      }),
      Core.Credential.fromCore({
        hash: Core.Hash28ByteBase16(this.__getParam("stakeKeyHash")),
        type: Core.CredentialType.KeyHash,
      }),
    );

    if (!contractAddress) {
      throw new Error("Could not generate a valid contract address.");
    }

    const paymentPart = BlazeHelper.getPaymentHashFromBech32(ownerAddress);
    const stakingPart = BlazeHelper.getStakingHashFromBech32(ownerAddress);
    const txInstance = this.newTransaction();

    referenceInputs.forEach((input) =>
      txInstance.addReferenceInput(
        // Ensure that each reference is clean.
        Core.TransactionUnspentOutput.fromCbor(input.toCbor()),
      ),
    );
    txInstance.addRequiredSigner(Core.Ed25519KeyHashHex(paymentPart));

    if (stakingPart) {
      txInstance.addRequiredSigner(Core.Ed25519KeyHashHex(stakingPart));
    }

    if (existingPositionData) {
      const redeemer = Core.PlutusData.fromCbor(Core.HexBlob(CANCEL_REDEEMER));
      await Promise.all(
        existingPositionData.map(async (utxo) => {
          const hash = utxo.output().datum()?.asDataHash();

          // If there's no hash, then it has an inline datum and we don't need to provide it.
          if (!hash) {
            txInstance.addInput(utxo, redeemer);
          } else {
            const datum = await this.blaze.provider.resolveDatum(
              Core.DatumHash(hash),
            );
            txInstance.addInput(utxo, redeemer, datum);
          }
        }),
      );
    }

    const deposit = new AssetAmount(
      (existingPositions?.length ?? 0) > 0 ? 0n : this.__getParam("minLockAda"),
      ADA_METADATA,
    );

    /**
     * If there is no lockedValues defined, or it is an empty
     * array, then we can assume we are withdrawing all of our
     * existing positions. Since those are already collected,
     * we can just submit the transaction now and spend the
     * existing positions back to our change address.
     */
    if (
      lockedValues === undefined ||
      (lockedValues && lockedValues.length === 0)
    ) {
      return this.completeTx({
        tx: txInstance,
        deposit,
        referralFee: referralFee,
      });
    }

    let inline: string | undefined;

    /**
     * If we deliberately pass in a null value for
     * delegation programs, then re-use the existing delegation
     * from the existing position data. This assumes that we
     * are updating a position, and not starting new.
     */
    if (programs === null && existingPositionData) {
      for (const position of existingPositionData) {
        const datum = position.output().datum()?.asInlineData();
        if (datum) {
          inline = datum.toCbor();
          break;
        }
      }
    } else {
      const newDatum = this.datumBuilder.buildLockDatum({
        owner: {
          address: ownerAddress,
        },
        programs: programs || [],
      });
      inline = newDatum.inline;
    }

    if (!inline) {
      throw new Error(
        "A datum was not constructed for this lockup, which can brick the funds! Aborting.",
      );
    }

    txInstance.lockAssets(
      contractAddress,
      makeValue(
        payment.lovelace,
        ...Object.entries(payment).filter(([key]) => key !== "lovelace"),
      ),
      Core.PlutusData.fromCbor(Core.HexBlob(inline)),
    );

    return this.completeTx({
      tx: txInstance,
      datum: inline,
      deposit,
      referralFee: referralFee,
    });
  }

  /**
   * Helper method to enforcing isolated updating of an existing
   * position. This function ensures that the delegation datum
   * stored at the existing position will be reused.
   *
   * @param positionArgs
   * @returns
   */
  updatePosition(
    positionArgs: Omit<ILockConfigArgs<TDelegationPrograms>, "programs">,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    return this.lock({
      ...positionArgs,
      programs: null,
    });
  }

  /**
   * Helper method to enforcing isolated updating of an existing
   * delegation. This function ensures that the assets
   * stored at the existing position will be reused.
   *
   * @param delegationArgs
   * @returns
   */
  updateDelegation(
    delegationArgs: Omit<ILockConfigArgs<TDelegationPrograms>, "lockedValues">,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    return this.lock({
      ...delegationArgs,
      lockedValues: null,
    });
  }

  /**
   * Unlocks a position in its entirety.
   *
   * @param unlockArgs
   * @returns
   */
  async unlock(
    unlockArgs: Omit<ILockConfigArgs<TDelegationPrograms>, "lockedValues">,
  ): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    return this.lock({
      ...unlockArgs,
      lockedValues: [],
    });
  }

  async unlock_v1({
    destination,
    positions,
    referralFee,
  }: {
    destination: string;
    positions: Core.TransactionUnspentOutput[];
    referralFee?: ITxBuilderReferralFee;
  }): Promise<IComposedTx<BlazeTx, Core.Transaction>> {
    const tx = this.newTransaction();
    const v1UnlockScript =
      "5908fe0100003233223233223233322232333222323333333322222222323332223233332222323233223233322232333222323233223322323232332233223333322222332233223322332233223322322223253353035001104b13504c35304a3357389201035054350004b498ccc888d4c06c00c88d4c02800c88d4c0380088888888888cd4c0ac480048ccd5cd19b8f00100f048047003335004232323333573466e1cd55cea8012400046603a6eb8d5d0a8011bae357426ae8940088d413cd4c134cd5ce249035054310004e49926135573ca00226ea800400ccd40108cccd5cd19b8735573a6ea80052000201923504d35304b3357389201035054310004c49926002335004232323333573466e1cd55cea8012400046601464646464646464646464646666ae68cdc39aab9d500a480008cccccccccc060cd40ac8c8c8cccd5cd19b8735573aa004900011980f181f1aba150023030357426ae8940088d417cd4c174cd5ce249035054310005e49926135573ca00226ea8004d5d0a80519a8158161aba150093335503275ca0626ae854020ccd540c9d728189aba1500733502b04735742a00c66a05666aa0b00a0eb4d5d0a8029919191999ab9a3370e6aae754009200023350203232323333573466e1cd55cea80124000466a05066a08ceb4d5d0a80118259aba135744a00446a0c66a60c266ae712401035054310006249926135573ca00226ea8004d5d0a8011919191999ab9a3370e6aae7540092000233502633504675a6ae854008c12cd5d09aba250022350633530613357389201035054310006249926135573ca00226ea8004d5d09aba2500223505f35305d3357389201035054310005e49926135573ca00226ea8004d5d0a80219a815bae35742a00666a05666aa0b0eb88004d5d0a801181e9aba135744a00446a0b66a60b266ae71241035054310005a49926135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135573ca00226ea8004d5d0a8011919191999ab9a3370ea00290031180e981f9aba135573ca00646666ae68cdc3a801240084603860926ae84d55cf280211999ab9a3370ea00690011180e181a1aba135573ca00a46666ae68cdc3a802240004603e6eb8d5d09aab9e50062350563530543357389201035054310005549926499264984d55cea80089baa001357426ae8940088d413cd4c134cd5ce249035054310004e49926135573ca00226ea8004004480048848cc00400c0088004888888888848cccccccccc00402c02802402001c01801401000c00880048848cc00400c008800448848cc00400c0084800448848cc00400c0084800448848cc00400c00848004848888c010014848888c00c014848888c008014848888c00401480044800480048848cc00400c0088004c8004d540d0884894cd4d4034004407c8854cd4c080c01000840884cd4c0184800401000448c88c008dd6000990009aa81a111999aab9f0012500e233500d30043574200460066ae880080c88c8c8c8cccd5cd19b8735573aa006900011998039919191999ab9a3370e6aae754009200023300d303135742a00466a02605a6ae84d5d1280111a81c1a981b19ab9c491035054310003749926135573ca00226ea8004d5d0a801999aa805bae500a35742a00466a01eeb8d5d09aba25002235034353032335738921035054310003349926135744a00226aae7940044dd50009110919980080200180110009109198008018011000899aa800bae75a224464460046eac004c8004d540b888c8cccd55cf80112804919a80419aa81898031aab9d5002300535573ca00460086ae8800c0b44d5d08008891001091091198008020018900089119191999ab9a3370ea002900011a80418029aba135573ca00646666ae68cdc3a801240044a01046a0566a605266ae712401035054310002a499264984d55cea80089baa001121223002003112200112001232323333573466e1cd55cea8012400046600c600e6ae854008dd69aba135744a00446a04a6a604666ae71241035054310002449926135573ca00226ea80048848cc00400c00880048c8cccd5cd19b8735573aa002900011bae357426aae7940088d4084d4c07ccd5ce24810350543100020499261375400224464646666ae68cdc3a800a40084a00e46666ae68cdc3a8012400446a014600c6ae84d55cf280211999ab9a3370ea00690001280511a8121a981119ab9c490103505431000234992649926135573aa00226ea8004484888c00c0104488800844888004480048c8cccd5cd19b8750014800880188cccd5cd19b8750024800080188d4070d4c068cd5ce249035054310001b499264984d55ce9baa0011220021220012001232323232323333573466e1d4005200c200b23333573466e1d4009200a200d23333573466e1d400d200823300b375c6ae854014dd69aba135744a00a46666ae68cdc3a8022400c46601a6eb8d5d0a8039bae357426ae89401c8cccd5cd19b875005480108cc048c050d5d0a8049bae357426ae8940248cccd5cd19b875006480088c050c054d5d09aab9e500b23333573466e1d401d2000230133016357426aae7940308d4084d4c07ccd5ce2481035054310002049926499264992649926135573aa00826aae79400c4d55cf280109aab9e500113754002424444444600e01044244444446600c012010424444444600a010244444440082444444400644244444446600401201044244444446600201201040024646464646666ae68cdc3a800a400446660106eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d400920002300a300b357426aae7940188d4048d4c040cd5ce2490350543100011499264984d55cea80189aba25001135573ca00226ea80048488c00800c888488ccc00401401000c80048c8c8cccd5cd19b875001480088c018dd71aba135573ca00646666ae68cdc3a80124000460106eb8d5d09aab9e500423500c35300a3357389201035054310000b499264984d55cea80089baa001212230020032122300100320011122232323333573466e1cd55cea80124000466aa016600c6ae854008c014d5d09aba25002235009353007335738921035054310000849926135573ca00226ea8004480048004498448848cc00400c008448004448c8c00400488cc00cc0080080041";
    const paymentPart = BlazeHelper.getPaymentHashFromBech32(destination);

    const script = Core.Script.newPlutusV1Script(
      new Core.PlutusV1Script(Core.HexBlob(v1UnlockScript)),
    );

    tx.provideScript(script);
    tx.addRequiredSigner(Core.Ed25519KeyHashHex(paymentPart));
    await Promise.all(
      positions.map(async (p) => {
        const hash = p.output().datum()?.asDataHash();
        if (!hash) {
          tx.addInput(p, serialize(PositionRedeemer, "EMPTY"));
        } else {
          const datum = await this.blaze.provider.resolveDatum(hash);
          tx.addInput(p, serialize(PositionRedeemer, "EMPTY"), datum);
        }
      }),
    );

    const allAssets: Record<string, bigint> = {
      lovelace: 0n,
    };
    positions.forEach((p) => {
      allAssets.lovelace += p.output().amount().coin();
      const assets = p.output().amount().multiasset();
      if (assets) {
        Object.entries(assets).forEach(([id, amt]) => {
          if (allAssets[id]) {
            allAssets[id] += amt;
          } else {
            allAssets[id] = amt;
          }
        });
      }
    });

    tx.payAssets(
      Core.Address.fromBech32(destination),
      makeValue(
        allAssets.lovelace,
        ...Object.entries(allAssets).filter(([key]) => key !== "lovelace"),
      ),
    );

    return this.completeTx({
      deposit: new AssetAmount(0n, ADA_METADATA),
      tx,
      referralFee,
    });
  }

  /**
   * Completes a yield farming transaction by processing referral fees,
   * calculating transaction fees, and preparing the transaction for submission.
   *
   * This method handles the payment of referral fees by determining the type of
   * asset involved and paying the appropriate amount to the specified address.
   * It also attaches metadata related to the referral fee, if applicable.
   * The transaction fees are calculated and set within the transaction object.
   * The method returns an object representing the composed transaction, which
   * includes the original transaction, fees, and an optional datum.
   *
   * The composed transaction object provides a `build` function to finalize the transaction,
   * calculate the Cardano transaction fee, and prepare it for signing and submission.
   *
   * @param {IYieldFarmingCompleteTxArgs} args - The arguments required to complete the transaction, including:
   *   - `datum`: Optional data associated with the transaction.
   *   - `deposit`: The deposit amount required for the transaction.
   *   - `referralFee`: The referral fee details, if applicable.
   *   - `tx`: The initial transaction object to be completed.
   * @returns {Promise<IComposedTx<BlazeTx, Core.Transaction>>} A promise that resolves to the composed transaction object, which includes methods for finalizing, signing, and submitting the transaction.
   */
  private async completeTx({
    datum,
    deposit,
    referralFee,
    tx,
  }: IYieldFarmingCompleteTxArgs): Promise<
    IComposedTx<BlazeTx, Core.Transaction>
  > {
    if (referralFee) {
      tx.payAssets(
        Core.Address.fromBech32(referralFee.destination),
        referralFee.payment,
      );

      if (referralFee.feeLabel) {
        /**
         * @TODO Need to add metadata once fixed in blaze.
         */
        const data = new Core.AuxiliaryData();
        const map = new Map<bigint, Core.Metadatum>();
        map.set(674n, Core.Metadatum.newText(`${referralFee.feeLabel}`));
        data.setMetadata(new Core.Metadata(map));
        tx.setAuxiliaryData(data);
      }
    }

    let finishedTx: Core.Transaction | undefined;
    const that = this;

    const thisTx: IComposedTx<BlazeTx, Core.Transaction> = {
      tx,
      fees: {
        cardanoTxFee: new AssetAmount(0n, ADA_METADATA),
        deposit,
        scooperFee: new AssetAmount(0n, ADA_METADATA),
        referral: new AssetAmount(
          referralFee?.payment.coin() || 0n,
          ADA_METADATA,
        ),
      },
      datum,
      async build() {
        if (!finishedTx) {
          finishedTx = await tx.complete();
        }

        thisTx.fees.cardanoTxFee = new AssetAmount(
          BigInt(finishedTx.body().fee() ?? "0"),
          6,
        );

        return {
          cbor: finishedTx.toCbor(),
          builtTx: finishedTx,
          sign: async () => {
            const signedTx = await that.blaze.signTransaction(
              finishedTx as Core.Transaction,
            );
            return {
              cbor: signedTx.toCbor(),
              submit: async () => await that.blaze.submitTransaction(signedTx),
            };
          },
        };
      },
    };

    return thisTx;
  }
}
