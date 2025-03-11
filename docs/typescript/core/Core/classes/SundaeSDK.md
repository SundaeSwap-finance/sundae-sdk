[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: SundaeSDK

The main SundaeSDK class that contains all the necessary sub-classes for
interacting with the SundaeSwap protocol.

```ts
const sdk = await SundaeSDK.new({
  baseType: EBasePrototype.Lucid,
  network: "preview"
});

sdk.builder().buildSwapTx({ ...args })
  .then(async ({ build, sign }) => {
    const { fees } = await build();
    console.log(fees);

    const { submit } = await sign();
    const txHash = submit();

    console.log(txHash);
  })
```

## Methods

### blaze()

> **blaze**(): `Blaze`\<`Provider`, `Wallet$1`\>

Helper method to easily get the SDK's Blaze instance.

#### Returns

`Blaze`\<`Provider`, `Wallet$1`\>

#### Defined in

[packages/core/src/SundaeSDK.class.ts:146](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L146)

***

### builder()

> **builder**(`contractVersion`): [`TxBuilderV1`](TxBuilderV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

• **contractVersion**: [`V1`](../enumerations/EContractVersion.md#v1)

#### Returns

[`TxBuilderV1`](TxBuilderV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:109](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L109)

***

### getOptions()

> **getOptions**(): [`ISundaeSDKOptions`](../interfaces/ISundaeSDKOptions.md)

Utility method to retrieve the SDK options object.

#### Returns

[`ISundaeSDKOptions`](../interfaces/ISundaeSDKOptions.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:100](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L100)

***

### query()

> **query**(): [`QueryProvider`](QueryProvider.md)

Utility method to retrieve the provider instance.

#### Returns

[`QueryProvider`](QueryProvider.md)

- The QueryProvider instance.

#### Defined in

[packages/core/src/SundaeSDK.class.ts:137](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L137)

***

### new()

> `static` **new**(`args`): `Promise`\<[`SundaeSDK`](SundaeSDK.md)\>

Sets up TxBuilders based on the selected builder type. This is async
because we only import them after consuming the arguments.

#### Parameters

• **args**: [`ISundaeSDKOptions`](../interfaces/ISundaeSDKOptions.md)

The SundaeSDK arguments.

#### Returns

`Promise`\<[`SundaeSDK`](SundaeSDK.md)\>

#### Defined in

[packages/core/src/SundaeSDK.class.ts:65](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L65)
