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

A basic order's required constraint set (per the basic `OrderConfig`) is
`[basic-order, fairness-order]` — note there is no route constraint:
  - basic-order: the `BasicFields` payload (Constr 0/1/3)
  - fairness-order: `Void`

#### Parameters

• **args**: [`IBasicV4Args`](../interfaces/IBasicV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.basic`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:554](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L554)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:685](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L685)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:856](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L856)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:661](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L661)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:644](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L644)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:391](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L391)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:447](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L447)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:411](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L411)

***

### getSettings()

> **getSettings**(): `Promise`\<[`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

The protocol's indexed settings (root settings + v4 OrderConfig registry).
Returns `[]` if the API isn't serving settings yet — callers must then pass
`configToken` explicitly.

#### Returns

`Promise`\<[`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:371](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L371)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:990](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L990)

***

### newTxInstance()

> **newTxInstance**(): `TxBuilder`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`TxBuilder`

#### Overrides

[`TxBuilderAbstractV4`](TxBuilderAbstractV4.md).[`newTxInstance`](TxBuilderAbstractV4.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:315](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L315)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:735](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L735)

***

### strategy()

> **strategy**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Places a v4 strategy order. The order locks the offered assets and names a
strategist (`authSigner`) authorized to sign the `StrategyExecution` the
scooper later fills. It carries the full `[strategy-order, route-order,
fairness-order]` constraint set, matching the strategy `OrderConfig`.

#### Parameters

• **args**: [`IStrategyV4Args`](../interfaces/IStrategyV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.strategy`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:603](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L603)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:500](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L500)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:531](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L531)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:949](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L949)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:651](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L651)
