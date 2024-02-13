import { jest } from "@jest/globals";
import { Lucid, OutRef, Provider, UTxO } from "lucid-cardano";

import { getBlockfrostProtocolParameters, windowCardano } from "./cardano.js";
import { PREVIEW_DATA } from "./mockData.js";

type TGetUtxosByOutRefMock = (outRefs: OutRef[]) => Promise<UTxO[] | undefined>;
type TGetUtxosMock = () => UTxO[];

export const setupLucid = (
  useLucid?: (lucid: Lucid) => void,
  options?: {
    customUtxos?: UTxO[];
  }
): {
  getUtxosByOutRefMock: jest.Mock<TGetUtxosByOutRefMock>;
  getUtxosMock: jest.Mock<TGetUtxosMock>;
  mockProvider: jest.Mock;
  ownerAddress: string;
} => {
  const getUtxosByOutRefMock = jest.fn<TGetUtxosByOutRefMock>();
  const getUtxosMock = jest
    .fn<TGetUtxosMock>()
    .mockImplementation(() => PREVIEW_DATA.wallet.utxos);

  const mockProvider = jest.fn().mockImplementation(() => ({
    // Required for collecting UTXOs for some reason.
    getUtxos: getUtxosMock,
    getProtocolParameters: jest
      .fn()
      .mockImplementation(() => getBlockfrostProtocolParameters("preview")),
    getUtxosByOutRef: getUtxosByOutRefMock,
  }));

  beforeAll(async () => {
    global.window = {
      // @ts-ignore
      cardano: windowCardano,
    };

    const provider = new mockProvider() as unknown as Provider;
    const lucid = await Lucid.new(provider, "Preview");
    lucid.selectWalletFrom({
      address: PREVIEW_DATA.addresses.current,
      utxos: options?.customUtxos ?? PREVIEW_DATA.wallet.utxos,
    });
    useLucid?.(lucid);
  });

  afterEach(() => {
    getUtxosByOutRefMock.mockReset();
  });

  return {
    getUtxosByOutRefMock,
    getUtxosMock,
    mockProvider,
    ownerAddress: PREVIEW_DATA.addresses.current,
  };
};
