[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Type Alias: TCancelerAddress

> **TCancelerAddress**: `string`

The optional alternate address that can cancel the Escrow order. This is
needed because a [TDestinationAddress](TDestinationAddress.md) can be a Script Address. This
is useful to chain swaps with other protocols if desired, while still allowing
a consistently authorized alternate to cancel the Escrow.

## Defined in

[packages/core/src/@types/datumbuilder.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L89)
