import {
  Type,
  NetworkSchema,
  ProviderSettingsSchema,
} from "@sundaeswap/sprinkles";

export const CliWalletSchema = Type.Union([
  Type.Object({
    type: Type.Literal("hot"),
    privateKey: Type.String({
      title: "Encrypted Private Key",
      sensitive: true,
    }),
    address: Type.String({ title: "Wallet Address" }),
  }),
  Type.Object({
    type: Type.Literal("cold"),
    address: Type.String({ title: "Cold Wallet Address" }),
  }),
]);

export const CustomValidatorEntrySchema = Type.Object({
  paramsPath: Type.String({ title: "Path to protocol params JSON" }),
  settingsSource: Type.Optional(
    Type.Union(
      [
        Type.Literal("V3"),
        Type.Literal("Stableswaps"),
        Type.Literal("NftCheck"),
      ],
      { title: "Borrow settings.mint from this version" },
    ),
  ),
});

export const CliSettingsSchema = Type.Object({
  network: NetworkSchema,
  provider: ProviderSettingsSchema,
  wallet: CliWalletSchema,
  customValidators: Type.Optional(
    Type.Object({
      V3: Type.Optional(CustomValidatorEntrySchema),
      Stableswaps: Type.Optional(CustomValidatorEntrySchema),
      NftCheck: Type.Optional(CustomValidatorEntrySchema),
    }),
  ),
});
