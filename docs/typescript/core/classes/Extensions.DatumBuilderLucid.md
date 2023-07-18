# Class: DatumBuilderLucid

[Extensions](../modules/Extensions.md).DatumBuilderLucid

The Lucid implementation of a [DatumBuilder](Core.DatumBuilder.md). This is useful
if you would rather just build valid CBOR strings for just the datum
portion of a valid SundaeSwap transaction.

## Hierarchy

- [`DatumBuilder`](Core.DatumBuilder.md)<`Data`\>

  ↳ **`DatumBuilderLucid`**

## Methods

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
| `hash` | `string` |

#### Overrides

[DatumBuilder](Core.DatumBuilder.md).[buildDepositDatum](Core.DatumBuilder.md#builddepositdatum)

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:112](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L112)

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

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:193](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L193)

___

### buildDepositZap

▸ **buildDepositZap**(`zap`): [`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

Builds the atomic zap deposit of a single-sided pool deposit.

#### Parameters

| Name | Type |
| :------ | :------ |
| `zap` | [`DepositSingle`](../modules/Core.md#depositsingle) |

#### Returns

[`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

#### Overrides

DatumBuilder.buildDepositZap

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:213](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L213)

___

### buildLockDatum

▸ **buildLockDatum**(`«destructured»`): [`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

Builds the datum for asset locking, including LP tokens and other
native Cardano assets.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`LockArguments`](../interfaces/Core.LockArguments.md) |

#### Returns

[`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

#### Overrides

DatumBuilder.buildLockDatum

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L54)

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
| `hash` | `string` |

#### Overrides

DatumBuilder.buildOrderAddresses

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:274](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L274)

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

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:184](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L184)

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
| `hash` | `string` |

#### Overrides

[DatumBuilder](Core.DatumBuilder.md).[buildSwapDatum](Core.DatumBuilder.md#buildswapdatum)

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:86](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L86)

___

### buildSwapDirection

▸ **buildSwapDirection**(`swap`, `amount`): `Object`

Builds the swap action against the pool.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `swap` | [`Swap`](../modules/Core.md#swap) | - |
| `amount` | `AssetAmount`<`IAssetAmountMetadata`\> | The amount of the supplied asset we are sending to the pool. |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `cbor` | `string` |
| `datum` | `Constr`<`bigint` \| `Constr`<`bigint`\>\> |
| `hash` | `string` |

#### Overrides

DatumBuilder.buildSwapDirection

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:249](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L249)

___

### buildWithdrawAsset

▸ **buildWithdrawAsset**(`fundedLPAsset`): [`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

Builds the LP tokens to send to the pool.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fundedLPAsset` | `AssetAmount`<`IAssetAmountMetadata`\> | The LP tokens to send to the pool. |

#### Returns

[`DatumResult`](../interfaces/Core.DatumResult.md)<`Data`\>

#### Overrides

DatumBuilder.buildWithdrawAsset

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:227](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L227)

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
| `hash` | `string` |

#### Overrides

[DatumBuilder](Core.DatumBuilder.md).[buildWithdrawDatum](Core.DatumBuilder.md#buildwithdrawdatum)

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:157](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L157)

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
| `hash` | `string` |

#### Overrides

[DatumBuilder](Core.DatumBuilder.md).[buildZapDatum](Core.DatumBuilder.md#buildzapdatum)

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:137](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L137)

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

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:33](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L33)

___

### getDestinationAddressFromCBOR

▸ **getDestinationAddressFromCBOR**(`datum`): `string`

Parses out the DesintationAddress from a datum.

**`TODO`**

Ensure that we can reliably parse the DesinationAddress from the datum string.

#### Parameters

| Name | Type |
| :------ | :------ |
| `datum` | `string` |

#### Returns

`string`

#### Overrides

[DatumBuilder](Core.DatumBuilder.md).[getDestinationAddressFromCBOR](Core.DatumBuilder.md#getdestinationaddressfromcbor)

#### Defined in

[classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts:46](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/DatumBuilders/DatumBuilder.Lucid.class.ts#L46)

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

[classes/Abstracts/DatumBuilder.abstract.class.ts:95](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/DatumBuilder.abstract.class.ts#L95)
