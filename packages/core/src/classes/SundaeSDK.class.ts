import { TSupportedTxBuilderOptions, TSwapAsset } from "../types";
import type { Provider } from "./modules/Provider/Provider.abstract.class";
import { ProviderSundaeSwap } from "./modules/Provider/Provider.SundaeSwap";
import type { TxBuilder } from "./modules/TxBuilder/TxBuilder.abstract";

export class SundaeSDK {
  private provider: Provider;
  public TxBuilderOptions: TSupportedTxBuilderOptions;

  constructor(private builder: TxBuilder, provider?: Provider) {
    this.builder = builder;
    this.provider = provider ?? new ProviderSundaeSwap(builder.options.network);
    this.TxBuilderOptions = builder.options;
  }

  query(): Provider {
    return this.provider;
  }

  /**
   *
   * @param givenAsset The asset which you are providing for the swap.
   * @param coinA The first human-readable ticker name or concatenated assetID of the pool.
   * @param coinB The second human-readable ticker name or concatenated assetID of the pool.
   * @param fee The desired fee of the pool you want to use.
   * @param receiverAddress Where you want coinB to be sent to.
   */
  async swap(
    givenAsset: TSwapAsset,
    coinA: string,
    coinB: string,
    fee: string,
    receiverAddress: string
  ) {
    const poolData = await this.provider.findPoolData(coinA, coinB, fee);

    return this.builder.buildSwap({
      givenAsset,
      poolData,
      receiverAddress,
    });
  }
}

// export class SundaeSDK {
//   // Instances.
//   public lucid?: Lucid;

//   // States.
//   public api: WalletApi;
//   public swapping: boolean = false;
//   public network: TSupportedNetworks;
//   public params: IParams;
//   public provider?: Provider;

//   constructor(
//     api: WalletApi,
//     provider: Provider,
//     network: TSupportedNetworks = "Mainnet"
//   ) {
//     this.api = api;
//     this.provider = provider;
//     this.network = network;
//     this.params = params[network];
//   }

//   public async getLucid(): Promise<Lucid> {
//     if (!this.lucid) {
//       this.lucid = await import("lucid-cardano").then(async ({ Lucid }) => {
//         return await Lucid.new(this.provider, this.network);
//       });
//       this.lucid.selectWallet(this.api);
//     }

//     return this.lucid;
//   }

//   public setWalletApi(api: WalletApi) {
//     this.api = api;
//     this.lucid?.selectWallet(api);
//   }

//   public async swap({
//     poolIdent,
//     asset,
//     swapDirection = 0,
//     minimumReceivableAsset = 1n,
//     submit = true,
//   }: IGetSwapArgs): Promise<ISwapResponse> {
//     this.ensureNotSwapping();
//     const assetIDs = getAssetIDs(asset);

//     const { Constr, Data, unixTimeToEnclosingSlot, SLOT_CONFIG_NETWORK } =
//       await import("lucid-cardano");

//     this.swapping = true;
//     const lucid = await this.getLucid();
//     const address = await lucid.wallet.address();
//     const { paymentCredential, stakeCredential } =
//       lucid.utils.getAddressDetails(address);

//     if (!paymentCredential) {
//       throw new Error("You must provide a payment credential!");
//     }

//     // prettier-ignore
//     const data = new Constr(0, [
//       poolIdent,
//       new Constr(0, [
//         new Constr(0, [
//           new Constr(0, [
//             new Constr(0, [
//               // payment credential
//               paymentCredential?.hash
//             ]),
//             stakeCredential?.hash ? new Constr(0, [
//               new Constr(0, [
//                 new Constr(0, [
//                   // staking credential
//                   stakeCredential?.hash
//                 ])
//               ])
//             ]) : new Constr(1, [])
//           ]),
//           new Constr(1, [])
//         ]),
//         new Constr(1, [])
//       ]),
//       `2500000n`,
//       new Constr(0, [
//         new Constr(swapDirection, []),
//         // From-swap or to-swap
//         `${asset.amount}n`,
//         minimumReceivableAsset ? new Constr(0, [
//           minimumReceivableAsset
//         ]) : new Constr(1, []),
//       ])
//     ]);

//     try {
//       const tx = lucid.newTx();
//       const payment: Record<string, bigint> = {};

//       if (assetIDs.concatenated === "") {
//         payment.lovelace =
//           this.params.SCOOPER_FEE + this.params.RIDER_FEE + asset.amount;
//       } else {
//         payment.lovelace = this.params.SCOOPER_FEE + this.params.RIDER_FEE;
//         payment[asset.metadata.assetID.replace(".", "")] = asset.amount;
//       }

//       const ttl = unixTimeToEnclosingSlot(
//         Date.now() / 1000,
//         SLOT_CONFIG_NETWORK[this.network]
//       );

//       tx.payToContract(this.params.ESCROW_ADDRESS, Data.to(data), payment);

//       const finishedTx = await tx.complete();
//       const signedTx = await finishedTx.sign().complete();

//       let response: ISwapResponse;

//       if (submit) {
//         response = {
//           data: await signedTx.submit(),
//           ttl,
//         };
//       } else {
//         const CtxBuffer =
//           typeof window !== "undefined"
//             ? await import("buffer").then(({ Buffer }) => Buffer)
//             : Buffer;
//         response = {
//           data: CtxBuffer.from(signedTx.txSigned.to_bytes()).toString("hex"),
//           ttl,
//         };
//       }

//       this.swapping = false;
//       return response;
//     } catch (e) {
//       this.swapping = false;
//       throw e;
//     }
//   }

//   private ensureNotSwapping() {
//     if (this.swapping) {
//       console.warn(ERROR_CODES[1]);
//       throw new Error(ERROR_CODES[1].message);
//     }
//   }
// }
