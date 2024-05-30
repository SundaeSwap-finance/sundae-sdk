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

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:91](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L91)

___

### INVALID\_POOL\_IDENT

▪ `Static` **INVALID\_POOL\_IDENT**: `string` = `"You supplied a pool ident of an invalid length! The will prevent the scooper from processing this order."`

The error to throw when the pool ident does not match V1 constraints.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:93](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L93)

## Methods

### buildDepositDatum

▸ **buildDepositDatum**(`args`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: `Data`  } ; `extension`: `Data` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `Address`: \{ `hex`: `string`  }  } \| \{ `AllOf`: \{ `scripts`: `Data`  }  } \| \{ `AnyOf`: \{ `scripts`: `Data`  }  } \| \{ `AtLeast`: \{ `required`: `bigint` ; `scripts`: `Data`  }  } \| \{ `Before`: \{ `posix`: `bigint`  }  } \| \{ `After`: \{ `posix`: `bigint`  }  } \| \{ `Script`: \{ `hex`: `string`  }  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

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

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: `Data`  } ; `extension`: `Data` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `Address`: \{ `hex`: `string`  }  } \| \{ `AllOf`: \{ `scripts`: `Data`  }  } \| \{ `AnyOf`: \{ `scripts`: `Data`  }  } \| \{ `AtLeast`: \{ `required`: `bigint` ; `scripts`: `Data`  }  } \| \{ `Before`: \{ `posix`: `bigint`  }  } \| \{ `After`: \{ `posix`: `bigint`  }  } \| \{ `Script`: \{ `hex`: `string`  }  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

An object comprising the hash of the inline datum, the inline datum itself,
                                             and the schema of the original deposit datum, essential for the execution of the deposit operation.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:158](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L158)

___

### buildMintPoolDatum

▸ **buildMintPoolDatum**(`params`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `askFeePer10Thousand`: `bigint` ; `assets`: [[`string`, `string`], [`string`, `string`]] ; `bidFeePer10Thousand`: `bigint` ; `circulatingLp`: `bigint` ; `feeManager`: ``null`` \| \{ `Address`: \{ `hex`: `string`  }  } \| \{ `AllOf`: \{ `scripts`: `Data`  }  } \| \{ `AnyOf`: \{ `scripts`: `Data`  }  } \| \{ `AtLeast`: \{ `required`: `bigint` ; `scripts`: `Data`  }  } \| \{ `Before`: \{ `posix`: `bigint`  }  } \| \{ `After`: \{ `posix`: `bigint`  }  } \| \{ `Script`: \{ `hex`: `string`  }  } ; `identifier`: `string` ; `marketOpen`: `bigint` ; `protocolFee`: `bigint`  }\>

Creates a new pool datum for minting a the pool. This is attached to the assets that are sent
to the pool minting contract. See [Lucid.TxBuilderLucidV3](Lucid.TxBuilderLucidV3.md) for more details.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`IDatumBuilderMintPoolV3Args`](../interfaces/Lucid.IDatumBuilderMintPoolV3Args.md) | The arguments for building a pool mint datum. - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway. - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway. - fee: The pool fee represented as per thousand. - marketOpen: The POSIX timestamp for when pool trades should start executing. - protocolFee: The fee gathered for the protocol treasury. - seedUtxo: The UTXO to use as the seed, which generates asset names and the pool ident. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `askFeePer10Thousand`: `bigint` ; `assets`: [[`string`, `string`], [`string`, `string`]] ; `bidFeePer10Thousand`: `bigint` ; `circulatingLp`: `bigint` ; `feeManager`: ``null`` \| \{ `Address`: \{ `hex`: `string`  }  } \| \{ `AllOf`: \{ `scripts`: `Data`  }  } \| \{ `AnyOf`: \{ `scripts`: `Data`  }  } \| \{ `AtLeast`: \{ `required`: `bigint` ; `scripts`: `Data`  }  } \| \{ `Before`: \{ `posix`: `bigint`  }  } \| \{ `After`: \{ `posix`: `bigint`  }  } \| \{ `Script`: \{ `hex`: `string`  }  } ; `identifier`: `string` ; `marketOpen`: `bigint` ; `protocolFee`: `bigint`  }\>

An object containing the hash of the inline datum, the inline datum itself,
                                             and the schema of the original pool mint datum, crucial for the execution
                                             of the minting pool operation.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:249](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L249)

___

### buildPoolMintRedeemerDatum

▸ **buildPoolMintRedeemerDatum**(`param`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `MintLP`: \{ `identifier`: `string`  }  } \| \{ `CreatePool`: \{ `assets`: [[`string`, `string`], [`string`, `string`]] ; `metadataOutput`: `bigint` ; `poolOutput`: `bigint`  }  }\>

Creates a redeemer datum for minting a new pool. This is attached to the new assets that
creating a new pool mints on the blockchain. See [Lucid.TxBuilderLucidV3](Lucid.TxBuilderLucidV3.md) for more
details.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | [`IDatumBuilderPoolMintRedeemerV3Args`](../interfaces/Lucid.IDatumBuilderPoolMintRedeemerV3Args.md) | The assets being supplied to the new pool. - assetA: The amount and metadata of assetA. This is a bit misleading because the assets are lexicographically ordered anyway. - assetB: The amount and metadata of assetB. This is a bit misleading because the assets are lexicographically ordered anyway. |

