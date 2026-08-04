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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:586](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L586)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:717](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L717)

***

### blendedSwap()

> **blendedSwap**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Places a v4 swap as a **basic** order (constraint tag `Swap` = 2) rather
than a route-bound swap order. Use this for a *complex* fill — one the
scooper must split across multiple pools of the same pair (a blend).

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:521](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L521)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:888](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L888)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:693](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L693)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:676](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L676)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:387](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L387)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:443](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L443)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:407](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L407)

***

### getSettings()

> **getSettings**(): `Promise`\<[`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

The protocol's indexed settings (root settings + v4 OrderConfig registry).
Returns `[]` if the API isn't serving settings yet — callers must then pass
`configToken` explicitly.

#### Returns

`Promise`\<[`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:367](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L367)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:1024](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L1024)

***

### newTxInstance()

> **newTxInstance**(): `TxBuilder`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`TxBuilder`

#### Overrides

[`TxBuilderAbstractV4`](TxBuilderAbstractV4.md).[`newTxInstance`](TxBuilderAbstractV4.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:311](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L311)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:767](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L767)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:635](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L635)

***

### swap()

> **swap**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Places a v4 swap order — a single-asset offer that fills against whichever
pool the scooper routes it through, subject to the `minReceived` targets.

A swap order must carry the full constraint set the swap `OrderConfig`
requires — verified against live preview orders as
`[swap-order, route-order, fairness-order]`, in that order:
  - swap-order: the `SwapFields` payload (Constr 2)
  - route-order: an empty list `[]` (scooper fills in routing at scoop time)
  - fairness-order: `Void`
The order-validator checks this list matches the OrderConfig's
`required_constraints` exactly, so a partial set is rejected on-chain.

#### Parameters

• **args**: [`ISwapV4Args`](../interfaces/ISwapV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.swap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:494](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L494)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:981](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L981)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:683](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L683)
