# Class: SundaeSDK

[Core](../modules/Core.md).SundaeSDK

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

## Constructors

### constructor

• **new SundaeSDK**(`args`): [`SundaeSDK`](Core.SundaeSDK.md)

Builds a class instance using the arguments specified.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md) | The primary arguments object for the SDK. |

#### Returns

[`SundaeSDK`](Core.SundaeSDK.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:70](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L70)

## Methods

### blaze

▸ **blaze**(): `undefined` \| `Blaze`\<`Blockfrost`, `WebWallet`\> \| `Blaze`\<`EmulatorProvider`, `ColdWallet`\>

Helper method to retrieve a blaze instance.

#### Returns

`undefined` \| `Blaze`\<`Blockfrost`, `WebWallet`\> \| `Blaze`\<`EmulatorProvider`, `ColdWallet`\>

#### Defined in

[packages/core/src/SundaeSDK.class.ts:275](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L275)

___

### builder

▸ **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderBlazeV1`](Blaze.TxBuilderBlazeV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |
| `txBuilderType` | [`BLAZE`](../enums/Core.ETxBuilderType.md#blaze) |

#### Returns

[`TxBuilderBlazeV1`](Blaze.TxBuilderBlazeV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:174](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L174)

▸ **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderBlazeV3`](Blaze.TxBuilderBlazeV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |
| `txBuilderType` | [`BLAZE`](../enums/Core.ETxBuilderType.md#blaze) |

#### Returns

[`TxBuilderBlazeV3`](Blaze.TxBuilderBlazeV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:178](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L178)

▸ **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |
| `txBuilderType` | [`LUCID`](../enums/Core.ETxBuilderType.md#lucid) |

#### Returns

[`TxBuilderLucidV1`](Lucid.TxBuilderLucidV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:182](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L182)

▸ **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |
| `txBuilderType` | [`LUCID`](../enums/Core.ETxBuilderType.md#lucid) |

#### Returns

[`TxBuilderLucidV3`](Lucid.TxBuilderLucidV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:186](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L186)

▸ **builder**(`contractVersion`): [`TxBuilderV1`](Core.TxBuilderV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |

#### Returns

[`TxBuilderV1`](Core.TxBuilderV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:190](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L190)

▸ **builder**(`contractVersion`): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:191](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L191)

▸ **builder**(`contractVersion`, `txBuilderType?`): [`TxBuilderV1`](Core.TxBuilderV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |
| `txBuilderType?` | [`ETxBuilderType`](../enums/Core.ETxBuilderType.md) |

#### Returns

[`TxBuilderV1`](Core.TxBuilderV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:192](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L192)

▸ **builder**(`contractVersion`, `txBuilderType?`): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |
| `txBuilderType?` | [`ETxBuilderType`](../enums/Core.ETxBuilderType.md) |

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:196](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L196)

▸ **builder**(`contractVersion`, `txBuilderType`): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |
| `txBuilderType` | [`ETxBuilderType`](../enums/Core.ETxBuilderType.md) |

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:200](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L200)

▸ **builder**(): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:204](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L204)

▸ **builder**(`contractVersion?`, `txBuilderType?`): [`TxBuilderV1`](Core.TxBuilderV1.md) \| [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion?` | [`EContractVersion`](../enums/Core.EContractVersion.md) |
| `txBuilderType?` | [`ETxBuilderType`](../enums/Core.ETxBuilderType.md) |

#### Returns

[`TxBuilderV1`](Core.TxBuilderV1.md) \| [`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:205](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L205)

___

### getOptions

▸ **getOptions**(): [`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md)

Utility method to retrieve the SDK options object.

#### Returns

[`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:169](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L169)

___

### lucid

▸ **lucid**(): `undefined` \| `Lucid`

Helper method to retrieve a Lucid instance.

#### Returns

`undefined` \| `Lucid`

#### Defined in

[packages/core/src/SundaeSDK.class.ts:258](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L258)

___

### query

▸ **query**(): [`QueryProvider`](Core.QueryProvider.md)

Utility method to retrieve the provider instance.

#### Returns

[`QueryProvider`](Core.QueryProvider.md)

- The QueryProvider instance.

#### Defined in

[packages/core/src/SundaeSDK.class.ts:249](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L249)

___

### registerTxBuilders

▸ **registerTxBuilders**(): `Promise`\<`void`\>

Registers TxBuilders depending on the TxBuilder
type. Currently we only support Lucid, but plan on adding
more types in the future. This gives full flexibility to the
client in which they can utilize the SDK according to their
software stack.

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/SundaeSDK.class.ts:99](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L99)

___

### new

▸ **new**(`args`): `Promise`\<[`SundaeSDK`](Core.SundaeSDK.md)\>

Sets up TxBuilders based on the selected builder type. This is async
because we only import them after consuming the arguments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md) | The SundaeSDK arguments. |

#### Returns

`Promise`\<[`SundaeSDK`](Core.SundaeSDK.md)\>

#### Defined in

[packages/core/src/SundaeSDK.class.ts:86](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L86)
