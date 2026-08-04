[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Enumeration: EV4BasicConstraint

The basic-order constraint classes, identified on-chain by the constructor
index of the constraint `data`. On-chain, `extract_basic_fields` ignores the
tag entirely (it enforces only aggregate consumption + the min-received
floor); the tag is dispatch metadata for the scooper.

`Swap` (tag 2) is a routing-free swap: a single offered asset → min-received,
carried by a basic order (`[basic-order, fairness-order]`, NO route
constraint) so the scooper can fill it across parallel same-pair pools — the
route constraint would force serial routing and forbid the split. The
partial-fill-capable swap-order encoding is separate — see
[DatumBuilderV4.buildSwapConstraintData](../classes/DatumBuilderV4.md#buildswapconstraintdata).

## Enumeration Members

### Claim

> **Claim**: `3`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:33](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L33)

***

### Deposit

> **Deposit**: `0`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L30)

***

### Swap

> **Swap**: `2`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:32](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L32)

***

### Withdraw

> **Withdraw**: `1`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts:31](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V4.class.ts#L31)
