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

> **basic**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

Places a v4 basic order — `Deposit`, `Withdraw`, or `Claim` (per
`args.type`).

A basic order carries exactly the constraint set its deployment's basic
`OrderConfig` requires — the basic-order payload plus deployment-defined
fillers (launch: the fee constraint; pre-audit: fairness). There is no
route constraint in either era.

#### Parameters

• **args**: [`IBasicV4Args`](../interfaces/IBasicV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Overrides

`TxBuilderAbstractV4.basic`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:932](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L932)

***

### batch()

> **batch**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

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

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1070](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1070)

***

### cancel()

> **cancel**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

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

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Overrides

`TxBuilderAbstractV4.cancel`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1236](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1236)

***

### claim()

> **claim**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

Claim is a basic order that collects a pool's accrued claimables (e.g. a
constant-sum pool's bounty) rather than trading against its reserves.

#### Parameters

• **args**: `Omit`\<[`IBasicV4Args`](../interfaces/IBasicV4Args.md), `"type"`\>

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1046](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1046)

***

### deposit()

> **deposit**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

Deposit is a basic order whose min-received names the pool's LP asset.

#### Parameters

• **args**: `Omit`\<[`IBasicV4Args`](../interfaces/IBasicV4Args.md), `"type"`\>

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Overrides

`TxBuilderAbstractV4.deposit`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1029](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1029)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:607](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L607)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:548](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L548)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:616](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L616)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:568](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L568)

***

### getSettings()

> **getSettings**(): `Promise`\<[`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

The protocol's indexed settings (root settings + v4 OrderConfig registry).
Returns `[]` if the API isn't serving settings yet — callers must then pass
`configToken` explicitly.

#### Returns

`Promise`\<[`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:441](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L441)

***

### mintPool()

> **mintPool**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

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

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Overrides

`TxBuilderAbstractV4.mintPool`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1365](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1365)

***

### newTxInstance()

> **newTxInstance**(): `TxBuilder`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`TxBuilder`

#### Overrides

[`TxBuilderAbstractV4`](TxBuilderAbstractV4.md).[`newTxInstance`](TxBuilderAbstractV4.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:365](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L365)

***

### orderRouteSwap()

> **orderRouteSwap**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

Places a chain of orders that starts on v4: a v4 order that pays its
output into the next order in `legs`, which pays into the one after it,
and so on. Each order is filled in its own scoop, one after another; if a
later order cannot fill, the earlier ones have still filled.

This is the reverse of the v1/v3 `orderRouteSwap`, which chain an older
order into v4. The v4 order is the same plain order [swapIntent](TxBuilderV4.md#swapintent)
places, with its payout sent to the next order's script address and that
order's datum attached inline. It does not use the route constraint that
[swap](TxBuilderV4.md#swap) refuses to build.

It refuses these chains:

- **No v1.** A v4 order can only attach its payout's datum inline, and a
  v1 order is a Plutus V1 script, which cannot read an inline datum. A v1
  order anywhere after the v4 order would lock funds that nothing could
  spend, not even a cancel, so this throws instead.
- **Only v3 and stableswap older-pool orders.** An nft-check order is
  only scooped while it holds its condition NFT, which a chain does not
  forward, so it would never fill.
- **Each older-pool order's pool must hold what arrives.** Otherwise the
  order could never fill, and it would only be found after the orders
  before it had filled.
- **At most five orders.** Each order nests the next one's datum, and a
  long enough chain nests deeper than SundaeSwap's datum parsers read.
- **No two v4 orders in a row.** One v4 order already routes across any
  number of v4 pools, so a second one directly after it is never needed.
- **A later v4 order must be last.** A v4 order in the middle of a chain
  is not supported yet: the ADA it needs to arrive with has not been
  worked out.

For the chains it places:

- **Amounts.** Each older-pool order offers exactly the least the order
  before it can deliver: the v4 order's `minReceived`, or the previous
  older-pool order's minimum priced on its pool. If an order delivers
  more, the extra arrives in the next order unswapped and is passed on to
  that order's destination.
- **ADA.** The v4 order locks every later order's fee on top of its own
  budget and deposit, plus the larger deposit an order needs when it pays
  into another order. Fills pass ADA they don't spend through to their
  payout, so each order arrives already funded. `fees.scooperFee` reports
  the v4 budget plus that forwarded ADA.
- **Referrals.** Every order's referral fee is paid in one output of this
  transaction, so they must all name the same destination; if they don't,
  this throws. The label published is the first one in `legs` order.
- **Ownership.** `ownerAddress` owns every order, so the owner can cancel
  any order that cannot fill.

#### Parameters

• **args**: [`IOrderRouteSwapV4Args`](../interfaces/IOrderRouteSwapV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:764](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L764)

***

### placeOrder()

> `protected` **placeOrder**(`args`, `offered`, `constraints`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

Shared placement primitive: assemble the `OrderDatum`, lock the offered
assets + the fee budget at the order script address, and complete. Exposed
(protected) so the datum/output assembly is unit-testable without a live
tx completion.

#### Parameters

• **args**: [`IOrderV4Base`](../interfaces/IOrderV4Base.md) & `object`

• **offered**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

• **constraints**: [`string`, `PlutusData`][]

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1115](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1115)

***

### strategy()

> **strategy**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

Places a v4 strategy order. The order locks the offered assets and names a
strategist (`authSigner`) authorized to sign the `StrategyExecution` the
scooper later fills. It carries exactly the constraint set the
deployment's strategy `OrderConfig` requires; an unindexed config token
falls back to the package the deployed modules imply.

#### Parameters

• **args**: [`IStrategyV4Args`](../interfaces/IStrategyV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Overrides

`TxBuilderAbstractV4.strategy`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:984](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L984)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:669](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L669)

***

### swapIntent()

> **swapIntent**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

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

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:700](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L700)

***

### update()

> **update**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

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

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Overrides

`TxBuilderAbstractV4.update`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1324](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1324)

***

### withdraw()

> **withdraw**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

Withdraw is a basic order whose offered asset is the pool's LP asset.

#### Parameters

• **args**: `Omit`\<[`IBasicV4Args`](../interfaces/IBasicV4Args.md), `"type"`\>

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>, `string`\>\>

#### Overrides

`TxBuilderAbstractV4.withdraw`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1036](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1036)
