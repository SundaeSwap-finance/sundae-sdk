[**@sundaeswap/taste-test**](../README.md) • **Docs**

***

# Function: findPrevNode()

> **findPrevNode**(`utxos`, `userKey`, `ttType`): `undefined` \| `TransactionUnspentOutput`

Searches through a list of UTXOs to find a node owned by the user, identified by a specific key, and return the next reference (previous to the user's node).

## Parameters

• **utxos**: `TransactionUnspentOutput`[]

An array of unspent transaction outputs (UTXOs).

• **userKey**: `string`

The unique identifier key for the user, used to find a specific node in the UTXOs.

• **ttType**: [`TTasteTestType`](../type-aliases/TTasteTestType.md)

The type of Taste Test we are using.

## Returns

`undefined` \| `TransactionUnspentOutput`

- Returns the UTXO that contains the previous node of the user's node if found, otherwise returns undefined.

This function iterates through the provided `utxos`, attempting to match the `userKey` with a key within the datum of each UTXO.
If a match is found, it indicates that the UTXO belongs to the user's node, and the UTXO referenced as the previous node is returned.
If no matching node is found in the list of UTXOs, the function returns undefined, indicating the previous node of the user's node was not found.

## Defined in

[taste-test/src/utils.ts:84](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/utils.ts#L84)
