---
title: "DatumBuilderLucid"
---

# DatumBuilderLucid

The Lucid implementation of a [DatumBuilder](../../Core/classes/DatumBuilder.md). This is useful
if you would rather just build valid CBOR strings for just the datum
portion of a valid SundaeSwap transaction.

## Hierarchy

- [`DatumBuilder`](../../Core/classes/DatumBuilder.md)\<`Data`\>.**DatumBuilderLucid**

## Methods

### \_getAddressHashes()

Helper function to parse addresses hashses from a Bech32 or hex encoded address.

#### Signature

```ts
Private _getAddressHashes(address: string): object;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Returns

`object`

| Member | Type |
| :------ | :------ |
| `paymentCredentials` | `string` |
| `stakeCredentials`? | `string` |

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:296](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L296)

### \_isScriptAddress()

Helper function to check if an address is a string.

#### Signature

```ts
Private _isScriptAddress(address: string): boolean;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | The Bech32 encoded address. |

#### Returns

`boolean`

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:354](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L354)

### \_maybeThrowDestinationNetworkError()

Throws an error if either of the OrderAddresses are on the wrong network.

#### Signature

```ts
Private _maybeThrowDestinationNetworkError(addressNetwork: number, address: string, orderAddresses: OrderAddresses): void;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `addressNetwork` | `number` |
| `address` | `string` |
| `orderAddresses` | [`OrderAddresses`](../../Core/types/OrderAddresses.md) |

#### Returns

`void`

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:410](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L410)

### \_validateAddressNetwork()

Validates that the [OrderAddresses](../../Core/types/OrderAddresses.md) provided match the instance's network.

#### Signature

```ts
Private _validateAddressNetwork(orderAddresses: OrderAddresses): void;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../../Core/types/OrderAddresses.md) |

#### Returns

`void`

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:367](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L367)

### \_validateAddressesAreValid()

Validates the [OrderAddresses](../../Core/types/OrderAddresses.md) arguments as being valid Cardano address strings
and that they are on the correct network.

#### Signature

```ts
Private _validateAddressesAreValid(orderAddresses: OrderAddresses): void;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../../Core/types/OrderAddresses.md) |

#### Returns

`void`

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:318](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L318)

### buildDepositDatum()

Builds the Deposit datum.

#### Signature

```ts
buildDepositDatum(«destructured»: DepositArguments): object;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`DepositArguments`](../../Core/interfaces/DepositArguments.md) |

#### Returns

`object`

| Member | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`\<`Data`\> |
| `hash` | `string` |

Overrides: [DatumBuilder](../../Core/classes/DatumBuilder.md).[buildDepositDatum](../../Core/classes/DatumBuilder.md#builddepositdatum)

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:84](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L84)

### buildDepositPair()

Builds the pair of assets for depositing in the pool.

#### Signature

```ts
buildDepositPair(deposit: DepositMixed): DatumResult<Data>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deposit` | [`DepositMixed`](../../Core/types/DepositMixed.md) | A pair of assets that match CoinA and CoinB of the pool. |

#### Returns

[`DatumResult`](../../Core/interfaces/DatumResult.md)\<`Data`\>

Overrides: DatumBuilder.buildDepositPair

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:165](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L165)

### buildDepositZap()

Builds the atomic zap deposit of a single-sided pool deposit.

#### Signature

```ts
buildDepositZap(zap: DepositSingle): DatumResult<Data>;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `zap` | [`DepositSingle`](../../Core/types/DepositSingle.md) |

#### Returns

[`DatumResult`](../../Core/interfaces/DatumResult.md)\<`Data`\>

Overrides: DatumBuilder.buildDepositZap

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:188](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L188)

### buildOrderAddresses()

Builds the datum for the [OrderAddresses](../../Core/types/OrderAddresses.md) interface using a data
constructor class from the Lucid library.

#### Signature

```ts
buildOrderAddresses(addresses: OrderAddresses): object;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `addresses` | [`OrderAddresses`](../../Core/types/OrderAddresses.md) |

#### Returns

`object`

| Member | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`\<`Constr`\<`string`\> \| `Constr`\<`Constr`\<`string`\> \| `Constr`\<`Constr`\<`string`\> \| `Constr`\<`Constr`\<`Constr`\<`string`\>\>\>\>\>\> |
| `hash` | `string` |

Overrides: DatumBuilder.buildOrderAddresses

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:247](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L247)

### buildScooperFee()

Builds the fee for the Scoopers. Defaults to [SCOOPER_FEE](../../Core/interfaces/IProtocolParams.md#scooper_fee)

#### Signature

```ts
buildScooperFee(fee?: bigint): bigint;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fee?` | `bigint` | The custom fee if provided. |

#### Returns

`bigint`

Overrides: DatumBuilder.buildScooperFee

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:156](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L156)

