[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IPoolBand

One band of a v4 concentrated-liquidity pool's ladder.

## Properties

### active?

> `optional` **active**: `boolean`

Whether this is the band the current price sits in.

#### Defined in

[packages/core/src/@types/queryprovider.ts:196](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L196)

***

### curve

> **curve**: `0` \| `1`

0 = concentrated-liquidity arc, 1 = constant-sum bin.

#### Defined in

[packages/core/src/@types/queryprovider.ts:182](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L182)

***

### feeBuy

> **feeBuy**: [`bigint`, `bigint`]

Fee on swaps that buy the pool's first asset, as `[num, den]`.

#### Defined in

[packages/core/src/@types/queryprovider.ts:184](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L184)

***

### feeSell

> **feeSell**: [`bigint`, `bigint`]

Fee on swaps that sell the pool's first asset, as `[num, den]`.

#### Defined in

[packages/core/src/@types/queryprovider.ts:186](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L186)

***

### liquidity?

> `optional` **liquidity**: `bigint`

The band's liquidity, `floor(weight · bandCounter / bandWeightTotal)`.

#### Defined in

[packages/core/src/@types/queryprovider.ts:194](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L194)

***

### quantities?

> `optional` **quantities**: [`bigint`, `bigint`]

What the band holds at the pool's current reserves, in `[assetA, assetB]`
order; the bands sum to the pool's reserves. Empty when the API could not
place the reserves on the ladder.

#### Defined in

[packages/core/src/@types/queryprovider.ts:192](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L192)

***

### start

> **start**: [`bigint`, `bigint`]

The band's lower sqrt-price edge as `[num, den]`.

#### Defined in

[packages/core/src/@types/queryprovider.ts:178](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L178)

***

### weight

> **weight**: `bigint`

The band's share of the ladder's liquidity counter.

#### Defined in

[packages/core/src/@types/queryprovider.ts:180](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L180)
