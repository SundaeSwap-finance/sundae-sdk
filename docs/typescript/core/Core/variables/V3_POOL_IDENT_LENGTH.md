[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Variable: V3\_POOL\_IDENT\_LENGTH

> `const` **V3\_POOL\_IDENT\_LENGTH**: `56` = `56`

For v3 pools, the pool identifier will always be 28 bytes (56 characters) long.
It is impossible for the v1 pool ident to be 28 bytes as:
 - There would need to be around 26959946667150639794667015087019630673637144422540572481103610249216 pools available in order for a pool ident to reach 28 bytes
 - There's not enough ADA in existence to cover the transaction fees, or the minUTXO cost, for creating that many pools

## Defined in

[packages/core/src/constants.ts:16](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/constants.ts#L16)
