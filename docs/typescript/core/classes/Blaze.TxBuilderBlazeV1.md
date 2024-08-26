# Class: TxBuilderBlazeV1

[Blaze](../modules/Blaze.md).TxBuilderBlazeV1

`TxBuilderBlazeV1` is a class extending `TxBuilder` to support transaction construction
for Blaze against the V1 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
such as swaps, cancellations, updates, deposits, withdrawals, zaps, and liquidity migrations to
the V3 contracts (it is recommended to utilize V3 contracts if possible: [Blaze.TxBuilderBlazeV3](Blaze.TxBuilderBlazeV3.md)).

**`Implements`**

## Hierarchy

- [`TxBuilderV1`](Core.TxBuilderV1.md)

  ↳ **`TxBuilderBlazeV1`**

## Constructors

### constructor

• **new TxBuilderBlazeV1**(`blaze`, `network`, `queryProvider?`): [`TxBuilderBlazeV1`](Blaze.TxBuilderBlazeV1.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `blaze` | `Blaze`\<`Blockfrost`, `WebWallet`\> \| `Blaze`\<`EmulatorProvider`, `ColdWallet`\> | A configured Blaze instance to use. |
| `network` | [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks) | The network id to use when building the transaction. |
| `queryProvider?` | [`QueryProviderSundaeSwap`](Core.QueryProviderSundaeSwap.md) | - |

#### Returns

[`TxBuilderBlazeV1`](Blaze.TxBuilderBlazeV1.md)

#### Overrides

TxBuilderV1.constructor

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:103](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L103)

## Properties

### blaze

• **blaze**: `Blaze`\<`Blockfrost`, `WebWallet`\> \| `Blaze`\<`EmulatorProvider`, `ColdWallet`\>

A configured Blaze instance to use.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:104](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L104)

## Methods

### \_\_getParam

▸ **__getParam**\<`K`\>(`param`): [`ITxBuilderV1BlazeParams`](../interfaces/Blaze.ITxBuilderV1BlazeParams.md)[`K`]

An internal shortcut method to avoid having to pass in the network all the time.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`ITxBuilderV1BlazeParams`](../interfaces/Blaze.ITxBuilderV1BlazeParams.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | `K` | The parameter you want to retrieve. |

#### Returns

[`ITxBuilderV1BlazeParams`](../interfaces/Blaze.ITxBuilderV1BlazeParams.md)[`K`]

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:247](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L247)

___

### attachReferralFees

▸ **attachReferralFees**(`instance`, `fee`): `void`

Helper function to attache referral fees to a tx instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `instance` | `TxBuilder` | Blaze TxBuilder instance. |
| `fee` | [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md) | The referral fees to add. |

#### Returns

`void`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:273](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L273)

___

### cancel

▸ **cancel**(`cancelArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a cancel transaction based on the provided configuration arguments.
Validates the datum and datumHash, retrieves the necessary UTXO data,
sets up the transaction, and completes it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cancelArgs` | [`ICancelConfigArgs`](../interfaces/Core.ICancelConfigArgs.md) | The configuration arguments for the cancel transaction. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

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

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:583](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L583)

___

### getProtocolParams

▸ **getProtocolParams**(): `Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/Core.ISundaeProtocolParamsFull.md)\>

Retrieves the basic protocol parameters from the SundaeSwap API
and fills in a place-holder for the compiled code of any validators.

This is to keep things lean until we really need to attach a validator,
in which case, a subsequent method call to [TxBuilderBlazeV3#getValidatorScript](Blaze.TxBuilderBlazeV3.md#getvalidatorscript)
will re-populate with real data.

#### Returns

`Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/Core.ISundaeProtocolParamsFull.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:192](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L192)

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

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:211](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L211)

___

### migrateLiquidityToV3

▸ **migrateLiquidityToV3**(`migrations`, `yieldFarming?`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

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

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

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

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:1115](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L1115)

___

### newTxInstance

▸ **newTxInstance**(`fee?`): `TxBuilder`

Returns a new Tx instance from Blaze. Throws an error if not ready.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fee?` | [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md) |

#### Returns

`TxBuilder`

#### Overrides

[TxBuilderV1](Core.TxBuilderV1.md).[newTxInstance](Core.TxBuilderV1.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:257](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L257)

___

### orderRouteSwap

▸ **orderRouteSwap**(`args`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Performs an order route swap with the given arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IOrderRouteSwapArgs`](../interfaces/Core.IOrderRouteSwapArgs.md) | The arguments for the order route swap. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

The result of the transaction.

**`Async`**

#### Overrides

TxBuilderV1.orderRouteSwap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:421](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L421)

___

### swap

▸ **swap**(`swapArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a swap transaction based on the provided swap configuration.
It constructs the necessary arguments for the swap, builds the transaction instance,
and completes the transaction by paying to the contract and finalizing the transaction details.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `swapArgs` | [`ISwapConfigArgs`](../interfaces/Core.ISwapConfigArgs.md) | The configuration arguments for the swap. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

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

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:334](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L334)

___

### update

▸ **update**(`The`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

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

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

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

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:691](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L691)

___

### withdraw

▸ **withdraw**(`withdrawArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a withdrawal transaction using the provided withdrawal configuration arguments.
The method builds the withdrawal transaction, including the necessary accumulation of LP tokens
and datum, and then completes the transaction to remove liquidity from a pool.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `withdrawArgs` | [`IWithdrawConfigArgs`](../interfaces/Core.IWithdrawConfigArgs.md) | The configuration arguments for the withdrawal. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

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

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:860](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L860)

___

### zap

▸ **zap**(`zapArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a zap transaction which combines a swap and a deposit into a single operation.
It determines the swap direction, builds the necessary arguments, sets up the transaction,
and then completes it by attaching the required metadata and making payments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `zapArgs` | `Omit`\<[`IZapConfigArgs`](../interfaces/Core.IZapConfigArgs.md), ``"zapDirection"``\> | The configuration arguments for the zap, excluding the zap direction. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

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

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:924](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L924)

___

### getParam

▸ **getParam**\<`K`\>(`param`, `network`): [`ITxBuilderV1BlazeParams`](../interfaces/Blaze.ITxBuilderV1BlazeParams.md)[`K`]

Helper method to get a specific parameter of the transaction builder.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`ITxBuilderV1BlazeParams`](../interfaces/Blaze.ITxBuilderV1BlazeParams.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | `K` | The parameter you want to retrieve. |
| `network` | [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks) | The protocol network. |

#### Returns

[`ITxBuilderV1BlazeParams`](../interfaces/Blaze.ITxBuilderV1BlazeParams.md)[`K`]

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts:234](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V1.class.ts#L234)
