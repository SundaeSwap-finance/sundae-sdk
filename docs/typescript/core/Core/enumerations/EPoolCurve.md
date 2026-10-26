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

[packages/core/src/@types/txbuilders.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L89)

***

### ConstantProduct

> **ConstantProduct**: `"constant_product"`

#### Defined in

[packages/core/src/@types/txbuilders.ts:87](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L87)

***

### ConstantSum

> **ConstantSum**: `"constant_sum"`

#### Defined in

[packages/core/src/@types/txbuilders.ts:88](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L88)

***

### V4Stableswap

> **V4Stableswap**: `"stableswap"`

The v4 stableswap invariant module: a Curve-style two-asset curve for
pegged pairs, priced on rated reserves with a `linear_amplification`.

NOT `EContractVersion.Stableswaps`. That is the **v3 stableswap contract**
— a whole contract version with its own datum and transaction builders
(`DatumBuilder.Stableswaps`, `TxBuilder.Stableswaps`). This is one curve a
**v4** pool can bind, next to the three above. The estimator for this curve
is `V4StableswapPool` in `@sundaeswap/math`; the v3 one is
`StableSwapsPool`, and the two are not interchangeable.

What the two versions SHARE is the amplification: one parameter, one field
(`IPoolData.linearAmplificationFactor`), one scale. What differs is that v3
stores `D` in the pool datum and has no per-asset rates, while v4 stores no
`D` and carries `rates`.

#### Defined in

[packages/core/src/@types/txbuilders.ts:106](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L106)
