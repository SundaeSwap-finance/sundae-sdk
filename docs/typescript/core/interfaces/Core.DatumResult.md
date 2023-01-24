# Interface: DatumResult<T\>

[Core](../modules/Core.md).DatumResult

The returned results of a [DatumBuilder](../classes/Core.DatumBuilder.md) method.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Properties

### cbor

• **cbor**: `string`

The hex-encoded CBOR string of the datum

#### Defined in

[@types/datumbuilder.ts:118](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L118)

___

### datum

• **datum**: `T`

The datum type of the library used to build it.

#### Defined in

[@types/datumbuilder.ts:120](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L120)