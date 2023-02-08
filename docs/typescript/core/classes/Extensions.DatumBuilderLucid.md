# Class: DatumBuilderLucid

[Extensions](../modules/Extensions.md).DatumBuilderLucid

The Lucid implementation of a [DatumBuilder](Core.DatumBuilder.md). This is useful
if you would rather just build valid CBOR strings for just the datum
portion of a valid SundaeSwap transaction.

## Hierarchy

- [`DatumBuilder`](Core.DatumBuilder.md)<`Data`\>

  ↳ **`DatumBuilderLucid`**

## Methods

### \_getAddressHashes

▸ `Private` **_getAddressHashes**(`address`): `Object`

Helper function to parse addresses hashses from a Bech32 or hex encoded address.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `paymentCredentials` | `string` |
| `stakeCredentials?` | `string` |

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:252](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L252)

___

### \_maybeThrowDestinationNetworkError

▸ `Private` **_maybeThrowDestinationNetworkError**(`addressNetwork`, `address`, `orderAddresses`): `void`

Throws an error if either of the OrderAddresses are on the wrong network.

#### Parameters

| Name | Type |
| :------ | :------ |
| `addressNetwork` | `number` |
| `address` | `string` |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) |

#### Returns

`void`

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:355](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L355)

___

### \_validateAddressNetwork

▸ `Private` **_validateAddressNetwork**(`orderAddresses`): `void`

Validates that the [OrderAddresses](../modules/Core.md#orderaddresses) provided match the instance's network.

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) |

#### Returns

`void`

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:312](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L312)

___

### \_validateAddressesAreValid

▸ `Private` **_validateAddressesAreValid**(`orderAddresses`): `void`

Validates the [OrderAddresses](../modules/Core.md#orderaddresses) arguments as being valid Cardano address strings
and that they are on the correct network.

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) |

#### Returns

`void`

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:274](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L274)

___

### buildDepositDatum

▸ **buildDepositDatum**(`«destructured»`): `Object`

Builds the Deposit datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`DepositArguments`](../interfaces/Core.DepositArguments.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`<`Data`\> |

#### Overrides

[DatumBuilder](Core.DatumBuilder.md).[buildDepositDatum](Core.DatumBuilder.md#builddepositdatum)

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:68](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L68)

___

### buildDepositPair

▸ **buildDepositPair**(`deposit`): [`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

Builds the pair of assets for depositing in the pool.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deposit` | [`DepositMixed`](../modules/Core.md#depositmixed) | A pair of assets that match CoinA and CoinB of the pool. |

#### Returns

[`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

#### Overrides

DatumBuilder.buildDepositPair

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:140](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L140)

___

### buildDepositZap

▸ **buildDepositZap**(`zap`): [`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

Builds the pair of assets for depositing in the pool.

#### Parameters

| Name | Type |
| :------ | :------ |
| `zap` | [`DepositSingle`](../modules/Core.md#depositsingle) |

#### Returns

[`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

#### Overrides

DatumBuilder.buildDepositZap

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:160](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L160)

___

### buildOrderAddresses

▸ **buildOrderAddresses**(`addresses`): `Object`

Builds the datum for the [OrderAddresses](../modules/Core.md#orderaddresses) interface using a data
constructor class from the Lucid library.

#### Parameters

| Name | Type |
| :------ | :------ |
| `addresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`Constr`<`string`\>\>\>\>\>\> |

#### Overrides

DatumBuilder.buildOrderAddresses

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:213](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L213)

___

### buildScooperFee

▸ **buildScooperFee**(`fee?`): `bigint`

Builds the fee for the Scoopers. Defaults to [SCOOPER_FEE](../interfaces/Core.IProtocolParams.md#scooper_fee)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fee?` | `bigint` | The custom fee if provided. |

#### Returns

`bigint`

#### Overrides

DatumBuilder.buildScooperFee

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:131](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L131)

___

### buildSwapDatum

▸ **buildSwapDatum**(`«destructured»`): `Object`

Builds the Swap datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`SwapArguments`](../interfaces/Core.SwapArguments.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`<`string` \| `bigint` \| `Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`Constr`<`string`\>\>\>\>\>\> \| `Constr`<`bigint` \| `Constr`<`bigint`\>\>\> |

#### Overrides

[DatumBuilder](Core.DatumBuilder.md).[buildSwapDatum](Core.DatumBuilder.md#buildswapdatum)

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L45)

___

### buildSwapDirection

▸ **buildSwapDirection**(`swap`, `amount`): `Object`

Builds the swap action against the pool.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `swap` | [`Swap`](../modules/Core.md#swap) | - |
| `amount` | [`AssetAmount`](Core.AssetAmount.md) | The amount of the supplied asset we are sending to the pool. |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`<`bigint` \| `Constr`<`bigint`\>\> |

#### Overrides

DatumBuilder.buildSwapDirection

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:191](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L191)

___

### buildWithdrawAsset

▸ **buildWithdrawAsset**(`fundedLPAsset`): [`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

Builds the LP tokens to send to the pool.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fundedLPAsset` | [`IAsset`](../interfaces/Core.IAsset.md) | The LP tokens to send to the pool. |

#### Returns

[`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

#### Overrides

DatumBuilder.buildWithdrawAsset

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:174](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L174)

___

### buildWithdrawDatum

▸ **buildWithdrawDatum**(`«destructured»`): `Object`

Builds the Withdraw datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`WithdrawArguments`](../interfaces/Core.WithdrawArguments.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`<`Data`\> |

#### Overrides

[DatumBuilder](Core.DatumBuilder.md).[buildWithdrawDatum](Core.DatumBuilder.md#buildwithdrawdatum)

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:107](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L107)

___

### buildZapDatum

▸ **buildZapDatum**(`«destructured»`): `Object`

Builds the Zap datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ZapArguments`](../interfaces/Core.ZapArguments.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`<`Data`\> |

#### Overrides

[DatumBuilder](Core.DatumBuilder.md).[buildZapDatum](Core.DatumBuilder.md#buildzapdatum)

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:90](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L90)

___

### datumToHash

▸ **datumToHash**(`datum`): `string`

Builds a hash from a Data object.

#### Parameters

| Name | Type |
| :------ | :------ |
| `datum` | `Data` |

#### Returns

`string`

#### Overrides

[DatumBuilder](Core.DatumBuilder.md).[datumToHash](Core.DatumBuilder.md#datumtohash)

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:38](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L38)

___

### throwInvalidOrderAddressesError

▸ `Static` **throwInvalidOrderAddressesError**(`orderAddresses`, `errorMessage`): `never`

This must be called when an invalid address is supplied to the buildOrderAddresses method.
While there is no way to enforce this from being called, it will fail tests unless invalid addresses cause the error
to be thrown.

**`See`**

[Testing](../modules/Testing.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `orderAddresses` | [`OrderAddresses`](../modules/Core.md#orderaddresses) |
| `errorMessage` | `string` |

#### Returns

`never`

#### Inherited from

[DatumBuilder](Core.DatumBuilder.md).[throwInvalidOrderAddressesError](Core.DatumBuilder.md#throwinvalidorderaddresseserror)

#### Defined in

[classes/Abstracts/DatumBuilder.abstract.class.ts:84](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L84)
