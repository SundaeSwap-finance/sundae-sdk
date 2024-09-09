# Class: TxBuilderLucidV1

[Lucid](../modules/Lucid.md).TxBuilderLucidV1

`TxBuilderLucidV1` is a class extending `TxBuilder` to support transaction construction
for Lucid against the V1 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
such as swaps, cancellations, updates, deposits, withdrawals, zaps, and liquidity migrations to
the V3 contracts (it is recommended to utilize V3 contracts if possible: [Lucid.TxBuilderLucidV3](Lucid.TxBuilderLucidV3.md)).

**`Implements`**

## Hierarchy

- [`TxBuilderV1`](Core.TxBuilderV1.md)

  ↳ **`TxBuilderLucidV1`**

## Constructors

### constructor

• **new TxBuilderLucidV1**(`lucid`, `network`, `queryProvider?`): [`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `lucid` | `Lucid` | A configured Lucid instance to use. |
| `network` | [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks) | The network to build transactions on. |
| `queryProvider?` | [`QueryProviderSundaeSwap`](Core.QueryProviderSundaeSwap.md) | - |

#### Returns

[`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

#### Overrides

TxBuilderV1.constructor

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:101](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L101)

## Properties

### lucid

• **lucid**: `Lucid`

A configured Lucid instance to use.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:102](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L102)

## Methods

### \_\_getParam

▸ **__getParam**\<`K`\>(`param`): [`ITxBuilderV1LucidParams`](../interfaces/Lucid.ITxBuilderV1LucidParams.md)[`K`]

An internal shortcut method to avoid having to pass in the network all the time.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`ITxBuilderV1LucidParams`](../interfaces/Lucid.ITxBuilderV1LucidParams.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | `K` | The parameter you want to retrieve. |

#### Returns

[`ITxBuilderV1LucidParams`](../interfaces/Lucid.ITxBuilderV1LucidParams.md)[`K`]

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:178](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L178)

___

### cancel

▸ **cancel**(`cancelArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a cancel transaction based on the provided configuration arguments.
Validates the datum and datumHash, retrieves the necessary UTXO data,
sets up the transaction, and completes it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cancelArgs` | [`ICancelConfigArgs`](../interfaces/Core.ICancelConfigArgs.md) | The configuration arguments for the cancel transaction. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the cancel transaction.

**`Async`**

**`Example`**

```ts
const txHash = await sdk.builder().cancel({
  ...args
})
  .then(({ sign }) => sign())
  .then(({ submit }) => submit());
```

#### Overrides

TxBuilderV1.cancel

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:453](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L453)

___

### getProtocolParams

▸ **getProtocolParams**(): `Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/Core.ISundaeProtocolParamsFull.md)\>

Retrieves the basic protocol parameters from the SundaeSwap API
and fills in a place-holder for the compiled code of any validators.

This is to keep things lean until we really need to attach a validator,
in which case, a subsequent method call to [TxBuilderLucidV3#getValidatorScript](Lucid.TxBuilderLucidV3.md#getvalidatorscript)
will re-populate with real data.

#### Returns

`Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/Core.ISundaeProtocolParamsFull.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:123](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L123)

___

### getValidatorScript

▸ **getValidatorScript**(`name`): `Promise`\<[`ISundaeProtocolValidatorFull`](../interfaces/Core.ISundaeProtocolValidatorFull.md)\>

Gets the full validator script based on the key. If the validator
scripts have not been fetched yet, then we get that information
before returning a response.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the validator script to retrieve. |

#### Returns

`Promise`\<[`ISundaeProtocolValidatorFull`](../interfaces/Core.ISundaeProtocolValidatorFull.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:142](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L142)

___

### migrateLiquidityToV3

▸ **migrateLiquidityToV3**(`migrations`, `yieldFarming?`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Temporary function that migrates liquidity from V1 to version V3 pools in a batch process. This asynchronous function
iterates through an array of migration configurations, each specifying the withdrawal configuration
from a V1 pool and the deposit details into a V3 pool. For each migration, it constructs a withdrawal
datum for the V1 pool and a deposit datum for the V3 pool, calculates required fees, and constructs
the transaction metadata. It accumulates the total scooper fees, deposit amounts, and referral fees
across all migrations. The function concludes by composing a final transaction that encompasses all
individual migrations and returns the completed transaction along with the total fees and deposits.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `migrations` | [`IMigrateLiquidityConfig`](../interfaces/Core.IMigrateLiquidityConfig.md)[] | An array of objects, each containing the withdrawal configuration for a V1 pool and the deposit pool data for a V3 pool. |
| `yieldFarming?` | [`IMigrateYieldFarmingLiquidityConfig`](../interfaces/Core.IMigrateYieldFarmingLiquidityConfig.md) | Migration configuration for any locked Yield Farming positions for a V1 pool. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the transaction result, including the final transaction, total deposit, scooper fees, and referral fees.

**`Example`**

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

TxBuilderV1.migrateLiquidityToV3

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:920](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L920)

