[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: TxBuilderLucidV3

`TxBuilderLucidV3` is a class extending `TxBuilder` to support transaction construction
for Lucid against the V3 SundaeSwap protocol. It includes capabilities to build and execute various transaction types
such as swaps, cancellations, updates, deposits, withdrawals, and zaps.

## Extends

- [`TxBuilderV3`](../../Core/classes/TxBuilderV3.md)

## Constructors

### new TxBuilderLucidV3()

> **new TxBuilderLucidV3**(`lucid`, `network`, `queryProvider`?): [`TxBuilderLucidV3`](TxBuilderLucidV3.md)

#### Parameters

• **lucid**: `Lucid`

A configured Lucid instance to use.

• **network**: [`TSupportedNetworks`](../../Core/type-aliases/TSupportedNetworks.md)

The network to build transactions on.

• **queryProvider?**: [`QueryProviderSundaeSwap`](../../Core/classes/QueryProviderSundaeSwap.md)

#### Returns

[`TxBuilderLucidV3`](TxBuilderLucidV3.md)

#### Overrides

`TxBuilderV3.constructor`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:94](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L94)

## Properties

### lucid

> **lucid**: `Lucid`

A configured Lucid instance to use.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:95](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L95)

## Methods

### cancel()

> **cancel**(`cancelArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a cancel transaction based on the provided configuration arguments.
Validates the datum and datumHash, retrieves the necessary UTXO data,
sets up the transaction, and completes it.

#### Parameters

• **cancelArgs**: [`ICancelConfigArgs`](../../Core/interfaces/ICancelConfigArgs.md)

The configuration arguments for the cancel transaction.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the cancel transaction.

#### Overrides

`TxBuilderV3.cancel`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:687](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L687)

***

### deposit()

> **deposit**(`depositArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a deposit transaction using the provided deposit configuration arguments.
The method builds the deposit transaction, including the necessary accumulation of deposit tokens
and the required datum, then completes the transaction to add liquidity to a pool.

#### Parameters

• **depositArgs**: [`IDepositConfigArgs`](../../Core/interfaces/IDepositConfigArgs.md)

The configuration arguments for the deposit.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object.

#### Overrides

`TxBuilderV3.deposit`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:847](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L847)

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

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:1083](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L1083)

***

### getAllReferenceUtxos()

> **getAllReferenceUtxos**(): `Promise`\<`UTxO`[]\>

Gets the reference UTxOs based on the transaction data
stored in the reference scripts of the protocol parameters
using the Lucid provider.

#### Returns

`Promise`\<`UTxO`[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:134](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L134)

***

### getAllSettingsUtxos()

> **getAllSettingsUtxos**(): `Promise`\<`UTxO`[]\>

Gets the settings UTxOs based on the transaction data
stored in the settings scripts of the protocol parameters
using the Lucid provider.

#### Returns

`Promise`\<`UTxO`[]\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:171](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L171)

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

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:191](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L191)

***

### getProtocolParams()

> **getProtocolParams**(): `Promise`\<[`ISundaeProtocolParamsFull`](../../Core/interfaces/ISundaeProtocolParamsFull.md)\>

Retrieves the basic protocol parameters from the SundaeSwap API
and fills in a place-holder for the compiled code of any validators.

This is to keep things lean until we really need to attach a validator,
in which case, a subsequent method call to [TxBuilderLucidV3#getValidatorScript](TxBuilderLucidV3.md#getvalidatorscript)
will re-populate with real data.

#### Returns

`Promise`\<[`ISundaeProtocolParamsFull`](../../Core/interfaces/ISundaeProtocolParamsFull.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:116](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L116)

***

### getReferenceScript()

> **getReferenceScript**(`type`): `Promise`\<[`ISundaeProtocolReference`](../../Core/interfaces/ISundaeProtocolReference.md)\>

#### Parameters

• **type**: `"order.spend"` \| `"pool.spend"`

The type of reference input to retrieve.

#### Returns

`Promise`\<[`ISundaeProtocolReference`](../../Core/interfaces/ISundaeProtocolReference.md)\>

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:152](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L152)

***

### getUtxosForPoolMint()

> **getUtxosForPoolMint**(): `Promise`\<`UTxO`[]\>

Retrieves the list of UTXOs associated with the wallet, sorts them first by transaction hash (`txHash`)
in ascending order and then by output index (`outputIndex`) in ascending order, and returns them for Lucid
to collect from.

