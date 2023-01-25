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

[classes/Abstracts/DatumBuilder.abstract.class.ts:39](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L39)

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

[classes/Abstracts/DatumBuilder.abstract.class.ts:33](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L33)

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

[classes/Abstracts/DatumBuilder.abstract.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L45)

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

[classes/Abstracts/DatumBuilder.abstract.class.ts:69](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L69)
