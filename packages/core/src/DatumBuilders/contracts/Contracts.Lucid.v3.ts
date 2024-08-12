import { Data } from "lucid-cardano";

export const SignatureSchema = Data.Object({
  Address: Data.Object({
    hex: Data.Bytes(),
  }),
});

export type TSignatureSchema = Data.Static<typeof SignatureSchema>;
export const Signature = SignatureSchema as unknown as TSignatureSchema;

export const AllOfSchema = Data.Object({
  AllOf: Data.Object({
    scripts: Data.Any(),
  }),
});

export type TAllOfSchema = Data.Static<typeof AllOfSchema>;
export const AllOf = AllOfSchema as unknown as TAllOfSchema;

export const AnyOfSchema = Data.Object({
  AnyOf: Data.Object({
    scripts: Data.Any(),
  }),
});

export type TAnyOfSchema = Data.Static<typeof AnyOfSchema>;
export const AnyOf = AnyOfSchema as unknown as TAnyOfSchema;

export const AtLeastSchema = Data.Object({
  AtLeast: Data.Object({
    required: Data.Integer(),
    scripts: Data.Any(),
  }),
});

export type TAtLeastSchema = Data.Static<typeof AtLeastSchema>;
export const AtLeast = AtLeastSchema as unknown as TAtLeastSchema;

export const BeforeSchema = Data.Object({
  Before: Data.Object({
    posix: Data.Integer(),
  }),
});

export type TBeforeSchema = Data.Static<typeof BeforeSchema>;
export const Before = BeforeSchema as unknown as TBeforeSchema;

export const AfterSchema = Data.Object({
  After: Data.Object({
    posix: Data.Integer(),
  }),
});

export type TAfterSchema = Data.Static<typeof AfterSchema>;
export const After = AfterSchema as unknown as TAfterSchema;

export const ScriptSchema = Data.Object({
  Script: Data.Object({
    hex: Data.Bytes(),
  }),
});

export type TScriptSchema = Data.Static<typeof ScriptSchema>;
export const Script = ScriptSchema as unknown as TScriptSchema;

// Needs to be updated later to allow full variant
export const MultiSigScriptSchema = Data.Enum([
  SignatureSchema,
  AllOfSchema,
  AnyOfSchema,
  AtLeastSchema,
  BeforeSchema,
  AfterSchema,
  ScriptSchema,
]);

export type TMultiSigScript = Data.Static<typeof MultiSigScriptSchema>;
export const MultiSigScript =
  MultiSigScriptSchema as unknown as TMultiSigScript;

export const SingletonValueSchema = Data.Tuple([
  Data.Bytes(),
  Data.Bytes(),
  Data.Integer(),
]);
export type TSingletonValue = Data.Static<typeof SingletonValueSchema>;
export const SingletonValue =
  SingletonValueSchema as unknown as TSingletonValue;

export const SwapSchema = Data.Object({
  offer: SingletonValueSchema,
  minReceived: SingletonValueSchema,
});
export type TSwap = Data.Static<typeof SwapSchema>;
export const Swap = SwapSchema as unknown as TSwap;

export const DepositSchema = Data.Object({
  assets: Data.Tuple([SingletonValueSchema, SingletonValueSchema]),
});

export const WithdrawalSchema = Data.Object({
  amount: SingletonValueSchema,
});

export const DonationSchema = Data.Object({
  assets: Data.Tuple([SingletonValueSchema, SingletonValueSchema]),
});

export const OrderSchema = Data.Enum([
  Data.Object({ Strategies: Data.Nullable(Data.Literal("TODO")) }),
  Data.Object({ Swap: SwapSchema }),
  Data.Object({ Deposit: DepositSchema }),
  Data.Object({ Withdrawal: WithdrawalSchema }),
  Data.Object({ Donation: DonationSchema }),
]);
export type TOrder = Data.Static<typeof OrderSchema>;
export const Order = OrderSchema as unknown as TOrder;

export const VKeyCredentialSchema = Data.Object({
  VKeyCredential: Data.Object({ bytes: Data.Bytes() }),
});
export type TVKeyCredential = Data.Static<typeof VKeyCredentialSchema>;
export const VKeyCredential =
  VKeyCredentialSchema as unknown as TVKeyCredential;

export const SCredentialSchema = Data.Object({
  SCredential: Data.Object({ bytes: Data.Bytes() }),
});
export type TSCredential = Data.Static<typeof SCredentialSchema>;
export const SCredential = SCredentialSchema as unknown as TSCredential;

export const CredentialSchema = Data.Enum([
  VKeyCredentialSchema,
  SCredentialSchema,
]);
export type TCredential = Data.Static<typeof CredentialSchema>;
export const Credential = CredentialSchema as unknown as TCredential;

