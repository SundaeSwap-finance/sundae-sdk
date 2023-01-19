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
| `builder` | [`TxBuilder`](TxBuilder.md)<`any`, `any`, `any`, `any`\> | An instance of TxBuilder. |

#### Defined in

[classes/SundaeSDK.class.ts:22](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L22)

## Properties

### builder

• `Private` **builder**: [`TxBuilder`](TxBuilder.md)<`any`, `any`, `any`, `any`\>

An instance of TxBuilder.

#### Defined in

[classes/SundaeSDK.class.ts:22](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L22)

## Methods

### \_buildBasicSwapConfig

▸ `Private` **_buildBasicSwapConfig**(`args`, `slippage?`): `Promise`<[`SwapConfig`](SwapConfig.md)\>

Builds a basic Swap config from [ISDKSwapArgs](../interfaces/ISDKSwapArgs.md).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ISDKSwapArgs`](../interfaces/ISDKSwapArgs.md) |  |
| `slippage?` | `number` \| ``false`` | Calculate a minimum receivable amount of the opposing asset pair based on the provided value. If set to false, calculation will be ignored. |

#### Returns

`Promise`<[`SwapConfig`](SwapConfig.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:148](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L148)

___

### build

▸ **build**(): [`TxBuilder`](TxBuilder.md)<`any`, `any`, `any`, `any`\>

Utility method to retrieve the builder instance.

#### Returns

[`TxBuilder`](TxBuilder.md)<`any`, `any`, `any`, `any`\>

#### Defined in

[classes/SundaeSDK.class.ts:31](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L31)

___

### limitSwap

▸ **limitSwap**(`args`, `limitPrice`): `Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

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
| `args` | [`ISDKSwapArgs`](../interfaces/ISDKSwapArgs.md) |
| `limitPrice` | [`AssetAmount`](AssetAmount.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:134](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L134)

___

### query

▸ **query**(): [`IProviderClass`](../interfaces/IProviderClass.md)

Utility method to retrieve the provider instance.

#### Returns

[`IProviderClass`](../interfaces/IProviderClass.md)

#### Defined in

[classes/SundaeSDK.class.ts:40](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L40)

___

### swap

▸ **swap**(`args`, `slippage?`): `Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

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

 - [IProviderClass.findPoolData](../interfaces/IProviderClass.md#findpooldata)
 - [TxBuilder.buildSwapTx](TxBuilder.md#buildswaptx)
 - [SwapConfig](SwapConfig.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ISDKSwapArgs`](../interfaces/ISDKSwapArgs.md) |  |
| `slippage?` | `number` | Set your slippage tolerance. Defaults to 10%. |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:95](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L95)
