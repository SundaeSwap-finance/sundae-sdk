[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: DatumBuilderV3

This class is useful if you would rather just build valid CBOR strings for just the datum
portion of a valid SundaeSwap transaction.

## Extended by

- [`DatumBuilderStableswaps`](DatumBuilderStableswaps.md)

## Implements

- [`DatumBuilderAbstract`](DatumBuilderAbstract.md)

## Properties

### network

> **network**: [`TSupportedNetworks`](../type-aliases/TSupportedNetworks.md)

The current network id.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:118](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L118)

***

### INVALID\_POOL\_IDENT

> `static` **INVALID\_POOL\_IDENT**: `string` = `"You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order."`

The error to throw when the pool ident does not match V1 constraints.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:120](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L120)

## Methods

### buildDepositDatum()

> **buildDepositDatum**(`args`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Constructs a deposit datum object for V3 deposits, based on the specified arguments. This function
creates a comprehensive deposit datum structure, which includes the destination address, the pool ident,
owner information, scooper fee, and the deposit order details. The deposit order specifies the assets involved
in the deposit. The constructed datum is then converted to an inline format, suitable for embedding within
transactions, and its hash is calculated. The function returns an object containing the hash of the inline datum,
the inline datum itself, and the schema of the original datum, which are key for facilitating the deposit operation
within a transactional framework.

#### Parameters

• **args**: [`IDatumBuilderDepositV3Args`](../interfaces/IDatumBuilderDepositV3Args.md)

The deposit arguments for constructing the V3 deposit datum.

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

An object comprising the hash of the inline datum, the inline datum itself,
                                             and the schema of the original deposit datum, essential for the execution of the deposit operation.

##### destination

> **destination**: `"Self"` \| `object`

##### details

> **details**: `object` \| `object` \| `object` \| `object` \| `object` \| `object`

##### extension

> **extension**: `PlutusData`

##### maxProtocolFee

> **maxProtocolFee**: `bigint`

##### owner

> **owner**: `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`

##### poolIdent?

> `optional` **poolIdent**: `string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:183](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L183)

***

### buildMintPoolDatum()

> **buildMintPoolDatum**(`params`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object` \| `object`\>

Creates a new pool datum for minting a the pool. This is attached to the assets that are sent
to the pool minting contract. See [Core.TxBuilderV3](TxBuilderV3.md) for more details.

#### Parameters

• **params**: [`IDatumBuilderMintPoolArgs`](../interfaces/IDatumBuilderMintPoolArgs.md)

The arguments for building a pool mint datum.
 - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
 - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.
 - fee: The pool fee represented as per thousand.
 - marketOpen: The POSIX timestamp for when pool trades should start executing.
 - protocolFee: The fee gathered for the protocol treasury.
 - seedUtxo: The UTXO to use as the seed, which generates asset names and the pool ident.

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object` \| `object`\>

An object containing the hash of the inline datum, the inline datum itself,
                                             and the schema of the original pool mint datum, crucial for the execution
                                             of the minting pool operation.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:333](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L333)

***

### buildPoolMintRedeemerDatum()

> **buildPoolMintRedeemerDatum**(`param`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object` \| `object` \| `object`\>

Creates a redeemer datum for minting a new pool. This is attached to the new assets that
creating a new pool mints on the blockchain. See [Core.TxBuilderV3](TxBuilderV3.md) for more
details.

#### Parameters

• **param**: [`IDatumBuilderPoolMintRedeemerV3Args`](../interfaces/IDatumBuilderPoolMintRedeemerV3Args.md)

The assets being supplied to the new pool.
 - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway.
 - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway.

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object` \| `object` \| `object`\>

An object containing the hash of the inline datum, the inline datum itself,
                                             and the schema of the original pool mint redeemer datum, crucial for the execution
                                             of the minting pool operation.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:386](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L386)

***

### buildSwapDatum()

> **buildSwapDatum**(`args`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Constructs a swap datum object tailored for V3 swaps, based on the provided arguments. This function
assembles a detailed swap datum structure, which includes the pool ident, destination address, owner information,
scooper fee, and the swap order details. The swap order encapsulates the offered asset and the minimum received
asset requirements. The constructed datum is then converted to an inline format suitable for transaction embedding,
and its hash is computed. The function returns an object containing the hash, the inline datum, and the original
datum schema, facilitating the swap operation within a transactional context.

#### Parameters

• **args**: [`IDatumBuilderSwapV3Args`](../interfaces/IDatumBuilderSwapV3Args.md)

The swap arguments for constructing the V3 swap datum.

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

An object containing the hash of the inline datum, the inline datum itself,
                                             and the schema of the original swap datum, essential for the execution of the swap operation.

##### destination

> **destination**: `"Self"` \| `object`

##### details

> **details**: `object` \| `object` \| `object` \| `object` \| `object` \| `object`

##### extension

> **extension**: `PlutusData`

##### maxProtocolFee

> **maxProtocolFee**: `bigint`

##### owner

> **owner**: `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`

##### poolIdent?

> `optional` **poolIdent**: `string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:139](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L139)

