# Class: TxBuilderLucidV3

[Lucid](../modules/Lucid.md).TxBuilderLucidV3

`TxBuilderLucidV3` is a class extending `TxBuilder` to support transaction construction
for Lucid against the V3 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
such as swaps, cancellations, updates, deposits, withdrawals, and zaps.

**`Implements`**

## Hierarchy

- [`TxBuilder`](Core.TxBuilder.md)

  ↳ **`TxBuilderLucidV3`**

## Constructors

### constructor

• **new TxBuilderLucidV3**(`lucid`, `datumBuilder`, `queryProvider?`): [`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `lucid` | `Lucid` | A configured Lucid instance to use. |
| `datumBuilder` | [`DatumBuilderLucidV3`](Lucid.DatumBuilderLucidV3.md) | A valid V3 DatumBuilder class that will build valid datums. |
| `queryProvider?` | [`QueryProviderSundaeSwap`](Core.QueryProviderSundaeSwap.md) | - |

#### Returns

[`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md)

#### Overrides

TxBuilder.constructor

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:100](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L100)

## Properties

### datumBuilder

• **datumBuilder**: [`DatumBuilderLucidV3`](Lucid.DatumBuilderLucidV3.md)

A valid V3 DatumBuilder class that will build valid datums.

#### Inherited from

TxBuilder.datumBuilder

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:102](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L102)

___

### lucid

• **lucid**: `Lucid`

A configured Lucid instance to use.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:101](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L101)

## Methods

### \_\_getParam

▸ **__getParam**\<`K`\>(`param`): [`ITxBuilderV3Params`](../interfaces/Lucid.ITxBuilderV3Params.md)[`K`]

An internal shortcut method to avoid having to pass in the network all the time.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends keyof [`ITxBuilderV3Params`](../interfaces/Lucid.ITxBuilderV3Params.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | `K` | The parameter you want to retrieve. |

#### Returns

[`ITxBuilderV3Params`](../interfaces/Lucid.ITxBuilderV3Params.md)[`K`]

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:134](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L134)

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

#### Overrides

TxBuilder.cancel

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:551](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L551)

___

### deposit

▸ **deposit**(`depositArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a deposit transaction using the provided deposit configuration arguments.
The method builds the deposit transaction, including the necessary accumulation of deposit tokens
and the required datum, then completes the transaction to add liquidity to a pool.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `depositArgs` | [`IDepositConfigArgs`](../interfaces/Core.IDepositConfigArgs.md) | The configuration arguments for the deposit. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object.

#### Overrides

TxBuilder.deposit

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:703](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L703)

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

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:934](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L934)

___

### getAllReferenceUtxos

▸ **getAllReferenceUtxos**(): `Promise`\<`UTxO`[]\>

Gets the reference UTxOs based on the transaction data
stored in the reference scripts of the protocol parameters
using the Lucid provider.

#### Returns

`Promise`\<`UTxO`[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:176](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L176)

___

### getAllSettingsUtxos

▸ **getAllSettingsUtxos**(): `Promise`\<`UTxO`[]\>

Gets the settings UTxOs based on the transaction data
stored in the settings scripts of the protocol parameters
using the Lucid provider.

#### Returns

`Promise`\<`UTxO`[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:196](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L196)

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

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:148](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L148)

___

### getUtxosForPoolMint

▸ **getUtxosForPoolMint**(): `Promise`\<`UTxO`[]\>

Retrieves the list of UTXOs associated with the wallet, sorts them first by transaction hash (`txHash`)
in ascending order and then by output index (`outputIndex`) in ascending order, and returns them for Lucid
to collect from.

#### Returns

`Promise`\<`UTxO`[]\>

A promise that resolves to an array of UTXOs for the transaction. Sorting is required
because the first UTXO in the sorted list is the seed (used for generating a unique pool ident, etc).

**`Throws`**

Throws an error if the retrieval of UTXOs fails or if no UTXOs are available.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:977](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L977)

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

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:219](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L219)

___

### mintPool

▸ **mintPool**(`mintPoolArgs`): `Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Mints a new liquidity pool on the Cardano blockchain. This method
constructs and submits a transaction that includes all the necessary generation
of pool NFTs, metadata, pool assets, and initial liquidity tokens,

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mintPoolArgs` | [`IMintV3PoolConfigArgs`](../interfaces/Core.IMintV3PoolConfigArgs.md) | Configuration arguments for minting the pool, including assets, fee parameters, owner address, protocol fee, and referral fee. - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway. - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway. - fees: A pair of fees, denominated out of 10 thousand, that correspond to their respective index in marketTimings. - - **NOTE**: Fees must be the same value until decay is supported by scoopers. - marketTimings: The POSIX timestamp for when the fee should start (market open), and stop (fee progression ends). - ownerAddress: Who the generated LP tokens should be sent to. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/Core.IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A completed transaction object.

**`Throws`**

Throws an error if the transaction fails to build or submit.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:303](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L303)

___

### newTxInstance

▸ **newTxInstance**(`fee?`): `Tx`

Returns a new Tx instance from Lucid and pre-applies the referral
fee payment if a [ITxBuilderReferralFee](../interfaces/Core.ITxBuilderReferralFee.md) config is passed in.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fee?` | [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md) | The optional referral fee configuration. |

#### Returns

`Tx`

#### Overrides

[TxBuilder](Core.TxBuilder.md).[newTxInstance](Core.TxBuilder.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:256](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L256)

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

#### Overrides

TxBuilder.swap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:497](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L497)

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

#### Overrides

TxBuilder.update

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:617](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L617)

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

#### Overrides

TxBuilder.withdraw

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:751](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L751)

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

#### Overrides

TxBuilder.zap

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:796](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L796)

___

### getParam

▸ **getParam**\<`K`\>(`param`, `network`): [`ITxBuilderV3Params`](../interfaces/Lucid.ITxBuilderV3Params.md)[`K`]

Helper method to get a specific parameter of the transaction builder.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `K` | extends keyof [`ITxBuilderV3Params`](../interfaces/Lucid.ITxBuilderV3Params.md) | A generic type parameter that extends the keys of `ITxBuilderV3Params`. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | `K` | The name of the parameter to retrieve. Must be a key of `ITxBuilderV3Params`. |
| `network` | [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks) | The network for which to retrieve the parameter. Determines the set of parameters to use. |

#### Returns

[`ITxBuilderV3Params`](../interfaces/Lucid.ITxBuilderV3Params.md)[`K`]

- The value of the requested parameter, with the type corresponding to the key `param`.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:122](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L122)
