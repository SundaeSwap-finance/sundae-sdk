// @ts-nocheck
import { jest } from "@jest/globals";
import { Lucid, WalletApi, Provider, ProtocolParameters } from "lucid-cardano";

import { protocolParams } from "../../lib/params";
import { SundaeSDK } from "../SundaeSDK.class";
import { PreviewParams } from "./data/PreviewParams";

let sdk: SundaeSDK;
let mockWallet: WalletApi;
class MockWalletApi {
  address: string;
  privateKey: string;
  publicKey: string;

  constructor(address: string, privateKey: string, publicKey: string) {
    this.address = address;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  static new(
    address: string,
    privateKey: string,
    publicKey: string
  ): WalletApi {
    return new this(address, privateKey, publicKey) as unknown as WalletApi;
  }

  async getNetworkId() {
    return 0;
  }

  async getUtxos(): Promise<string[] | undefined> {
    const utxos = [
      "828258207ea0b7a83742a0621331675006cd27a663b644a70f2f017252f5e92e78c480fc0182583900d38956d5d8c3e996880298b8e1534679e285f93475cf6aa3256205c7121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0821a0fb65650a2581c99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15ac4443484f431a5b71344c444d494e541a34be809744564f54451b000008e641ef62bd4543484f430a1a3b9aca00454d494e540a1a3b9aca004556414e494c1a1c377bbf465242455252591a0510ff40465342455252591a3ab5e8404656414e494c0a1a3b9aca00475242455252590a1a05f5e100475342455252590a1a3b9aca004850524f504f53414c01581ccf9722966a212e61baa3a1a61a40f5c42a639b5a9272a8d85d1d6998a2446c7020021a41a663b2446c7020041b00000004b4038a00",
      "82825820e73bfbd175f5e2651dda92bd77f0ace2c181953733e9bda2ae8a52a1ca8917a701825839005eaa5cf9ca3ce3bdc0d6562c09d7f0bf6db3f53c9307645455cf9d8e121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0821a00989680a1581ccadd6bf1f7535eed785b01169b03fc800360b396ab5617b560fccd4ea15053616c7361536f6c617269733031343101",
      "82825820f443b8d05da095ee5de85e56ad9fde46109ae6e2410fb81a74f5e27fafca82850182583900f9149b0a7f1080dbb480b4e661c8d53b232459062f279db91fe99fab121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0821a00989680a1581c99b071ce8580d6a3a11b4902145adb8bfd0d2a03935af8cf66403e15a14a446973636f696e476f7601",
      "82825820fb869661336c14a8255e1127a45ef619ea9732abd3884e70aa2b30de61c01505008258390050ae3f3f99d6bb3d0d7f5014d138ae29b2793a2dd331e6da0beef04c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d01aee450260",
      "82825820fb869661336c14a8255e1127a45ef619ea9732abd3884e70aa2b30de61c01505018258390050ae3f3f99d6bb3d0d7f5014d138ae29b2793a2dd331e6da0beef04c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d01a77228130",
      "82825820fb869661336c14a8255e1127a45ef619ea9732abd3884e70aa2b30de61c01505028258390050ae3f3f99d6bb3d0d7f5014d138ae29b2793a2dd331e6da0beef04c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d01a77228130",
      "82825820fb869661336c14a8255e1127a45ef619ea9732abd3884e70aa2b30de61c01505038258390050ae3f3f99d6bb3d0d7f5014d138ae29b2793a2dd331e6da0beef04c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d01a004c4b40",
    ];

    return utxos;
  }

  async getUsedAddresses() {
    return [
      "00c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
    ];
  }

  async signTx(): Promise<string> {
    return "mockSig";
  }

  async submitTx() {
    await new Promise((res) => {
      setTimeout(res, 1000);
    });
  }
}
class MockBlockfrost {
  address: string;
  constructor(address: string) {
    this.address = address;
  }

  static new(address: string): Provider {
    return new this(address) as unknown as Provider;
  }

  async getProtocolParameters(): Promise<ProtocolParameters> {
    return PreviewParams as unknown as ProtocolParameters;
  }
}

beforeEach(() => {
  mockWallet = MockWalletApi.new(
    "00c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0",
    "mockPrivKey",
    "mockPubKey"
  );
  sdk = new SundaeSDK(
    mockWallet,
    MockBlockfrost.new(
      "00c279a3fb3b4e62bbc78e288783b58045d4ae82a18867d8352d02775a121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0"
    ),
    "Preview"
  );
});

describe("SundaeSDK class methods", () => {
  it("should have the right variables", () => {
    expect(sdk.network).toEqual("Preview");
    expect(sdk.api).toBeInstanceOf(MockWalletApi);
    expect(sdk.params).toMatchObject(protocolParams.Preview);
    expect(sdk.provider).toBeInstanceOf(MockBlockfrost);
    expect(sdk.swapping).toBeFalsy();
  });

  it("should update dynamically import lucid", async () => {
    expect(sdk.lucid).toBeUndefined();
    const thisLucid = await sdk.getLucid();
    expect(thisLucid).toBeInstanceOf(Lucid);
    expect(sdk.lucid).toBeInstanceOf(Lucid);
  });

  it("should perform successfully perform a swap", async () => {
    const lucid = await sdk.getLucid();
    const spiedNewTx = jest.spyOn(lucid, "newTx");
    try {
      await sdk.swap({
        poolIdent: "03",
        asset: {
          amount: 20n,
          metadata: {
            assetID:
              "cf9722966a212e61baa3a1a61a40f5c42a639b5a9272a8d85d1d6998.6c702004",
            decimals: 6,
          },
        },
      });
    } catch (e) {
      expect(sdk.swapping).toBeFalsy();
      expect(spiedNewTx).toHaveBeenCalled();
    }
  });
});
