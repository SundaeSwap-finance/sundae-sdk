[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: TxBuilderV4

`TxBuilderV4` builds transactions against the sundae-v4 protocol.

v4 is a module-composable redesign: swap math (curve), authorization, and fee
policy are pluggable withdraw-validator modules rather than hardcoded into the
pool. Order placement is a generic `OrderDatum` carrying a list of
`(module_hash, data)` constraints; `swap`/`deposit`/`withdraw` are convenience
wrappers that attach the appropriate constraint via [DatumBuilderV4](DatumBuilderV4.md).

Deployment addresses/hashes (order validator, constraint modules, pool policy)
are resolved from `getProtocolParams()` — the Sundae API `protocols` query
filtered to [EContractVersion.V4](../enumerations/EContractVersion.md#v4). That entry must be present for these
methods to run; the titles resolved are [V4_VALIDATORS](../variables/V4_VALIDATORS.md).

## Extends

- [`TxBuilderAbstractV4`](TxBuilderAbstractV4.md)

## Methods

### basic()

> **basic**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Places a v4 basic order — `Deposit`, `Withdraw`, or `Claim` (per
`args.type`).

A basic order carries exactly the constraint set its deployment's basic
`OrderConfig` requires — the basic-order payload plus deployment-defined
fillers (launch: the fee constraint; pre-audit: fairness). There is no
route constraint in either era.

#### Parameters

• **args**: [`IBasicV4Args`](../interfaces/IBasicV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.basic`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:845](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L845)

***

### batch()

> **batch**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Places SEVERAL basic orders in one transaction.

Some intents are irreducibly plural: covering a stretch of the price line
with concentrated liquidity means depositing into every pool whose range it
touches, and those are separate orders because they are separate pools. One
order per transaction would mean one wallet signature per pool, and a
partially-signed set leaves the position half-built.

Every order is locked onto the same transaction, and the reported deposit
and scooper fee are the SUMS across them — each order reserves its own
budget, so a batch of five costs five budgets, not one.

`datum` on the result is the first order's, since the shape carries a single
datum; the orders' own datums are each locked into their outputs. Referral
is taken once for the batch rather than per order — the per-order field is
ignored here, so a caller can't accidentally pay it N times.

#### Parameters

• **args**: [`IBatchV4Args`](../interfaces/IBatchV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:983](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L983)

***

### cancel()

> **cancel**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Cancels an existing v4 order, returning its locked assets to the owner. The
order UTxO is spent through the order validator's `Cancel` path (redeemer
`Constr 0 []`), which only requires the datum `owner` multisig to be
satisfied — so the owner's key hash is added as a required signer.

Note: order owners are keyed on the address's **stake** credential (see
[DatumBuilderV4.buildOwnerDatum](DatumBuilderV4.md#buildownerdatum)), so the resulting transaction must
carry a witness from the stake key. CIP-30 browser wallets provide this
automatically; a headless signer must opt in — e.g. blaze's
`HotWallet.signTransaction(tx, partialSign, signWithStakeKey=true)`.

#### Parameters

• **args**: [`ICancelConfigArgs`](../interfaces/ICancelConfigArgs.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.cancel`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1158](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1158)

***

### claim()

> **claim**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Claim is a basic order that collects a pool's accrued claimables (e.g. a
constant-sum pool's bounty) rather than trading against its reserves.

#### Parameters

• **args**: `Omit`\<[`IBasicV4Args`](../interfaces/IBasicV4Args.md), `"type"`\>

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:959](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L959)

***

### deposit()

> **deposit**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Deposit is a basic order whose min-received names the pool's LP asset.

#### Parameters

• **args**: `Omit`\<[`IBasicV4Args`](../interfaces/IBasicV4Args.md), `"type"`\>

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.deposit`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:942](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L942)

***

### getDatumType()

> **getDatumType**(): [`EDatumType`](../enumerations/EDatumType.md)

How a preceding order must attach a v4 order's datum when it pays out to
the v4 order address. v4 locks its orders with an inline datum (see
`basic`), so a chained leg needs no datum-hash metadata entry.

Present so a v1/v3 `orderRouteSwap` can chain into v4: the first leg reads
this to decide how to carry the next leg's datum.

#### Returns

[`EDatumType`](../enumerations/EDatumType.md)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:581](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L581)

***

### getOrderConfigToken()

> **getOrderConfigToken**(`label`): `Promise`\<`string`\>

Resolves an order type's `config_token` (the value an order sets as its
`config_token`) from the indexed settings, by the OrderConfig entry's label.

#### Parameters

• **label**: `string`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:522](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L522)

***

### getOrderScriptAddress()

> **getOrderScriptAddress**(`ownerAddress`?): `Promise`\<`string`\>

The order script address: the order validator's hash as the payment
credential, with the owner's stake credential attached (when present) so
placed orders stay delegated to the owner's pool.

#### Parameters

• **ownerAddress?**: `string`

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:590](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L590)

***

### getPoolByIdent()

> **getPoolByIdent**(`ident`): `Promise`\<[`IPoolV4`](../interfaces/IPoolV4.md)\>

Fetches a v4 pool by its `ident`: resolves the live pool UTxO by its `222`
NFT and decodes the `PoolDatum`. Returns the reserves (2–16 assets), LP
accounting, and the CIP-68 LP/NFT asset ids — everything a caller needs to
build a deposit/withdraw order against the pool. See [IPoolV4](../interfaces/IPoolV4.md).

#### Parameters

• **ident**: `string`

#### Returns

`Promise`\<[`IPoolV4`](../interfaces/IPoolV4.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:542](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L542)

***

### getSettings()

> **getSettings**(): `Promise`\<[`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

The protocol's indexed settings (root settings + v4 OrderConfig registry).
Returns `[]` if the API isn't serving settings yet — callers must then pass
`configToken` explicitly.

#### Returns

`Promise`\<[`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:415](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L415)

***

### mintPool()

> **mintPool**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Creates (mints) a new v4 pool. Consumes a seed UTxO from the creator to
derive the pool `identifier`, mints the CIP-68 `100`/`222`/`333` tokens, and
writes the pool UTxO (reserves + NFT + the preminted LP buffer) with a
`PoolDatum` whose `actions` mirror the on-chain settings `PoolConfig`.

Module handling is generic: it follows whatever the on-chain `PoolConfig`
references. The caller supplies only the curve config (fees/prices); every
other module's `Create` config is published in the settings
(`values.moduleConfigs`) and applied verbatim, and each module's reference
script is resolved by `hash → protocol-entry title → reference` — so a
different governance (or any) module hash on another network just works.
The circulating LP (issued to the creator via change) defaults to
`Σ price_i·reserve_i`; an equal amount is preminted into the pool.

#### Parameters

• **args**: [`IMintPoolV4Args`](../interfaces/IMintPoolV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.mintPool`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1292](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1292)

***

### newTxInstance()

> **newTxInstance**(): `TxBuilder`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`TxBuilder`

#### Overrides

[`TxBuilderAbstractV4`](TxBuilderAbstractV4.md).[`newTxInstance`](TxBuilderAbstractV4.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:359](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L359)

***

### orderRouteSwap()

> **orderRouteSwap**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Places a chained swap that STARTS on v4: a v4 intent whose payout lands as
a v3 or stableswap order, optionally followed by one more leg (v4, v3 or
stableswap). Each leg fills in its own scoop; the chain is sequential, not
atomic.

The reverse of the legacy builders' `orderRouteSwap`, which chain a legacy
order INTO v4. It uses the same plain intent as [swapIntent](TxBuilderV4.md#swapintent), with a
`Fixed` destination at the next order's script address carrying that
order's datum inline. It does not use the route constraint
[swap](TxBuilderV4.md#swap) refuses to build.

- **Inline datums only.** A v4 order can attach its payout's datum only
  inline. A v1 order is a Plutus V1 script, which cannot read an inline
  datum, so a v1 leg anywhere after the v4 leg would lock funds that
  nothing can ever spend, cancel included. This throws instead.
- **Amounts.** `swapB` offers exactly `swapA.minReceived`, the floor the
  v4 order guarantees. Anything the v4 leg wins above that arrives in the
  legacy order unnamed and is passed on to that order's destination.
- **ADA.** The v4 order carries every later leg's fee (and the larger
  routed deposit when `swapB` forwards into a third leg), on top of its
  own budget and deposit. A v4 fill passes unconsumed ADA through to its
  destination, so this arrives with the legacy order already funded.
- **Referrals.** Every leg's referral fee is paid in one output, so they
  must share a destination; differing destinations throw.
- **Ownership.** `ownerAddress` owns every leg, so a leg that cannot fill
  can always be cancelled by the owner.

#### Parameters

• **args**: [`IOrderRouteSwapV4Args`](../interfaces/IOrderRouteSwapV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:716](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L716)

***

### placeOrder()

> `protected` **placeOrder**(`args`, `offered`, `constraints`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Shared placement primitive: assemble the `OrderDatum`, lock the offered
assets + the fee budget at the order script address, and complete. Exposed
(protected) so the datum/output assembly is unit-testable without a live
tx completion.

#### Parameters

• **args**: [`IOrderV4Base`](../interfaces/IOrderV4Base.md) & `object`

• **offered**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

• **constraints**: [`string`, `PlutusData`][]

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1033](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1033)

***

### strategy()

> **strategy**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Places a v4 strategy order. The order locks the offered assets and names a
strategist (`authSigner`) authorized to sign the `StrategyExecution` the
scooper later fills. It carries exactly the constraint set the
deployment's strategy `OrderConfig` requires; an unindexed config token
falls back to the package the deployed modules imply.

#### Parameters

• **args**: [`IStrategyV4Args`](../interfaces/IStrategyV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.strategy`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:897](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L897)

***

### swap()

> **swap**(`_args`): `Promise`\<`never`\>

NOT IMPLEMENTED — use [swapIntent](TxBuilderV4.md#swapintent).

A swap order carries the route constraint, which validates a strictly
serial chain on-chain. That module is outside the launch's audited surface,
so this builder will not construct one: an unaudited validator that nothing
can reach is a validator nobody has to trust.

The name is kept, and throws, on purpose. It is the method an integrator
reaches for first, and failing loudly with a pointer is better than either
a missing method (which reads as "v4 cannot swap") or a silent build
against a validator we are not standing behind.

Returns when the route module is audited and route orders are supported.

#### Parameters

• **\_args**: [`ISwapV4Args`](../interfaces/ISwapV4Args.md)

#### Returns

`Promise`\<`never`\>

#### Overrides

`TxBuilderAbstractV4.swap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:643](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L643)

***

### swapIntent()

> **swapIntent**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Places a v4 swap.

An INTENT, which is what a v4 order is: an offer and a floor, naming no
pool. The scooper decides how to fill it — one pool, a split across a
pair's pools, or a multi-hop chain — and `minReceived` is what bounds the
result. Nothing here mentions routes, reserves or curves, because the order
does not.

The route constraint that [swap](TxBuilderV4.md#swap) carries enforces strictly serial
routing on-chain (each hop's output is consumed by the next), so it cannot
represent a parallel same-pair split. A basic order carries only
`[basic-order, fairness-order]` (no route), leaving the aggregate
consumption bound + the `minReceived` floor as the sole on-chain checks — so
the scooper is free to fan the fill out across pools. Because `minReceived`
is set from the *blended* quote (tighter than any single pool can deliver),
the floor itself bounds how far a fill can deviate from the intended split.

A basic order settles single-shot to a `Fixed` destination (no partial
fills) — a market swap, not a resting/limit order. Route a serial fill
(single pool, or a genuine multi-hop chain across different pairs) through
[swap](TxBuilderV4.md#swap) instead, to keep its on-chain anti-skim guarantee.

#### Parameters

• **args**: [`ISwapV4Args`](../interfaces/ISwapV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:674](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L674)

***

### update()

> **update**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Updates an order in place: cancels the existing order UTxO and locks a
fresh swap/basic order in the same transaction. The replacement carries its
own constraint set and `config_token`; the returned assets from the cancel
fund the new order's deposit/budget/offer (Blaze balances the difference).

Like [cancel](TxBuilderV4.md#cancel), this spends a stake-keyed order, so the transaction
needs the owner's stake-key witness. CIP-30 browser wallets supply it via
the composed `sign()`; a headless signer (e.g. blaze `HotWallet`) must sign
with the stake key explicitly.

#### Parameters

• **args**: [`IUpdateV4Args`](../interfaces/IUpdateV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.update`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1251](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1251)

***

### withdraw()

> **withdraw**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Withdraw is a basic order whose offered asset is the pool's LP asset.

#### Parameters

• **args**: `Omit`\<[`IBasicV4Args`](../interfaces/IBasicV4Args.md), `"type"`\>

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.withdraw`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:949](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L949)
