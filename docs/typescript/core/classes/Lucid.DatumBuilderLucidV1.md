# Class: DatumBuilderLucidV1

[Lucid](../modules/Lucid.md).DatumBuilderLucidV1

The Lucid implementation for building valid Datums for
V1 contracts on the SundaeSwap protocol.

## Implements

- [`DatumBuilder`](Core.DatumBuilder.md)

## Properties

### network

• **network**: [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks)

The current network id.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts:27](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts#L27)

___

### INVALID\_POOL\_IDENT

▪ `Static` **INVALID\_POOL\_IDENT**: `string` = `"You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order."`

The error to throw when the pool ident does not match V1 constraints.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts:29](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts#L29)

## Methods

### buildDepositDatum

▸ **buildDepositDatum**(`params`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<`Data`\>

Creates a deposit datum object from the given deposit arguments. The function initializes
a new datum with specific properties such as the pool ident, order addresses, scooper fee,
and deposit pair schema. It then converts this datum into an inline format and calculates
its hash using [Lucid.LucidHelper](Lucid.LucidHelper.md). The function returns an object containing the hash of the inline
datum, the inline datum itself, and the original datum schema.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`IDepositArguments`](../interfaces/Core.IDepositArguments.md) | The deposit arguments required to construct the deposit datum. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<`Data`\>

An object containing the hash of the inline datum, the inline datum itself,
                              and the schema of the original datum.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts:82](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts#L82)

___

### buildSwapDatum

▸ **buildSwapDatum**(`params`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<`Data`\>

Constructs a swap datum object based on the provided swap arguments.
The function initializes a new datum with specific properties such as the pool ident,
order addresses, scooper fee, and swap direction schema. It then converts this datum
into an inline format and computes its hash using [Lucid.LucidHelper](Lucid.LucidHelper.md). The function returns an
object containing the hash of the inline datum, the inline datum itself, and the original
datum schema.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`ISwapArguments`](../interfaces/Core.ISwapArguments.md) | The swap arguments required to build the swap datum. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<`Data`\>

An object containing the hash of the inline datum, the inline datum itself,
                              and the schema of the original datum.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts:48](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts#L48)

___

### buildWithdrawDatum

▸ **buildWithdrawDatum**(`params`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<`Data`\>

Generates a withdraw datum object from the specified withdraw arguments. This function constructs
a new datum with defined attributes such as the pool ident, order addresses, scooper fee, and
the schema for the supplied LP (Liquidity Provider) asset for withdrawal. After constructing the datum,
it is converted into an inline format, and its hash is calculated using [Lucid.LucidHelper](Lucid.LucidHelper.md). The function returns
an object containing the hash of the inline datum, the inline datum itself, and the schema of the original
datum, which are crucial for executing the withdrawal operation within a transactional framework.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`IWithdrawArguments`](../interfaces/Core.IWithdrawArguments.md) | The arguments necessary to construct the withdraw datum. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<`Data`\>

An object comprising the hash of the inline datum, the inline datum itself,
                              and the schema of the original datum, facilitating the withdrawal operation's integration into the transactional process.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts:149](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts#L149)

___

### experimental\_buildZapDatum

▸ **experimental_buildZapDatum**(`params`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<`Data`\>

Constructs a zap datum object from provided zap arguments. This function creates a new datum with
specific attributes such as the pool ident, order addresses, scooper fee, and deposit zap schema.
The datum is then converted to an inline format, and its hash is computed using [Lucid.LucidHelper](Lucid.LucidHelper.md). The function
returns an object that includes the hash of the inline datum, the inline datum itself, and the original
datum schema, facilitating the integration of the zap operation within a larger transaction framework.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`IZapArguments`](../interfaces/Core.IZapArguments.md) | The arguments necessary for constructing the zap datum. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<`Data`\>

An object containing the hash of the inline datum, the inline datum itself,
                              and the schema of the original datum, which are essential for the zap transaction's execution.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts:115](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V1.class.ts#L115)
