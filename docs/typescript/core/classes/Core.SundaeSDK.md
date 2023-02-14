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

[classes/SundaeSDK.class.ts:36](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L36)

## Properties

### builder

• **builder**: [`TxBuilder`](Core.TxBuilder.md)<`any`, `any`, `any`, [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)\>

An instance of TxBuilder.

#### Defined in

[classes/SundaeSDK.class.ts:36](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L36)

## Methods

### build

▸ **build**<`T`\>(): [`TxBuilder`](Core.TxBuilder.md)<`any`, `T`, `any`, [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)\>

Utility method to retrieve the builder instance with types.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Returns

[`TxBuilder`](Core.TxBuilder.md)<`any`, `T`, `any`, [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L45)

___

### deposit

▸ **deposit**(`config`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

Create a Deposit transaction for a pool by supplying two assets.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`DepositConfigArgs`](../interfaces/Core.DepositConfigArgs.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:172](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L172)

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
| `config` | [`SwapConfigArgs`](../interfaces/Core.SwapConfigArgs.md) |
| `limitPrice` | [`AssetAmount`](Core.AssetAmount.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:151](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L151)

___

### query

▸ **query**(): [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)

Utility method to retrieve the provider instance.

#### Returns

[`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)

#### Defined in

[classes/SundaeSDK.class.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L54)

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
| `config` | `Omit`<[`SwapConfigArgs`](../interfaces/Core.SwapConfigArgs.md), ``"minReceivable"``\> | - |
| `slippage?` | `number` | Set your slippage tolerance. Defaults to 10%. |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:107](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L107)

___

### unstable\_zap

▸ **unstable_zap**(`config`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

Create a Deposit transaction for a pool by supplying two assets.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`SDKZapArgs`](../interfaces/Core.SDKZapArgs.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:187](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L187)

___

### withdraw

▸ **withdraw**(`config`): `Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

Create a Withdraw transaction for a pool by supplying the LP tokens.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`WithdrawConfigArgs`](../interfaces/Core.WithdrawConfigArgs.md) |

#### Returns

`Promise`<[`ITxBuilderComplete`](../interfaces/Core.ITxBuilderComplete.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:162](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L162)
