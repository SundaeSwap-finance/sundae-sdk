# Class: SundaeSDK

[Core](../modules/Core.md).SundaeSDK

The main SundaeSDK class that contains all the necessary sub-classes for
interacting with the SundaeSwap protocol.

```ts
const sdk = new SundaeSDK({
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

[packages/core/src/SundaeSDK.class.ts:265](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L265)

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

[packages/core/src/SundaeSDK.class.ts:164](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L164)

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

[packages/core/src/SundaeSDK.class.ts:168](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L168)

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

[packages/core/src/SundaeSDK.class.ts:172](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L172)

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

[packages/core/src/SundaeSDK.class.ts:176](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L176)

▸ **builder**(`contractVersion`): [`TxBuilderV1`](Core.TxBuilderV1.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V1`](../enums/Core.EContractVersion.md#v1) |

#### Returns

[`TxBuilderV1`](Core.TxBuilderV1.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:180](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L180)

▸ **builder**(`contractVersion`): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Parameters

| Name | Type |
| :------ | :------ |
| `contractVersion` | [`V3`](../enums/Core.EContractVersion.md#v3) |

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:181](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L181)

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

[packages/core/src/SundaeSDK.class.ts:182](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L182)

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

[packages/core/src/SundaeSDK.class.ts:186](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L186)

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

[packages/core/src/SundaeSDK.class.ts:190](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L190)

▸ **builder**(): [`TxBuilderV3`](Core.TxBuilderV3.md)

Creates the appropriate transaction builder by which you can create valid transactions.

#### Returns

[`TxBuilderV3`](Core.TxBuilderV3.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:194](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L194)

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

[packages/core/src/SundaeSDK.class.ts:195](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L195)

___

### getOptions

▸ **getOptions**(): [`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md)

Utility method to retrieve the SDK options object.

#### Returns

[`ISundaeSDKOptions`](../interfaces/Core.ISundaeSDKOptions.md)

#### Defined in

[packages/core/src/SundaeSDK.class.ts:159](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L159)

___

### lucid

▸ **lucid**(): `undefined` \| `Lucid`

Helper method to retrieve a Lucid instance.

#### Returns

`undefined` \| `Lucid`

#### Defined in

[packages/core/src/SundaeSDK.class.ts:248](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L248)

___

### query

▸ **query**(): [`QueryProvider`](Core.QueryProvider.md)

Utility method to retrieve the provider instance.

#### Returns

[`QueryProvider`](Core.QueryProvider.md)

- The QueryProvider instance.

#### Defined in

[packages/core/src/SundaeSDK.class.ts:239](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L239)

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

[packages/core/src/SundaeSDK.class.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/SundaeSDK.class.ts#L89)