#### Returns

`Promise`\<`UTxO`[]\>

A promise that resolves to an array of UTXOs for the transaction. Sorting is required
because the first UTXO in the sorted list is the seed (used for generating a unique pool ident, etc).

#### Throws

Throws an error if the retrieval of UTXOs fails or if no UTXOs are available.

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:1126](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L1126)

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

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:213](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L213)

***

### mintPool()

> **mintPool**(`mintPoolArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

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

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A completed transaction object.

#### Throws

Throws an error if the transaction fails to build or submit.

#### Overrides

`TxBuilderV3.mintPool`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:282](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L282)

***

### newTxInstance()

> **newTxInstance**(`fee`?): `Tx`

Returns a new Tx instance from Lucid and pre-applies the referral
fee payment if a [ITxBuilderReferralFee](../../Core/interfaces/ITxBuilderReferralFee.md) config is passed in.

#### Parameters

• **fee?**: [`ITxBuilderReferralFee`](../../Core/interfaces/ITxBuilderReferralFee.md)

The optional referral fee configuration.

#### Returns

`Tx`

#### Overrides

[`TxBuilderV3`](../../Core/classes/TxBuilderV3.md).[`newTxInstance`](../../Core/classes/TxBuilderV3.md#newtxinstance)

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:236](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L236)

***

### orderRouteSwap()

> **orderRouteSwap**(`args`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Performs an order route swap with the given arguments.

#### Parameters

• **args**: [`IOrderRouteSwapArgs`](../../Core/interfaces/IOrderRouteSwapArgs.md)

The arguments for the order route swap.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

The result of the transaction.

#### Overrides

`TxBuilderV3.orderRouteSwap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:546](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L546)

***

### swap()

> **swap**(`swapArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a swap transaction based on the provided swap configuration.
It constructs the necessary arguments for the swap, builds the transaction instance,
and completes the transaction by paying to the contract and finalizing the transaction details.

#### Parameters

• **swapArgs**: [`ISwapConfigArgs`](../../Core/interfaces/ISwapConfigArgs.md)

The configuration arguments for the swap.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the completed transaction.

#### Overrides

`TxBuilderV3.swap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:469](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L469)

***

### update()

> **update**(`The`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Updates a transaction by first executing a cancel transaction, spending that back into the
contract, and then attaching a swap datum. It handles referral fees and ensures the correct
accumulation of assets for the transaction.

#### Parameters

• **The**

arguments for cancel and swap configurations.

• **The.cancelArgs**: [`ICancelConfigArgs`](../../Core/interfaces/ICancelConfigArgs.md)

• **The.swapArgs**: [`ISwapConfigArgs`](../../Core/interfaces/ISwapConfigArgs.md)

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the result of the updated transaction.

#### Overrides

`TxBuilderV3.update`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:761](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L761)

***

### withdraw()

> **withdraw**(`withdrawArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a withdrawal transaction using the provided withdrawal configuration arguments.
The method builds the withdrawal transaction, including the necessary accumulation of LP tokens
and datum, and then completes the transaction to remove liquidity from a pool.

#### Parameters

• **withdrawArgs**: [`IWithdrawConfigArgs`](../../Core/interfaces/IWithdrawConfigArgs.md)

The configuration arguments for the withdrawal.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object.

#### Overrides

`TxBuilderV3.withdraw`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:895](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L895)

***

### zap()

> **zap**(`zapArgs`): `Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

Executes a zap transaction which combines a swap and a deposit into a single operation.
It determines the swap direction, builds the necessary arguments, sets up the transaction,
and then completes it by attaching the required metadata and making payments.

#### Parameters

• **zapArgs**: `Omit`\<[`IZapConfigArgs`](../../Core/interfaces/IZapConfigArgs.md), `"zapDirection"`\>

The configuration arguments for the zap, excluding the zap direction.

#### Returns

`Promise`\<[`IComposedTx`](../../Core/interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, `Record`\<`string`, `AssetAmount`\<`IAssetAmountMetadata`\>\>\>\>

A promise that resolves to the composed transaction object resulting from the zap operation.

#### Overrides

`TxBuilderV3.zap`

#### Defined in

[packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts:945](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/TxBuilders/TxBuilder.Lucid.V3.class.ts#L945)
