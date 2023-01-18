# Class: TxBuilderLucid

Building a TxBuilder is fairly simple, but depends on the library that the underlying tooling uses. In this case,
you would build this TxBuilder like this:

**`Example`**

```ts
const builder = new TxBuilderLucid(
 {
   provider: "blockfrost";
   blockfrost: {
     url: <base_api_url>,
     apiKey: <base_api_key>,
   }
 },
 new ProviderSundaeSwap("preview")
);
```

## Hierarchy

- [`TxBuilder`](TxBuilder.md)<[`ITxBuilderLucidOptions`](../interfaces/ITxBuilderLucidOptions.md), `LucidType`, `DataType`, `TxType`\>

  ↳ **`TxBuilderLucid`**

## Constructors

### constructor

• **new TxBuilderLucid**(`options`, `provider`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`ITxBuilderLucidOptions`](../interfaces/ITxBuilderLucidOptions.md) | The main option for instantiating the class. |
| `provider` | [`IProviderClass`](../interfaces/IProviderClass.md) | An instance of a [IProviderClass](../interfaces/IProviderClass.md) class. |

#### Overrides

TxBuilder&lt;
  ITxBuilderLucidOptions,
  LucidType,
  DataType,
  TxType
\&gt;.constructor

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:73](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L73)

## Properties

### options

• **options**: [`ITxBuilderLucidOptions`](../interfaces/ITxBuilderLucidOptions.md)

The main option for instantiating the class.

#### Inherited from

TxBuilder.options

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:74](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L74)

___

### provider

• **provider**: [`IProviderClass`](../interfaces/IProviderClass.md)

An instance of a [IProviderClass](../interfaces/IProviderClass.md) class.

#### Inherited from

TxBuilder.provider

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:75](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L75)

## Methods

### buildEscrowAddressDatum

▸ **buildEscrowAddressDatum**(`address`): `Promise`<`Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`Constr`<`string`\>\>\>\>\>\>\>

Builds the datum for the [EscrowAddress](../modules.md#escrowaddress) interface using a data
constructor class from the Lucid library.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | [`EscrowAddress`](../modules.md#escrowaddress) |

#### Returns

`Promise`<`Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`Constr`<`string`\>\>\>\>\>\>\>

#### Overrides

[TxBuilder](TxBuilder.md).[buildEscrowAddressDatum](TxBuilder.md#buildescrowaddressdatum)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:197](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L197)

___

### buildEscrowSwapDatum

▸ **buildEscrowSwapDatum**(`suppliedAsset`, `swap`): `Promise`<`Constr`<`bigint` \| `Constr`<`bigint`\>\>\>

Builds the datum for the Swap action using a data
constructor class from the Lucid library.

#### Parameters

| Name | Type |
| :------ | :------ |
| `suppliedAsset` | [`AssetAmount`](AssetAmount.md) |
| `swap` | [`Swap`](../modules.md#swap) |

#### Returns

`Promise`<`Constr`<`bigint` \| `Constr`<`bigint`\>\>\>

#### Overrides

[TxBuilder](TxBuilder.md).[buildEscrowSwapDatum](TxBuilder.md#buildescrowswapdatum)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:236](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L236)

___

### buildSwapDatum

▸ **buildSwapDatum**(`givenAsset`, `assetA`, `assetB`, `minReceivable`): `Promise`<`Data`\>

Builds the main datum for a Swap transaction so that scoopers
can execute their batches in the Escrow script address.

#### Parameters

| Name | Type |
| :------ | :------ |
| `givenAsset` | [`IAsset`](../interfaces/IAsset.md) |
| `assetA` | [`IPoolDataAsset`](../interfaces/IPoolDataAsset.md) |
| `assetB` | [`IPoolDataAsset`](../interfaces/IPoolDataAsset.md) |
| `minReceivable` | [`AssetAmount`](AssetAmount.md) |

#### Returns

`Promise`<`Data`\>

#### Overrides

[TxBuilder](TxBuilder.md).[buildSwapDatum](TxBuilder.md#buildswapdatum)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:255](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L255)

___

### complete

▸ **complete**(): [`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)

Completes the transaction building and includes validation of the arguments.

#### Returns

[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)

#### Inherited from

[TxBuilder](TxBuilder.md).[complete](TxBuilder.md#complete)

#### Defined in

[classes/TxBuilder.abstract.class.ts:65](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L65)

___

### validateSwapArguments

▸ `Static` **validateSwapArguments**(`args`, `options`): `Promise`<`void`\>

Validates the [IBuildSwapArgs](../interfaces/IBuildSwapArgs.md) as having valid values. This **does not** ensure
that your datum is well structured, only that your config arguments have valid values.

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`IBuildSwapArgs`](../interfaces/IBuildSwapArgs.md)<`any`\> |
| `options` | [`ITxBuilderOptions`](../interfaces/ITxBuilderOptions.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[TxBuilder](TxBuilder.md).[validateSwapArguments](TxBuilder.md#validateswaparguments)

#### Defined in

[classes/TxBuilder.abstract.class.ts:113](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L113)
