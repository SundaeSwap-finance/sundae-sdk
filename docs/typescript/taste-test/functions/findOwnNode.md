[**@sundaeswap/taste-test**](../README.md) • **Docs**

***

# Function: findOwnNode()

> **findOwnNode**(`utxos`, `userKey`, `ttType`): `undefined` \| `UTxO`

Searches through a list of UTXOs to find a node owned by the user, identified by a specific key.

## Parameters

• **utxos**: `UTxO`[]

An array of unspent transaction outputs (UTXOs).

• **userKey**: `string`

The unique identifier key for the user, used to find a specific node in the UTXOs.

• **ttType**: [`TTasteTestType`](../type-aliases/TTasteTestType.md)

The type of Taste Test we are using.

## Returns

`undefined` \| `UTxO`

- Returns the UTXO that contains the user's node if found, otherwise returns undefined.

This function iterates through the provided `utxos`, attempting to match the `userKey` with a key within the datum of each UTXO.
If a match is found, it indicates that the UTXO belongs to the user's node, and this UTXO is returned.
If no matching node is found in the list of UTXOs, the function returns undefined, indicating the user's node was not found.

## Defined in

[taste-test/src/utils.ts:51](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/utils.ts#L51)
