[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: TxBuilderV4

`TxBuilderV4` builds transactions against the sundae-v4 protocol.

v4 is a module-composable redesign of the protocol — the swap math
(curve), authorization, fee policy, and other behaviors are pluggable
withdraw-validator modules rather than hardcoded into the pool
validator. Order placement is correspondingly factored into a list of
(`module_hash`, `data`) constraints carried on a generic OrderDatum.

This class mirrors `TxBuilderV3`'s public surface (`swap`, `deposit`,
`withdraw`, `cancel`, `mintPool`) and adds `basic()` — the v4
placement primitive every non-strategy intent ultimately uses.

Phase 1 ships the class skeleton with stub methods that throw
`NotImplementedError`; subsequent phases land each action's body in
turn (see `SDK V4 Phase 2…6` tasks).

## Extends

- [`TxBuilderAbstractV4`](TxBuilderAbstractV4.md)

## Constructors

### new TxBuilderV4()

> **new TxBuilderV4**(`blaze`, `queryProvider`?): [`TxBuilderV4`](TxBuilderV4.md)

#### Parameters

• **blaze**: `Blaze`\<`Provider`, `Wallet$1`\>

A configured Blaze instance to use.

• **queryProvider?**: [`QueryProviderSundaeSwap`](QueryProviderSundaeSwap.md)

A custom query provider if desired.

#### Returns

[`TxBuilderV4`](TxBuilderV4.md)

#### Overrides

`TxBuilderAbstractV4.constructor`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:48](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L48)

## Properties

### blaze

> **blaze**: `Blaze`\<`Provider`, `Wallet$1`\>

A configured Blaze instance to use.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:49](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L49)

## Methods

### basic()

> **basic**(`_args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Builds a v4 basic order — the placement primitive that backs every
non-strategy intent. A basic order pays out to its destination when
the destination output carries at least the declared min_received
list, regardless of which pools the scooper routed through.

Phase 3 will land the body.

#### Parameters

• **\_args**: `unknown`

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.basic`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:98](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L98)

***

### cancel()

> **cancel**(`_args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Cancels an existing v4 order, returning the locked value to the
owner.

Phase 5 will land the body.

#### Parameters

• **\_args**: `unknown`

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.cancel`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:128](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L128)

***

### deposit()

> **deposit**(`_args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Builds a v4 deposit order — a basic order whose min_received list
names the pool's LP asset.

Phase 4 will land the body.

#### Parameters

• **\_args**: `unknown`

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.deposit`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:108](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L108)

***

### enableTracing()

> **enableTracing**(`enable`): [`TxBuilderV4`](TxBuilderV4.md)

Enables tracing in the Blaze transaction builder.

#### Parameters

• **enable**: `boolean`

#### Returns

[`TxBuilderV4`](TxBuilderV4.md)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:65](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L65)

***

### mintPool()

> **mintPool**(`_args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Mints a new v4 pool — composes the curve, fee, and auth modules
declared by the supplied PoolConfig and seeds initial liquidity.

Phase 6 will land the body.

#### Parameters

• **\_args**: `unknown`

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.mintPool`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:138](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L138)

***

### newTxInstance()

> **newTxInstance**(): `unknown`

Creates a new transaction instance. Phase 1 placeholder — the
downstream methods will use this in subsequent phases.

#### Returns

`unknown`

#### Overrides

[`TxBuilderAbstractV4`](TxBuilderAbstractV4.md).[`newTxInstance`](TxBuilderAbstractV4.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:74](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L74)

***

### swap()

> **swap**(`_args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Builds a v4 swap order — a single-asset offer with a list of
min-received targets routed via the pluggable swap constraint.

Phase 3 will land the body.

#### Parameters

• **\_args**: `unknown`

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.swap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:86](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L86)

***

### withdraw()

> **withdraw**(`_args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Builds a v4 withdraw order — a basic order whose offered asset is
the pool's LP asset and min_received names the underlying assets.

Phase 4 will land the body.

#### Parameters

• **\_args**: `unknown`

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`unknown`, `unknown`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

`TxBuilderAbstractV4.withdraw`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V4.class.ts:118](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V4.class.ts#L118)
