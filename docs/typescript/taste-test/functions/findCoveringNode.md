[**@sundaeswap/taste-test**](../README.md) • **Docs**

***

# Function: findCoveringNode()

> **findCoveringNode**(`utxos`, `userKey`, `ttType`): `undefined` \| `TransactionUnspentOutput`

Finds the UTxO node that covers a given user key.

## Parameters

• **utxos**: `TransactionUnspentOutput`[]

An array of UTxO objects to search through.

• **userKey**: `string`

The user key to find the covering node for.

• **ttType**: [`TTasteTestType`](../type-aliases/TTasteTestType.md)

The type of Taste Test we are using.

## Returns

`undefined` \| `TransactionUnspentOutput`

- The covering UTxO node, or undefined if no covering node is found.

## Example

```ts
const utxos = [...]; // your array of UTxO objects
const userKey = 'someUserKey';
const coveringNode = findCoveringNode(utxos, userKey);
```

## Defined in

[taste-test/src/utils.ts:18](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/utils.ts#L18)
