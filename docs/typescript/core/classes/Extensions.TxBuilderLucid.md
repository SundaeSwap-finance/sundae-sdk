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

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:83](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L83)

## Properties

### options

• **options**: [`ITxBuilderLucidOptions`](../interfaces/Extensions.ITxBuilderLucidOptions.md)

The main option for instantiating the class.

#### Inherited from

TxBuilder.options

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:84](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L84)

___

### query

• **query**: [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)

A valid Query Provider class that will do the lookups.

#### Inherited from

TxBuilder.query

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:85](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L85)

## Methods

### buildFreezerTx

▸ **buildFreezerTx**(`lockConfig`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<[`Transaction`](Core.Transaction.md)<`Tx`\>, `undefined` \| `string`\>\>

Builds a valid transaction for the V2 Yield Farming contract
that allows a user to add or update staking positions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `lockConfig` | [`FreezerConfig`](Core.FreezerConfig.md) |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<[`Transaction`](Core.Transaction.md)<`Tx`\>, `undefined` \| `string`\>\>

#### Overrides

[TxBuilder](Core.TxBuilder.md).[buildFreezerTx](Core.TxBuilder.md#buildfreezertx)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:148](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L148)

___

### buildUpdateSwapTx

▸ **buildUpdateSwapTx**(`«destructured»`): `Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<[`Transaction`](Core.Transaction.md)<`Tx`\>, `undefined` \| `string`\>\>

Updates an open order by spending the UTXO back into the smart contract
with an updated swap datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `cancelConfig` | [`CancelConfig`](Core.CancelConfig.md) |
| › `swapConfig` | [`SwapConfig`](Core.SwapConfig.md) |

#### Returns

`Promise`<[`ITxBuilderTx`](../interfaces/Core.ITxBuilderTx.md)<[`Transaction`](Core.Transaction.md)<`Tx`\>, `undefined` \| `string`\>\>

#### Overrides

[TxBuilder](Core.TxBuilder.md).[buildUpdateSwapTx](Core.TxBuilder.md#buildupdateswaptx)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:284](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L284)

___

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Inherited from

[TxBuilder](Core.TxBuilder.md).[getParams](Core.TxBuilder.md#getparams)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:112](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L112)

___

### initWallet

▸ `Private` **initWallet**(): `Promise`<`void`\>

Initializes a Lucid instance with the

#### Returns

`Promise`<`void`\>

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:104](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L104)

___

### newTxInstance

▸ **newTxInstance**(): `Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

Returns a new Tx instance from Lucid. Throws an error if not ready.

#### Returns

`Promise`<[`Transaction`](Core.Transaction.md)<`Tx`\>\>

#### Overrides

[TxBuilder](Core.TxBuilder.md).[newTxInstance](Core.TxBuilder.md#newtxinstance)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:134](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L134)
