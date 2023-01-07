// @ts-nocheck

// import {
//   BrowserWallet as BrowserWalletType,
//   Data as DataType,
//   Transaction as TransactionType,
// } from "@meshsdk/core";
// import { TxBuilder } from "./TxBuilder.abstract";
// import {
//   ITxBuilderLoaderOptions,
//   TMeshArgs,
//   TTxBuilderComplete,
// } from "../../../types";

// export class TxBuilderMesh extends TxBuilder {
//   protected lib?: BrowserWalletType | undefined;
//   protected currentTx?: TransactionType | undefined;
//   protected currentDatum?: DataType | undefined;

//   private constructor(public options: TMeshArgs) {
//     super();
//     this.options = options;
//   }

//   static new(args: ITxBuilderLoaderOptions["mesh"]): TxBuilderMesh {
//     if (!args?.wallet) {
//       throw new Error(
//         "The Mesh options object is missing a required `wallet` parameter."
//       );
//     }

//     return new TxBuilderMesh(args);
//   }

//   async getLib(): Promise<BrowserWalletType> {
//     if (!this.lib) {
//       const { BrowserWallet } = await import("@meshsdk/core");
//       this.lib = await BrowserWallet.enable(this.options.wallet);
//     }

//     return this.lib;
//   }

//   async swap(): Promise<TxBuilderMesh> {
//     const { Transaction } = await import("@meshsdk/core");
//     const tx = new Transaction({ initiator: await this.getLib() });
//     const data: DataType = [];

//     console.log(tx, data);
//     return this;
//   }

//   async complete(): Promise<TTxBuilderComplete> {
//     if (!this.currentTx) {
//       throw new Error("There is no current Transaction to complete!");
//     }

//     const lib = await this.getLib();
//     const unsignedTx = await this.currentTx.build();
//     const signedTx = await lib.signTx(unsignedTx);

//     return {
//       cbor: signedTx,
//       submit: () => lib.submitTx(signedTx),
//     };
//   }

//   async createCurrentTx(): Promise<TransactionType> {
//     const { Transaction } = await import("@meshsdk/core");
//     this.currentTx = new Transaction({ initiator: await this.getLib() });
//     return this.currentTx;
//   }
// }

export {};
