[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Class: SundaeSDK

The main SundaeSDK class that contains all the necessary sub-classes for
interacting with the SundaeSwap protocol.

```ts
const blazeInstance = Blaze.from(
  // Blaze constructor options.
);
const sdk = SundaeSDK.new({
  blazeInstance
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

[packages/core/src/SundaeSDK.class.ts:137](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L137)

***

### builder()

> **builder**(`contractVersion`): [`TxBuilderV1`](TxBuilderV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

• **contractVersion**: [`V1`](../enumerations/EContractVersion.md#v1)

#### Returns

[`TxBuilderV1`](TxBuilderV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:99](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L99)

***

### query()

> **query**(): [`QueryProvider`](QueryProvider.md)

Utility method to retrieve the provider instance.

#### Returns

[`QueryProvider`](QueryProvider.md)

- The QueryProvider instance.

#### Defined in

[packages/core/src/SundaeSDK.class.ts:128](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L128)

***

### new()

> `static` **new**(`args`): [`SundaeSDK`](SundaeSDK.md)

Sets up TxBuilders based on the selected builder type. This is async
because we only import them after consuming the arguments.

#### Parameters

• **args**: [`ISundaeSDKOptions`](../interfaces/ISundaeSDKOptions.md)

The SundaeSDK arguments.

#### Returns

[`SundaeSDK`](SundaeSDK.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:76](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L76)
