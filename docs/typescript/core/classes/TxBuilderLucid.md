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

[classes/TxBuilders/TxBuilder.Lucid.class.ts:73](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L73)

## Properties

### options

• **options**: [`ITxBuilderLucidOptions`](../interfaces/ITxBuilderLucidOptions.md)

The main option for instantiating the class.

#### Inherited from

TxBuilder.options

#### Defined in

[classes/TxBuilders/TxBuilder.Lucid.class.ts:74](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L74)

___

### provider

• **provider**: [`IProviderClass`](../interfaces/IProviderClass.md)

An instance of a [IProviderClass](../interfaces/IProviderClass.md) class.

#### Inherited from

TxBuilder.provider

#### Defined in

[classes/TxBuilders/TxBuilder.Lucid.class.ts:75](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L75)

## Methods

### buildEscrowAddressDatum

▸ **buildEscrowAddressDatum**(`address`): `Promise`<`Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`any`\>\>\>\>

Builds the datum for the [EscrowAddress](../modules.md#escrowaddress) interface using a data
constructor class from the Lucid library.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | [`EscrowAddress`](../modules.md#escrowaddress) |

#### Returns

`Promise`<`Constr`<`Constr`<`string`\> \| `Constr`<`Constr`<`any`\>\>\>\>

#### Overrides

TxBuilder.buildEscrowAddressDatum

#### Defined in

[classes/TxBuilders/TxBuilder.Lucid.class.ts:202](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L202)

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

TxBuilder.buildEscrowSwapDatum

#### Defined in

[classes/TxBuilders/TxBuilder.Lucid.class.ts:242](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L242)

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

TxBuilder.buildSwapDatum

#### Defined in

[classes/TxBuilders/TxBuilder.Lucid.class.ts:261](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L261)
