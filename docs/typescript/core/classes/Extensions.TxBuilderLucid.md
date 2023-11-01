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

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:95](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L95)

## Methods

### buildFreezerTx

▸ **buildFreezerTx**(`freezerConfig`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`Tx`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

Builds a valid transaction for the V2 Yield Farming contract
that allows a user to add or update staking positions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `freezerConfig` | [`FreezerConfig`](Core.FreezerConfig.md) |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`Tx`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

[TxBuilder](Core.TxBuilder.md).[buildFreezerTx](Core.TxBuilder.md#buildfreezertx)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:188](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L188)

___

### buildUpdateSwapTx

▸ **buildUpdateSwapTx**(`«destructured»`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`Tx`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

Updates an open order by spending the UTXO back into the smart contract
with an updated swap datum.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `cancelConfig` | [`CancelConfig`](Core.CancelConfig.md) |
| › `swapConfig` | [`SwapConfig`](Core.SwapConfig.md) |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`Tx`, `undefined` \| `string`, `Record`<`string`, `AssetAmount`<`IAssetAmountMetadata`\>\>\>\>

#### Overrides

[TxBuilder](Core.TxBuilder.md).[buildUpdateSwapTx](Core.TxBuilder.md#buildupdateswaptx)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:354](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L354)

___

### getParams

▸ `Protected` **getParams**(): [`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

Helper function for child classes to easily grab the appropriate protocol parameters for SundaeSwap.

#### Returns

[`IProtocolParams`](../interfaces/Core.IProtocolParams.md)

#### Inherited from

[TxBuilder](Core.TxBuilder.md).[getParams](Core.TxBuilder.md#getparams)

#### Defined in

[classes/Abstracts/TxBuilder.abstract.class.ts:113](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Abstracts/TxBuilder.abstract.class.ts#L113)

___

### initWallet

▸ `Private` **initWallet**(): `Promise`<`void`\>

Initializes a Lucid instance with the

#### Returns

`Promise`<`void`\>

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:113](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L113)

___

### newTxInstance

▸ **newTxInstance**(`fee?`): `Promise`<`Tx`\>

Returns a new Tx instance from Lucid. Throws an error if not ready.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fee?` | [`ITxBuilderReferralFee`](../interfaces/Core.ITxBuilderReferralFee.md) |

#### Returns

`Promise`<`Tx`\>

#### Overrides

[TxBuilder](Core.TxBuilder.md).[newTxInstance](Core.TxBuilder.md#newtxinstance)

#### Defined in

[classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts:147](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/Extensions/TxBuilders/TxBuilder.Lucid.class.ts#L147)
