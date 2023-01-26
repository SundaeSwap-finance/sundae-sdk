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
| `builder` | [`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`, [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)\> | An instance of TxBuilder. |

#### Defined in

[classes/SundaeSDK.class.ts:34](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L34)

## Properties

### builder

• `Private` **builder**: [`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`, [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)\>

An instance of TxBuilder.

#### Defined in

[classes/SundaeSDK.class.ts:34](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L34)

## Methods

### build

▸ **build**<`T`\>(): [`TxBuilder`](Core.TxBuilder.md)<`any`, `T`, `any`, [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)\>

Utility method to retrieve the builder instance.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Returns

[`TxBuilder`](Core.TxBuilder.md)<`any`, `T`, `any`, [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:43](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L43)

___

### deposit

▸ **deposit**(`config`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

Create a Deposit transaction for a pool by supplying two assets.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`BuildDepositConfigArgs`](../interfaces/Core.BuildDepositConfigArgs.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:170](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L170)

___

### limitSwap

▸ **limitSwap**(`config`, `limitPrice`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

Creates a swap with a minimum receivable limit price. The price should be the minimum
amount at which you want the order to execute. For example:

**`Example`**

```ts
// Your desired limit price of the opposing pool asset
const limitPrice = new AssetAmount(1500000n, 6);

// Normal swap arguments
const pool = await SDK.query().findPoolData(poolQuery);
const config: BuildSwapConfigArgs = {
 pool,
 suppliedAsset: {
   assetId: "POLICY_ID.ASSET_NAME",
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
| `config` | [`BuildSwapConfigArgs`](../interfaces/Core.BuildSwapConfigArgs.md) |
| `limitPrice` | [`AssetAmount`](Core.AssetAmount.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:149](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L149)

___

### query

▸ **query**(): [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)

Utility method to retrieve the provider instance.

#### Returns

[`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)

#### Defined in

[classes/SundaeSDK.class.ts:52](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L52)

___

### swap

▸ **swap**(`config`, `slippage?`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

The main entry point for building a swap transaction with the least amount
of configuration required. By default, all calls to this method are treated
as market orders with a generous 10% slippage tolerance by default.

**`Example`**

### Building a Swap
```ts
 const config: BuildSwapConfigArgs = {
 pool: {
   /** Pool data you got from somewhere else. */
 },
 suppliedAsset: {
   assetId: "POLICY_ID.ASSET_NAME",
   amount: new AssetAmount(20n, 6)
 },
 receiverAddress: "addr1..."
};

const { submit, cbor } = await SDK.swap(config);
```

### Building a Swap With a Pool Query
```ts
const pool = await SDK.query().findPoolData(poolQuery);
const config: BuildSwapConfigArgs = {
 pool,
 suppliedAsset: {
   assetId: "POLICY_ID.ASSET_NAME",
   amount: new AssetAmount(20n, 6)
 },
 receiverAddress: "addr1..."
};

const { submit, cbor } = await SDK.swap(
 config,
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
| `config` | [`BuildSwapConfigArgs`](../interfaces/Core.BuildSwapConfigArgs.md) | - |
| `slippage?` | `number` | Set your slippage tolerance. Defaults to 10%. |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:105](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L105)

___

### withdraw

▸ **withdraw**(`config`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

Create a Withdraw transaction for a pool by supplying the LP tokens.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`BuildWithdrawConfigArgs`](../interfaces/Core.BuildWithdrawConfigArgs.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:160](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L160)

___

### zap

▸ **zap**(`config`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

Create a Deposit transaction for a pool by supplying two assets.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`SDKZapArgs`](../interfaces/Core.SDKZapArgs.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:180](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L180)
