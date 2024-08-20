import { jest } from "@jest/globals";

import { Emulator, EmulatorProvider } from "@blaze-cardano/emulator";
import { Blaze, ColdWallet, Core, makeValue } from "@blaze-cardano/sdk";
import { windowCardano } from "./cardano.js";
import { PREVIEW_DATA } from "./mockData.js";

type TGetUtxosByOutRefMock = (
  outRefs: { txHash: string; outputIndex: number }[]
) => Promise<Core.TransactionOutput[] | undefined>;
type TGetUtxosMock = () => Promise<Core.TransactionOutput[]>;

const convertedOutputs = PREVIEW_DATA.wallet.utxos.map((utxo) => {
  return Core.TransactionOutput.fromCore({
    address: Core.PaymentAddress(utxo.address),
    value: makeValue(
      utxo.assets.lovelace,
      ...Object.entries(utxo.assets).filter(([key]) => key !== "lovelace")
    ).toCore(),
    datum: utxo.datum
      ? Core.PlutusData.fromCbor(Core.HexBlob(utxo.datum)).toCore()
      : undefined,
    datumHash: utxo.datumHash
      ? Core.DatumHash(Core.HexBlob(utxo.datumHash))
      : undefined,
  });
});

export const setupBlaze = (
  useBlaze?: (blaze: Blaze<EmulatorProvider, ColdWallet>) => void,
  options?: {
    customUtxos?: Core.TransactionOutput[];
    beforeAll?: () => void;
  }
): {
  getUtxosByOutRefMock: jest.SpiedFunction<
    (txIns: Core.TransactionInput[]) => Promise<Core.TransactionUnspentOutput[]>
  >;
  getUtxosMock: jest.SpiedFunction<
    (address: Core.Address) => Promise<Core.TransactionUnspentOutput[]>
  >;
  ownerAddress: string;
} => {
  const getUtxosByOutRefMock = jest.spyOn(
    EmulatorProvider.prototype,
    "resolveUnspentOutputs"
  );
  const getUtxosMock = jest.spyOn(
    EmulatorProvider.prototype,
    "getUnspentOutputs"
  );

  beforeAll(async () => {
    options?.beforeAll?.();

    global.window = {
      // @ts-ignore
      cardano: windowCardano,
    };

    const emulator = new Emulator(options?.customUtxos ?? convertedOutputs);
    const provider = new EmulatorProvider(emulator);

    const blaze = await Blaze.from(
      provider,
      new ColdWallet(
        Core.addressFromBech32(PREVIEW_DATA.addresses.current),
        Core.NetworkId.Testnet,
        new EmulatorProvider(emulator)
      )
    );

    useBlaze?.(blaze);
  });

  afterEach(() => {
    getUtxosByOutRefMock.mockReset();
  });

  return {
    getUtxosByOutRefMock,
    getUtxosMock,
    ownerAddress: PREVIEW_DATA.addresses.current,
  };
};
