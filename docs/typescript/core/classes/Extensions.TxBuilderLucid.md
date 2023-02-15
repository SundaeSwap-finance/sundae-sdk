# Class: TxBuilderLucid

[Extensions](../modules/Extensions.md).TxBuilderLucid

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

- [`TxBuilder`](Core.TxBuilder.md)<[`ITxBuilderLucidOptions`](../interfaces/Extensions.ITxBuilderLucidOptions.md), `Lucid`, `Tx`\>

  ↳ **`TxBuilderLucid`**

## Constructors

### constructor

• **new TxBuilderLucid**(`options`, `query`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`ITxBuilderLucidOptions`](../interfaces/Extensions.ITxBuilderLucidOptions.md) | The main option for instantiating the class. |
| `query` | [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md) | A valid Query Provider class that will do the lookups. |

#### Overrides

TxBuilder&lt;
  ITxBuilderLucidOptions,
  Lucid,
  Tx
\&gt;.constructor

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:76](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L76)

## Properties

### options

• **options**: [`ITxBuilderLucidOptions`](../interfaces/Extensions.ITxBuilderLucidOptions.md)

The main option for instantiating the class.

#### Inherited from

TxBuilder.options

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:77](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L77)

___

### query

• **query**: [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)

A valid Query Provider class that will do the lookups.

#### Inherited from

TxBuilder.query

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:78](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L78)

## Methods

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Inherited from

[TxBuilder](Core.TxBuilder.md).[getParams](Core.TxBuilder.md#getparams)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:88](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L88)

___

### initWallet

▸ `Private` **initWallet**(): `Promise`<`void`\>

Initializes a Lucid instance with the

#### Returns

`Promise`<`void`\>

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:97](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L97)

___

### newTxInstance

▸ **newTxInstance**(): `Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

Returns a new Tx instance from Lucid. Throws an error if not ready.

#### Returns

`Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

#### Overrides

[TxBuilder](Core.TxBuilder.md).[newTxInstance](Core.TxBuilder.md#newtxinstance)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:127](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L127)
