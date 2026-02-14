import {
  QueryProviderSundaeSwap,
  SundaeSDK,
  type ISundaeProtocolParamsFull,
  type TSupportedNetworks,
} from "@sundaeswap/core";
import { getBlazeInstance } from "./utils.js";

export interface ISettings {
  network?: string;
  walletType?: string;
  address?: string;
  privateKey?: string;
  providerType?: string;
  providerKey?: string;
  customProtocolParams?: ISundaeProtocolParamsFull;
}

export class State {
  private sdkInstance?: SundaeSDK;
  settings: ISettings;

  constructor() {
    this.settings = {};
  }

  sdk(): SundaeSDK {
    if (!this.sdkInstance) {
      throw new Error("SDK not initialized. Call setSdk() first.");
    }
    return this.sdkInstance;
  }

  async setSdk(): Promise<void> {
    if (!this.sdkInstance) {
      const blazeInstance = await getBlazeInstance(this);
      this.sdkInstance = SundaeSDK.new({
        blazeInstance,
        network: this.settings.network as TSupportedNetworks,
      });
    } else {
      this.sdk().options.blazeInstance = await getBlazeInstance(this);
    }

    if (this.settings.customProtocolParams) {
      const queryProvider = new QueryProviderSundaeSwap(
        this.settings.network! as TSupportedNetworks,
      );
      queryProvider.addCustomProtocolParams(this.settings.customProtocolParams);
      this.sdk().queryProvider = queryProvider;
      [...this.sdk().builders.values()].forEach((builder) => {
        builder.setQueryProvider(queryProvider);
      });
    }

    return;
  }
}
