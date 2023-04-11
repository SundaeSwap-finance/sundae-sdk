---
title: "TxBuilderLucid"
---

# TxBuilderLucid

Building a TxBuilder is fairly simple, but depends on the library that the underlying tooling uses. In this case,
you would build this TxBuilder like this:

## Example

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

- [`TxBuilder`](../../Core/classes/TxBuilder.md)\<[`ITxBuilderLucidOptions`](../interfaces/ITxBuilderLucidOptions.md), `Lucid`, `Tx`\>.**TxBuilderLucid**

## Constructors

## constructor()

### Signature

```ts
new TxBuilderLucid(options: ITxBuilderLucidOptions, query: IQueryProviderClass): TxBuilderLucid;
```

### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`ITxBuilderLucidOptions`](../interfaces/ITxBuilderLucidOptions.md) | The main option for instantiating the class. |
| `query` | [`IQueryProviderClass`](../../Core/interfaces/IQueryProviderClass.md) | A valid Query Provider class that will do the lookups. |

### Returns

[`TxBuilderLucid`](TxBuilderLucid.md)

Overrides: TxBuilder\<
  ITxBuilderLucidOptions,
  Lucid,
  Tx
\>.constructor

Defined in:  [classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:79](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L79)

## Properties

### options

> [`ITxBuilderLucidOptions`](../interfaces/ITxBuilderLucidOptions.md)

The main option for instantiating the class.

Inherited from: TxBuilder.options

Defined in:  [classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L80)

### query

> [`IQueryProviderClass`](../../Core/interfaces/IQueryProviderClass.md)

A valid Query Provider class that will do the lookups.

Inherited from: TxBuilder.query

Defined in:  [classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:81](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L81)

## Methods

### getParams()

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Signature

```ts
Protected getParams(): IProtocolParams;
```

#### Returns

[`IProtocolParams`](../../Core/interfaces/IProtocolParams.md)

Inherited from: [TxBuilder](../../Core/classes/TxBuilder.md).[getParams](../../Core/classes/TxBuilder.md#getparams)

Defined in:  [classes/Abstracts/TxBuilder.abstract.class.ts:93](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L93)

### initWallet()

Initializes a Lucid instance with the

#### Signature

```ts
Private initWallet(): Promise<void>;
```

#### Returns

`Promise`\<`void`\>

Defined in:  [classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:100](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L100)

### newTxInstance()

Returns a new Tx instance from Lucid. Throws an error if not ready.

#### Signature

```ts
newTxInstance(): Promise<Transaction<Tx>>;
```

#### Returns

`Promise`\<[`Transaction`](../../Core/classes/Transaction.md)\<`Tx`\>\>

Overrides: [TxBuilder](../../Core/classes/TxBuilder.md).[newTxInstance](../../Core/classes/TxBuilder.md#newtxinstance)

Defined in:  [classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:130](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L130)