### buildSwapDatum()

Builds the Swap datum.

#### Signature

```ts
buildSwapDatum(«destructured»: SwapArguments): object;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`SwapArguments`](../../Core/interfaces/SwapArguments.md) |

#### Returns

`object`

| Member | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`\<`string` \| `bigint` \| `Constr`\<`Constr`\<`string`\> \| `Constr`\<`Constr`\<`string`\> \| `Constr`\<`Constr`\<`string`\> \| `Constr`\<`Constr`\<`Constr`\<`string`\>\>\>\>\>\> \| `Constr`\<`bigint` \| `Constr`\<`bigint`\>\>\> |
| `hash` | `string` |

Overrides: [DatumBuilder](../../Core/classes/DatumBuilder.md).[buildSwapDatum](../../Core/classes/DatumBuilder.md#buildswapdatum)

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:58](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L58)

### buildSwapDirection()

Builds the swap action against the pool.

#### Signature

```ts
buildSwapDirection(swap: Swap, amount: AssetAmount): object;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `swap` | [`Swap`](../../Core/types/Swap.md) | - |
| `amount` | [`AssetAmount`](../../Core/classes/AssetAmount.md) | The amount of the supplied asset we are sending to the pool. |

#### Returns

`object`

| Member | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`\<`bigint` \| `Constr`\<`bigint`\>\> |
| `hash` | `string` |

Overrides: DatumBuilder.buildSwapDirection

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:222](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L222)

### buildWithdrawAsset()

Builds the LP tokens to send to the pool.

#### Signature

```ts
buildWithdrawAsset(fundedLPAsset: IAsset): DatumResult<Data>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fundedLPAsset` | [`IAsset`](../../Core/interfaces/IAsset.md) | The LP tokens to send to the pool. |

#### Returns

[`DatumResult`](../../Core/interfaces/DatumResult.md)\<`Data`\>

Overrides: DatumBuilder.buildWithdrawAsset

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:202](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L202)

### buildWithdrawDatum()

Builds the Withdraw datum.

#### Signature

```ts
buildWithdrawDatum(«destructured»: WithdrawArguments): object;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`WithdrawArguments`](../../Core/interfaces/WithdrawArguments.md) |

#### Returns

`object`

| Member | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`\<`Data`\> |
| `hash` | `string` |

Overrides: [DatumBuilder](../../Core/classes/DatumBuilder.md).[buildWithdrawDatum](../../Core/classes/DatumBuilder.md#buildwithdrawdatum)

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:129](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L129)

### buildZapDatum()

Builds the Zap datum.

#### Signature

```ts
buildZapDatum(«destructured»: ZapArguments): object;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ZapArguments`](../../Core/interfaces/ZapArguments.md) |

#### Returns

`object`

| Member | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`\<`Data`\> |
| `hash` | `string` |

Overrides: [DatumBuilder](../../Core/classes/DatumBuilder.md).[buildZapDatum](../../Core/classes/DatumBuilder.md#buildzapdatum)

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:109](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L109)

### datumToHash()

Builds a hash from a Data object.

#### Signature

```ts
datumToHash(datum: Data): string;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `datum` | `Data` |

#### Returns

`string`

Overrides: [DatumBuilder](../../Core/classes/DatumBuilder.md).[datumToHash](../../Core/classes/DatumBuilder.md#datumtohash)

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:38](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L38)

### getDestinationAddressFromCBOR()

Parses out the DesintationAddress from a datum.

#### TODO

Ensure that we can reliably parse the DesinationAddress from the datum string.

#### Signature

```ts
getDestinationAddressFromCBOR(datum: string): string;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `datum` | `string` |

#### Returns

`string`

Overrides: [DatumBuilder](../../Core/classes/DatumBuilder.md).[getDestinationAddressFromCBOR](../../Core/classes/DatumBuilder.md#getdestinationaddressfromcbor)

Defined in:  [classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:51](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L51)

### throwInvalidOrderAddressesError()

This must be called when an invalid address is supplied to the buildOrderAddresses method.
While there is no way to enforce this from being called, it will fail tests unless invalid addresses cause the error
to be thrown.

#### See

[Testing](../../Testing/Testing.md)

#### Signature

```ts
Static throwInvalidOrderAddressesError(orderAddresses: OrderAddresses, errorMessage: string): never;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../../Core/types/OrderAddresses.md) |
| `errorMessage` | `string` |

#### Returns

`never`

Inherited from: [DatumBuilder](../../Core/classes/DatumBuilder.md).[throwInvalidOrderAddressesError](../../Core/classes/DatumBuilder.md#throwinvalidorderaddresseserror)

Defined in:  [classes/Abstracts/DatumBuilder.abstract.class.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L91)
