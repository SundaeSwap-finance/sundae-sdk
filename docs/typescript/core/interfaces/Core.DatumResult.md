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

[@types/datumbuilder.ts:141](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L141)

___

### datum

• **datum**: `T`

The datum type of the library used to build it.

#### Defined in

[@types/datumbuilder.ts:145](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L145)

___

### hash

• `Optional` **hash**: `string`

The hex-encoded hash of the CBOR string

#### Defined in

[@types/datumbuilder.ts:143](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L143)
