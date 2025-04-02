[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: TxBuilderV3

`TxBuilderBlazeV3` is a class extending `TxBuilder` to support transaction construction
for Blaze against the V3 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
such as swaps, cancellations, updates, deposits, withdrawals, and zaps.

## Extends

- [`TxBuilderAbstractV3`](TxBuilderAbstractV3.md)

## Constructors

### new TxBuilderV3()

> **new TxBuilderV3**(`blaze`, `queryProvider`?): [`TxBuilderV3`](TxBuilderV3.md)

#### Parameters

• **blaze**: `Blaze`\<`Provider`, `Wallet$1`\>

A configured Blaze instance to use.

• **queryProvider?**: [`QueryProviderSundaeSwap`](QueryProviderSundaeSwap.md)

A custom query provider if desired.

#### Returns

[`TxBuilderV3`](TxBuilderV3.md)

#### Overrides

`TxBuilderAbstractV3.constructor`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:94](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L94)

## Properties

### blaze

> **blaze**: `Blaze`\<`Provider`, `Wallet$1`\>

A configured Blaze instance to use.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:95](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L95)

## Methods

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

#### Overrides

`TxBuilderAbstractV3.cancel`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:795](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L795)

***

### deposit()

> **deposit**(`depositArgs`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a deposit transaction using the provided deposit configuration arguments.
The method builds the deposit transaction, including the necessary accumulation of deposit tokens
and the required datum, then completes the transaction to add liquidity to a pool.

#### Parameters

• **depositArgs**: [`IDepositConfigArgs`](../interfaces/IDepositConfigArgs.md)

The configuration arguments for the deposit.

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object.

#### Overrides

`TxBuilderAbstractV3.deposit`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:984](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L984)

***

### enableTracing()

> **enableTracing**(`enable`): [`TxBuilderV3`](TxBuilderV3.md)

Enables tracing in the Blaze transaction builder.

#### Parameters

• **enable**: `boolean`

True to enable tracing, false to turn it off. (default: false)

#### Returns

[`TxBuilderV3`](TxBuilderV3.md)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:114](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L114)

***

### generateScriptAddress()

> **generateScriptAddress**(`type`, `ownerAddress`?): `Promise`\<`string`\>

Merges the user's staking key to the contract payment address if present.

#### Parameters

• **type**: `"order.spend"` \| `"pool.mint"`

• **ownerAddress?**: `string`

#### Returns

`Promise`\<`string`\>

The generated Bech32 address.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:1250](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L1250)

***

### getAllReferenceUtxos()

> **getAllReferenceUtxos**(): `Promise`\<`TransactionUnspentOutput`[]\>

Gets the reference UTxOs based on the transaction data
stored in the reference scripts of the protocol parameters
using the Blaze provider.

#### Returns

`Promise`\<`TransactionUnspentOutput`[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:143](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L143)

***

### getMaxScooperFeeAmount()

> **getMaxScooperFeeAmount**(): `Promise`\<`bigint`\>

Utility function to get the max scooper fee amount, which is defined
in the settings UTXO datum. If no settings UTXO was found, due to a network
error or otherwise, we fallback to 1 ADA.

#### Returns

`Promise`\<`bigint`\>

The maxScooperFee as defined by the settings UTXO.

#### Overrides

`TxBuilderAbstractV3.getMaxScooperFeeAmount`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:215](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L215)

***

### getProtocolParams()

