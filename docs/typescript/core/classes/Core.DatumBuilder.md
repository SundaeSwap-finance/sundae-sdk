# Class: DatumBuilder<Data\>

[Core](../modules/Core.md).DatumBuilder

The main builder interface for constructing valid Datums
for SundaeSwap protocol transactions.

**NOTE**: Be careful when building custom representations of this,
as invalid datum constructs can brick user funds!

To accurately create a custom DatumBuilder, refer to our Jest testing helper
methods exported to easily ensure your builder is outputting the correct hex-encoded
CBOR strings.

## Type parameters

| Name | Type |
| :------ | :------ |
| `Data` | `any` |

## Hierarchy

- **`DatumBuilder`**

  ↳ [`DatumBuilderLucid`](Extensions.DatumBuilderLucid.md)

## Methods

### buildDepositDatum

▸ `Abstract` **buildDepositDatum**(`args`): [`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

Should build a Datum for a Deposit transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`DepositArguments`](../interfaces/Core.DepositArguments.md) | The Deposit arguments. |

#### Returns

[`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

#### Defined in

[classes/Abstracts/DatumBuilder.abstract.class.ts:55](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L55)

___

### buildSwapDatum

▸ `Abstract` **buildSwapDatum**(`args`): [`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

Should build a Datum for Swap transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`SwapArguments`](../interfaces/Core.SwapArguments.md) | The Swap arguments. |

#### Returns

[`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

#### Defined in

[classes/Abstracts/DatumBuilder.abstract.class.ts:49](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L49)

___

### buildWithdrawDatum

▸ `Abstract` **buildWithdrawDatum**(`args`): [`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

Should build a Datum for a Withdraw transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`WithdrawArguments`](../interfaces/Core.WithdrawArguments.md) | The Withdraw arguments. |

#### Returns

[`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

#### Defined in

[classes/Abstracts/DatumBuilder.abstract.class.ts:67](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L67)

___

### buildZapDatum

▸ `Abstract` **buildZapDatum**(`args`): [`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

Should build a Datum for a Zap transaction.

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ZapArguments`](../interfaces/Core.ZapArguments.md) |

#### Returns

[`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

#### Defined in

[classes/Abstracts/DatumBuilder.abstract.class.ts:61](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L61)

___

### datumToHash

▸ `Abstract` **datumToHash**(`datum`): `string`

Should take a valid Datum structure or hex-encoded CBOR string of a valid Datum and convert it to a hash.
This is primarily used for testing but is a useful utility.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `datum` | `string` \| `Data` | The Data representation or hex-encoded CBOR string of the datum. |

#### Returns

`string`

#### Defined in

[classes/Abstracts/DatumBuilder.abstract.class.ts:37](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L37)

___

### getDestinationAddressFromCBOR

▸ `Abstract` **getDestinationAddressFromCBOR**(`datum`): `string`

Should parse the given datum cbor and extract the [DestinationAddress](../modules/Core.md#destinationaddress) from it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `datum` | `string` | The hex-encoded CBOR string of the datum. |

#### Returns

`string`

#### Defined in

[classes/Abstracts/DatumBuilder.abstract.class.ts:43](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L43)

___

### throwInvalidOrderAddressesError

▸ `Static` **throwInvalidOrderAddressesError**(`orderAddresses`, `errorMessage`): `never`

This must be called when an invalid address is supplied to the buildOrderAddresses method.
While there is no way to enforce this from being called, it will fail tests unless invalid addresses cause the error
to be thrown.

**`See`**

[Testing](../modules/Testing.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) |
| `errorMessage` | `string` |

#### Returns

`never`

#### Defined in

[classes/Abstracts/DatumBuilder.abstract.class.ts:94](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L94)
