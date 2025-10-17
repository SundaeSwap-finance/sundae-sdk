[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: TxBuilderV1

`TxBuilderBlazeV1` is a class extending `TxBuilder` to support transaction construction
for Blaze against the V1 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
such as swaps, cancellations, updates, deposits, withdrawals, zaps, and liquidity migrations to
the V3 contracts (it is recommended to utilize V3 contracts if possible: [Core.TxBuilderV3](TxBuilderV3.md)).

## Extends

- [`TxBuilderAbstractV1`](TxBuilderAbstractV1.md)

## Constructors

### new TxBuilderV1()

> **new TxBuilderV1**(`blaze`, `queryProvider`?): [`TxBuilderV1`](TxBuilderV1.md)

#### Parameters

• **blaze**: `Blaze`\<`Provider`, `Wallet`\>

A configured Blaze instance to use.

• **queryProvider?**: [`QueryProviderSundaeSwap`](QueryProviderSundaeSwap.md)

A custom query provider if desired.

#### Returns

[`TxBuilderV1`](TxBuilderV1.md)

#### Overrides

`TxBuilderAbstractV1.constructor`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:102](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L102)

## Properties

### blaze

> **blaze**: `Blaze`\<`Provider`, `Wallet`\>

A configured Blaze instance to use.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:103](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L103)

## Methods

### \_\_getParam()

> **\_\_getParam**\<`K`\>(`param`): [`ITxBuilderV1BlazeParams`](../interfaces/ITxBuilderV1BlazeParams.md)\[`K`\]

An internal shortcut method to avoid having to pass in the network all the time.

#### Type Parameters

• **K** *extends* keyof [`ITxBuilderV1BlazeParams`](../interfaces/ITxBuilderV1BlazeParams.md)

#### Parameters

• **param**: `K`

The parameter you want to retrieve.

#### Returns

[`ITxBuilderV1BlazeParams`](../interfaces/ITxBuilderV1BlazeParams.md)\[`K`\]

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:195](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L195)

***

### cancel()

> **cancel**(`cancelArgs`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a cancel transaction based on the provided configuration arguments.
Validates the datum and datumHash, retrieves the necessary UTXO data,
sets up the transaction, and completes it.

#### Parameters

• **cancelArgs**: [`ICancelConfigArgs`](../interfaces/ICancelConfigArgs.md)

The configuration arguments for the cancel transaction.

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the cancel transaction.

#### Example

```ts
const txHash = await sdk.builder().cancel({
  ...args
})
  .then(({ sign }) => sign())
  .then(({ submit }) => submit());
```

#### Overrides

`TxBuilderAbstractV1.cancel`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:474](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L474)

***

### enableTracing()

> **enableTracing**(`enable`): [`TxBuilderV1`](TxBuilderV1.md)

Enables tracing in the Blaze transaction builder.

#### Parameters

• **enable**: `boolean`

True to enable tracing, false to turn it off. (default: false)

#### Returns

[`TxBuilderV1`](TxBuilderV1.md)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:122](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L122)

***

### getProtocolParams()

> **getProtocolParams**(): `Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/ISundaeProtocolParamsFull.md)\>

Retrieves the basic protocol parameters from the SundaeSwap API
and fills in a place-holder for the compiled code of any validators.

This is to keep things lean until we really need to attach a validator,
in which case, a subsequent method call to [TxBuilderV3#getValidatorScript](TxBuilderV3.md#getvalidatorscript)
will re-populate with real data.

#### Returns

`Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/ISundaeProtocolParamsFull.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:137](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L137)

***

### getValidatorScript()

> **getValidatorScript**(`name`): `Promise`\<[`ISundaeProtocolValidatorFull`](../interfaces/ISundaeProtocolValidatorFull.md)\>

Gets the full validator script based on the key. If the validator
scripts have not been fetched yet, then we get that information
before returning a response.

#### Parameters

• **name**: `string`

The name of the validator script to retrieve.

#### Returns

`Promise`\<[`ISundaeProtocolValidatorFull`](../interfaces/ISundaeProtocolValidatorFull.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:156](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L156)

***

### migrateLiquidityToV3()

> **migrateLiquidityToV3**(`migrations`, `yieldFarming`?): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Temporary function that migrates liquidity from V1 to version V3 pools in a batch process. This asynchronous function
iterates through an array of migration configurations, each specifying the withdrawal configuration
from a V1 pool and the deposit details into a V3 pool. For each migration, it constructs a withdrawal
datum for the V1 pool and a deposit datum for the V3 pool, calculates required fees, and constructs
the transaction metadata. It accumulates the total scooper fees, deposit amounts, and referral fees
across all migrations. The function concludes by composing a final transaction that encompasses all
individual migrations and returns the completed transaction along with the total fees and deposits.

#### Parameters

• **migrations**: [`IMigrateLiquidityConfig`](../interfaces/IMigrateLiquidityConfig.md)[]

An array of objects, each containing the withdrawal configuration for a V1 pool and the deposit pool data for a V3 pool.

• **yieldFarming?**: [`IMigrateYieldFarmingLiquidityConfig`](../interfaces/IMigrateYieldFarmingLiquidityConfig.md)

Migration configuration for any locked Yield Farming positions for a V1 pool.

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the transaction result, including the final transaction, total deposit, scooper fees, and referral fees.

#### Example

