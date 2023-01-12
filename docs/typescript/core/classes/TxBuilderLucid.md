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

## Implements

- [`ITxBuilderClass`](../interfaces/ITxBuilderClass.md)<[`ITxBuilderLucidOptions`](../interfaces/ITxBuilderLucidOptions.md), `LucidType`, `DataType`, `TxType`\>

## Constructors

### constructor

• **new TxBuilderLucid**(`options`, `provider`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`ITxBuilderLucidOptions`](../interfaces/ITxBuilderLucidOptions.md) | The main option for instantiating the class. |
| `provider` | [`IProviderClass`](../interfaces/IProviderClass.md) | An instance of a [IProviderClass](../interfaces/IProviderClass.md) class. |

#### Defined in

[classes/TxBuilders/TxBuilder.Lucid.class.ts:70](https://github.com/SundaeSwap-finance/sundae-sdk/blob/f054aa7/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L70)

## Properties

### options

• **options**: [`ITxBuilderLucidOptions`](../interfaces/ITxBuilderLucidOptions.md)

The main option for instantiating the class.

#### Implementation of

ITxBuilderClass.options

#### Defined in

[classes/TxBuilders/TxBuilder.Lucid.class.ts:71](https://github.com/SundaeSwap-finance/sundae-sdk/blob/f054aa7/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L71)

___

### provider

• **provider**: [`IProviderClass`](../interfaces/IProviderClass.md)

An instance of a [IProviderClass](../interfaces/IProviderClass.md) class.

#### Implementation of

ITxBuilderClass.provider

#### Defined in

[classes/TxBuilders/TxBuilder.Lucid.class.ts:72](https://github.com/SundaeSwap-finance/sundae-sdk/blob/f054aa7/packages/core/src/classes/TxBuilders/TxBuilder.Lucid.class.ts#L72)
