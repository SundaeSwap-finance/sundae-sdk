# Class: SundaeSDK

[Core](../modules/Core.md).SundaeSDK

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
| `builder` | [`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`\> | An instance of TxBuilder. |

#### Defined in

[classes/SundaeSDK.class.ts:27](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L27)

## Properties

### builder

• `Private` **builder**: [`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`\>

An instance of TxBuilder.

#### Defined in

[classes/SundaeSDK.class.ts:27](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L27)

## Methods

### \_buildBasicSwapConfig

▸ `Private` **_buildBasicSwapConfig**(`args`, `slippage?`): `Promise`<[`SwapConfig`](Core.SwapConfig.md)\>

Builds a basic Swap config from [ISDKSwapArgs](../interfaces/Core.ISDKSwapArgs.md).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ISDKSwapArgs`](../interfaces/Core.ISDKSwapArgs.md) |  |
| `slippage?` | `number` \| ``false`` | Calculate a minimum receivable amount of the opposing asset pair based on the provided value. If set to false, calculation will be ignored. |

#### Returns

`Promise`<[`SwapConfig`](Core.SwapConfig.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:157](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L157)

___

### build

▸ **build**(): [`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`\>

Utility method to retrieve the builder instance.

#### Returns

[`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`\>

#### Defined in

[classes/SundaeSDK.class.ts:36](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L36)

___

### limitSwap

▸ **limitSwap**(`args`, `limitPrice`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

Creates a swap with a minimum receivable limit price. The price should be the minimum
amount at which you want the order to execute. For example:

**`Example`**

```ts
// Your desired limit price of the opposing pool asset
const limitPrice = new AssetAmount(1500000n, 6);

// Normal swap arguments
const swapArgs: ISDKSwapArgs = {
 poolQuery: {
   pair: ["assetAID", "assetBID"],
   fee: "0.03"
 },
 suppliedAsset: {
   assetID: "POLICY_ID.ASSET_NAME",
   amount: new AssetAmount(20n, 6)
 },
 receiverAddress: "addr1..."
}

// Build Tx
const { submit, cbor } = await SDK.limitSwap(
 swapArgs,
 limitPrice
)
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ISDKSwapArgs`](../interfaces/Core.ISDKSwapArgs.md) |
| `limitPrice` | [`AssetAmount`](Core.AssetAmount.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:139](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L139)

___

### query

▸ **query**(): [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)

Utility method to retrieve the provider instance.

#### Returns

[`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)

#### Defined in

[classes/SundaeSDK.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L45)

___

### swap

▸ **swap**(`args`, `slippage?`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

The main entry point for building a swap transaction with the least amount
of configuration required. By default, all calls to this method are treated
as market orders with a generous 10% slippage tolerance by default.

**`Example`**

### Building a Swap
```ts
const args: ISDKSwapArgs = {
 pool: {
   /** ...pool data... */
 },
 suppliedAsset: {
   assetID: "POLICY_ID.ASSET_NAME",
   amount: new AssetAmount(20n, 6)
 },
 receiverAddress: "addr1..."
};

const { submit, cbor } = await SDK.swap(args);
```

### Building a Swap With a Pool Query
```ts
const args: ISDKSwapArgs = {
 poolQuery: {
   pair: ["assetAID", "assetBID"],
   fee: "0.03"
 },
 suppliedAsset: {
   assetID: "POLICY_ID.ASSET_NAME",
   amount: new AssetAmount(20n, 6)
 },
 receiverAddress: "addr1..."
};

const { submit, cbor } = await SDK.swap(
 args,
 0.03 // Tighter slippage of 3%
);
```

**`See`**

 - [IProviderClass.findPoolData](../interfaces/Core.IQueryProviderClass.md#findpooldata)
 - [TxBuilder.buildSwapTx](Core.TxBuilder.md#buildswaptx)
 - [SwapConfig](Core.SwapConfig.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ISDKSwapArgs`](../interfaces/Core.ISDKSwapArgs.md) |  |
| `slippage?` | `number` | Set your slippage tolerance. Defaults to 10%. |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:100](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L100)
