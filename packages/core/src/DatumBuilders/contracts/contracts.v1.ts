import { Data, Static } from "@blaze-cardano/sdk";

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
export type TPaymentHash = Static<typeof PaymentHashSchema>;
export const PaymentHash = PaymentHashSchema as unknown as TPaymentHash;

export const StakingHashSchema = Data.Object({
  value: PaymentHashSchema,
});
export type TStakingHashSchema = Static<typeof StakingHashSchema>;
export const StakingHash = StakingHashSchema as unknown as TStakingHashSchema;

export const CredentialSchema = Data.Object({
  paymentKey: PaymentHashSchema,
  stakingKey: Data.Nullable(StakingHashSchema),
});
export type TCredential = Static<typeof CredentialSchema>;
export const Credential = CredentialSchema as unknown as TCredential;

export const DestinationSchema = Data.Object({
  credentials: CredentialSchema,
  datum: Data.Nullable(Data.Bytes()),
});
export type TDestination = Static<typeof DestinationSchema>;
export const Destination = DestinationSchema as unknown as TDestination;

export const OrderAddressesSchema = Data.Object({
  destination: DestinationSchema,
  alternate: Data.Nullable(CredentialSchema),
});
export type TOrderAddresses = Static<typeof OrderAddressesSchema>;
export const OrderAddresses =
  OrderAddressesSchema as unknown as TOrderAddresses;

export const SwapDirectionSchema = Data.Object({
  suppliedAssetIndex: Data.Enum([Data.Literal("A"), Data.Literal("B")]),
  amount: Data.Integer(),
  minReceivable: Data.Nullable(Data.Integer()),
});
export type TSwapDirection = Static<typeof SwapDirectionSchema>;
export const SwapDirection = SwapDirectionSchema as unknown as TSwapDirection;

export const SwapOrderSchema = Data.Object({
  ident: Data.Bytes(),
  orderAddresses: OrderAddressesSchema,
  scooperFee: Data.Integer(),
  swapDirection: SwapDirectionSchema,
});
export type TSwapOrder = Static<typeof SwapOrderSchema>;
export const SwapOrder = SwapOrderSchema as unknown as TSwapOrder;
