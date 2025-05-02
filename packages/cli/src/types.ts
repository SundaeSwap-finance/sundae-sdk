import {
  QueryProviderSundaeSwap,
  SundaeSDK,
  type ISundaeProtocolParamsFull,
  type TSupportedNetworks,
} from "@sundaeswap/core";
import { getBlazeInstance } from "./utils";

export interface ISettings {
  network?: string;
  address?: string;
  providerType?: string;
  providerKey?: string;
  customProtocolParams?: ISundaeProtocolParamsFull;
}

export class State {
  sdk?: SundaeSDK;
  settings: ISettings;

  constructor() {
    this.settings = {};
  }

  async setSdk(): Promise<void> {
    if (!this.sdk) {
      const blazeInstance = await getBlazeInstance(this);
      this.sdk = SundaeSDK.new({
        blazeInstance,
      });
    } else {
      this.sdk.options.blazeInstance = await getBlazeInstance(this);
    }

    console.log(this.settings);

    if (this.settings.customProtocolParams) {
      const queryProvider = new QueryProviderSundaeSwap(
        this.settings.network! as TSupportedNetworks,
      );
      queryProvider.addCustomProtocolParams(this.settings.customProtocolParams);
      this.sdk.queryProvider = queryProvider;
      this.sdk.builders.values().forEach((builder) => {
        builder.setQueryProvider(queryProvider);
      });
    }

    return;
  }
}
