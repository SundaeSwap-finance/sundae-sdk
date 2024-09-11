[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: LucidHelper

A helper class that provides utility functions for validating and processing
Cardano addresses. These functions include:
- Parsing address hashes from a Bech32 or hex encoded address
- Validating an address as being a valid Cardano address and that it is on the correct network
- Checking if an address is a script address
- Validating that an address matches the given network
- Throwing an error if the address is on the wrong network
- Throwing an error if an invalid address is supplied

## Example

```typescript
 const hashes = LucidHelper.getAddressHashes("addr_test...")
 LucidHelper.validateAddressAndDatumAreValid({ address: "addr_test...", network: "mainnet" });
 const isScript = LucidHelper.isScriptAddress("addr_test...");
```

## Methods

### getAddressHashes()

> `static` **getAddressHashes**(`address`): `object`

Helper function to parse addresses hashes from a Bech32 or hex encoded address.

#### Parameters

• **address**: `string`

#### Returns

`object`

##### paymentCredentials

> **paymentCredentials**: `string`

##### stakeCredentials?

> `optional` **stakeCredentials**: `string`

#### Defined in

[packages/core/src/Utilities/LucidHelper.class.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/LucidHelper.class.ts#L28)

***

### isScriptAddress()

> `static` **isScriptAddress**(`address`): `boolean`

Helper function to check if an address is a script address.

#### Parameters

• **address**: `string`

The Bech32 encoded address.

#### Returns

`boolean`

#### Defined in

[packages/core/src/Utilities/LucidHelper.class.ts:104](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/LucidHelper.class.ts#L104)

***

### maybeThrowNetworkError()

> `static` **maybeThrowNetworkError**(`addressNetwork`, `address`, `network`): `void`

Throws a useful error if the address, network, and instance network are on the wrong network.

#### Parameters

• **addressNetwork**: `number`

• **address**: `string`

• **network**: [`TSupportedNetworks`](../../Core/type-aliases/TSupportedNetworks.md)

#### Returns

`void`

#### Defined in

[packages/core/src/Utilities/LucidHelper.class.ts:139](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/LucidHelper.class.ts#L139)

***

### throwInvalidOrderAddressesError()

> `static` **throwInvalidOrderAddressesError**(`address`, `errorMessage`): `never`

Throws an error describing the address and contextual information.

#### Parameters

• **address**: `string`

• **errorMessage**: `string`

#### Returns

`never`

#### Defined in

[packages/core/src/Utilities/LucidHelper.class.ts:168](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/LucidHelper.class.ts#L168)

***

### validateAddressAndDatumAreValid()

> `static` **validateAddressAndDatumAreValid**(`__namedParameters`): `void`

Validates that an address and optional datum are valid,
and that the address is on the correct network.

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.address**: `string`

• **\_\_namedParameters.datum**: [`TDatum`](../../Core/type-aliases/TDatum.md)

• **\_\_namedParameters.network**: [`TSupportedNetworks`](../../Core/type-aliases/TSupportedNetworks.md)

#### Returns

`void`

#### Defined in

[packages/core/src/Utilities/LucidHelper.class.ts:50](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/LucidHelper.class.ts#L50)

***

### validateAddressNetwork()

> `static` **validateAddressNetwork**(`address`, `network`): `void`

Validates that an address matches the provided network.

#### Parameters

• **address**: `string`

• **network**: [`TSupportedNetworks`](../../Core/type-aliases/TSupportedNetworks.md)

#### Returns

`void`

#### Defined in

[packages/core/src/Utilities/LucidHelper.class.ts:117](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/LucidHelper.class.ts#L117)
