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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:282](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L282)

***

### cancel()

> **cancel**(`_args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Cancels an existing v4 order. Pending: spend the order UTxO via the order
validator's Cancel path (needs the order reference script + owner-signer
resolution from the multisig).

#### Parameters

• **\_args**: `unknown`

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.cancel`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:393](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L393)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:310](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L310)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:201](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L201)

***

### mintPool()

> **mintPool**(`_args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Mints a new v4 pool. The pool DATUM is ready ([DatumBuilderV4.buildPoolDatum](DatumBuilderV4.md#buildpooldatum)
+ [DatumBuilderV4.hashModuleConfig](DatumBuilderV4.md#hashmoduleconfig)); the remaining tx work (seed-utxo
consumption, CIP-68 222/100/333 NFT mint via the pool policy, module withdraw
registrations, settings reference) lands once the protocol query exposes the
v4 pool-mint policy + settings.

#### Parameters

• **\_args**: `unknown`

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.mintPool`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:404](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L404)

***

### newTxInstance()

> **newTxInstance**(): `TxBuilder`

Should create a new transaction instance from the supplied transaction library.

#### Returns

`TxBuilder`

#### Overrides

[`TxBuilderAbstractV4`](TxBuilderAbstractV4.md).[`newTxInstance`](TxBuilderAbstractV4.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:145](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L145)

***

### placeOrder()

> `protected` **placeOrder**(`args`, `offered`, `constraints`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Shared placement primitive: assemble the `OrderDatum`, lock the offered
assets + the fee budget at the order script address, and complete. Exposed
(protected) so the datum/output assembly is unit-testable without a live
tx completion.

#### Parameters

• **args**: [`IOrderV4Base`](../interfaces/IOrderV4Base.md)

• **offered**: `AssetAmount`\<`IAssetAmountMetadata`\>[]

• **constraints**: [`string`, `PlutusData`][]

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:329](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L329)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:246](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L246)

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

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:317](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L317)
