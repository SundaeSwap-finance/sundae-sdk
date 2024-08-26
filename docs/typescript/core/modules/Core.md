# Module: Core

## Enumerations

- [EContractVersion](../enums/Core.EContractVersion.md)
- [EDatumType](../enums/Core.EDatumType.md)
- [EPoolCoin](../enums/Core.EPoolCoin.md)
- [EPoolSearchType](../enums/Core.EPoolSearchType.md)
- [ESwapType](../enums/Core.ESwapType.md)
- [ETxBuilderType](../enums/Core.ETxBuilderType.md)

## Classes

- [CancelConfig](../classes/Core.CancelConfig.md)
- [Config](../classes/Core.Config.md)
- [DatumBuilder](../classes/Core.DatumBuilder.md)
- [DepositConfig](../classes/Core.DepositConfig.md)
- [OrderConfig](../classes/Core.OrderConfig.md)
- [SundaeSDK](../classes/Core.SundaeSDK.md)
- [SwapConfig](../classes/Core.SwapConfig.md)
- [WithdrawConfig](../classes/Core.WithdrawConfig.md)
- [ZapConfig](../classes/Core.ZapConfig.md)

## Interfaces

- [IArguments](../interfaces/Core.IArguments.md)
- [IBaseConfig](../interfaces/Core.IBaseConfig.md)
- [IBlazeBuilder](../interfaces/Core.IBlazeBuilder.md)
- [ICancelConfigArgs](../interfaces/Core.ICancelConfigArgs.md)
- [IComposedTx](../interfaces/Core.IComposedTx.md)
- [ICurrentFeeFromDecayingFeeArgs](../interfaces/Core.ICurrentFeeFromDecayingFeeArgs.md)
- [IDepositArguments](../interfaces/Core.IDepositArguments.md)
- [IDepositConfigArgs](../interfaces/Core.IDepositConfigArgs.md)
- [ILimitSwap](../interfaces/Core.ILimitSwap.md)
- [ILucidBuilder](../interfaces/Core.ILucidBuilder.md)
- [IMarketSwap](../interfaces/Core.IMarketSwap.md)
- [IMigrateLiquidityConfig](../interfaces/Core.IMigrateLiquidityConfig.md)
- [IMigrateYieldFarmingLiquidityConfig](../interfaces/Core.IMigrateYieldFarmingLiquidityConfig.md)
- [IMintV3PoolConfigArgs](../interfaces/Core.IMintV3PoolConfigArgs.md)
- [IOrderConfigArgs](../interfaces/Core.IOrderConfigArgs.md)
- [IOrderRouteSwapArgs](../interfaces/Core.IOrderRouteSwapArgs.md)
- [IPoolByIdentQuery](../interfaces/Core.IPoolByIdentQuery.md)
- [IPoolByPairQuery](../interfaces/Core.IPoolByPairQuery.md)
- [IPoolData](../interfaces/Core.IPoolData.md)
- [IPoolDataAsset](../interfaces/Core.IPoolDataAsset.md)
- [IPoolDate](../interfaces/Core.IPoolDate.md)
- [ISundaeProtocolParams](../interfaces/Core.ISundaeProtocolParams.md)
- [ISundaeProtocolParamsFull](../interfaces/Core.ISundaeProtocolParamsFull.md)
- [ISundaeProtocolReference](../interfaces/Core.ISundaeProtocolReference.md)
- [ISundaeProtocolValidator](../interfaces/Core.ISundaeProtocolValidator.md)
- [ISundaeProtocolValidatorFull](../interfaces/Core.ISundaeProtocolValidatorFull.md)
- [ISundaeSDKOptions](../interfaces/Core.ISundaeSDKOptions.md)
- [ISwapArguments](../interfaces/Core.ISwapArguments.md)
- [ISwapConfigArgs](../interfaces/Core.ISwapConfigArgs.md)
- [ITxBuilderFees](../interfaces/Core.ITxBuilderFees.md)
- [ITxBuilderReferralFee](../interfaces/Core.ITxBuilderReferralFee.md)
- [IWithdrawArguments](../interfaces/Core.IWithdrawArguments.md)
- [IWithdrawConfigArgs](../interfaces/Core.IWithdrawConfigArgs.md)
- [IZapArguments](../interfaces/Core.IZapArguments.md)
- [IZapConfigArgs](../interfaces/Core.IZapConfigArgs.md)

