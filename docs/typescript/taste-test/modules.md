# @sundaeswap/taste-test

This package includes necessary exports for building Taste
Test transactions for the SundaeSwap protocol.

## Classes

- [AbstractTasteTest](classes/AbstractTasteTest.md)
- [TasteTestLucid](classes/TasteTestLucid.md)

## Interfaces

- [IBaseArgs](interfaces/IBaseArgs.md)
- [IComposedTx](interfaces/IComposedTx.md)
- [IDepositArgs](interfaces/IDepositArgs.md)
- [ITasteTestCompleteTxArgs](interfaces/ITasteTestCompleteTxArgs.md)
- [ITasteTestFees](interfaces/ITasteTestFees.md)
- [IUpdateArgs](interfaces/IUpdateArgs.md)
- [IWithdrawArgs](interfaces/IWithdrawArgs.md)

## Type Aliases

### TTasteTestFees

Ƭ **TTasteTestFees**: [`IComposedTx`](interfaces/IComposedTx.md)\<`unknown`, `unknown`, [`ITasteTestFees`](interfaces/ITasteTestFees.md)\>[``"fees"``]

Helper type to export the fees object associated with the TasteTest class.

#### Defined in

[taste-test/src/@types/index.ts:27](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/@types/index.ts#L27)

___

### TTasteTestType

Ƭ **TTasteTestType**: ``"Direct"`` \| ``"Liquidity"``

The type of Taste Test, where "Direct" is a non-pool Taste Test, and "Liquidity"
is ends the taste test with pool creation.

#### Defined in

[taste-test/src/@types/index.ts:14](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/@types/index.ts#L14)

## Functions

### divCeil

▸ **divCeil**(`a`, `b`): `bigint`

Performs a division operation on two bigints and rounds up the result.

This function takes two bigint numbers, divides the first by the second, and rounds up the result.
The rounding up ensures the result is the smallest integer greater than or equal to the actual division result,
often used when dealing with scenarios where fractional results are not acceptable, and rounding up is required.

Note: This function does not handle cases where 'b' is zero. Zero as the divisor will lead to an error as division by zero is not defined.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `a` | `bigint` | The dividend represented as a bigint. |
| `b` | `bigint` | The divisor represented as a bigint. |

#### Returns

`bigint`

- The result of the division, rounded up to the nearest bigint.

#### Defined in

[taste-test/src/utils.ts:110](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/utils.ts#L110)

___

### findCoveringNode

▸ **findCoveringNode**(`utxos`, `userKey`, `ttType`): `undefined` \| `UTxO`

Finds the UTxO node that covers a given user key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `utxos` | `UTxO`[] | An array of UTxO objects to search through. |
| `userKey` | `string` | The user key to find the covering node for. |
| `ttType` | [`TTasteTestType`](modules.md#ttastetesttype) | The type of Taste Test we are using. |

#### Returns

`undefined` \| `UTxO`

- The covering UTxO node, or undefined if no covering node is found.

**`Example`**

```ts
const utxos = [...]; // your array of UTxO objects
const userKey = 'someUserKey';
const coveringNode = findCoveringNode(utxos, userKey);
```

#### Defined in

[taste-test/src/utils.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/utils.ts#L19)

___

### findOwnNode

▸ **findOwnNode**(`utxos`, `userKey`, `ttType`): `undefined` \| `UTxO`

Searches through a list of UTXOs to find a node owned by the user, identified by a specific key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `utxos` | `UTxO`[] | An array of unspent transaction outputs (UTXOs). |
| `userKey` | `string` | The unique identifier key for the user, used to find a specific node in the UTXOs. |
| `ttType` | [`TTasteTestType`](modules.md#ttastetesttype) | The type of Taste Test we are using. |

#### Returns

`undefined` \| `UTxO`

- Returns the UTXO that contains the user's node if found, otherwise returns undefined.

This function iterates through the provided `utxos`, attempting to match the `userKey` with a key within the datum of each UTXO.
If a match is found, it indicates that the UTXO belongs to the user's node, and this UTXO is returned.
If no matching node is found in the list of UTXOs, the function returns undefined, indicating the user's node was not found.

#### Defined in

[taste-test/src/utils.ts:51](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/utils.ts#L51)

___

### findPrevNode

▸ **findPrevNode**(`utxos`, `userKey`, `ttType`): `undefined` \| `UTxO`

Searches through a list of UTXOs to find a node owned by the user, identified by a specific key, and return the next reference (previous to the user's node).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `utxos` | `UTxO`[] | An array of unspent transaction outputs (UTXOs). |
| `userKey` | `string` | The unique identifier key for the user, used to find a specific node in the UTXOs. |
| `ttType` | [`TTasteTestType`](modules.md#ttastetesttype) | The type of Taste Test we are using. |

#### Returns

`undefined` \| `UTxO`

- Returns the UTXO that contains the previous node of the user's node if found, otherwise returns undefined.

This function iterates through the provided `utxos`, attempting to match the `userKey` with a key within the datum of each UTXO.
If a match is found, it indicates that the UTXO belongs to the user's node, and the UTXO referenced as the previous node is returned.
If no matching node is found in the list of UTXOs, the function returns undefined, indicating the previous node of the user's node was not found.

#### Defined in

[taste-test/src/utils.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/utils.ts#L80)
