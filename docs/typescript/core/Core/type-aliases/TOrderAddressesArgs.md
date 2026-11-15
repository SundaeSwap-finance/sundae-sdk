[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Type Alias: TOrderAddressesArgs

> **TOrderAddressesArgs**: `object`

An Escrow address defines the destination address and an optional PubKeyHash

## Type declaration

### AlternateAddress?

> `optional` **AlternateAddress**: [`TCancelerAddress`](TCancelerAddress.md)

### DestinationAddress

> **DestinationAddress**: [`TDestinationAddress`](TDestinationAddress.md)

### PoolDestinationScooperFee?

> `optional` **PoolDestinationScooperFee**: `bigint`

ADA the destination order must carry, so this order forwards it.

When omitted it is queried from the destination version's builder, which
works only for versions in the shared `TTxBuilder` union. A v4 destination
MUST pass it: a v4 order's `service_budget` is chosen per order, so there
is no constant maximum to query.

### PoolDestinationVersion?

> `optional` **PoolDestinationVersion**: [`EContractVersion`](../enumerations/EContractVersion.md)

## Defined in

[packages/core/src/@types/datumbuilder.ts:95](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L95)
