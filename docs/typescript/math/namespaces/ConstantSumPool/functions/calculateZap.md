[**@sundaeswap/math**](../../../README.md) • **Docs**

***

# Function: calculateZap()

> **calculateZap**(`offered`, `reserves`, `prices`, `totalLp`, `fee`): [`TZapOutcome`](../type-aliases/TZapOutcome.md)

A zap on a 2-asset constant-sum pool: a non-proportional `offered` basket
is rebalanced by swapping part of the over-weighted asset, then deposited
under the target-pinned rule ([calculatePinnedDeposit](calculatePinnedDeposit.md)). The swap
amount `dx` is the one that leaves the post-swap basket proportional to
the post-swap reserves, so the pin consumes the whole basket up to
rounding. With `k = (1−fee)·p_X/p_Y`,

  (a_X − dx)/(r_X + dx) = (a_Y + k·dx)/(r_Y − k·dx)
  ⇒ dx = (a_X·r_Y − a_Y·r_X) / (k·(r_X + a_X) + (r_Y + a_Y))

(the dx² terms cancel). `dx` is floored and the swap leg follows
[getSwapOutput](getSwapOutput.md); whatever imbalance rounding leaves comes back as
`change`.

`fee` is the pool's fee for the swap direction — v4 splits bid and ask, so
the caller picks. Two assets only: with more, which assets to swap is an
allocation problem this formula does not address.

## Parameters

• **offered**: `bigint`[]

• **reserves**: `bigint`[]

• **prices**: `bigint`[]

• **totalLp**: `bigint`

• **fee**: `TFractionLike`

## Returns

[`TZapOutcome`](../type-aliases/TZapOutcome.md)

## Defined in

[ConstantSumPool.ts:416](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/math/src/PoolMath/ConstantSumPool.ts#L416)
