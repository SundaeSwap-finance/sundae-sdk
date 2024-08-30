# Class: TxBuilderBlazeV3

[Blaze](../modules/Blaze.md).TxBuilderBlazeV3

`TxBuilderBlazeV3` is a class extending `TxBuilder` to support transaction construction
for Blaze against the V3 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
such as swaps, cancellations, updates, deposits, withdrawals, and zaps.

**`Implements`**

## Hierarchy

- [`TxBuilderV3`](Core.TxBuilderV3.md)

  ↳ **`TxBuilderBlazeV3`**

## Constructors

### constructor

• **new TxBuilderBlazeV3**(`blaze`, `network`, `queryProvider?`): [`TxBuilderBlazeV3`](Blaze.TxBuilderBlazeV3.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `blaze` | `Blaze`\<`Blockfrost`, `WebWallet`\> \| `Blaze`\<`EmulatorProvider`, `ColdWallet`\> | A configured Blaze instance to use. |
| `network` | [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks) | The Network identifier for this TxBuilder instance. |
| `queryProvider?` | [`QueryProviderSundaeSwap`](Core.QueryProviderSundaeSwap.md) | - |

#### Returns

[`TxBuilderBlazeV3`](Blaze.TxBuilderBlazeV3.md)

#### Overrides

TxBuilderV3.constructor

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:92](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L92)

## Properties

### blaze

• **blaze**: `Blaze`\<`Blockfrost`, `WebWallet`\> \| `Blaze`\<`EmulatorProvider`, `ColdWallet`\>

A configured Blaze instance to use.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:93](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L93)

## Methods

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

#### Overrides

TxBuilderV3.cancel

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:817](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L817)

___

### deposit

▸ **deposit**(`depositArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a deposit transaction using the provided deposit configuration arguments.
The method builds the deposit transaction, including the necessary accumulation of deposit tokens
and the required datum, then completes the transaction to add liquidity to a pool.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `depositArgs` | [`IDepositConfigArgs`](../interfaces/Core.IDepositConfigArgs.md) | The configuration arguments for the deposit. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object.

#### Overrides

TxBuilderV3.deposit

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:1011](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L1011)

___

### generateScriptAddress

▸ **generateScriptAddress**(`type`, `ownerAddress?`): `Promise`\<`string`\>

Merges the user's staking key to the contract payment address if present.

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | ``"pool.mint"`` \| ``"order.spend"`` |
| `ownerAddress?` | `string` |

#### Returns

`Promise`\<`string`\>

The generated Bech32 address.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:1272](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L1272)

___

### getAllReferenceUtxos

▸ **getAllReferenceUtxos**(): `Promise`\<`TransactionUnspentOutput`[]\>

Gets the reference UTxOs based on the transaction data
stored in the reference scripts of the protocol parameters
using the Blaze provider.

#### Returns

`Promise`\<`TransactionUnspentOutput`[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:173](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L173)

___

### getMaxScooperFeeAmount

▸ **getMaxScooperFeeAmount**(): `Promise`\<`bigint`\>

Utility function to get the max scooper fee amount, which is defined
in the settings UTXO datum. If no settings UTXO was found, due to a network
error or otherwise, we fallback to 1 ADA.

#### Returns

`Promise`\<`bigint`\>

The maxScooperFee as defined by the settings UTXO.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:245](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L245)

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

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:155](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L155)

___

### getReferenceScript

▸ **getReferenceScript**(`type`): `Promise`\<[`ISundaeProtocolReference`](../interfaces/Core.ISundaeProtocolReference.md)\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | ``"order.spend"`` \| ``"pool.spend"`` | The type of reference input to retrieve. |

#### Returns

`Promise`\<[`ISundaeProtocolReference`](../interfaces/Core.ISundaeProtocolReference.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:196](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L196)

___

### getSettingsUtxo

▸ **getSettingsUtxo**(): `Promise`\<`TransactionUnspentOutput`\>

Gets the settings UTxO.

#### Returns

`Promise`\<`TransactionUnspentOutput`\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:213](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L213)

___

### getSettingsUtxoDatum

▸ **getSettingsUtxoDatum**(): `Promise`\<`string`\>

Gets the setting utxo's datum CBOR.

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:225](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L225)

___

### getUtxosForPoolMint

▸ **getUtxosForPoolMint**(): `Promise`\<`TransactionUnspentOutput`[]\>

Retrieves the list of UTXOs associated with the wallet, sorts them first by transaction hash (`txHash`)
in ascending order and then by output index (`outputIndex`) in ascending order, and returns them for Blaze
to collect from.

#### Returns

`Promise`\<`TransactionUnspentOutput`[]\>

A promise that resolves to an array of UTXOs for the transaction. Sorting is required
because the first UTXO in the sorted list is the seed (used for generating a unique pool ident, etc).

**`Throws`**

Throws an error if the retrieval of UTXOs fails or if no UTXOs are available.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:1321](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L1321)

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

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:267](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L267)

___

### mintPool

▸ **mintPool**(`mintPoolArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Mints a new liquidity pool on the Cardano blockchain. This method
constructs and submits a transaction that includes all the necessary generation
of pool NFTs, metadata, pool assets, and initial liquidity tokens,

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mintPoolArgs` | [`IMintV3PoolConfigArgs`](../interfaces/Core.IMintV3PoolConfigArgs.md) | Configuration arguments for minting the pool, including assets, fee parameters, owner address, protocol fee, and referral fee. - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway. - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway. - fee: The desired pool fee, denominated out of 10 thousand. - marketOpen: The POSIX timestamp for when the pool should allow trades (market open). - ownerAddress: Who the generated LP tokens should be sent to. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A completed transaction object.

**`Throws`**

Throws an error if the transaction fails to build or submit.

#### Overrides

TxBuilderV3.mintPool

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:350](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L350)

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

[TxBuilderV3](Core.TxBuilderV3.md).[newTxInstance](Core.TxBuilderV3.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:287](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L287)

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

TxBuilderV3.orderRouteSwap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:663](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L663)

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

#### Overrides

TxBuilderV3.swap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:574](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L574)

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

#### Overrides

TxBuilderV3.update

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:915](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L915)

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

#### Overrides

TxBuilderV3.withdraw

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:1065](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L1065)

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

#### Overrides

TxBuilderV3.zap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:1118](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L1118)
