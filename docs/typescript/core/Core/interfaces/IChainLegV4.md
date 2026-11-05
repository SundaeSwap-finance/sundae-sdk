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

[packages/core/src/@types/txbuilders.ts:160](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L160)

***

### contractVersion

> **contractVersion**: [`V4`](../enumerations/EContractVersion.md#v4)

Discriminator. A v4 leg is an intent, not a swap against one pool.

#### Defined in

[packages/core/src/@types/txbuilders.ts:117](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L117)

***

### maxPerExecution?

> `optional` **maxPerExecution**: `bigint`

Per-scoop fee cap, and this leg's routing fan-out budget. For a chained
leg this is the v4 tail's SHARE of the caller's total fee budget, not the
whole of it.

#### Defined in

[packages/core/src/@types/txbuilders.ts:166](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L166)

***

### minReceived

> **minReceived**: `AssetAmount`\<`IAssetAmountMetadata`\> \| `AssetAmount`\<`IAssetAmountMetadata`\>[]

The minimum the owner will accept, per asset.

#### Defined in

[packages/core/src/@types/txbuilders.ts:153](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L153)

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
(`check_basic_consumption`). For a native token, naming more than arrives
does not make the order unfillable, because the scooper consumes at most
what the order holds. So a chain into v4 can state the EXPECTED fill of a
token and convert all of it.

It must name the asset the previous leg delivers, or this throws. ADA is
capped at what the previous leg guarantees: the scooper spends the full
offered lovelace, taking any shortfall from the order's deposit and
budget, and cannot fill the order once those run out. ADA won above the
guarantee reaches the destination unconverted.

Only safe for a leg whose contract bounds consumption this way. v1 and v3
cannot overstate what they offer, which is why this is a per-leg override
rather than the default.

`minReceived` must then be calibrated against the PESSIMISTIC path — what
the previous leg's minimum converts to — because it is an absolute floor
checked gross, not a proportion of what arrived. Pairing an optimistic
`offered` with an optimistic floor leaves the order unable to fill
whenever the previous leg underfills.

#### Defined in

[packages/core/src/@types/txbuilders.ts:151](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L151)
