[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: TxBuilderBlazeV3

`TxBuilderBlazeV3` is a class extending `TxBuilder` to support transaction construction
for Blaze against the V3 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
such as swaps, cancellations, updates, deposits, withdrawals, and zaps.

## Extends

- [`TxBuilderV3`](../../Core/classes/TxBuilderV3.md)

## Constructors

### new TxBuilderBlazeV3()

> **new TxBuilderBlazeV3**(`blaze`, `network`, `queryProvider`?): [`TxBuilderBlazeV3`](TxBuilderBlazeV3.md)

#### Parameters

• **blaze**: `Blaze`\<`Provider`, `Wallet$1`\>

A configured Blaze instance to use.

• **network**: [`TSupportedNetworks`](../../Core/type-aliases/TSupportedNetworks.md)

The Network identifier for this TxBuilder instance.

• **queryProvider?**: [`QueryProviderSundaeSwap`](../../Core/classes/QueryProviderSundaeSwap.md)

#### Returns

[`TxBuilderBlazeV3`](TxBuilderBlazeV3.md)

#### Overrides

`TxBuilderV3.constructor`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:90](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L90)

## Properties

### blaze

> **blaze**: `Blaze`\<`Provider`, `Wallet$1`\>

A configured Blaze instance to use.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L91)

## Methods

### cancel()

> **cancel**(`cancelArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a cancel transaction based on the provided configuration arguments.
Validates the datum and datumHash, retrieves the necessary UTXO data,
sets up the transaction, and completes it.

#### Parameters

• **cancelArgs**: [`ICancelConfigArgs`](../../Core/interfaces/ICancelConfigArgs.md)

The configuration arguments for the cancel transaction.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the cancel transaction.

#### Overrides

`TxBuilderV3.cancel`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:822](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L822)

***

### deposit()

> **deposit**(`depositArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a deposit transaction using the provided deposit configuration arguments.
The method builds the deposit transaction, including the necessary accumulation of deposit tokens
and the required datum, then completes the transaction to add liquidity to a pool.

#### Parameters

• **depositArgs**: [`IDepositConfigArgs`](../../Core/interfaces/IDepositConfigArgs.md)

The configuration arguments for the deposit.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object.

#### Overrides

`TxBuilderV3.deposit`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:1017](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L1017)

***

### generateScriptAddress()

> **generateScriptAddress**(`type`, `ownerAddress`?): `Promise`\<`string`\>

Merges the user's staking key to the contract payment address if present.

#### Parameters

• **type**: `"pool.mint"` \| `"order.spend"`

• **ownerAddress?**: `string`

#### Returns

`Promise`\<`string`\>

The generated Bech32 address.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:1283](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L1283)

***

### getAllReferenceUtxos()

> **getAllReferenceUtxos**(): `Promise`\<`TransactionUnspentOutput`[]\>

Gets the reference UTxOs based on the transaction data
stored in the reference scripts of the protocol parameters
using the Blaze provider.

#### Returns

`Promise`\<`TransactionUnspentOutput`[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:169](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L169)

***

### getMaxScooperFeeAmount()

> **getMaxScooperFeeAmount**(): `Promise`\<`bigint`\>

Utility function to get the max scooper fee amount, which is defined
in the settings UTXO datum. If no settings UTXO was found, due to a network
error or otherwise, we fallback to 1 ADA.

#### Returns

`Promise`\<`bigint`\>

The maxScooperFee as defined by the settings UTXO.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:241](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L241)

***

### getProtocolParams()

> **getProtocolParams**(): `Promise`\<[`ISundaeProtocolParamsFull`](../../Core/interfaces/ISundaeProtocolParamsFull.md)\>

Retrieves the basic protocol parameters from the SundaeSwap API
and fills in a place-holder for the compiled code of any validators.

This is to keep things lean until we really need to attach a validator,
in which case, a subsequent method call to [TxBuilderBlazeV3#getValidatorScript](TxBuilderBlazeV3.md#getvalidatorscript)
will re-populate with real data.

#### Returns

`Promise`\<[`ISundaeProtocolParamsFull`](../../Core/interfaces/ISundaeProtocolParamsFull.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:151](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L151)

***

### getReferenceScript()

> **getReferenceScript**(`type`): `Promise`\<[`ISundaeProtocolReference`](../../Core/interfaces/ISundaeProtocolReference.md)\>

#### Parameters

• **type**: `"order.spend"` \| `"pool.spend"`

The type of reference input to retrieve.

#### Returns

`Promise`\<[`ISundaeProtocolReference`](../../Core/interfaces/ISundaeProtocolReference.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:192](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L192)

***

### getSettingsUtxo()

> **getSettingsUtxo**(): `Promise`\<`TransactionUnspentOutput`\>

Gets the settings UTxO.

#### Returns

`Promise`\<`TransactionUnspentOutput`\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:209](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L209)

***

### getSettingsUtxoDatum()

> **getSettingsUtxoDatum**(): `Promise`\<`string`\>

Gets the setting utxo's datum CBOR.

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:221](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L221)

***

### getUtxosForPoolMint()

> **getUtxosForPoolMint**(): `Promise`\<`TransactionUnspentOutput`[]\>

