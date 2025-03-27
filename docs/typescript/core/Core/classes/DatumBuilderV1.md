[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: DatumBuilderV1

The Blaze implementation for building valid Datums for
V1 contracts on the SundaeSwap protocol.

## Implements

- [`DatumBuilderAbstract`](DatumBuilderAbstract.md)

## Properties

### network

> **network**: [`TSupportedNetworks`](../type-aliases/TSupportedNetworks.md)

The current network id.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts:42](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts#L42)

***

### INVALID\_POOL\_IDENT

> `static` **INVALID\_POOL\_IDENT**: `string` = `"You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order."`

The error to throw when the pool ident does not match V1 constraints.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts:44](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts#L44)

## Methods

### buildDepositDatum()

> **buildDepositDatum**(`params`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Creates a deposit datum object from the given deposit arguments. The function initializes
a new datum with specific properties such as the pool ident, order addresses, scooper fee,
and deposit pair schema. It then converts this datum into an inline format and calculates
its hash using [Core.BlazeHelper](BlazeHelper.md). The function returns an object containing the hash of the inline
datum, the inline datum itself, and the original datum schema.

#### Parameters

• **params**: [`IDepositArguments`](../interfaces/IDepositArguments.md)

The deposit arguments required to construct the deposit datum.

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

An object containing the hash of the inline datum, the inline datum itself,
                              and the schema of the original datum.

##### DepositPair

> **DepositPair**: `"VOID"` \| `object`

##### ident

> **ident**: `string`

##### orderAddresses

> **orderAddresses**: `object`

##### orderAddresses.alternate

> **alternate**: `null` \| `string`

##### orderAddresses.destination

> **destination**: `object`

##### orderAddresses.destination.credentials

> **credentials**: `object`

##### orderAddresses.destination.credentials.paymentKey

> **paymentKey**: `object` \| `object`

##### orderAddresses.destination.credentials.stakingKey

> **stakingKey**: `null` \| `object`

##### orderAddresses.destination.datum

> **datum**: `null` \| `string`

##### scooperFee

> **scooperFee**: `bigint`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts:112](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts#L112)

***

### buildSwapDatum()

> **buildSwapDatum**(`params`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Constructs a swap datum object based on the provided swap arguments.
The function initializes a new datum with specific properties such as the pool ident,
order addresses, scooper fee, and swap direction schema. It then converts this datum
into an inline format and computes its hash using [Core.BlazeHelper](BlazeHelper.md). The function returns an
object containing the hash of the inline datum, the inline datum itself, and the original
datum schema.

#### Parameters

• **params**: [`ISwapArguments`](../interfaces/ISwapArguments.md)

The swap arguments required to build the swap datum.

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

An object containing the hash of the inline datum, the inline datum itself,
                              and the schema of the original datum.

##### ident

> **ident**: `string`

##### orderAddresses

> **orderAddresses**: `object`

##### orderAddresses.alternate

> **alternate**: `null` \| `string`

##### orderAddresses.destination

> **destination**: `object`

##### orderAddresses.destination.credentials

> **credentials**: `object`

##### orderAddresses.destination.credentials.paymentKey

> **paymentKey**: `object` \| `object`

##### orderAddresses.destination.credentials.stakingKey

> **stakingKey**: `null` \| `object`

##### orderAddresses.destination.datum

> **datum**: `null` \| `string`

##### scooperFee

> **scooperFee**: `bigint`

##### swapDirection

> **swapDirection**: `object`

##### swapDirection.amount

> **amount**: `bigint`

##### swapDirection.minReceivable

> **minReceivable**: `null` \| `bigint`

##### swapDirection.suppliedAssetIndex

> **suppliedAssetIndex**: `"A"` \| `"B"`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts:78](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts#L78)

***

### buildWithdrawDatum()

> **buildWithdrawDatum**(`params`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Generates a withdraw datum object from the specified withdraw arguments. This function constructs
a new datum with defined attributes such as the pool ident, order addresses, scooper fee, and
the schema for the supplied LP (Liquidity Provider) asset for withdrawal. After constructing the datum,
it is converted into an inline format, and its hash is calculated using [Core.BlazeHelper](BlazeHelper.md). The function returns
an object containing the hash of the inline datum, the inline datum itself, and the schema of the original
datum, which are crucial for executing the withdrawal operation within a transactional framework.

#### Parameters

• **params**: [`IWithdrawArguments`](../interfaces/IWithdrawArguments.md)

The arguments necessary to construct the withdraw datum.

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

An object comprising the hash of the inline datum, the inline datum itself,
                              and the schema of the original datum, facilitating the withdrawal operation's integration into the transactional process.

##### ident

> **ident**: `string`

##### orderAddresses

> **orderAddresses**: `object`

##### orderAddresses.alternate

> **alternate**: `null` \| `string`

##### orderAddresses.destination

> **destination**: `object`

##### orderAddresses.destination.credentials

> **credentials**: `object`

##### orderAddresses.destination.credentials.paymentKey

> **paymentKey**: `object` \| `object`

##### orderAddresses.destination.credentials.stakingKey

> **stakingKey**: `null` \| `object`

##### orderAddresses.destination.datum

> **datum**: `null` \| `string`

##### scooperFee

> **scooperFee**: `bigint`

##### WithdrawAsset

> **WithdrawAsset**: `"VOID"` \| `object`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts:157](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts#L157)

***

### registerValidatorScriptHash()

> **registerValidatorScriptHash**(`hash`): `void`

Utility to register a validator script hash.

#### Parameters

• **hash**: `string`

The validator script hash.

#### Returns

`void`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts:58](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts#L58)
