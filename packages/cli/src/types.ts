import type { Blaze, Provider, Wallet } from "@blaze-cardano/sdk";

export interface ISettings {
  network?: string;
  address?: string;
  providerType?: string;
  providerKey?: string;
}

export interface IState {
  blaze?: Blaze<Provider, Wallet>;
  settings: ISettings;
}
