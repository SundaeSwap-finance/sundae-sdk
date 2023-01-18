# Class: SundaeSDK

A description for the SundaeSDK class.

```ts
const sdk = new SundaeSDK(
 new ProviderSundaeSwap()
);
```

## Constructors

### constructor

• **new SundaeSDK**(`builder`)

You'll need to provide a TxBuilder class to the main SDK, which is used to build Transactions and submit them.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `builder` | [`ITxBuilder`](ITxBuilder.md)<`any`, `any`, `any`, `any`\> | An instance of TxBuilder. |

#### Defined in

[classes/SundaeSDK.class.ts:20](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L20)

## Properties

### builder

• `Private` **builder**: [`ITxBuilder`](ITxBuilder.md)<`any`, `any`, `any`, `any`\>

An instance of TxBuilder.

#### Defined in

[classes/SundaeSDK.class.ts:20](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L20)

## Methods

### build

▸ **build**(): [`ITxBuilder`](ITxBuilder.md)<`any`, `any`, `any`, `any`\>

Utility method to retrieve the builder instance.

#### Returns

[`ITxBuilder`](ITxBuilder.md)<`any`, `any`, `any`, `any`\>

#### Defined in

[classes/SundaeSDK.class.ts:29](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L29)

___

### limitSwap

▸ **limitSwap**(`args`, `limitPrice`): `Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

Creates a swap with a minimum receivable limit price. The price should be the amount
at which you want the order to execute. For example:

**`Example`**

```ts
const limitPrice = new AssetAmount(1500000n, 6);
const { submit, cbor } = await SDK.limitSwap(
 poolQuery: {
   pair: ["assetAID", "assetBID"],
   fee: "0.03"
 },
 suppliedAsset: {
   assetID: "POLICY_ID.ASSET_NAME",
   amount: new AssetAmount(20n, 6)
 },
 receiverAddress: "addr1..."
)
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ISDKSwapArgs`](../interfaces/ISDKSwapArgs.md) |
| `limitPrice` | [`AssetAmount`](AssetAmount.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:117](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L117)

___

### query

▸ **query**(): [`IProviderClass`](../interfaces/IProviderClass.md)

Utility method to retrieve the provider instance.

#### Returns

[`IProviderClass`](../interfaces/IProviderClass.md)

#### Defined in

[classes/SundaeSDK.class.ts:38](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L38)

___

### swap

▸ **swap**(`args`): `Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

The main entry point for building a swap transaction with the least amount
of configuration required. By default, all calls to this method are treated
as market orders and will be executed as soon as a Scooper processes it.

For more control, look at

**`Example`**

### Building a Swap
```ts
const { submit, cbor } = await SDK.swap(
 pool: {
   /** ...pool data... */
 },
 suppliedAsset: {
   assetID: "POLICY_ID.ASSET_NAME",
   amount: new AssetAmount(20n, 6)
 },
 receiverAddress: "addr1..."
)
```

### Building a Swap With a Pool Query
```ts
const { submit, cbor } = await SDK.swap(
 poolQuery: {
   pair: ["assetAID", "assetBID"],
   fee: "0.03"
 },
 suppliedAsset: {
   assetID: "POLICY_ID.ASSET_NAME",
   amount: new AssetAmount(20n, 6)
 },
 receiverAddress: "addr1..."
)
```

**`See`**

 - [IProviderClass.findPoolData](../interfaces/IProviderClass.md#findpooldata)
 - ITxBuilderClass.buildSwapTx | ITxBuilderClass.buildSwap
 - [SwapConfig](SwapConfig.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ISDKSwapArgs`](../interfaces/ISDKSwapArgs.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:87](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L87)
