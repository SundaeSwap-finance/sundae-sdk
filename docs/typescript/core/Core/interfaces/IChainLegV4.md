[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IChainLegV4

A v4 leg of a chained swap. A v4 order is a pool-agnostic intent, so it
carries no pool: the scooper routes and splits it across any number of v4
pools inside ONE scoop. An arbitrarily long v4 tail is therefore a SINGLE
chain leg.

## Properties

### budget?

> `optional` **budget**: `bigint`

Lifetime service-fee allocation, in lovelace. This ADA must ARRIVE with
the order, so the preceding leg forwards it.

#### Defined in

[packages/core/src/@types/txbuilders.ts:152](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L152)

***

### contractVersion

> **contractVersion**: [`V4`](../enumerations/EContractVersion.md#v4)

Discriminator. A v4 leg is an intent, not a swap against one pool.

#### Defined in

[packages/core/src/@types/txbuilders.ts:116](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L116)

***

### maxPerExecution?

> `optional` **maxPerExecution**: `bigint`

Per-scoop fee cap, and this leg's routing fan-out budget. For a chained
leg this is the v4 tail's SHARE of the caller's total fee budget, not the
whole of it.

#### Defined in

[packages/core/src/@types/txbuilders.ts:158](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L158)

***

### minReceived

> **minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\> \| `AssetAmount`\<`IAssetAmountMetadata`\>[]

The minimum the owner will accept, per asset.

#### Defined in

[packages/core/src/@types/txbuilders.ts:145](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L145)

***

### offered?

> `optional` **offered**: `AssetAmount`\<`IAssetAmountMetadata`\>

What this leg may consume, overriding the preceding leg's MINIMUM
receivable.

A chained leg's datum is fixed when the chain is placed, before the
previous leg has filled, so by default it can only name that leg's
guaranteed minimum. Anything the previous leg wins above it then arrives
in the UTxO unclaimed and is returned unconverted — the owner ends up
holding the intermediate asset, in proportion to their slippage setting.

A v4 order's `offered` is an UPPER BOUND, not an exact amount: the
validator checks `consumed <= offered` per asset
(`check_basic_consumption`). Naming more than arrives does not make the
order unfillable — the scooper simply consumes what is there. So a chain
into v4 can state the EXPECTED fill and convert all of it.

Only safe for a leg whose contract bounds consumption this way. v1 and v3
cannot overstate what they offer, which is why this is a per-leg override
rather than the default.

`minReceived` must then be calibrated against the PESSIMISTIC path — what
the previous leg's minimum converts to — because it is an absolute floor
checked gross, not a proportion of what arrived. Pairing an optimistic
`offered` with an optimistic floor leaves the order unable to fill
whenever the previous leg underfills.

#### Defined in

[packages/core/src/@types/txbuilders.ts:143](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L143)