#### Returns

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `MintLP`: \{ `identifier`: `string`  }  } \| \{ `CreatePool`: \{ `assets`: [[`string`, `string`], [`string`, `string`]] ; `metadataOutput`: `bigint` ; `poolOutput`: `bigint`  }  }\>

An object containing the hash of the inline datum, the inline datum itself,
                                             and the schema of the original pool mint redeemer datum, crucial for the execution
                                             of the minting pool operation.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:297](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L297)

___

### buildSwapDatum

▸ **buildSwapDatum**(`args`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: `Data`  } ; `extension`: `Data` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `Address`: \{ `hex`: `string`  }  } \| \{ `AllOf`: \{ `scripts`: `Data`  }  } \| \{ `AnyOf`: \{ `scripts`: `Data`  }  } \| \{ `AtLeast`: \{ `required`: `bigint` ; `scripts`: `Data`  }  } \| \{ `Before`: \{ `posix`: `bigint`  }  } \| \{ `After`: \{ `posix`: `bigint`  }  } \| \{ `Script`: \{ `hex`: `string`  }  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

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

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: `Data`  } ; `extension`: `Data` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `Address`: \{ `hex`: `string`  }  } \| \{ `AllOf`: \{ `scripts`: `Data`  }  } \| \{ `AnyOf`: \{ `scripts`: `Data`  }  } \| \{ `AtLeast`: \{ `required`: `bigint` ; `scripts`: `Data`  }  } \| \{ `Before`: \{ `posix`: `bigint`  }  } \| \{ `After`: \{ `posix`: `bigint`  }  } \| \{ `Script`: \{ `hex`: `string`  }  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

An object containing the hash of the inline datum, the inline datum itself,
                                             and the schema of the original swap datum, essential for the execution of the swap operation.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:114](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L114)

___

### buildWithdrawDatum

▸ **buildWithdrawDatum**(`args`): [`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: `Data`  } ; `extension`: `Data` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `Address`: \{ `hex`: `string`  }  } \| \{ `AllOf`: \{ `scripts`: `Data`  }  } \| \{ `AnyOf`: \{ `scripts`: `Data`  }  } \| \{ `AtLeast`: \{ `required`: `bigint` ; `scripts`: `Data`  }  } \| \{ `Before`: \{ `posix`: `bigint`  }  } \| \{ `After`: \{ `posix`: `bigint`  }  } \| \{ `Script`: \{ `hex`: `string`  }  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

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

[`TDatumResult`](../modules/Core.md#tdatumresult)\<\{ `destination`: \{ `address`: \{ `paymentCredential`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  } ; `stakeCredential`: ``null`` \| \{ `keyHash`: \{ `VKeyCredential`: \{ `bytes`: `string`  }  } \| \{ `SCredential`: \{ `bytes`: `string`  }  }  }  } ; `datum`: `Data`  } ; `extension`: `Data` ; `order`: \{ `Strategies`: ``null`` \| ``"TODO"``  } \| \{ `Swap`: \{ `minReceived`: [`string`, `string`, `bigint`] ; `offer`: [`string`, `string`, `bigint`]  }  } \| \{ `Deposit`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } \| \{ `Withdrawal`: \{ `amount`: [`string`, `string`, `bigint`]  }  } \| \{ `Donation`: \{ `assets`: [[`string`, `string`, `bigint`], [`string`, `string`, `bigint`]]  }  } ; `owner`: \{ `Address`: \{ `hex`: `string`  }  } \| \{ `AllOf`: \{ `scripts`: `Data`  }  } \| \{ `AnyOf`: \{ `scripts`: `Data`  }  } \| \{ `AtLeast`: \{ `required`: `bigint` ; `scripts`: `Data`  }  } \| \{ `Before`: \{ `posix`: `bigint`  }  } \| \{ `After`: \{ `posix`: `bigint`  }  } \| \{ `Script`: \{ `hex`: `string`  }  } ; `poolIdent`: ``null`` \| `string` ; `scooperFee`: `bigint`  }\>

An object containing the hash of the inline datum, the inline datum itself,
                                             and the schema of the original withdraw datum, crucial for the execution of the withdrawal operation.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:203](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L203)

___

### computePoolId

▸ **computePoolId**(`seed`): `string`

Computes the pool ID based on the provided UTxO being spent.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `seed` | `UTxO` | The UTxO txHash and index. |

#### Returns

`string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:520](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L520)

___

### computePoolLqName

▸ **computePoolLqName**(`poolId`): `string`

Computes the pool liquidity name.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `poolId` | `string` | The hex encoded pool ident. |

#### Returns

`string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:496](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L496)

___

### computePoolNftName

▸ **computePoolNftName**(`poolId`): `string`

Computes the pool NFT name.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `poolId` | `string` | The hex encoded pool ident. |

#### Returns

`string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:484](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L484)

___

### computePoolRefName

▸ **computePoolRefName**(`poolId`): `string`

Computes the pool reference name.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `poolId` | `string` | The hex encoded pool ident. |

#### Returns

`string`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:508](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L508)

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

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:551](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L551)

___

### getSignerKeyFromDatum

▸ **getSignerKeyFromDatum**(`datum`): `undefined` \| `string`

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

`undefined` \| `string`

The signing key associated with the owner, extracted from the datum. This key is used
         for transaction validation and authorization purposes.

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts:590](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Lucid.V3.class.ts#L590)
