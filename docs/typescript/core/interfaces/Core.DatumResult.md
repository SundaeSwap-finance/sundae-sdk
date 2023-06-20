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

[@types/datumbuilder.ts:149](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L149)

___

### datum

• **datum**: `T`

The datum type of the library used to build it.

#### Defined in

[@types/datumbuilder.ts:153](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L153)

___

### hash

• `Optional` **hash**: `string`

The hex-encoded hash of the CBOR string

#### Defined in

[@types/datumbuilder.ts:151](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L151)
