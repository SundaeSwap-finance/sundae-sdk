[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: BlazeHelper

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
 const hashes = BlazeHelper.getAddressHashes("addr_test...")
 BlazeHelper.validateAddressAndDatumAreValid({ address: "addr_test...", network: "mainnet" });
 const isScript = BlazeHelper.isScriptAddress("addr_test...");
```

## Methods

### getAddressAsType()

> `static` **getAddressAsType**(`address`): `object`

Helper function to parse addresses hashes from a Bech32 encoded address.

#### Parameters

• **address**: `string`

#### Returns

`object`

##### address

> **address**: `Address`

##### type

> **type**: `AddressType`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:29](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L29)

***

### isBaseAddress()

> `static` **isBaseAddress**(`type`): `boolean`

Helper method to determine address type.

#### Parameters

• **type**: `AddressType`

The address type.

#### Returns

`boolean`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:58](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L58)

***

### isEnterpriseAddress()

> `static` **isEnterpriseAddress**(`type`): `boolean`

Helper method to determine address type.

#### Parameters

• **type**: `AddressType`

The address type.

#### Returns

`boolean`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L45)

***

### maybeThrowNetworkError()

> `static` **maybeThrowNetworkError**(`addressNetwork`, `address`, `network`): `void`

Throws a useful error if the address, network, and instance network are on the wrong network.

#### Parameters

• **addressNetwork**: `number`

• **address**: `string`

• **network**: [`TSupportedNetworks`](../type-aliases/TSupportedNetworks.md)

#### Returns

`void`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:198](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L198)

***

### mergeValues()

> `static` **mergeValues**(...`values`): `Value`

Helper function to merge to Value instances together into one.

#### Parameters

• ...**values**: (`undefined` \| `Value`)[]

A list of values to merge together.

#### Returns

`Value`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:240](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L240)

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

[packages/core/src/Utilities/BlazeHelper.class.ts:225](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L225)

***

### validateAddressAndDatumAreValid()

> `static` **validateAddressAndDatumAreValid**(`__namedParameters`): `void`

Validates that an address and optional datum are valid,
and that the address is on the correct network.

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.address**: `string`

• **\_\_namedParameters.datum**: [`TDatum`](../type-aliases/TDatum.md)

• **\_\_namedParameters.network**: [`TSupportedNetworks`](../type-aliases/TSupportedNetworks.md)

#### Returns

`void`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:110](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L110)

***

### validateAddressNetwork()

> `static` **validateAddressNetwork**(`address`, `network`): `void`

Validates that an address matches the provided network.

#### Parameters

• **address**: `string`

• **network**: [`TSupportedNetworks`](../type-aliases/TSupportedNetworks.md)

#### Returns

`void`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:162](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L162)
