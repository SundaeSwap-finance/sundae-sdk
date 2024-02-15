# Class: TxBuilderLucidV1

[Lucid](../modules/Lucid.md).TxBuilderLucidV1

`TxBuilderLucidV1` is a class extending `TxBuilder` to support transaction construction
for Lucid against the V1 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
such as swaps, cancellations, updates, deposits, withdrawals, zaps, and liquidity migrations to
the V3 contracts (it is recommended to utilize V3 contracts if possible: [Lucid.TxBuilderLucidV3](Lucid.TxBuilderLucidV3.md)).

**`Implements`**

## Hierarchy

- [`TxBuilder`](Core.TxBuilder.md)

  ↳ **`TxBuilderLucidV1`**

## Constructors

### constructor

• **new TxBuilderLucidV1**(`lucid`, `datumBuilder`): [`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `lucid` | `Lucid` | A configured Lucid instance to use. |
| `datumBuilder` | [`DatumBuilderLucidV1`](Lucid.DatumBuilderLucidV1.md) | A valid V1 DatumBuilder class that will build valid datums. |

#### Returns

[`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

#### Overrides

TxBuilder.constructor

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L91)

## Properties

### datumBuilder

• **datumBuilder**: [`DatumBuilderLucidV1`](Lucid.DatumBuilderLucidV1.md)

A valid V1 DatumBuilder class that will build valid datums.

#### Inherited from

TxBuilder.datumBuilder

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L91)

___

### lucid

• **lucid**: `Lucid`

A configured Lucid instance to use.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L91)

## Methods

### \_\_getParam

▸ **__getParam**\<`K`\>(`param`): [`ITxBuilderV1Params`](../interfaces/Lucid.ITxBuilderV1Params.md)[`K`]

An internal shortcut method to avoid having to pass in the network all the time.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`ITxBuilderV1Params`](../interfaces/Lucid.ITxBuilderV1Params.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | `K` | The parameter you want to retrieve. |

#### Returns

[`ITxBuilderV1Params`](../interfaces/Lucid.ITxBuilderV1Params.md)[`K`]

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:116](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L116)

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

TxBuilder.cancel

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:230](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L230)

___

### migrateLiquidityToV3

▸ **migrateLiquidityToV3**(`migrations`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Migrates liquidity from V1 to version V3 pools in a batch process. This asynchronous function
iterates through an array of migration configurations, each specifying the withdrawal configuration
from a V1 pool and the deposit details into a V3 pool. For each migration, it constructs a withdrawal
datum for the V1 pool and a deposit datum for the V3 pool, calculates required fees, and constructs
the transaction metadata. It accumulates the total scooper fees, deposit amounts, and referral fees
across all migrations. The function concludes by composing a final transaction that encompasses all
individual migrations and returns the completed transaction along with the total fees and deposits.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `migrations` | \{ `depositPool`: [`IPoolData`](../interfaces/Core.IPoolData.md) ; `withdrawConfig`: [`IWithdrawConfigArgs`](../interfaces/Core.IWithdrawConfigArgs.md)  }[] | An array of objects, each containing the withdrawal configuration for a V1 pool and the deposit pool data for a V3 pool. |

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

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:643](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L643)

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

[TxBuilder](Core.TxBuilder.md).[newTxInstance](Core.TxBuilder.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:124](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L124)

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

TxBuilder.swap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:172](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L172)

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

TxBuilder.update

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:304](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L304)

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

TxBuilder.withdraw

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:432](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L432)

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

TxBuilder.zap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:478](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L478)

___

### getParam

▸ **getParam**\<`K`\>(`param`, `network`): [`ITxBuilderV1Params`](../interfaces/Lucid.ITxBuilderV1Params.md)[`K`]

Helper method to get a specific parameter of the transaction builder.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`ITxBuilderV1Params`](../interfaces/Lucid.ITxBuilderV1Params.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | `K` | The parameter you want to retrieve. |
| `network` | [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks) | The protocol network. |

#### Returns

[`ITxBuilderV1Params`](../interfaces/Lucid.ITxBuilderV1Params.md)[`K`]

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts:103](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V1.class.ts#L103)
