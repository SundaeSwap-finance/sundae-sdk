[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: ITxBuilderSubmit\<SubmitResult\>

## Type Parameters

• **SubmitResult** = `string`

What `submit` resolves to; the hex encoded
transaction hash by default.

## Properties

### cbor

> **cbor**: `string`

The CBOR encoded hex string of the transaction. Useful if you want to do something with it instead of submitting to the wallet.

#### Defined in

[packages/core/src/@types/txbuilders.ts:27](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L27)

***

### submit()

> **submit**: () => `Promise`\<`SubmitResult`\>

Submits the CBOR encoded transaction to the connected wallet.

#### Returns

`Promise`\<`SubmitResult`\>

#### Defined in

[packages/core/src/@types/txbuilders.ts:29](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L29)