```typescript
const migrationResult = await sdk.builder().migrateLiquidityToV3([
  {
    withdrawConfig: {
      pool: { ident: 'pool1', liquidity: { ... } },
      suppliedLPAsset: { ... },
      referralFee: { ... },
    },
    depositPool: {
      ident: 'poolV3_1',
      assetA: { ... },
      assetB: { ... },
    },
  },
  {
    withdrawConfig: {
      pool: { ident: 'pool2', liquidity: { ... } },
      suppliedLPAsset: { ... },
      referralFee: { ... },
    },
    depositPool: {
      ident: 'poolV3_2',
      assetA: { ... },
      assetB: { ... },
    },
  },
]);
```

#### Overrides

`TxBuilderAbstractV1.migrateLiquidityToV3`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:1032](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L1032)

***

### newTxInstance()

> **newTxInstance**(`fee`?): `TxBuilder`

Returns a new Tx instance from Blaze. Throws an error if not ready.

#### Parameters

• **fee?**: [`ITxBuilderReferralFee`](../interfaces/ITxBuilderReferralFee.md)

#### Returns

`TxBuilder`

#### Overrides

[`TxBuilderAbstractV1`](TxBuilderAbstractV1.md).[`newTxInstance`](TxBuilderAbstractV1.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:205](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L205)

***

### orderRouteSwap()

> **orderRouteSwap**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Performs an order route swap with the given arguments.

#### Parameters

• **args**: [`IOrderRouteSwapArgs`](../interfaces/IOrderRouteSwapArgs.md)

The arguments for the order route swap.

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

The result of the transaction.

#### Overrides

`TxBuilderAbstractV1.orderRouteSwap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:329](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L329)

***

### swap()

> **swap**(`swapArgs`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a swap transaction based on the provided swap configuration.
It constructs the necessary arguments for the swap, builds the transaction instance,
and completes the transaction by paying to the contract and finalizing the transaction details.

#### Parameters

• **swapArgs**: [`ISwapConfigArgs`](../interfaces/ISwapConfigArgs.md)

The configuration arguments for the swap.

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the completed transaction.

#### Example

```ts
const txHash = await sdk.builder().swap({
  ...args
})
  .then(({ sign }) => sign())
  .then(({ submit }) => submit())
```

#### Overrides

`TxBuilderAbstractV1.swap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:256](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L256)

***

### update()

> **update**(`The`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Updates a transaction by first executing a cancel transaction, spending that back into the
contract, and then attaching a swap datum. It handles referral fees and ensures the correct
accumulation of assets for the transaction.

#### Parameters

• **The**

arguments for cancel and swap configurations.

• **The.cancelArgs**: [`ICancelConfigArgs`](../interfaces/ICancelConfigArgs.md)

• **The.swapArgs**: [`ISwapConfigArgs`](../interfaces/ISwapConfigArgs.md)

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the updated transaction.

#### Throws

#### Example

```ts
const txHash = await sdk.builder().update({
  cancelArgs: {
    ...args
  },
  swapArgs: {
    ...args
  }
})
  .then(({ sign }) => sign())
  .then(({ submit }) => submit());
```

#### Overrides

`TxBuilderAbstractV1.update`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:613](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L613)

***

### withdraw()

> **withdraw**(`withdrawArgs`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a withdrawal transaction using the provided withdrawal configuration arguments.
The method builds the withdrawal transaction, including the necessary accumulation of LP tokens
and datum, and then completes the transaction to remove liquidity from a pool.

#### Parameters

• **withdrawArgs**: [`IWithdrawConfigArgs`](../interfaces/IWithdrawConfigArgs.md)

The configuration arguments for the withdrawal.

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object.

#### Example

```ts
const txHash = await sdk.builder().withdraw({
  ..args
})
  .then(({ sign }) => sign())
  .then(({ submit }) => submit());
```

#### Overrides

`TxBuilderAbstractV1.withdraw`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:773](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L773)

***

### zap()

> **zap**(`zapArgs`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a zap transaction which combines a swap and a deposit into a single operation.
It determines the swap direction, builds the necessary arguments, sets up the transaction,
and then completes it by attaching the required metadata and making payments.

#### Parameters

• **zapArgs**: `Omit`\<[`IZapConfigArgs`](../interfaces/IZapConfigArgs.md), `"zapDirection"`\>

The configuration arguments for the zap, excluding the zap direction.

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object resulting from the zap operation.

#### Example

```ts
const txHash = await sdk.builder().zap({
  ...args
})
  .then(({ sign }) => sign())
  .then(({ submit }) => submit());
```

#### Overrides

`TxBuilderAbstractV1.zap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:841](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L841)

***

### getParam()

> `static` **getParam**\<`K`\>(`param`, `network`): [`ITxBuilderV1BlazeParams`](../interfaces/ITxBuilderV1BlazeParams.md)\[`K`\]

Helper method to get a specific parameter of the transaction builder.

#### Type Parameters

• **K** *extends* keyof [`ITxBuilderV1BlazeParams`](../interfaces/ITxBuilderV1BlazeParams.md)

#### Parameters

• **param**: `K`

The parameter you want to retrieve.

• **network**: [`TSupportedNetworks`](../type-aliases/TSupportedNetworks.md)

The protocol network.

#### Returns

[`ITxBuilderV1BlazeParams`](../interfaces/ITxBuilderV1BlazeParams.md)\[`K`\]

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V1.class.ts:182](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V1.class.ts#L182)
