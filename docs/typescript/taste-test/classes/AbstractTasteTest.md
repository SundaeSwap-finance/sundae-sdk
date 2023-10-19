# Class: AbstractTasteTest

Represents the abstract class that should be extended to implement
the functionality of the Taste Test features. This class provides
the structure for depositing, updating, and withdrawing operations.

**`Property`**

An instance of the Lucid class, representing the core functionality handler.

## Implemented by

- [`TasteTest`](TasteTest.md)

## Properties

### lucid

• `Abstract` **lucid**: `Lucid`

Represents the Lucid instance used for core operations.

#### Defined in

[taste-test/src/lib/classes/AbstractTasteTest.class.ts:17](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/AbstractTasteTest.class.ts#L17)

## Methods

### deposit

▸ `Abstract` **deposit**(`args`): `Promise`<[`ITxBuilder`](../interfaces/ITxBuilder.md)<`unknown`, `unknown`\>\>

Initiates a deposit transaction. The specific implementation of this method
should handle the business logic associated with making a deposit, including
validations, transaction building, and error handling.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IDepositArgs`](../interfaces/IDepositArgs.md) | The arguments required for the deposit operation, including the amount, user credentials, and other transaction details. |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/ITxBuilder.md)<`unknown`, `unknown`\>\>

- Returns a promise that resolves with an
ITxBuilder instance, representing the constructed transaction for the deposit.

#### Defined in

[taste-test/src/lib/classes/AbstractTasteTest.class.ts:29](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/AbstractTasteTest.class.ts#L29)

___

### update

▸ `Abstract` **update**(`args`): `Promise`<[`ITxBuilder`](../interfaces/ITxBuilder.md)<`unknown`, `unknown`\>\>

Initiates an update transaction. This method is responsible for handling
the business logic necessary to update an existing record or transaction.
This could include changing the amount, modifying references, or other updates.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IUpdateArgs`](../interfaces/IUpdateArgs.md) | The arguments required for the update operation. This includes any fields that are updatable within the transaction and may include credentials for authorization. |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/ITxBuilder.md)<`unknown`, `unknown`\>\>

- Returns a promise that resolves with an
ITxBuilder instance, representing the constructed transaction for the update.

#### Defined in

[taste-test/src/lib/classes/AbstractTasteTest.class.ts:42](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/AbstractTasteTest.class.ts#L42)

___

### withdraw

▸ `Abstract` **withdraw**(`args`): `Promise`<[`ITxBuilder`](../interfaces/ITxBuilder.md)<`unknown`, `unknown`\>\>

Initiates a withdrawal transaction. This method should handle the logic
associated with withdrawing funds, including validations, constructing the
withdrawal transaction, and handling errors appropriately.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IWithdrawArgs`](../interfaces/IWithdrawArgs.md) | The arguments required for the withdrawal operation, including the amount to withdraw, user credentials, and other necessary details. |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/ITxBuilder.md)<`unknown`, `unknown`\>\>

- Returns a promise that resolves with an
ITxBuilder instance, representing the constructed transaction for the withdrawal.

#### Defined in

[taste-test/src/lib/classes/AbstractTasteTest.class.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/AbstractTasteTest.class.ts#L54)
