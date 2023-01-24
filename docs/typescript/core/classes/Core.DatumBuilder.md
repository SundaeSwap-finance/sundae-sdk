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

[classes/Abstracts/DatumBuilder.abstract.class.ts:37](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L37)

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

[classes/Abstracts/DatumBuilder.abstract.class.ts:31](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L31)
