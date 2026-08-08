[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Enumeration: EPoolCurve

The invariant ("curve") module bound to a v4 pool, which determines its swap
math. v4 is module-composable, so unlike pre-v4 versions the swap behavior
isn't implied by the contract version alone. The identifier values match the
on-chain module identifiers surfaced by the GraphQL `Pool.modules` field.

## Enumeration Members

### ConcentratedLiquidity

> **ConcentratedLiquidity**: `"concentrated_liquidity"`

#### Defined in

[packages/core/src/@types/txbuilders.ts:83](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L83)

***

### ConstantProduct

> **ConstantProduct**: `"constant_product"`

#### Defined in

[packages/core/src/@types/txbuilders.ts:81](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L81)

***

### ConstantSum

> **ConstantSum**: `"constant_sum"`

#### Defined in

[packages/core/src/@types/txbuilders.ts:82](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L82)
