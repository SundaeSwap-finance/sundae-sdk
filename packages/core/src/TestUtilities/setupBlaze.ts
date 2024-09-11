import { afterEach, beforeAll, spyOn, type Mock } from "bun:test";

import { Emulator, EmulatorProvider } from "@blaze-cardano/emulator";
import { Blaze, ColdWallet, Core, makeValue } from "@blaze-cardano/sdk";
import { windowCardano } from "./cardano.js";
import { PREVIEW_DATA } from "./mockData.js";

const convertedOutputs = PREVIEW_DATA.wallet.utxos.map((utxo) => {
  return Core.TransactionOutput.fromCore({
    address: Core.PaymentAddress(utxo.address),
    value: makeValue(
      utxo.assets.lovelace,
      ...Object.entries(utxo.assets).filter(([key]) => key !== "lovelace"),
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
  useBlaze?: (blaze: Blaze<EmulatorProvider, ColdWallet>) => Promise<void>,
  options?: {
    customUtxos?: Core.TransactionOutput[];
    beforeAll?: () => void;
  },
): {
  getUtxosByOutRefMock: Mock<
    (txIns: Core.TransactionInput[]) => Promise<Core.TransactionUnspentOutput[]>
  >;
  getUtxosMock: Mock<
    (address: Core.Address) => Promise<Core.TransactionUnspentOutput[]>
  >;
  resolveDatumMock: Mock<
    (datumHash: Core.DatumHash) => Promise<Core.PlutusData>
  >;
  ownerAddress: string;
} => {
  const getUtxosByOutRefMock = spyOn(
    EmulatorProvider.prototype,
    "resolveUnspentOutputs",
  );
  const getUtxosMock = spyOn(EmulatorProvider.prototype, "getUnspentOutputs");
  const resolveDatumMock = spyOn(EmulatorProvider.prototype, "resolveDatum");

  beforeAll(async () => {
    options?.beforeAll?.();

    global.window = {
      // @ts-expect-error Type mismatches.
      cardano: windowCardano,
    };

    const emulator = new Emulator(options?.customUtxos ?? convertedOutputs);
    const provider = new EmulatorProvider(emulator);

    const blaze = await Blaze.from(
      provider,
      new ColdWallet(
        Core.addressFromBech32(PREVIEW_DATA.addresses.current),
        Core.NetworkId.Testnet,
        new EmulatorProvider(emulator),
      ),
    );

    await useBlaze?.(blaze);
  });

  afterEach(() => {
    getUtxosByOutRefMock.mockReset();
  });

  return {
    getUtxosByOutRefMock,
    getUtxosMock,
    resolveDatumMock,
    ownerAddress: PREVIEW_DATA.addresses.current,
  };
};