Retrieves the list of UTXOs associated with the wallet, sorts them first by transaction hash (`txHash`)
in ascending order and then by output index (`outputIndex`) in ascending order, and returns them for Blaze
to collect from.

#### Returns

`Promise`\<`TransactionUnspentOutput`[]\>

A promise that resolves to an array of UTXOs for the transaction. Sorting is required
because the first UTXO in the sorted list is the seed (used for generating a unique pool ident, etc).

#### Throws

Throws an error if the retrieval of UTXOs fails or if no UTXOs are available.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:1332](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L1332)

***

### getValidatorScript()

> **getValidatorScript**(`name`): `Promise`\<[`ISundaeProtocolValidatorFull`](../../Core/interfaces/ISundaeProtocolValidatorFull.md)\>

Gets the full validator script based on the key. If the validator
scripts have not been fetched yet, then we get that information
before returning a response.

#### Parameters

• **name**: `string`

The name of the validator script to retrieve.

#### Returns

`Promise`\<[`ISundaeProtocolValidatorFull`](../../Core/interfaces/ISundaeProtocolValidatorFull.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:263](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L263)

***

### mintPool()

> **mintPool**(`mintPoolArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Mints a new liquidity pool on the Cardano blockchain. This method
constructs and submits a transaction that includes all the necessary generation
of pool NFTs, metadata, pool assets, and initial liquidity tokens,

#### Parameters

• **mintPoolArgs**: [`IMintV3PoolConfigArgs`](../../Core/interfaces/IMintV3PoolConfigArgs.md)

Configuration arguments for minting the pool, including assets,
fee parameters, owner address, protocol fee, and referral fee.
 - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
 - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
 - fee: The desired pool fee, denominated out of 10 thousand.
 - marketOpen: The POSIX timestamp for when the pool should allow trades (market open).
 - ownerAddress: Who the generated LP tokens should be sent to.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A completed transaction object.

#### Throws

Throws an error if the transaction fails to build or submit.

#### Overrides

`TxBuilderV3.mintPool`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:346](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L346)

***

### newTxInstance()

> **newTxInstance**(`fee`?): `TxBuilder`

Returns a new Tx instance from Blaze. Throws an error if not ready.

#### Parameters

• **fee?**: [`ITxBuilderReferralFee`](../../Core/interfaces/ITxBuilderReferralFee.md)

#### Returns

`TxBuilder`

#### Overrides

[`TxBuilderV3`](../../Core/classes/TxBuilderV3.md).[`newTxInstance`](../../Core/classes/TxBuilderV3.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:283](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L283)

***

### orderRouteSwap()

> **orderRouteSwap**(`args`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Performs an order route swap with the given arguments.

#### Parameters

• **args**: [`IOrderRouteSwapArgs`](../../Core/interfaces/IOrderRouteSwapArgs.md)

The arguments for the order route swap.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

The result of the transaction.

#### Overrides

`TxBuilderV3.orderRouteSwap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:668](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L668)

***

### swap()

> **swap**(`swapArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a swap transaction based on the provided swap configuration.
It constructs the necessary arguments for the swap, builds the transaction instance,
and completes the transaction by paying to the contract and finalizing the transaction details.

#### Parameters

• **swapArgs**: [`ISwapConfigArgs`](../../Core/interfaces/ISwapConfigArgs.md)

The configuration arguments for the swap.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the completed transaction.

#### Overrides

`TxBuilderV3.swap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:580](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L580)

***

### update()

> **update**(`The`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Updates a transaction by first executing a cancel transaction, spending that back into the
contract, and then attaching a swap datum. It handles referral fees and ensures the correct
accumulation of assets for the transaction.

#### Parameters

• **The**

arguments for cancel and swap configurations.

• **The.cancelArgs**: [`ICancelConfigArgs`](../../Core/interfaces/ICancelConfigArgs.md)

• **The.swapArgs**: [`ISwapConfigArgs`](../../Core/interfaces/ISwapConfigArgs.md)

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the updated transaction.

#### Overrides

`TxBuilderV3.update`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:921](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L921)

***

### withdraw()

> **withdraw**(`withdrawArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a withdrawal transaction using the provided withdrawal configuration arguments.
The method builds the withdrawal transaction, including the necessary accumulation of LP tokens
and datum, and then completes the transaction to remove liquidity from a pool.

#### Parameters

• **withdrawArgs**: `Omit`\<[`IWithdrawConfigArgs`](../../Core/interfaces/IWithdrawConfigArgs.md), `"withdraw"`\>

The configuration arguments for the withdrawal.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object.

#### Overrides

`TxBuilderV3.withdraw`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:1071](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L1071)

***

### zap()

> **zap**(`zapArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a zap transaction which combines a swap and a deposit into a single operation.
It determines the swap direction, builds the necessary arguments, sets up the transaction,
and then completes it by attaching the required metadata and making payments.

#### Parameters

• **zapArgs**: `Omit`\<[`IZapConfigArgs`](../../Core/interfaces/IZapConfigArgs.md), `"zapDirection"`\>

The configuration arguments for the zap, excluding the zap direction.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`TxBuilder`, `Transaction`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object resulting from the zap operation.

#### Overrides

`TxBuilderV3.zap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts:1129](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Blaze.V3.class.ts#L1129)