***

### buildWithdrawDatum()

> **buildWithdrawDatum**(`args`): [`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

Creates a withdraw datum object for V3 withdrawals, utilizing the provided arguments. This function
assembles a detailed withdraw datum structure, which encompasses the destination address, pool ident,
owner information, scooper fee, and the withdrawal order details. The withdrawal order defines the amount
of LP (Liquidity Provider) tokens involved in the withdrawal. Once the datum is constructed, it is converted
into an inline format, suitable for transaction embedding, and its hash is calculated. The function returns
an object containing the hash of the inline datum, the inline datum itself, and the schema of the original
datum, facilitating the withdrawal operation within a transactional context.

#### Parameters

• **args**: [`IDatumBuilderWithdrawV3Args`](../interfaces/IDatumBuilderWithdrawV3Args.md)

The withdrawal arguments for constructing the V3 withdraw datum.

#### Returns

[`TDatumResult`](../type-aliases/TDatumResult.md)\<`object`\>

An object containing the hash of the inline datum, the inline datum itself,
                                             and the schema of the original withdraw datum, crucial for the execution of the withdrawal operation.

##### destination

> **destination**: `"Self"` \| `object`

##### details

> **details**: `object` \| `object` \| `object` \| `object` \| `object` \| `object`

##### extension

> **extension**: `PlutusData`

##### maxProtocolFee

> **maxProtocolFee**: `bigint`

##### owner

> **owner**: `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`

##### poolIdent?

> `optional` **poolIdent**: `string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:229](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L229)

***

### computePoolId()

> `static` **computePoolId**(`seed`): `string`

Computes the pool ID based on the provided UTxO being spent.

#### Parameters

• **seed**

The UTxO txHash and index.

• **seed.outputIndex**: `number`

• **seed.txHash**: `string`

#### Returns

`string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:640](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L640)

***

### computePoolLqName()

> `static` **computePoolLqName**(`poolId`): `string`

Computes the pool liquidity name.

#### Parameters

• **poolId**: `string`

The hex encoded pool ident.

#### Returns

`string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:616](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L616)

***

### computePoolNftName()

> `static` **computePoolNftName**(`poolId`): `string`

Computes the pool NFT name.

#### Parameters

• **poolId**: `string`

The hex encoded pool ident.

#### Returns

`string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:604](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L604)

***

### computePoolRefName()

> `static` **computePoolRefName**(`poolId`): `string`

Computes the pool reference name.

#### Parameters

• **poolId**: `string`

The hex encoded pool ident.

#### Returns

`string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:628](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L628)

***

### getDestinationAddressesFromDatum()

> `static` **getDestinationAddressesFromDatum**(`datum`): `object`

Extracts the staking and payment key hashes from a given datum's destination address. This static method
parses the provided datum to retrieve the destination address and then extracts the staking key hash and payment
key hash, if they exist. The method supports addresses that may include both staking and payment credentials,
handling each accordingly. It returns an object containing the staking key hash and payment key hash, which can
be used for further processing or validation within the system.

#### Parameters

• **datum**: `string`

The serialized datum string from which the destination address and its credentials are to be extracted.

#### Returns

`object`

An object containing the staking and
         payment key hashes extracted from the destination address within the datum. Each key hash is returned as a string
         if present, or `undefined` if the respective credential is not found in the address.

##### paymentKeyHash

> **paymentKeyHash**: `undefined` \| `string`

##### stakingKeyHash

> **stakingKeyHash**: `undefined` \| `string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:671](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L671)

***

### getSignerKeyFromDatum()

> `static` **getSignerKeyFromDatum**(`datum`): `undefined` \| `string`

Retrieves the owner's signing key from a given datum. This static method parses the provided
datum to extract the owner's information, specifically focusing on the signing key associated
with the owner. This key is crucial for validating ownership and authorizing transactions within
the system. The method is designed to work with datums structured according to V3Types.OrderDatum,
ensuring compatibility with specific transaction formats.

#### Parameters

• **datum**: `string`

The serialized datum string from which the owner's signing key is to be extracted.

#### Returns

`undefined` \| `string`

The signing key associated with the owner, extracted from the datum. This key is used
         for transaction validation and authorization purposes.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts:722](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts#L722)