> **getProtocolParams**(): `Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/ISundaeProtocolParamsFull.md)\>

Retrieves the basic protocol parameters from the SundaeSwap API
and fills in a place-holder for the compiled code of any validators.

#### Returns

`Promise`\<[`ISundaeProtocolParamsFull`](../interfaces/ISundaeProtocolParamsFull.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:125](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L125)

***

### getReferenceScript()

> **getReferenceScript**(`type`): `Promise`\<[`ISundaeProtocolReference`](../interfaces/ISundaeProtocolReference.md)\>

#### Parameters

• **type**: `"order.spend"` \| `"pool.spend"`

The type of reference input to retrieve.

#### Returns

`Promise`\<[`ISundaeProtocolReference`](../interfaces/ISundaeProtocolReference.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:166](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L166)

***

### getSettingsUtxo()

> **getSettingsUtxo**(): `Promise`\<`TransactionUnspentOutput`\>

Gets the settings UTxO.

#### Returns

`Promise`\<`TransactionUnspentOutput`\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:183](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L183)

***

### getSettingsUtxoDatum()

> **getSettingsUtxoDatum**(): `Promise`\<`string`\>

Gets the setting utxo's datum CBOR.

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:195](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L195)

***

### getUtxosForPoolMint()

> **getUtxosForPoolMint**(`requiredAssets`): `Promise`\<`TransactionUnspentOutput`[]\>

Retrieves the list of UTXOs associated with the wallet, sorts them first by transaction hash (`txHash`)
in ascending order and then by output index (`outputIndex`) in ascending order, and returns them for Blaze
to collect from.

#### Parameters

• **requiredAssets**: [`AssetAmount`\<`IAssetAmountMetadata`\>, `AssetAmount`\<`IAssetAmountMetadata`\>]

#### Returns

`Promise`\<`TransactionUnspentOutput`[]\>

A promise that resolves to an array of UTXOs for the transaction. Sorting is required
because the first UTXO in the sorted list is the seed (used for generating a unique pool ident, etc).

#### Throws

Throws an error if the retrieval of UTXOs fails or if no UTXOs are available.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:1299](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L1299)

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

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:260](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L260)

***

### mintPool()

> **mintPool**(`mintPoolArgs`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Mints a new liquidity pool on the Cardano blockchain. This method
constructs and submits a transaction that includes all the necessary generation
of pool NFTs, metadata, pool assets, and initial liquidity tokens,

#### Parameters

• **mintPoolArgs**: [`IMintV3PoolConfigArgs`](../interfaces/IMintV3PoolConfigArgs.md)

Configuration arguments for minting the pool, including assets,
fee parameters, owner address, protocol fee, and referral fee.
 - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
 - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
 - fee: The desired pool fee, denominated out of 10 thousand.
 - marketOpen: The POSIX timestamp for when the pool should allow trades (market open).
 - ownerAddress: Who the generated LP tokens should be sent to.

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A completed transaction object.

#### Throws

Throws an error if the transaction fails to build or submit.

#### Overrides

`TxBuilderAbstractV3.mintPool`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:318](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L318)

***

### newTxInstance()

> **newTxInstance**(`fee`?): `TxBuilder`

Returns a new Tx instance from Blaze. Throws an error if not ready.

#### Parameters

• **fee?**: [`ITxBuilderReferralFee`](../interfaces/ITxBuilderReferralFee.md)

#### Returns

`TxBuilder`

#### Overrides

[`TxBuilderAbstractV3`](TxBuilderAbstractV3.md).[`newTxInstance`](TxBuilderAbstractV3.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:280](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L280)

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

`TxBuilderAbstractV3.orderRouteSwap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:645](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L645)

***

### resetMaxScooperFee()

> **resetMaxScooperFee**(): `void`

Resets the max scooper fee to read from the settings UTXO.

#### Returns

`void`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:248](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L248)

***

### setMaxScooperFee()

> **setMaxScooperFee**(`val`): `void`

Sets the max scooper fee override value.

#### Parameters

• **val**: `bigint`

The value in lovelace.

#### Returns

`void`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:239](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L239)

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

#### Overrides

`TxBuilderAbstractV3.swap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:557](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L557)

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

#### Overrides

`TxBuilderAbstractV3.update`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:893](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L893)

***

### withdraw()

> **withdraw**(`withdrawArgs`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a withdrawal transaction using the provided withdrawal configuration arguments.
The method builds the withdrawal transaction, including the necessary accumulation of LP tokens
and datum, and then completes the transaction to remove liquidity from a pool.

#### Parameters

• **withdrawArgs**: `Omit`\<[`IWithdrawConfigArgs`](../interfaces/IWithdrawConfigArgs.md), `"withdraw"`\>

The configuration arguments for the withdrawal.

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object.

#### Overrides

`TxBuilderAbstractV3.withdraw`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:1038](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L1038)

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

#### Overrides

`TxBuilderAbstractV3.zap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.V3.class.ts:1096](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.V3.class.ts#L1096)