export const AddressSchema = Data.Object({
  paymentCredential: CredentialSchema,
  stakeCredential: Data.Nullable(
    Data.Object({
      keyHash: CredentialSchema,
    })
  ),
});
export type TAddressSchema = Data.Static<typeof AddressSchema>;
export const Address = AddressSchema as unknown as TAddressSchema;

export const DestinationSchema = Data.Object({
  address: AddressSchema,
  datum: Data.Any(),
});
export type TDestination = Data.Static<typeof DestinationSchema>;
export const Destination = DestinationSchema as unknown as TDestination;

export const IdentSchema = Data.Bytes();

export const OrderDatumSchema = Data.Object({
  poolIdent: Data.Nullable(IdentSchema),
  owner: MultiSigScriptSchema,
  scooperFee: Data.Integer(),
  destination: DestinationSchema,
  order: OrderSchema,
  extension: Data.Any(),
});
export type TOrderDatum = Data.Static<typeof OrderDatumSchema>;
export const OrderDatum = OrderDatumSchema as unknown as TOrderDatum;

export const AssetClassSchema = Data.Tuple([Data.Bytes(), Data.Bytes()]);
export type TAssetClass = Data.Static<typeof AssetClassSchema>;
export const AssetClass = AssetClassSchema as unknown as TAssetClass;

export const AssetClassPairSchema = Data.Tuple([
  AssetClassSchema,
  AssetClassSchema,
]);
export type TAssetClassPair = Data.Static<typeof AssetClassPairSchema>;
export const AssetClassPair =
  AssetClassPairSchema as unknown as TAssetClassPair;

export const PoolDatumSchema = Data.Object({
  identifier: IdentSchema,
  assets: AssetClassPairSchema,
  circulatingLp: Data.Integer(),
  bidFeePer10Thousand: Data.Integer(),
  askFeePer10Thousand: Data.Integer(),
  feeManager: Data.Nullable(MultiSigScriptSchema),
  marketOpen: Data.Integer(),
  protocolFee: Data.Integer(),
});
export type TPoolDatum = Data.Static<typeof PoolDatumSchema>;
export const PoolDatum = PoolDatumSchema as unknown as TPoolDatum;

export const PoolRedeemerSchema = Data.Enum([
  // This first variant is never used, just a hack to make aiken's dual
  // spend/mint script work since the script checks for a constr 122 wrapper to
  // see if it should run the spend code
  Data.Object({ DUMMY: Data.Literal("DUMMY") }),
  Data.Object({
    Spend: Data.Object({
      contents: Data.Object({
        signatoryIndex: Data.Integer(),
        scooperIndex: Data.Integer(),
        inputOrder: Data.Array(Data.Integer()),
      }),
    }),
  }),
]);

export type TPoolRedeemer = Data.Static<typeof PoolRedeemerSchema>;
export const PoolRedeemer = PoolRedeemerSchema as unknown as TPoolRedeemer;

export const OrderRedeemerSchema = Data.Enum([
  Data.Literal("Scoop"),
  Data.Literal("Cancel"),
]);
export type TOrderRedeemer = Data.Static<typeof OrderRedeemerSchema>;
export const OrderRedeemer = OrderRedeemerSchema as unknown as TOrderRedeemer;

export const PoolMintRedeemerSchema = Data.Enum([
  Data.Object({ MintLP: Data.Object({ identifier: Data.Bytes() }) }),
  Data.Object({
    CreatePool: Data.Object({
      assets: Data.Tuple([AssetClassSchema, AssetClassSchema]),
      poolOutput: Data.Integer(),
      metadataOutput: Data.Integer(),
    }),
  }),
]);
export type TPoolMintRedeemer = Data.Static<typeof PoolMintRedeemerSchema>;
export const PoolMintRedeemer =
  PoolMintRedeemerSchema as unknown as TPoolMintRedeemer;

export const SettingsDatumSchema = Data.Object({
  settingsAdmin: MultiSigScriptSchema,
  metadataAdmin: AddressSchema,
  treasuryAdmin: MultiSigScriptSchema,
  treasuryAddress: AddressSchema,
  treasuryAllowance: Data.Array(Data.Integer()),
  authorizedScoopers: Data.Nullable(Data.Array(Data.Bytes())),
  authorizedStakingKeys: Data.Array(CredentialSchema),
  baseFee: Data.Integer(),
  simpleFee: Data.Integer(),
  strategyFee: Data.Integer(),
  poolCreationFee: Data.Integer(),
  extensions: Data.Any(),
});
export type TSettingsDatum = Data.Static<typeof SettingsDatumSchema>;
export const SettingsDatum = SettingsDatumSchema as unknown as TSettingsDatum;
