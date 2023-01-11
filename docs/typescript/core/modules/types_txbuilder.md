[@sundae/sdk-core](../README.md) / [Exports](../modules.md) / @types/txbuilder

# Module: @types/txbuilder

## Interfaces

- [ITxBuilderClass](../interfaces/types_txbuilder.ITxBuilderClass.md)
- [ITxBuilderLucidOptions](../interfaces/types_txbuilder.ITxBuilderLucidOptions.md)
- [ITxBuilderOptions](../interfaces/types_txbuilder.ITxBuilderOptions.md)

## Type Aliases

### TTxBuilderComplete

Ƭ **TTxBuilderComplete**: `Object`

The returned interface once a transaction is successfully built.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `cbor` | `string` | The CBOR encoded hex string of the transcation. Useful if you want to do something with it instead of submitting to the wallet. |
| `submit` | () => `Promise`<`string`\> | Submits the CBOR encoded transaction to the connected wallet returns a hex encoded transaction hash. |

#### Defined in

@types/txbuilder.d.ts:4
