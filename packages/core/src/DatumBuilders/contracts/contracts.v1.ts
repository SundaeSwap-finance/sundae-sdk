import { Data, Static } from "@blaze-cardano/sdk";

export const CredentialSchema = Data.Enum([
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
export type TCredential = Static<typeof CredentialSchema>;
export const Credential = CredentialSchema as unknown as TCredential;

export const DestinationSchema = Data.Object({
  PaymentCredentials: CredentialSchema,
  StakeCredentials: Data.Nullable(
    Data.Enum([
      Data.Object({
        DelegationHash: Data.Object({
          hash: CredentialSchema,
        }),
      }),
    ])
  ),
  Datum: Data.Nullable(
    Data.Enum([
      Data.Object({
        Value: Data.Tuple([Data.Bytes()]),
      }),
    ])
  ),
});
export type TDestination = Static<typeof DestinationSchema>;
export const Destination = DestinationSchema as unknown as TDestination;

export const OrderAddressesSchema = Data.Object({
  Destination: DestinationSchema,
  Alternate: Data.Nullable(CredentialSchema),
});
export type TOrderAddresses = Static<typeof OrderAddressesSchema>;
export const OrderAddresses =
  OrderAddressesSchema as unknown as TOrderAddresses;

export const SwapDirectionSchema = Data.Object({
  SuppliedAssetIndex: Data.Enum([
    Data.Object({
      AssetA: Data.Object({ value: Data.Integer({ minimum: 0, maximum: 0 }) }),
    }),
    Data.Object({
      AssetB: Data.Object({ value: Data.Integer({ maximum: 1, minimum: 1 }) }),
    }),
  ]),
  Amount: Data.Integer(),
  MinReceivable: Data.Nullable(
    Data.Object({
      amount: Data.Tuple([Data.Integer()]),
    })
  ),
});
export type TSwapDirection = Static<typeof SwapDirectionSchema>;
export const SwapDirection = SwapDirectionSchema as unknown as TSwapDirection;

export const SwapOrderSchema = Data.Object({
  Ident: Data.Bytes(),
  OrderAddresses: OrderAddressesSchema,
  ScooperFee: Data.Integer(),
  SwapDirection: SwapDirectionSchema,
});
export type TSwapOrder = Static<typeof SwapOrderSchema>;
export const SwapOrder = SwapOrderSchema as unknown as TSwapOrder;
