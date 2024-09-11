[**@sundaeswap/taste-test**](../README.md) • **Docs**

***

# Function: findCoveringNode()

> **findCoveringNode**(`utxos`, `userKey`, `ttType`): `undefined` \| `UTxO`

Finds the UTxO node that covers a given user key.

## Parameters

• **utxos**: `UTxO`[]

An array of UTxO objects to search through.

• **userKey**: `string`

The user key to find the covering node for.

• **ttType**: [`TTasteTestType`](../type-aliases/TTasteTestType.md)

The type of Taste Test we are using.

## Returns

`undefined` \| `UTxO`

- The covering UTxO node, or undefined if no covering node is found.

## Example

```ts
const utxos = [...]; // your array of UTxO objects
const userKey = 'someUserKey';
const coveringNode = findCoveringNode(utxos, userKey);
```

## Defined in

[taste-test/src/utils.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/utils.ts#L19)
