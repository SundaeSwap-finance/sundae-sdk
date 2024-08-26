# Class: DatumBuilderBlazeV1

[Blaze](../modules/Blaze.md).DatumBuilderBlazeV1

The Blaze implementation for building valid Datums for
V1 contracts on the SundaeSwap protocol.

## Implements

- [`DatumBuilder`](Core.DatumBuilder.md)

## Properties

### network

• **network**: [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks)

The current network id.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Blaze.V1.class.ts:41](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Blaze.V1.class.ts#L41)

___

### INVALID\_POOL\_IDENT

▪ `Static` **INVALID\_POOL\_IDENT**: `string` = `"You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order."`

The error to throw when the pool ident does not match V1 constraints.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Blaze.V1.class.ts:43](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Blaze.V1.class.ts#L43)

## Methods

### buildDepositDatum

▸ **buildDepositDatum**(`params`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `DepositPair`: ``"VOID"`` \| \{ `Parent`: \{ `Child`: ``"VOID"`` \| \{ `Value`: \{ `pair`: \{ `a`: `bigint` ; `b`: `bigint`  }  }  }  }  } ; `ident`: `string` ; `orderAddresses`: \{ `alternate`: ``null`` \| `string` ; `destination`: \{ `credentials`: \{ `paymentKey`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  } ; `stakingKey`: ``null`` \| \{ `value`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  }  }  } ; `datum`: ``null`` \| `string`  }  } ; `scooperFee`: `bigint`  }\>

Creates a deposit datum object from the given deposit arguments. The function initializes
a new datum with specific properties such as the pool ident, order addresses, scooper fee,
and deposit pair schema. It then converts this datum into an inline format and calculates
its hash using [Blaze.BlazeHelper](Blaze.BlazeHelper.md). The function returns an object containing the hash of the inline
datum, the inline datum itself, and the original datum schema.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`IDepositArguments`](../interfaces/Core.IDepositArguments.md) | The deposit arguments required to construct the deposit datum. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `DepositPair`: ``"VOID"`` \| \{ `Parent`: \{ `Child`: ``"VOID"`` \| \{ `Value`: \{ `pair`: \{ `a`: `bigint` ; `b`: `bigint`  }  }  }  }  } ; `ident`: `string` ; `orderAddresses`: \{ `alternate`: ``null`` \| `string` ; `destination`: \{ `credentials`: \{ `paymentKey`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  } ; `stakingKey`: ``null`` \| \{ `value`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  }  }  } ; `datum`: ``null`` \| `string`  }  } ; `scooperFee`: `bigint`  }\>

An object containing the hash of the inline datum, the inline datum itself,
                              and the schema of the original datum.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Blaze.V1.class.ts:96](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Blaze.V1.class.ts#L96)

___

### buildSwapDatum

▸ **buildSwapDatum**(`params`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `ident`: `string` ; `orderAddresses`: \{ `alternate`: ``null`` \| `string` ; `destination`: \{ `credentials`: \{ `paymentKey`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  } ; `stakingKey`: ``null`` \| \{ `value`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  }  }  } ; `datum`: ``null`` \| `string`  }  } ; `scooperFee`: `bigint` ; `swapDirection`: \{ `amount`: `bigint` ; `minReceivable`: ``null`` \| `bigint` ; `suppliedAssetIndex`: ``"A"`` \| ``"B"``  }  }\>

Constructs a swap datum object based on the provided swap arguments.
The function initializes a new datum with specific properties such as the pool ident,
order addresses, scooper fee, and swap direction schema. It then converts this datum
into an inline format and computes its hash using [Blaze.BlazeHelper](Blaze.BlazeHelper.md). The function returns an
object containing the hash of the inline datum, the inline datum itself, and the original
datum schema.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`ISwapArguments`](../interfaces/Core.ISwapArguments.md) | The swap arguments required to build the swap datum. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `ident`: `string` ; `orderAddresses`: \{ `alternate`: ``null`` \| `string` ; `destination`: \{ `credentials`: \{ `paymentKey`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  } ; `stakingKey`: ``null`` \| \{ `value`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  }  }  } ; `datum`: ``null`` \| `string`  }  } ; `scooperFee`: `bigint` ; `swapDirection`: \{ `amount`: `bigint` ; `minReceivable`: ``null`` \| `bigint` ; `suppliedAssetIndex`: ``"A"`` \| ``"B"``  }  }\>

An object containing the hash of the inline datum, the inline datum itself,
                              and the schema of the original datum.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Blaze.V1.class.ts:62](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Blaze.V1.class.ts#L62)

___

### buildWithdrawDatum

▸ **buildWithdrawDatum**(`params`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `WithdrawAsset`: ``"VOID"`` \| \{ `LPToken`: \{ `value`: `bigint`  }  } ; `ident`: `string` ; `orderAddresses`: \{ `alternate`: ``null`` \| `string` ; `destination`: \{ `credentials`: \{ `paymentKey`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  } ; `stakingKey`: ``null`` \| \{ `value`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  }  }  } ; `datum`: ``null`` \| `string`  }  } ; `scooperFee`: `bigint`  }\>

Generates a withdraw datum object from the specified withdraw arguments. This function constructs
a new datum with defined attributes such as the pool ident, order addresses, scooper fee, and
the schema for the supplied LP (Liquidity Provider) asset for withdrawal. After constructing the datum,
it is converted into an inline format, and its hash is calculated using [Blaze.BlazeHelper](Blaze.BlazeHelper.md). The function returns
an object containing the hash of the inline datum, the inline datum itself, and the schema of the original
datum, which are crucial for executing the withdrawal operation within a transactional framework.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`IWithdrawArguments`](../interfaces/Core.IWithdrawArguments.md) | The arguments necessary to construct the withdraw datum. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `WithdrawAsset`: ``"VOID"`` \| \{ `LPToken`: \{ `value`: `bigint`  }  } ; `ident`: `string` ; `orderAddresses`: \{ `alternate`: ``null`` \| `string` ; `destination`: \{ `credentials`: \{ `paymentKey`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  } ; `stakingKey`: ``null`` \| \{ `value`: \{ `KeyHash`: \{ `value`: `string`  }  } \| \{ `ScriptHash`: \{ `value`: `string`  }  }  }  } ; `datum`: ``null`` \| `string`  }  } ; `scooperFee`: `bigint`  }\>

An object comprising the hash of the inline datum, the inline datum itself,
                              and the schema of the original datum, facilitating the withdrawal operation's integration into the transactional process.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Blaze.V1.class.ts:141](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Blaze.V1.class.ts#L141)
