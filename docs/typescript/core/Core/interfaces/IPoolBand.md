[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IPoolBand

One band of a v4 banded concentrated-liquidity pool's ladder.

## Properties

### active?

> `optional` **active**: `boolean`

Whether this is the band the current price sits in.

#### Defined in

[packages/core/src/@types/queryprovider.ts:203](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L203)

***

### curve

> **curve**: `0` \| `1`

0 = concentrated-liquidity arc, 1 = constant-sum bin.

#### Defined in

[packages/core/src/@types/queryprovider.ts:189](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L189)

***

### feeBuy

> **feeBuy**: [`bigint`, `bigint`]

Fee on swaps that buy the pool's first asset, as `[num, den]`.

#### Defined in

[packages/core/src/@types/queryprovider.ts:191](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L191)

***

### feeSell

> **feeSell**: [`bigint`, `bigint`]

Fee on swaps that sell the pool's first asset, as `[num, den]`.

#### Defined in

[packages/core/src/@types/queryprovider.ts:193](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L193)

***

### liquidity?

> `optional` **liquidity**: `bigint`

The band's liquidity, `floor(weight · bandCounter / bandWeightTotal)`.

#### Defined in

[packages/core/src/@types/queryprovider.ts:201](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L201)

***

### quantities?

> `optional` **quantities**: [`bigint`, `bigint`]

What the band holds at the pool's current reserves, in `[assetA, assetB]`
order; the bands sum to the pool's reserves. Empty when the API could not
place the reserves on the ladder.

#### Defined in

[packages/core/src/@types/queryprovider.ts:199](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L199)

***

### start

> **start**: [`bigint`, `bigint`]

The band's lower sqrt-price edge as `[num, den]`.

#### Defined in

[packages/core/src/@types/queryprovider.ts:185](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L185)

***

### weight

> **weight**: `bigint`

The band's share of the ladder's liquidity counter.

#### Defined in

[packages/core/src/@types/queryprovider.ts:187](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L187)
