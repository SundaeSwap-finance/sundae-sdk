import { mock } from "bun:test";

export interface IWalletAPIResponses {
  balance: string;
  changeAddress: string;
  networkId: number;
  rewardAddresses: string[];
  unusedAddresses: string[];
  usedAddresses: string[];
  collateral: string[];
  utxos: string[];
}

const walletApiResponses: IWalletAPIResponses = {
  balance:
    "821a89c8606ba1581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e44591a0584eba0",
  changeAddress:
    "00744b2df6faa2410bfe334e819db1f83689c08cb6fcf152298e1a14130d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105",
  networkId: 0,
  rewardAddresses: [
    "e00d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105",
  ],
  collateral: [],
  unusedAddresses: [
    "00ff310b072c281a4ef0e4166a00f9da571c4998cd57bb91764dfbdcf80d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105",
    "0048d877c663d8cb8b2f138a39148851e00e919a32396f50db5dbf8a6e0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105",
    "00c81daa4c987b37903b261eb86c8966e9ce54cdadc3d38b88709f78160d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105",
  ],
  usedAddresses: [
    "00a84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d40d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105",
    "005ba681182207a86520605f68867fa9a017782550516942355696c8280d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105",
    "008692a239eeae24067fb6ead1d4f636ae47fa2b5494884261dd768c4c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105",
  ],
  utxos: [
    "828258203d78636dd1954d4321f3681d5315a0b9ddd6056d20ca821f83662c33e9ad1cf20182583900a84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d40d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d51051a881ab2ce",
    "82825820f8484c9d324ccb446f700f738c03570170eab000805a675e9fbdf5967f89852002825839008692a239eeae24067fb6ead1d4f636ae47fa2b5494884261dd768c4c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105821a019bfcbfa1581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e44591a00fd280e",
    "82825820fa93050bab619f9150d73560317b4656dd458a25665967324185a75872f3cac10182583900a84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d40d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105821a0011b0dea1581cfa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183a14574494e44591a0487c392",
  ],
};

const mockAPI = {
  experimental: {
    getCollateral: mock<() => Promise<string[]>>().mockImplementation(() =>
      Promise.resolve([walletApiResponses.utxos[0]]),
    ),
    off: mock(),
    on: mock(),
  },
  getBalance: mock<() => Promise<string>>().mockImplementation(() =>
    Promise.resolve(walletApiResponses.balance),
  ),
  getChangeAddress: mock<() => Promise<string>>().mockImplementation(() =>
    Promise.resolve(walletApiResponses.changeAddress),
  ),
  getNetworkId: mock<() => Promise<number>>().mockImplementation(() =>
    Promise.resolve(walletApiResponses.networkId),
  ),
  getRewardAddresses: mock<() => Promise<string[]>>().mockImplementation(() =>
    Promise.resolve(walletApiResponses.rewardAddresses),
  ),
  getCollateral: mock<() => Promise<string[]>>().mockImplementation(() =>
    Promise.resolve(walletApiResponses.collateral),
  ),
  getUnusedAddresses: mock<() => Promise<string[]>>().mockImplementation(() =>
    Promise.resolve(walletApiResponses.unusedAddresses),
  ),
  getUsedAddresses: mock<() => Promise<string[]>>().mockImplementation(() =>
    Promise.resolve(walletApiResponses.usedAddresses),
  ),
  getUtxos: mock<() => Promise<string[]>>().mockImplementation(() =>
    Promise.resolve(walletApiResponses.utxos),
  ),
  submitTx: mock<() => Promise<string>>().mockImplementation(() =>
    Promise.resolve("test-preview-txhash"),
  ),
  signData: mock<
    () => Promise<{ signature: string; key: string }>
  >().mockImplementation(() =>
    Promise.resolve({
      signature: "test-preview-signature",
      key: "test-preview-key",
    }),
  ),
  signTx: mock<() => Promise<string>>().mockImplementation(() =>
    Promise.resolve("test-preview-signedtx"),
  ),
};

export const windowCardano: {
  eternl: {
    name: string;
    enable: () => Promise<typeof mockAPI>;
    icon: string;
    isEnabled: () => Promise<boolean>;
    version: string;
  };
} = {
  eternl: {
    name: "Eternl",
    enable: mock<() => Promise<typeof mockAPI>>().mockImplementation(() =>
      Promise.resolve(mockAPI),
    ),
    icon: "",
    isEnabled: mock<() => Promise<boolean>>().mockImplementation(() =>
      Promise.resolve(true),
    ),
    version: "test",
  },
};

export const setupGlobalCardano = () => {
  Object.defineProperty(global, "window", {
    value: {
      cardano: windowCardano,
    },
  });
};
