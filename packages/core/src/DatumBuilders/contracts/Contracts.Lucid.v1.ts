import { Data } from "lucid-cardano";

export const PaymentHashSchema = Data.Enum([
  Data.Object({
    KeyHash: Data.Object({
      value: Data.Bytes(),
    }),
  }),
  Data.Object({
    ScriptHash: Data.Object({
      value: Data.Bytes(),
    }),
  }),
]);
export type TPaymentHash = Data.Static<typeof PaymentHashSchema>;
export const PaymentHash = PaymentHashSchema as unknown as TPaymentHash;

export const StakingHashSchema = Data.Object({
  value: PaymentHashSchema,
});
export type TStakingHashSchema = Data.Static<typeof StakingHashSchema>;
export const StakingHash = StakingHashSchema as unknown as TStakingHashSchema;

export const CredentialSchema = Data.Object({
  paymentKey: PaymentHashSchema,
  stakingKey: Data.Nullable(StakingHashSchema),
});
export type TCredential = Data.Static<typeof CredentialSchema>;
export const Credential = CredentialSchema as unknown as TCredential;

export const DestinationSchema = Data.Object({
  credentials: CredentialSchema,
  datum: Data.Nullable(Data.Bytes()),
});
export type TDestination = Data.Static<typeof DestinationSchema>;
export const Destination = DestinationSchema as unknown as TDestination;

export const OrderAddressesSchema = Data.Object({
  destination: DestinationSchema,
  alternate: Data.Nullable(CredentialSchema),
});
export type TOrderAddresses = Data.Static<typeof OrderAddressesSchema>;
export const OrderAddresses =
  OrderAddressesSchema as unknown as TOrderAddresses;

export const SwapDirectionSchema = Data.Object({
  suppliedAssetIndex: Data.Enum([Data.Literal("A"), Data.Literal("B")]),
  amount: Data.Integer(),
  minReceivable: Data.Nullable(Data.Integer()),
});
export type TSwapDirection = Data.Static<typeof SwapDirectionSchema>;
export const SwapDirection = SwapDirectionSchema as unknown as TSwapDirection;

export const DepositPairSchema = Data.Enum([
  Data.Literal("VOID"),
  Data.Literal("VOID"),
  // 123
  Data.Object({
    Parent: Data.Object({
      Child: Data.Enum([
        Data.Literal("VOID"),
        // 122
        Data.Object({
          Value: Data.Object({
            // 121
            pair: Data.Object({
              a: Data.Integer(),
              b: Data.Integer(),
            }),
          }),
        }),
      ]),
    }),
  }),
]);
export type TDepositPair = Data.Static<typeof DepositPairSchema>;
export const DepositPair = DepositPairSchema as unknown as TDepositPair;

export const SwapOrderSchema = Data.Object({
  ident: Data.Bytes(),
  orderAddresses: OrderAddressesSchema,
  scooperFee: Data.Integer(),
  swapDirection: SwapDirectionSchema,
});
export type TSwapOrder = Data.Static<typeof SwapOrderSchema>;
export const SwapOrder = SwapOrderSchema as unknown as TSwapOrder;

export const DepositOrderSchema = Data.Object({
  ident: Data.Bytes(),
  orderAddresses: OrderAddressesSchema,
  scooperFee: Data.Integer(),
  DepositPair: DepositPairSchema,
});
export type TDepositOrder = Data.Static<typeof DepositOrderSchema>;
export const DepositOrder = DepositOrderSchema as unknown as TDepositOrder;

export const WithdrawAssetSchema = Data.Enum([
  Data.Literal("VOID"),
  // 122
  Data.Object({
    LPToken: Data.Object({
      value: Data.Integer(),
    }),
  }),
]);
export type TWithdrawAsset = Data.Static<typeof WithdrawAssetSchema>;
export const WithdrawAsset = WithdrawAssetSchema as unknown as TWithdrawAsset;

export const WithdrawOrderSchema = Data.Object({
  ident: Data.Bytes(),
  orderAddresses: OrderAddressesSchema,
  scooperFee: Data.Integer(),
  WithdrawAsset: WithdrawAssetSchema,
});
export type TWithdrawOrder = Data.Static<typeof WithdrawOrderSchema>;
export const WithdrawOrder = WithdrawOrderSchema as unknown as TWithdrawOrder;
