import { jest } from "@jest/globals";

import { params } from "../../lib/params";
import { SundaeSDK } from "../SundaeSDK.class";

let sdk: SundaeSDK;

beforeEach(() => {
  // sdk = new SundaeSDK("eternl", "Preview");
});

describe("SundaeSDK class methods", () => {
  // it("should have the right variables", () => {
  //   expect(sdk.network).toEqual("Preview");
  //   expect(sdk.preferredWallet).toEqual("eternl");
  //   expect(sdk.params).toMatchObject(params.Preview);
  //   expect(sdk.swapping).toBeFalsy();
  // });
  // it("should update dynamically import lucid", async () => {
  //   expect(sdk.meshWallet).toBeUndefined();
  //   const thisLucid = await sdk.getMeshWallet();
  //   expect(thisLucid).toBeInstanceOf(Lucid);
  //   expect(sdk.meshWallet).toBeInstanceOf(Lucid);
  // });
  // it("should perform successfully perform a swap", async () => {
  //   const lucid = await sdk.getMeshWallet();
  //   const spiedNewTx = jest.spyOn(lucid, "newTx");
  //   try {
  //     await sdk.swap({
  //       poolIdent: "03",
  //       asset: {
  //         amount: 20n,
  //         metadata: {
  //           assetID:
  //             "cf9722966a212e61baa3a1a61a40f5c42a639b5a9272a8d85d1d6998.6c702004",
  //           decimals: 6,
  //         },
  //       },
  //       walletHash: "",
  //     });
  //   } catch (e) {
  //     expect(sdk.swapping).toBeFalsy();
  //     expect(spiedNewTx).toHaveBeenCalled();
  //   }
  // });
});
