# Class: DatumBuilderLucidV3

[Lucid](../modules/Lucid.md).DatumBuilderLucidV3

The Lucid implementation of a [Core.DatumBuilder](Core.DatumBuilder.md). This is useful
if you would rather just build valid CBOR strings for just the datum
portion of a valid SundaeSwap transaction.

## Implements

- [`DatumBuilder`](Core.DatumBuilder.md)

## Properties

### network

• **network**: [`TSupportedNetworks`](../modules/Core.md#tsupportednetworks)

The current network id.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:66](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L66)

___

### INVALID\_POOL\_IDENT

▪ `Static` **INVALID\_POOL\_IDENT**: `string` = `"You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order."`

The error to throw when the pool ident does not match V1 constraints.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:68](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L68)

## Methods

### buildDepositDatum

▸ **buildDepositDatum**(`args`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: ``"NoDatum"`` \| \{ `DatumHash`: [`string`]  } \| \{ `InlineDatum`: [`Data`]  }  } ; `extension`: ``"NoExtension"`` \| ``"Foo"`` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `owner`: `string`  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

Constructs a deposit datum object for V3 deposits, based on the specified arguments. This function
creates a comprehensive deposit datum structure, which includes the destination address, the pool ident,
owner information, scooper fee, and the deposit order details. The deposit order specifies the assets involved
in the deposit. The constructed datum is then converted to an inline format, suitable for embedding within
transactions, and its hash is calculated. The function returns an object containing the hash of the inline datum,
the inline datum itself, and the schema of the original datum, which are key for facilitating the deposit operation
within a transactional framework.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IDatumBuilderDepositV3Args`](../interfaces/Lucid.IDatumBuilderDepositV3Args.md) | The deposit arguments for constructing the V3 deposit datum. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: ``"NoDatum"`` \| \{ `DatumHash`: [`string`]  } \| \{ `InlineDatum`: [`Data`]  }  } ; `extension`: ``"NoExtension"`` \| ``"Foo"`` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `owner`: `string`  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

An object comprising the hash of the inline datum, the inline datum itself,
                                             and the schema of the original deposit datum, essential for the execution of the deposit operation.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:131](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L131)

___

### buildSwapDatum

▸ **buildSwapDatum**(`args`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: ``"NoDatum"`` \| \{ `DatumHash`: [`string`]  } \| \{ `InlineDatum`: [`Data`]  }  } ; `extension`: ``"NoExtension"`` \| ``"Foo"`` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `owner`: `string`  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

Constructs a swap datum object tailored for V3 swaps, based on the provided arguments. This function
assembles a detailed swap datum structure, which includes the pool ident, destination address, owner information,
scooper fee, and the swap order details. The swap order encapsulates the offered asset and the minimum received
asset requirements. The constructed datum is then converted to an inline format suitable for transaction embedding,
and its hash is computed. The function returns an object containing the hash, the inline datum, and the original
datum schema, facilitating the swap operation within a transactional context.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IDatumBuilderSwapV3Args`](../interfaces/Lucid.IDatumBuilderSwapV3Args.md) | The swap arguments for constructing the V3 swap datum. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: ``"NoDatum"`` \| \{ `DatumHash`: [`string`]  } \| \{ `InlineDatum`: [`Data`]  }  } ; `extension`: ``"NoExtension"`` \| ``"Foo"`` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `owner`: `string`  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

An object containing the hash of the inline datum, the inline datum itself,
                                             and the schema of the original swap datum, essential for the execution of the swap operation.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:87](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L87)

___

### buildWithdrawDatum

▸ **buildWithdrawDatum**(`args`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: ``"NoDatum"`` \| \{ `DatumHash`: [`string`]  } \| \{ `InlineDatum`: [`Data`]  }  } ; `extension`: ``"NoExtension"`` \| ``"Foo"`` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `owner`: `string`  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

Creates a withdraw datum object for V3 withdrawals, utilizing the provided arguments. This function
assembles a detailed withdraw datum structure, which encompasses the destination address, pool ident,
owner information, scooper fee, and the withdrawal order details. The withdrawal order defines the amount
of LP (Liquidity Provider) tokens involved in the withdrawal. Once the datum is constructed, it is converted
into an inline format, suitable for transaction embedding, and its hash is calculated. The function returns
an object containing the hash of the inline datum, the inline datum itself, and the schema of the original
datum, facilitating the withdrawal operation within a transactional context.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | [`IDatumBuilderWithdrawV3Args`](../interfaces/Lucid.IDatumBuilderWithdrawV3Args.md) | The withdrawal arguments for constructing the V3 withdraw datum. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: ``"NoDatum"`` \| \{ `DatumHash`: [`string`]  } \| \{ `InlineDatum`: [`Data`]  }  } ; `extension`: ``"NoExtension"`` \| ``"Foo"`` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `owner`: `string`  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

An object containing the hash of the inline datum, the inline datum itself,
                                             and the schema of the original withdraw datum, crucial for the execution of the withdrawal operation.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:178](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L178)

___

### getDestinationAddressesFromDatum

▸ **getDestinationAddressesFromDatum**(`datum`): `Object`

Extracts the staking and payment key hashes from a given datum's destination address. This static method
parses the provided datum to retrieve the destination address and then extracts the staking key hash and payment
key hash, if they exist. The method supports addresses that may include both staking and payment credentials,
handling each accordingly. It returns an object containing the staking key hash and payment key hash, which can
be used for further processing or validation within the system.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `datum` | `string` | The serialized datum string from which the destination address and its credentials are to be extracted. |

#### Returns

`Object`

An object containing the staking and
         payment key hashes extracted from the destination address within the datum. Each key hash is returned as a string
         if present, or `undefined` if the respective credential is not found in the address.

| Name | Type |
| :------ | :------ |
| `paymentKeyHash` | `undefined` \| `string` |
| `stakingKeyHash` | `undefined` \| `string` |

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:359](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L359)

___

### getSignerKeyFromDatum

▸ **getSignerKeyFromDatum**(`datum`): `string`

Retrieves the owner's signing key from a given datum. This static method parses the provided
datum to extract the owner's information, specifically focusing on the signing key associated
with the owner. This key is crucial for validating ownership and authorizing transactions within
the system. The method is designed to work with datums structured according to V3Types.OrderDatum,
ensuring compatibility with specific transaction formats.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `datum` | `string` | The serialized datum string from which the owner's signing key is to be extracted. |

#### Returns

`string`

The signing key associated with the owner, extracted from the datum. This key is used
         for transaction validation and authorization purposes.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:398](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L398)
