# Class: BlazeHelper

[Blaze](../modules/Blaze.md).BlazeHelper

A helper class that provides utility functions for validating and processing
Cardano addresses. These functions include:
- Parsing address hashes from a Bech32 or hex encoded address
- Validating an address as being a valid Cardano address and that it is on the correct network
- Checking if an address is a script address
- Validating that an address matches the given network
- Throwing an error if the address is on the wrong network
- Throwing an error if an invalid address is supplied

**`Example`**

```typescript
 const hashes = BlazeHelper.getAddressHashes("addr_test...")
 BlazeHelper.validateAddressAndDatumAreValid({ address: "addr_test...", network: "mainnet" });
 const isScript = BlazeHelper.isScriptAddress("addr_test...");
```

## Methods

### getAddressHashes

▸ **getAddressHashes**(`address`): `Object`

Helper function to parse addresses hashes from a Bech32 encoded address.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `paymentCredentials` | `Hash28ByteBase16` |
| `stakeCredentials?` | `string` |

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:28](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L28)

___

### isScriptAddress

▸ **isScriptAddress**(`address`): `boolean`

Helper function to check if an address is a script address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | The Bech32 encoded address. |

#### Returns

`boolean`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:137](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L137)

___

### maybeThrowNetworkError

▸ **maybeThrowNetworkError**(`addressNetwork`, `address`, `network`): `void`

Throws a useful error if the address, network, and instance network are on the wrong network.

#### Parameters

| Name | Type |
| :------ | :------ |
| `addressNetwork` | `number` |
| `address` | `string` |
| `network` | [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks) |

#### Returns

`void`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:183](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L183)

___

### throwInvalidOrderAddressesError

▸ **throwInvalidOrderAddressesError**(`address`, `errorMessage`): `never`

Throws an error describing the address and contextual information.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `errorMessage` | `string` |

#### Returns

`never`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:210](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L210)

___

### validateAddressAndDatumAreValid

▸ **validateAddressAndDatumAreValid**(`«destructured»`): `void`

Validates that an address and optional datum are valid,
and that the address is on the correct network.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `address` | `string` |
| › `datum` | [`TDatum`](../modules/Core.md#tdatum) |
| › `network` | [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks) |

#### Returns

`void`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L80)

___

### validateAddressNetwork

▸ **validateAddressNetwork**(`address`, `network`): `void`

Validates that an address matches the provided network.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `network` | [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks) |

#### Returns

`void`

#### Defined in

[packages/core/src/Utilities/BlazeHelper.class.ts:151](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/Utilities/BlazeHelper.class.ts#L151)
