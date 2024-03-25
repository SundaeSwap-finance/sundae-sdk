# Class: TasteTestLucid

Represents the TasteTest class capable of handling various blockchain interactions for a protocol Taste Test.

This class encapsulates methods for common operations required in the Taste Test process on the blockchain.
It provides an interface to deposit assets, withdraw them, and update the commitment amounts. Each operation
is transaction-based and interacts with blockchain smart contracts to ensure the correct execution of business logic.

The TasteTest class relies on the Lucid service, which can come either from your own instance or from an existing
SundaeSDK class instance (as shown below). The class methods handle the detailed steps of each operation, including
transaction preparation, fee handling, and error checking, abstracting these complexities from the end user.

Usage example (not part of the actual documentation):
```ts
import type { Lucid } from "lucid-cardano";
const tasteTest = new TasteTest(sdk.build<unknown, Lucid>().wallet);

// For depositing assets into the taste test smart contract
tasteTest.deposit({ ... }).then(({ build, fees }) => console.log(fees));

// For withdrawing assets from the taste test smart contract
tasteTest.withdraw({ ... }).then(({ build, fees }) => console.log(fees));;

// For updating the committed assets in the taste test smart contract
tasteTest.update({ ... }).then(({ build, fees }) => console.log(fees));;
```

**`Implements`**

**`Param`**

An instance of the Lucid class, providing various utility methods for blockchain interactions.

## Implements

- [`AbstractTasteTest`](AbstractTasteTest.md)

## Methods

### \_attachScriptsOrReferenceInputs

▸ **_attachScriptsOrReferenceInputs**(`tx`, `script`): `Promise`\<`void`\>

Utility function to attach the correct validators or reference inputs
to a transaction.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tx` | `Tx` | The Lucid Transaction instance. |
| `script` | [`TScriptType`](../modules.md#tscripttype) | The script passed by the config. |

#### Returns

`Promise`\<`void`\>

#### Defined in

[taste-test/src/lib/classes/TasteTest.Lucid.class.ts:703](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/TasteTest.Lucid.class.ts#L703)

___

### \_getTasteTestTypeFromArgs

▸ **_getTasteTestTypeFromArgs**(`args`): [`TTasteTestType`](../modules.md#ttastetesttype)

A utility method to default the Taste Test type to liquidity if not set.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IBaseArgs`](../interfaces/IBaseArgs.md) | The base arguments. |

#### Returns

