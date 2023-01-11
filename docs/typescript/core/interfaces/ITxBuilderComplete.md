# Interface: ITxBuilderComplete

The returned interface once a transaction is successfully built.

## Properties

### cbor

• **cbor**: `string`

The CBOR encoded hex string of the transcation. Useful if you want to do something with it instead of submitting to the wallet.

#### Defined in

@types/txbuilder.ts:16

___

### submit

• **submit**: () => `Promise`<`string`\>

#### Type declaration

▸ (): `Promise`<`string`\>

Submits the CBOR encoded transaction to the connected wallet returns a hex encoded transaction hash.

##### Returns

`Promise`<`string`\>

#### Defined in

@types/txbuilder.ts:18
