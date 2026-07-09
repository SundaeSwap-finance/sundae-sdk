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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:424](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L424)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:587](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L587)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:475](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L475)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:301](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L301)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:320](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L320)

***

### getSettings()

> **getSettings**(): `Promise`\<[`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

The protocol's indexed settings (root settings + v4 OrderConfig registry).
Returns `[]` if the API isn't serving settings yet — callers must then pass
`configToken` explicitly.

#### Returns

`Promise`\<[`ISundaeProtocolSetting`](../interfaces/ISundaeProtocolSetting.md)[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:288](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L288)

***

### mintPool()

> **mintPool**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Creates (mints) a new v4 pool. Consumes a seed UTxO from the creator to
derive the pool `identifier`, mints the CIP-68 `100`/`222`/`333` tokens, and
writes the pool UTxO (reserves + NFT + the preminted LP buffer) with a
`PoolDatum` whose `actions` mirror the on-chain settings `PoolConfig`. Each
module the config references gets a `Create` withdraw-redeemer.

Today only the `constantSum` curve is wired, and the SDK can only build a
`Create` witness for the constant-sum, fee-split, and fairness modules — a
settings `PoolConfig` that references any other module (e.g. governance) is
rejected. The circulating LP (issued to the creator via change) defaults to
`Σ price_i·reserve_i`; an equal amount is preminted into the pool.

#### Parameters

• **args**: [`IMintPoolV4Args`](../interfaces/IMintPoolV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.mintPool`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:715](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L715)

***

### newTxInstance()

> **newTxInstance**(): `TxBuilder`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`TxBuilder`

#### Overrides

[`TxBuilderAbstractV4`](TxBuilderAbstractV4.md).[`newTxInstance`](TxBuilderAbstractV4.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:232](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L232)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:494](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L494)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:365](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L365)

***

### update()

> **update**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Updates an order in place: cancels the existing order UTxO and locks a
fresh swap/basic order in the same transaction. The replacement carries its
own constraint set and `config_token`; the returned assets from the cancel
fund the new order's deposit/budget/offer (Blaze balances the difference).

#### Parameters

• **args**: [`IUpdateV4Args`](../interfaces/IUpdateV4Args.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.update`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:675](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L675)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:482](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L482)