[`TTasteTestType`](../modules.md#ttastetesttype)

#### Defined in

[taste-test/src/lib/classes/TasteTest.Lucid.class.ts:689](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/TasteTest.Lucid.class.ts#L689)

___

### claim

▸ **claim**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, [`ITasteTestFees`](../interfaces/ITasteTestFees.md)\>\>

Processes a claim transaction, handling various pre-conditions and state checks.

This method is responsible for orchestrating a claim operation, including validating nodes,
ensuring proper policy adherence, and constructing the necessary transaction steps. It checks
for the user's participation in the network, retrieves the associated validator and policy information,
and determines the rightful ownership of claimable assets.

After preparing the necessary information and constructing the transaction steps, it completes the transaction
by setting the appropriate fees and preparing it for submission.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IClaimArgs`](../interfaces/IClaimArgs.md) | The required arguments for the claim operation. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, [`ITasteTestFees`](../interfaces/ITasteTestFees.md)\>\>

- Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.

**`Async`**

**`Throws`**

Throws errors if the claim conditions are not met, such as missing keys, inability to find nodes, or ownership issues.

#### Defined in

[taste-test/src/lib/classes/TasteTest.Lucid.class.ts:483](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/TasteTest.Lucid.class.ts#L483)

___

### completeTx

▸ **completeTx**(`params`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, [`ITasteTestFees`](../interfaces/ITasteTestFees.md)\>\>

Finalizes the construction of a transaction with the necessary operations and fees.

This function takes a constructed transaction and applies the final necessary steps to make it ready for submission.
These steps include setting the referral fee if it's part of the transaction, calculating the necessary transaction fees,
and preparing the transaction for signing. The function adapts to the presence of asset-specific transactions by
handling different referral payment types.

The base fees for the transaction are calculated based on a boolean for whether to include them, specifically for deposit and fold.
The only fees that are always set are referral fees and the native Cardano transaction fee.

Once the transaction is built, it's completed, and the actual Cardano network transaction fee is retrieved and set.
The built transaction is then ready for signing and submission.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`ITasteTestCompleteTxArgs`](../interfaces/ITasteTestCompleteTxArgs.md) | The arguments required for completing the transaction, including the transaction itself, the referral fee, and a flag indicating if the transaction includes fees. - `hasFees`: Indicates whether the transaction has fees associated with it. - `referralFee`: The referral fee information, if applicable. - `tx`: The initial transaction object that needs to be completed. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, [`ITasteTestFees`](../interfaces/ITasteTestFees.md)\>\>

- Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.

**`Async`**

**`Throws`**

Throws an error if the transaction cannot be completed or if there are issues with the fee calculation.

#### Defined in

[taste-test/src/lib/classes/TasteTest.Lucid.class.ts:589](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/TasteTest.Lucid.class.ts#L589)

___

### deposit

▸ **deposit**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, [`ITasteTestFees`](../interfaces/ITasteTestFees.md)\>\>

Initiates a deposit transaction, conducting various checks and orchestrating the transaction construction.

This method is in charge of initiating a deposit operation. It first verifies the availability of UTXOs in the wallet
and checks for the presence of necessary scripts. It retrieves the node validator and policy, determines the user's key,
and identifies the covering node based on the provided or found UTXOs.

If a covering node is not identified, the method checks whether the user already owns a node and, based on the `updateFallback`
flag, either updates the node or throws an error. After identifying the covering node, it prepares the necessary data structures
and transaction components, including the redeemer policy and validator actions.

The transaction is then constructed, incorporating various elements such as assets, validators, and minting policies.
It ensures the transaction falls within a valid time frame and completes it by setting the appropriate fees and preparing
it for submission.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IDepositArgs`](../interfaces/IDepositArgs.md) | The required arguments for the deposit operation. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, [`ITasteTestFees`](../interfaces/ITasteTestFees.md)\>\>

- Returns a promise that resolves with a transaction builder object,
which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.

**`Async`**

**`Throws`**

Throws an error if no UTXOs are available, if reference scripts are missing, or if a covering node cannot be found.

#### Implementation of

[AbstractTasteTest](AbstractTasteTest.md).[deposit](AbstractTasteTest.md#deposit)

#### Defined in

[taste-test/src/lib/classes/TasteTest.Lucid.class.ts:118](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/TasteTest.Lucid.class.ts#L118)

___

### getUserKey

▸ **getUserKey**(): `Promise`\<`string`\>

Retrieves the user key (hash) from a given Cardano address.

This method processes the Cardano address, attempts to extract the stake credential or payment credential hash,
and returns it as the user's key. If neither stake nor payment credentials are found, an error is thrown.

It utilizes the `lucid.utils.getAddressDetails` method to parse and extract details from the Cardano address.

#### Returns

`Promise`\<`string`\>

- The user key hash extracted from the address.

**`Throws`**

If neither stake nor payment credentials could be determined from the address.

#### Defined in

[taste-test/src/lib/classes/TasteTest.Lucid.class.ts:669](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/TasteTest.Lucid.class.ts#L669)

___

### update

▸ **update**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, [`ITasteTestFees`](../interfaces/ITasteTestFees.md)\>\>

Initiates an update transaction for a node's assets, ensuring various checks and constructing the transaction.

This method is responsible for initiating an update operation for a node. It starts by retrieving the node validator
and determining the user's key. It then searches for the user's own node, either based on provided UTXOs or by querying
the blockchain, and throws an error if the node isn't found or doesn't have a datum.

Upon successfully identifying the node, the method prepares the redeemer for the node validator action and recalculates
the node's assets based on the new input amount. It then constructs a transaction that collects from the identified node
and repays it to the contract with updated assets.

The transaction is assembled with appropriate components and redeemer information, ensuring the updated assets are correctly
set and the transaction is valid. The method completes the transaction by applying the necessary fees and preparing it for
submission.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IUpdateArgs`](../interfaces/IUpdateArgs.md) | The arguments required for the update operation, including potential UTXOs and the amount to add. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, [`ITasteTestFees`](../interfaces/ITasteTestFees.md)\>\>

- Returns a promise that resolves with a transaction builder object,
equipped with the transaction, its associated fees, and functions to build, sign, and submit the transaction.

**`Async`**

**`Throws`**

Throws an error if the user's payment credential hash is missing or if the node with the required datum cannot be found.

#### Implementation of

[AbstractTasteTest](AbstractTasteTest.md).[update](AbstractTasteTest.md#update)

#### Defined in

[taste-test/src/lib/classes/TasteTest.Lucid.class.ts:265](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/TasteTest.Lucid.class.ts#L265)

___

### withdraw

▸ **withdraw**(`args`): `Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, [`ITasteTestFees`](../interfaces/ITasteTestFees.md)\>\>

Processes a withdrawal transaction, handling various pre-conditions and state checks.

This method is responsible for orchestrating a withdrawal operation, including validating nodes,
ensuring proper policy adherence, and constructing the necessary transaction steps. It checks
for the user's participation in the network, retrieves the associated validator and policy information,
and determines the rightful ownership of assets.

Depending on the transaction's timing relative to certain deadlines, different transaction paths may be taken.
This could involve simply completing the transaction or applying a penalty in certain conditions. The method
handles these variations and constructs the appropriate transaction type.

After preparing the necessary information and constructing the transaction steps, it completes the transaction
by setting the appropriate fees and preparing it for submission.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IWithdrawArgs`](../interfaces/IWithdrawArgs.md) | The required arguments for the withdrawal operation. |

#### Returns

`Promise`\<[`IComposedTx`](../interfaces/IComposedTx.md)\<`Tx`, `TxComplete`, `undefined` \| `string`, [`ITasteTestFees`](../interfaces/ITasteTestFees.md)\>\>

- Returns a promise that resolves with a transaction builder object, which includes the transaction, its associated fees, and functions to build, sign, and submit the transaction.

**`Async`**

**`Throws`**

Throws errors if the withdrawal conditions are not met, such as missing keys, inability to find nodes, or ownership issues.

#### Implementation of

[AbstractTasteTest](AbstractTasteTest.md).[withdraw](AbstractTasteTest.md#withdraw)

#### Defined in

[taste-test/src/lib/classes/TasteTest.Lucid.class.ts:337](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/taste-test/src/lib/classes/TasteTest.Lucid.class.ts#L337)
