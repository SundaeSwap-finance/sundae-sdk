import { Data, Static } from "@blaze-cardano/sdk";

export const KeyHashSchema = Data.Object({
  KeyHash: Data.Object({
    value: Data.Bytes(),
  }),
});
export type TKeyHashSchema = Static<typeof KeyHashSchema>;
export const KeyHash = KeyHashSchema as unknown as TKeyHashSchema;

export const ScriptHashSchema = Data.Object({
  ScriptHash: Data.Object({
    value: Data.Bytes(),
  }),
});
export type TScriptHashSchema = Static<typeof ScriptHashSchema>;
export const ScriptHash = ScriptHashSchema as unknown as TScriptHashSchema;

export const PaymentStakingHashSchema = Data.Enum([
  KeyHashSchema,
  ScriptHashSchema,
]);
export type TPaymentStakingHash = Static<typeof PaymentStakingHashSchema>;
export const PaymentStakingHash =
  PaymentStakingHashSchema as unknown as TPaymentStakingHash;

export const CredentialSchema = Data.Object({
  paymentKey: PaymentStakingHashSchema,
  stakingKey: Data.Nullable(Data.Object({ value: PaymentStakingHashSchema })),
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
  alternate: Data.Nullable(Data.Bytes()),
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
export type TDepositPair = Static<typeof DepositPairSchema>;
export const DepositPair = DepositPairSchema as unknown as TDepositPair;

export const SwapOrderSchema = Data.Object({
  ident: Data.Bytes(),
  orderAddresses: OrderAddressesSchema,
  scooperFee: Data.Integer(),
  swapDirection: SwapDirectionSchema,
});
export type TSwapOrder = Static<typeof SwapOrderSchema>;
export const SwapOrder = SwapOrderSchema as unknown as TSwapOrder;

export const DepositOrderSchema = Data.Object({
  ident: Data.Bytes(),
  orderAddresses: OrderAddressesSchema,
  scooperFee: Data.Integer(),
  DepositPair: DepositPairSchema,
});
export type TDepositOrder = Static<typeof DepositOrderSchema>;
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
export type TWithdrawAsset = Static<typeof WithdrawAssetSchema>;
export const WithdrawAsset = WithdrawAssetSchema as unknown as TWithdrawAsset;

/**
 * @todo
 * The WithdrawAsset is using an enum that can be consolidated like V3 orders.
 * This will help simplify checking order datums with a single type.
 *
 * - OrderSchema
 * -- ident
 * -- orderAddresses
 * -- scooperFee
 * -- details (enum)
 * --- Swap (121)
 * --- Withdraw (122)
 * --- Deposit (123)
 */
export const WithdrawOrderSchema = Data.Object({
  ident: Data.Bytes(),
  orderAddresses: OrderAddressesSchema,
  scooperFee: Data.Integer(),
  WithdrawAsset: WithdrawAssetSchema,
});
export type TWithdrawOrder = Static<typeof WithdrawOrderSchema>;
export const WithdrawOrder = WithdrawOrderSchema as unknown as TWithdrawOrder;
