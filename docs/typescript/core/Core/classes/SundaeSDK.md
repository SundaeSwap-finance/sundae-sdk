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

> **blaze**(): `undefined` \| `Blaze`\<`Provider`, `Wallet$1`\>

Helper method to retrieve a blaze instance.

#### Returns

`undefined` \| `Blaze`\<`Provider`, `Wallet$1`\>

#### Defined in

[packages/core/src/SundaeSDK.class.ts:269](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L269)

***

### builder()

Creates the appropriate transaction builder by which you can create valid transactions.

#### builder(contractVersion, txBuilderType)

> **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderBlazeV1`](../../Blaze/classes/TxBuilderBlazeV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Parameters

• **contractVersion**: [`V1`](../enumerations/EContractVersion.md#v1)

• **txBuilderType**: [`BLAZE`](../enumerations/ETxBuilderType.md#blaze)

##### Returns

[`TxBuilderBlazeV1`](../../Blaze/classes/TxBuilderBlazeV1.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:168](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L168)

#### builder(contractVersion, txBuilderType)

> **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderBlazeV3`](../../Blaze/classes/TxBuilderBlazeV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Parameters

• **contractVersion**: [`V3`](../enumerations/EContractVersion.md#v3)

• **txBuilderType**: [`BLAZE`](../enumerations/ETxBuilderType.md#blaze)

##### Returns

[`TxBuilderBlazeV3`](../../Blaze/classes/TxBuilderBlazeV3.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:172](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L172)

#### builder(contractVersion, txBuilderType)

> **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderLucidV1`](../../Lucid/classes/TxBuilderLucidV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Parameters

• **contractVersion**: [`V1`](../enumerations/EContractVersion.md#v1)

• **txBuilderType**: [`LUCID`](../enumerations/ETxBuilderType.md#lucid)

##### Returns

[`TxBuilderLucidV1`](../../Lucid/classes/TxBuilderLucidV1.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:176](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L176)

#### builder(contractVersion, txBuilderType)

> **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderLucidV3`](../../Lucid/classes/TxBuilderLucidV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Parameters

• **contractVersion**: [`V3`](../enumerations/EContractVersion.md#v3)

• **txBuilderType**: [`LUCID`](../enumerations/ETxBuilderType.md#lucid)

##### Returns

[`TxBuilderLucidV3`](../../Lucid/classes/TxBuilderLucidV3.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:180](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L180)

#### builder(contractVersion)

> **builder**(`contractVersion`): [`TxBuilderV1`](TxBuilderV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Parameters

• **contractVersion**: [`V1`](../enumerations/EContractVersion.md#v1)

##### Returns

[`TxBuilderV1`](TxBuilderV1.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:184](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L184)

#### builder(contractVersion)

> **builder**(`contractVersion`): [`TxBuilderV3`](TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Parameters

• **contractVersion**: [`V3`](../enumerations/EContractVersion.md#v3)

##### Returns

[`TxBuilderV3`](TxBuilderV3.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:185](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L185)

#### builder(contractVersion, txBuilderType)

> **builder**(`contractVersion`, `txBuilderType`?): [`TxBuilderV1`](TxBuilderV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Parameters

• **contractVersion**: [`V1`](../enumerations/EContractVersion.md#v1)

• **txBuilderType?**: [`ETxBuilderType`](../enumerations/ETxBuilderType.md)

##### Returns

[`TxBuilderV1`](TxBuilderV1.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:186](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L186)

#### builder(contractVersion, txBuilderType)

> **builder**(`contractVersion`, `txBuilderType`?): [`TxBuilderV3`](TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Parameters

• **contractVersion**: [`V3`](../enumerations/EContractVersion.md#v3)

• **txBuilderType?**: [`ETxBuilderType`](../enumerations/ETxBuilderType.md)

##### Returns

[`TxBuilderV3`](TxBuilderV3.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:190](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L190)

#### builder(contractVersion, txBuilderType)

> **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderV3`](TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Parameters

• **contractVersion**: [`V3`](../enumerations/EContractVersion.md#v3)

• **txBuilderType**: [`ETxBuilderType`](../enumerations/ETxBuilderType.md)

##### Returns

[`TxBuilderV3`](TxBuilderV3.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:194](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L194)

#### builder()

> **builder**(): [`TxBuilderV3`](TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Returns

[`TxBuilderV3`](TxBuilderV3.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:198](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L198)

#### builder(contractVersion, txBuilderType)

> **builder**(`contractVersion`?, `txBuilderType`?): [`TxBuilderV1`](TxBuilderV1.md) \| [`TxBuilderV3`](TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

##### Parameters

• **contractVersion?**: [`EContractVersion`](../enumerations/EContractVersion.md)

• **txBuilderType?**: [`ETxBuilderType`](../enumerations/ETxBuilderType.md)

##### Returns

[`TxBuilderV1`](TxBuilderV1.md) \| [`TxBuilderV3`](TxBuilderV3.md)

##### Defined in

[packages/core/src/SundaeSDK.class.ts:199](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L199)

***

### getOptions()

> **getOptions**(): [`ISundaeSDKOptions`](../interfaces/ISundaeSDKOptions.md)

Utility method to retrieve the SDK options object.

#### Returns

[`ISundaeSDKOptions`](../interfaces/ISundaeSDKOptions.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:163](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L163)

***

### lucid()

> **lucid**(): `undefined` \| `Lucid`

Helper method to retrieve a Lucid instance.

#### Returns

`undefined` \| `Lucid`

#### Defined in

[packages/core/src/SundaeSDK.class.ts:252](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L252)

***

### query()

> **query**(): [`QueryProvider`](QueryProvider.md)

Utility method to retrieve the provider instance.

#### Returns

[`QueryProvider`](QueryProvider.md)

- The QueryProvider instance.

#### Defined in

[packages/core/src/SundaeSDK.class.ts:243](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L243)

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

[packages/core/src/SundaeSDK.class.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L80)