## Exported TxBuilders

- [TxBuilderV1](../classes/Core.TxBuilderV1.md)
- [TxBuilderV3](../classes/Core.TxBuilderV3.md)

## Extension Builders

- [QueryProvider](../classes/Core.QueryProvider.md)

## Extensions

- [QueryProviderSundaeSwap](../classes/Core.QueryProviderSundaeSwap.md)
- [QueryProviderSundaeSwapLegacy](../classes/Core.QueryProviderSundaeSwapLegacy.md)

## Type Aliases

### TCancelerAddress

Ƭ **TCancelerAddress**: `string`

The optional alternate address that can cancel the Escrow order. This is
needed because a [TDestinationAddress](Core.md#tdestinationaddress) can be a Script Address. This
is useful to chain swaps with other protocols if desired, while still allowing
a consistently authorized alternate to cancel the Escrow.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:89](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L89)

___

### TDatum

Ƭ **TDatum**: [`TDatumNone`](Core.md#tdatumnone) \| [`TDatumHash`](Core.md#tdatumhash) \| [`TDatumInline`](Core.md#tdatuminline)

A union to define all possible datum types.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:73](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L73)

___

### TDatumHash

Ƭ **TDatumHash**: `Object`

The DatumHash type is use to describe a datum hash.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`HASH`](../enums/Core.EDatumType.md#hash) |
| `value` | `string` |

#### Defined in

[packages/core/src/@types/datumbuilder.ts:48](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L48)

___

### TDatumInline

Ƭ **TDatumInline**: `Object`

The DatumInline type is used to describe an inline datum.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`INLINE`](../enums/Core.EDatumType.md#inline) |
| `value` | `string` |

#### Defined in

[packages/core/src/@types/datumbuilder.ts:56](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L56)

___

### TDatumNone

Ƭ **TDatumNone**: `Object`

The DatumNone type is used to describe a null datum.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`NONE`](../enums/Core.EDatumType.md#none) |

#### Defined in

[packages/core/src/@types/datumbuilder.ts:41](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L41)

___

### TDatumResult

Ƭ **TDatumResult**\<`Schema`\>: `Object`

The DatumResult for a DatumBuilder method.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Schema` | `unknown` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `hash` | `string` |
| `inline` | `string` |
| `schema` | `Schema` |

#### Defined in

[packages/core/src/@types/datumbuilder.ts:64](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L64)

___

### TDepositMixed

Ƭ **TDepositMixed**: `Object`

The CoinA and CoinB asset pair of a pool at the desired ratio. If the ratio
shifts after the order is placed but before it is scooped, the LP tokens along with
the remaining asset gets sent to the [TDestinationAddress](Core.md#tdestinationaddress)

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CoinAAmount` | `AssetAmount` |
| `CoinBAmount` | `AssetAmount` |

#### Defined in

[packages/core/src/@types/datumbuilder.ts:128](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L128)

___

### TDepositSingle

Ƭ **TDepositSingle**: `Object`

A single asset deposit where 50% of the provided Coin is swapped at the provided minimum
receivable amount to satisfy a pool's CoinA/CoinB requirements.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CoinAmount` | `AssetAmount` |
| `ZapDirection` | [`EPoolCoin`](../enums/Core.EPoolCoin.md) |

#### Defined in

[packages/core/src/@types/datumbuilder.ts:118](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L118)

___

### TDestinationAddress

Ƭ **TDestinationAddress**: `Object`

Defines the destination address of a swap along with an optional datum hash to attach.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `datum` | [`TDatum`](Core.md#tdatum) |

#### Defined in

[packages/core/src/@types/datumbuilder.ts:78](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L78)

___

### TFee

Ƭ **TFee**: [`bigint`, `bigint`]

The fee structure, denoted as an array of numerator and denominator.

#### Defined in

[packages/core/src/@types/queryprovider.ts:62](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L62)

___

### TIdent

Ƭ **TIdent**: `string`

The unique identifier of a pool, defined as a string.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:6](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L6)

___

### TOrderAddressesArgs

Ƭ **TOrderAddressesArgs**: `Object`

An Escrow address defines the destination address and an optional PubKeyHash

#### Type declaration

| Name | Type |
| :------ | :------ |
| `AlternateAddress?` | [`TCancelerAddress`](Core.md#tcanceleraddress) |
| `DestinationAddress` | [`TDestinationAddress`](Core.md#tdestinationaddress) |

#### Defined in

[packages/core/src/@types/datumbuilder.ts:94](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L94)

___

### TPubKeyHash

Ƭ **TPubKeyHash**: `string`

A hex-encoded public key hash of an address.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L19)

___

### TSwap

Ƭ **TSwap**: `Object`

The swap direction of a coin pair, and a minimum receivable amount
which acts as the limit price of a swap.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `MinimumReceivable?` | `AssetAmount` |
| `SuppliedCoin` | [`EPoolCoin`](../enums/Core.EPoolCoin.md) |

#### Defined in

[packages/core/src/@types/datumbuilder.ts:103](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L103)

___

### TSwapType

Ƭ **TSwapType**: [`IMarketSwap`](../interfaces/Core.IMarketSwap.md) \| [`ILimitSwap`](../interfaces/Core.ILimitSwap.md)

A union type to represent all possible swap types.

#### Defined in

[packages/core/src/@types/configs.ts:57](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/configs.ts#L57)

___

### TUTXO

Ƭ **TUTXO**: `Object`

The structure for a UTXO.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `hash` | `string` |
| `index` | `number` |

#### Defined in

[packages/core/src/@types/datumbuilder.ts:11](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L11)

___

### TWalletBuilder

Ƭ **TWalletBuilder**: [`ILucidBuilder`](../interfaces/Core.ILucidBuilder.md) \| [`IBlazeBuilder`](../interfaces/Core.IBlazeBuilder.md)

The union type to hold all possible builder types.

#### Defined in

[packages/core/src/@types/txbuilders.ts:85](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/txbuilders.ts#L85)

___

### TWithdraw

Ƭ **TWithdraw**: `AssetAmount`

A withdraw defines the amount of LP tokens a holder wishes to burn in exchange
for their provided assets.

#### Defined in

[packages/core/src/@types/datumbuilder.ts:112](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/datumbuilder.ts#L112)

## Variables

### ADA\_ASSET\_ID

• `Const` **ADA\_ASSET\_ID**: ``"ada.lovelace"``

The AssetID for the Cardano native token, $ADA.

#### Defined in

[packages/core/src/constants.ts:24](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/constants.ts#L24)

___

### MIN\_ASSET\_LENGTH

• `Const` **MIN\_ASSET\_LENGTH**: ``56``

The minimum asset length is determined by the hex-encoded byte string length of a Policy ID.
This condition is ignored for the Cardano $ADA asset, which has a Policy ID and Asset Name of "".

#### Defined in

[packages/core/src/constants.ts:5](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/constants.ts#L5)

___

### V1\_MAX\_POOL\_IDENT\_LENGTH

• `Const` **V1\_MAX\_POOL\_IDENT\_LENGTH**: ``10``

The max pool ident length for V1 pools. This isn't a technicality, but
rather a reasonable threshold by which we can test a pool ident.

#### Defined in

[packages/core/src/constants.ts:19](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/constants.ts#L19)

___

### V3\_POOL\_IDENT\_LENGTH

• `Const` **V3\_POOL\_IDENT\_LENGTH**: ``56``

For v3 pools, the pool identifier will always be 28 bytes (56 characters) long.
It is impossible for the v1 pool ident to be 28 bytes as:
 - There would need to be around 26959946667150639794667015087019630673637144422540572481103610249216 pools available in order for a pool ident to reach 28 bytes
 - There's not enough ADA in existence to cover the transaction fees, or the minUTXO cost, for creating that many pools

#### Defined in

[packages/core/src/constants.ts:13](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/constants.ts#L13)

## Utility Types

### TSupportedNetworks

Ƭ **TSupportedNetworks**: ``"mainnet"`` \| ``"preview"``

A type constant used for determining valid Cardano Network values.

#### Defined in

[packages/core/src/@types/utilities.ts:8](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L8)
