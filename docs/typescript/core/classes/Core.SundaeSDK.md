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

▸ **build**<`O`, `T`\>(): [`TxBuilder`](Core.TxBuilder.md)<`O`, `T`, `any`, [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)\>

Utility method to retrieve the builder instance with types.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `O` | `any` |
| `T` | `any` |

#### Returns

[`TxBuilder`](Core.TxBuilder.md)<`O`, `T`, `any`, [`IQueryProviderClass`](../interfaces/Core.IQueryProviderClass.md)\>

#### Defined in

[classes/SundaeSDK.class.ts:43](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L43)

___

### cancel

▸ **cancel**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

Create a cancel transaction for an open escrow order.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`CancelConfigArgs`](../interfaces/Core.CancelConfigArgs.md) |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/SundaeSDK.class.ts:200](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L200)

___

### deposit

▸ **deposit**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

Create a Deposit transaction for a pool by supplying two assets.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`DepositConfigArgs`](../interfaces/Core.DepositConfigArgs.md) |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/SundaeSDK.class.ts:190](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L190)

___

### limitSwap

▸ **limitSwap**(`config`, `minReceivable`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

Creates a swap with a minimum receivable amount.

**`Example`**

```ts
// The minimum amount of tokens you would like to receive from your order.
const minReceivable = new AssetAmount(15000000n, 6);

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
 minReceivable
)
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Omit`<[`SwapConfigArgs`](../interfaces/Core.SwapConfigArgs.md), ``"minReceivable"``\> |
| `minReceivable` | `AssetAmount`<`any`\> |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/SundaeSDK.class.ts:147](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L147)

___

### lock

▸ **lock**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

Create a locking transaction for yield farming and pool delegation.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`FreezerConfigArgs`](../interfaces/Core.FreezerConfigArgs.md) |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/SundaeSDK.class.ts:229](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L229)

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

▸ **swap**(`config`, `slippage?`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

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

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/SundaeSDK.class.ts:105](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L105)

___

### unlock

▸ **unlock**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

Create an unlocking transaction that removes all yield farming positions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Pick`<[`FreezerConfigArgs`](../interfaces/Core.FreezerConfigArgs.md), ``"existingPositions"`` \| ``"ownerAddress"`` \| ``"referralFee"``\> |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/SundaeSDK.class.ts:239](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L239)

___

### unstable\_zap

▸ **unstable_zap**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

Creates an atomic swap with a single asset and a pool.
This is experimental and currently not supported by Cardano parameter limits.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Omit`<[`ZapConfigArgs`](../interfaces/Core.ZapConfigArgs.md), ``"zapDirection"``\> |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/SundaeSDK.class.ts:259](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L259)

___

### updateSwap

▸ **updateSwap**(`cancelConfig`, `swapConfig`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

Create a new transaction that cancels and spends the assets with a new swap config.

#### Parameters

| Name | Type |
| :------ | :------ |
| `cancelConfig` | [`CancelConfigArgs`](../interfaces/Core.CancelConfigArgs.md) |
| `swapConfig` | [`SwapConfigArgs`](../interfaces/Core.SwapConfigArgs.md) |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/SundaeSDK.class.ts:162](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L162)

___

### withdraw

▸ **withdraw**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

Create a Withdraw transaction for a pool by supplying the LP tokens.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`WithdrawConfigArgs`](../interfaces/Core.WithdrawConfigArgs.md) |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/SundaeSDK.class.ts:180](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L180)

___

### zap

▸ **zap**(`config`): `Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

Builds a custom zap utilizing a chained order (first a swap, then a deposit).

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Omit`<[`ZapConfigArgs`](../interfaces/Core.ZapConfigArgs.md), ``"zapDirection"``\> |

#### Returns

`Promise`<[`ITxBuilder`](../interfaces/Core.ITxBuilder.md)<`unknown`, `unknown`\>\>

#### Defined in

[classes/SundaeSDK.class.ts:210](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L210)
