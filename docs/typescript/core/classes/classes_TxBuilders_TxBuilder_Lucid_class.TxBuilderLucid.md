[@sundae/sdk-core](../README.md) / [Exports](../modules.md) / [classes/TxBuilders/TxBuilder.Lucid.class](../modules/classes_TxBuilders_TxBuilder_Lucid_class.md) / TxBuilderLucid

# Class: TxBuilderLucid

[classes/TxBuilders/TxBuilder.Lucid.class](../modules/classes_TxBuilders_TxBuilder_Lucid_class.md).TxBuilderLucid

A TxBuilder instance that uses the Lucid library for building and submitting transactions.

## Implements

- [`ITxBuilderClass`](../interfaces/types_txbuilder.ITxBuilderClass.md)<[`ITxBuilderLucidOptions`](../interfaces/types_txbuilder.ITxBuilderLucidOptions.md), `LucidType`, `DataType`, `TxType`\>

## Constructors

### constructor

• **new TxBuilderLucid**(`options`, `provider`)

Building a TxBuilder is fairly simple, but depends on the library that the underlying tooling uses. In this case,
you would build this TxBuilder like this:

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

@see {@link ProviderSundaeSwap}
@param options The main option for instantiating the class.
@param provider An instance of a Provider class.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`ITxBuilderLucidOptions`](../interfaces/types_txbuilder.ITxBuilderLucidOptions.md) |
| `provider` | [`IProviderClass`](../interfaces/types_provider.IProviderClass.md) |

#### Defined in

classes/TxBuilders/TxBuilder.Lucid.class.ts:45
