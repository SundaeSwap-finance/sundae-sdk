import { afterEach, beforeAll, mock, type Mock } from "bun:test";
import { Lucid, OutRef, Provider } from "lucid-cardano";

import { getBlockfrostProtocolParameters, windowCardano } from "./cardano.js";
import { LocalUtxo, PREVIEW_DATA } from "./mockData.js";

type TGetUtxosByOutRefMock = (
  outRefs: OutRef[]
) => Promise<LocalUtxo[] | undefined>;
type TGetUtxosMock = () => Promise<LocalUtxo[]>;

export const setupLucid = (
  useLucid?: (lucid: Lucid) => Promise<void>,
  options?: {
    customUtxos?: LocalUtxo[];
    beforeAll?: () => void;
  }
): {
  getUtxosByOutRefMock: Mock<TGetUtxosByOutRefMock>;
  getUtxosMock: Mock<TGetUtxosMock>;
  mockProvider: Mock<any>;
  ownerAddress: string;
} => {
  const getUtxosByOutRefMock = mock<TGetUtxosByOutRefMock>();
  const getUtxosMock = mock<TGetUtxosMock>().mockResolvedValue(
    PREVIEW_DATA.wallet.utxos
  );

  const mockProvider = mock().mockImplementation(() => ({
    url: "https://cardano-preview.blockfrost.io/",
    // All fetch requests get mocked anyway.
    projectId: "test-project-id",

    // Required for collecting UTXOs for some reason.
    getUtxos: getUtxosMock,
    getProtocolParameters: mock().mockImplementation(() =>
      getBlockfrostProtocolParameters("preview")
    ),
    getUtxosByOutRef: getUtxosByOutRefMock,
    getDatum: mock(),
  }));

  beforeAll(async () => {
    options?.beforeAll?.();

    global.window = {
      // @ts-ignore
      cardano: windowCardano,
    };

    // @ts-ignore
    const provider = new mockProvider() as unknown as Provider;
    const lucid = await Lucid.new(provider, "Preview");
    lucid.selectWalletFrom({
      address: PREVIEW_DATA.addresses.current,
      // @ts-ignore
      utxos: options?.customUtxos ?? PREVIEW_DATA.wallet.utxos,
    });
    await useLucid?.(lucid);
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
