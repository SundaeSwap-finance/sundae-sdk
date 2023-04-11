---
title: "DatumBuilder"
---

# DatumBuilder\<Data\>

The main builder interface for constructing valid Datums
for SundaeSwap protocol transactions.

**NOTE**: Be careful when building custom representations of this,
as invalid datum constructs can brick user funds!

To accurately create a custom DatumBuilder, refer to our Jest testing helper
methods exported to easily ensure your builder is outputting the correct hex-encoded
CBOR strings.

## Type parameters

- `Data` = `any`

## Hierarchy

- [`DatumBuilderLucid`](../../Extensions/classes/DatumBuilderLucid.md)

## Methods

### buildDepositDatum()

Should build a Datum for a Deposit transaction.

#### Signature

```ts
Abstract buildDepositDatum(args: DepositArguments): DatumResult<Data>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`DepositArguments`](../interfaces/DepositArguments.md) | The Deposit arguments. |

#### Returns

[`DatumResult`](../interfaces/DatumResult.md)\<`Data`\>

Defined in:  [classes/Abstracts/DatumBuilder.abstract.class.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L54)

### buildSwapDatum()

Should build a Datum for Swap transaction.

#### Signature

```ts
Abstract buildSwapDatum(args: SwapArguments): DatumResult<Data>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`SwapArguments`](../interfaces/SwapArguments.md) | The Swap arguments. |

#### Returns

[`DatumResult`](../interfaces/DatumResult.md)\<`Data`\>

Defined in:  [classes/Abstracts/DatumBuilder.abstract.class.ts:48](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L48)

### buildWithdrawDatum()

Should build a Datum for a Withdraw transaction.

#### Signature

```ts
Abstract buildWithdrawDatum(args: WithdrawArguments): DatumResult<Data>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`WithdrawArguments`](../interfaces/WithdrawArguments.md) | The Withdraw arguments. |

#### Returns

[`DatumResult`](../interfaces/DatumResult.md)\<`Data`\>

Defined in:  [classes/Abstracts/DatumBuilder.abstract.class.ts:66](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L66)

### buildZapDatum()

Should build a Datum for a Zap transaction.

#### Signature

```ts
Abstract buildZapDatum(args: ZapArguments): DatumResult<Data>;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ZapArguments`](../interfaces/ZapArguments.md) |

#### Returns

[`DatumResult`](../interfaces/DatumResult.md)\<`Data`\>

Defined in:  [classes/Abstracts/DatumBuilder.abstract.class.ts:60](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L60)

### datumToHash()

Should take a valid Datum structure or hex-encoded CBOR string of a valid Datum and convert it to a hash.
This is primarily used for testing but is a useful utility.

#### Signature

```ts
Abstract datumToHash(datum: string | Data): string;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `datum` | `string` \| `Data` | The Data representation or hex-encoded CBOR string of the datum. |

#### Returns

`string`

Defined in:  [classes/Abstracts/DatumBuilder.abstract.class.ts:36](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L36)

### getDestinationAddressFromCBOR()

Should parse the given datum cbor and extract the [DestinationAddress](../types/DestinationAddress.md) from it.

#### Signature

```ts
Abstract getDestinationAddressFromCBOR(datum: string): string;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `datum` | `string` | The hex-encoded CBOR string of the datum. |

#### Returns

`string`

Defined in:  [classes/Abstracts/DatumBuilder.abstract.class.ts:42](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L42)

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
| `orderAddresses` | [`OrderAddresses`](../types/OrderAddresses.md) |
| `errorMessage` | `string` |

#### Returns

`never`

Defined in:  [classes/Abstracts/DatumBuilder.abstract.class.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L91)
