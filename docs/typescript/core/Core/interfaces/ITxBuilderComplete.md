---
title: "ITxBuilderComplete"
---

# ITxBuilderComplete

The returned interface once a transaction is successfully built.

## Properties

### cbor

> `string`

The CBOR encoded hex string of the transaction. Useful if you want to do something with it instead of submitting to the wallet.

Defined in:  [@types/txbuilder.ts:24](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L24)

### fees

> [`ITxBuilderFees`](ITxBuilderFees.md)

The calculated fees of the transaction.

Defined in:  [@types/txbuilder.ts:26](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L26)

### submit

> `Function`

#### Type declaration

Submits the CBOR encoded transaction to the connected wallet returns a hex encoded transaction hash.

##### Signature

```ts
(): Promise<string>;
```

##### Returns

`Promise`\<`string`\>

Defined in:  [@types/txbuilder.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilder.ts#L28)