___

### newTxInstance

▸ **newTxInstance**(`fee?`): `Tx`

Returns a new Tx instance from Lucid. Throws an error if not ready.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fee?` | [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md) |

#### Returns

`Tx`

#### Overrides

[TxBuilderV1](Core.TxBuilderV1.md).[newTxInstance](Core.TxBuilderV1.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:188](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L188)

___

### orderRouteSwap

▸ **orderRouteSwap**(`args`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Performs an order route swap with the given arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IOrderRouteSwapArgs`](../interfaces/Core.IOrderRouteSwapArgs.md) | The arguments for the order route swap. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

The result of the transaction.

**`Async`**

#### Overrides

TxBuilderV1.orderRouteSwap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:306](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L306)

___

### swap

▸ **swap**(`swapArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a swap transaction based on the provided swap configuration.
It constructs the necessary arguments for the swap, builds the transaction instance,
and completes the transaction by paying to the contract and finalizing the transaction details.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `swapArgs` | [`ISwapConfigArgs`](../interfaces/Core.ISwapConfigArgs.md) | The configuration arguments for the swap. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the completed transaction.

**`Async`**

**`Example`**

```ts
const txHash = await sdk.builder().swap({
  ...args
})
  .then(({ sign }) => sign())
  .then(({ submit }) => submit())
```

#### Overrides

TxBuilderV1.swap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:236](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L236)

___

### update

▸ **update**(`The`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Updates a transaction by first executing a cancel transaction, spending that back into the
contract, and then attaching a swap datum. It handles referral fees and ensures the correct
accumulation of assets for the transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `The` | `Object` | arguments for cancel and swap configurations. |
| `The.cancelArgs` | [`ICancelConfigArgs`](../interfaces/Core.ICancelConfigArgs.md) | - |
| `The.swapArgs` | [`ISwapConfigArgs`](../interfaces/Core.ISwapConfigArgs.md) | - |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the updated transaction.

**`Throws`**

**`Async`**

**`Example`**

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

TxBuilderV1.update

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:554](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L554)

___

### withdraw

▸ **withdraw**(`withdrawArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a withdrawal transaction using the provided withdrawal configuration arguments.
The method builds the withdrawal transaction, including the necessary accumulation of LP tokens
and datum, and then completes the transaction to remove liquidity from a pool.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `withdrawArgs` | [`IWithdrawConfigArgs`](../interfaces/Core.IWithdrawConfigArgs.md) | The configuration arguments for the withdrawal. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object.

**`Async`**

**`Example`**

```ts
const txHash = await sdk.builder().withdraw({
  ..args
})
  .then(({ sign }) => sign())
  .then(({ submit }) => submit());
```

#### Overrides

TxBuilderV1.withdraw

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:694](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L694)

___

### zap

▸ **zap**(`zapArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a zap transaction which combines a swap and a deposit into a single operation.
It determines the swap direction, builds the necessary arguments, sets up the transaction,
and then completes it by attaching the required metadata and making payments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `zapArgs` | `Omit`\<[`IZapConfigArgs`](../interfaces/Core.IZapConfigArgs.md), ``"zapDirection"``\> | The configuration arguments for the zap, excluding the zap direction. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object resulting from the zap operation.

**`Async`**

**`Example`**

```ts
const txHash = await sdk.builder().zap({
  ...args
})
  .then(({ sign }) => sign())
  .then(({ submit }) => submit());
```

#### Overrides

TxBuilderV1.zap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:752](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L752)

___

### getParam

▸ **getParam**\<`K`\>(`param`, `network`): [`ITxBuilderV1LucidParams`](../interfaces/Lucid.ITxBuilderV1LucidParams.md)[`K`]

Helper method to get a specific parameter of the transaction builder.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`ITxBuilderV1LucidParams`](../interfaces/Lucid.ITxBuilderV1LucidParams.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | `K` | The parameter you want to retrieve. |
| `network` | [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks) | The protocol network. |

#### Returns

[`ITxBuilderV1LucidParams`](../interfaces/Lucid.ITxBuilderV1LucidParams.md)[`K`]

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:165](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L165)
