---
title: "SundaeSDK"
---

# SundaeSDK

A description for the SundaeSDK class.

```ts
const sdk = new SundaeSDK(
 new ProviderSundaeSwap()
);
```

## Constructors

## constructor()

You'll need to provide a TxBuilder class to the main SDK, which is used to build Transactions and submit them.

### Signature

```ts
new SundaeSDK(builder: TxBuilder<any, any, any, IQueryProviderClass>): SundaeSDK;
```

### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `builder` | [`TxBuilder`](TxBuilder.md)\<`any`, `any`, `any`, [`IQueryProviderClass`](../interfaces/IQueryProviderClass.md)\> | An instance of TxBuilder. |

### Returns

[`SundaeSDK`](SundaeSDK.md)

Defined in:  [classes/SundaeSDK.class.ts:36](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L36)

## Properties

### builder

> [`TxBuilder`](TxBuilder.md)\<`any`, `any`, `any`, [`IQueryProviderClass`](../interfaces/IQueryProviderClass.md)\>

An instance of TxBuilder.

Defined in:  [classes/SundaeSDK.class.ts:36](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L36)

## Methods

### build()

Utility method to retrieve the builder instance with types.

#### Signature

```ts
build<T>(): TxBuilder<any, T, any, IQueryProviderClass>;
```

#### Type parameters

- `T` = `any`

#### Returns

[`TxBuilder`](TxBuilder.md)\<`any`, `T`, `any`, [`IQueryProviderClass`](../interfaces/IQueryProviderClass.md)\>

Defined in:  [classes/SundaeSDK.class.ts:45](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L45)

### cancel()

Create a cancel transaction for an open escrow order.

#### Signature

```ts
cancel(config: CancelConfigArgs): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`CancelConfigArgs`](../interfaces/CancelConfigArgs.md) |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/SundaeSDK.class.ts:182](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L182)

### deposit()

Create a Deposit transaction for a pool by supplying two assets.

#### Signature

```ts
deposit(config: DepositConfigArgs): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`DepositConfigArgs`](../interfaces/DepositConfigArgs.md) |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/SundaeSDK.class.ts:172](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L172)

### limitSwap()

Creates a swap with a minimum receivable limit price. The price should be the minimum
amount at which you want the order to execute. For example:

#### Example

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

#### Signature

```ts
limitSwap(config: SwapConfigArgs, limitPrice: AssetAmount): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`SwapConfigArgs`](../interfaces/SwapConfigArgs.md) |
| `limitPrice` | [`AssetAmount`](AssetAmount.md) |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/SundaeSDK.class.ts:151](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L151)

### query()

Utility method to retrieve the provider instance.

#### Signature

```ts
query(): IQueryProviderClass;
```

#### Returns

[`IQueryProviderClass`](../interfaces/IQueryProviderClass.md)

Defined in:  [classes/SundaeSDK.class.ts:54](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L54)

### swap()

The main entry point for building a swap transaction with the least amount
of configuration required. By default, all calls to this method are treated
as market orders with a generous 10% slippage tolerance by default.

#### Example

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

#### See

 - [IProviderClass.findPoolData](../interfaces/IQueryProviderClass.md#findpooldata)
 - [TxBuilder.buildSwapTx](TxBuilder.md#buildswaptx)
 - [SwapConfig](SwapConfig.md)

#### Signature

```ts
swap(config: Omit<SwapConfigArgs, "minReceivable">, slippage?: number): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | `Omit`\<[`SwapConfigArgs`](../interfaces/SwapConfigArgs.md), `"minReceivable"`\> | - |
| `slippage?` | `number` | Set your slippage tolerance. Defaults to 10%. |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/SundaeSDK.class.ts:107](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L107)

### unstable\_zap()

Create a Deposit transaction for a pool by supplying a single asset.

#### Signature

```ts
unstable_zap(config: SDKZapArgs): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`SDKZapArgs`](../interfaces/SDKZapArgs.md) |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/SundaeSDK.class.ts:211](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L211)

### withdraw()

Create a Withdraw transaction for a pool by supplying the LP tokens.

#### Signature

```ts
withdraw(config: WithdrawConfigArgs): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`WithdrawConfigArgs`](../interfaces/WithdrawConfigArgs.md) |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/SundaeSDK.class.ts:162](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L162)

### zap()

Builds a custom zap utilizing a chained order (first a swap, then a deposit).

#### Signature

```ts
zap(config: Omit<ZapConfigArgs, "zapDirection">): Promise<ITxBuilderTx>;
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `Omit`\<[`ZapConfigArgs`](../interfaces/ZapConfigArgs.md), `"zapDirection"`\> |

#### Returns

`Promise`\<[`ITxBuilderTx`](../interfaces/ITxBuilderTx.md)\>

Defined in:  [classes/SundaeSDK.class.ts:192](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/classes/SundaeSDK.class.ts#L192)
