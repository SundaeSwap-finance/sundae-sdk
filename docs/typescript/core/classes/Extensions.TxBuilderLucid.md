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

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:78](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L78)

## Properties

### options

• **options**: [`ITxBuilderLucidOptions`](../interfaces/Extensions.ITxBuilderLucidOptions.md)

The main option for instantiating the class.

#### Inherited from

TxBuilder.options

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:79](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L79)

___

### query

• **query**: [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)

A valid Query Provider class that will do the lookups.

#### Inherited from

TxBuilder.query

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L80)

## Methods

### complete

▸ **complete**(): [`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)

Completes the transaction building and includes validation of the arguments.

#### Returns

[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)

#### Inherited from

[TxBuilder](Core.TxBuilder.md).[complete](Core.TxBuilder.md#complete)

#### Defined in

[classes/TxBuilder.abstract.class.ts:60](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L60)

___

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Inherited from

[TxBuilder](Core.TxBuilder.md).[getParams](Core.TxBuilder.md#getparams)

#### Defined in

[classes/TxBuilder.abstract.class.ts:73](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L73)

___

### initWallet

▸ `Private` **initWallet**(): `Promise`<`void`\>

Initializes a Lucid instance with the

#### Returns

`Promise`<`void`\>

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:99](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L99)

___

### newTx

▸ **newTx**(): `Promise`<`Tx`\>

Returns a new Tx instance from Lucid. Throws an error if not ready.

#### Returns

`Promise`<`Tx`\>

#### Overrides

[TxBuilder](Core.TxBuilder.md).[newTx](Core.TxBuilder.md#newtx)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:130](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L130)

___

### validateSwapArguments

▸ `Static` **validateSwapArguments**(`args`, `options`): `Promise`<`void`\>

Validates a swap as having valid values. This **does not** ensure
that your datum is well structured, only that your config arguments have valid values.

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`IBuildSwapArgs`](../interfaces/Core.IBuildSwapArgs.md) |
| `options` | [`ITxBuilderOptions`](../interfaces/Core.ITxBuilderOptions.md) |

#### Returns

`Promise`<`void`\>

#### Inherited from

[TxBuilder](Core.TxBuilder.md).[validateSwapArguments](Core.TxBuilder.md#validateswaparguments)

#### Defined in

[classes/TxBuilder.abstract.class.ts:84](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/TxBuilder.abstract.class.ts#L84)
