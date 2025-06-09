[**@sundaeswap/core**](../README.md) • **Docs**

***

# Core

The primary types and exports for interacting with the core
SundaeSwap protocol.

## Index

### Enumerations

- [EContractVersion](enumerations/EContractVersion.md)
- [EDatumType](enumerations/EDatumType.md)
- [EDestinationType](enumerations/EDestinationType.md)
- [EPoolCoin](enumerations/EPoolCoin.md)
- [EPoolSearchType](enumerations/EPoolSearchType.md)
- [ESwapType](enumerations/ESwapType.md)

### Classes

- [BlazeHelper](classes/BlazeHelper.md)
- [CancelConfig](classes/CancelConfig.md)
- [Config](classes/Config.md)
- [DatumBuilderAbstract](classes/DatumBuilderAbstract.md)
- [DatumBuilderV1](classes/DatumBuilderV1.md)
- [DatumBuilderV3](classes/DatumBuilderV3.md)
- [DepositConfig](classes/DepositConfig.md)
- [OrderConfig](classes/OrderConfig.md)
- [SundaeSDK](classes/SundaeSDK.md)
- [SwapConfig](classes/SwapConfig.md)
- [TxBuilderV1](classes/TxBuilderV1.md)
- [TxBuilderV3](classes/TxBuilderV3.md)
- [WithdrawConfig](classes/WithdrawConfig.md)
- [ZapConfig](classes/ZapConfig.md)

### Interfaces

- [IArguments](interfaces/IArguments.md)
- [IBaseConfig](interfaces/IBaseConfig.md)
- [ICancelConfigArgs](interfaces/ICancelConfigArgs.md)
- [IComposedTx](interfaces/IComposedTx.md)
- [ICurrentFeeFromDecayingFeeArgs](interfaces/ICurrentFeeFromDecayingFeeArgs.md)
- [IDatumBuilderBaseV3Args](interfaces/IDatumBuilderBaseV3Args.md)
- [IDatumBuilderDepositV3Args](interfaces/IDatumBuilderDepositV3Args.md)
- [IDatumBuilderMintPoolV3Args](interfaces/IDatumBuilderMintPoolV3Args.md)
- [IDatumBuilderPoolMintRedeemerV3Args](interfaces/IDatumBuilderPoolMintRedeemerV3Args.md)
- [IDatumBuilderStrategyV3Args](interfaces/IDatumBuilderStrategyV3Args.md)
- [IDatumBuilderSwapV3Args](interfaces/IDatumBuilderSwapV3Args.md)
- [IDatumBuilderWithdrawV3Args](interfaces/IDatumBuilderWithdrawV3Args.md)
- [IDepositArguments](interfaces/IDepositArguments.md)
- [IDepositConfigArgs](interfaces/IDepositConfigArgs.md)
- [ILimitSwap](interfaces/ILimitSwap.md)
- [IMarketSwap](interfaces/IMarketSwap.md)
- [IMigrateLiquidityConfig](interfaces/IMigrateLiquidityConfig.md)
- [IMigrateYieldFarmingLiquidityConfig](interfaces/IMigrateYieldFarmingLiquidityConfig.md)
- [IMintV3PoolConfigArgs](interfaces/IMintV3PoolConfigArgs.md)
- [IOrderConfigArgs](interfaces/IOrderConfigArgs.md)
- [IOrderRouteSwapArgs](interfaces/IOrderRouteSwapArgs.md)
- [IPoolByIdentQuery](interfaces/IPoolByIdentQuery.md)
- [IPoolByPairQuery](interfaces/IPoolByPairQuery.md)
- [IPoolData](interfaces/IPoolData.md)
- [IPoolDataAsset](interfaces/IPoolDataAsset.md)
- [IPoolDate](interfaces/IPoolDate.md)
- [IPoolQueryLegacy](interfaces/IPoolQueryLegacy.md)
- [IStrategyConfigArgs](interfaces/IStrategyConfigArgs.md)
- [ISundaeProtocolParams](interfaces/ISundaeProtocolParams.md)
- [ISundaeProtocolParamsFull](interfaces/ISundaeProtocolParamsFull.md)
- [ISundaeProtocolReference](interfaces/ISundaeProtocolReference.md)
- [ISundaeProtocolValidator](interfaces/ISundaeProtocolValidator.md)
- [ISundaeProtocolValidatorFull](interfaces/ISundaeProtocolValidatorFull.md)
- [ISundaeSDKOptions](interfaces/ISundaeSDKOptions.md)
- [ISwapArguments](interfaces/ISwapArguments.md)
- [ISwapConfigArgs](interfaces/ISwapConfigArgs.md)
- [ITxBuilderCompleteTxArgs](interfaces/ITxBuilderCompleteTxArgs.md)
- [ITxBuilderFees](interfaces/ITxBuilderFees.md)
- [ITxBuilderReferralFee](interfaces/ITxBuilderReferralFee.md)
- [ITxBuilderV1BlazeParams](interfaces/ITxBuilderV1BlazeParams.md)
- [IWithdrawArguments](interfaces/IWithdrawArguments.md)
- [IWithdrawConfigArgs](interfaces/IWithdrawConfigArgs.md)
- [IZapArguments](interfaces/IZapArguments.md)
- [IZapConfigArgs](interfaces/IZapConfigArgs.md)

### Type Aliases

- [TCancelerAddress](type-aliases/TCancelerAddress.md)
- [TDatum](type-aliases/TDatum.md)
- [TDatumHash](type-aliases/TDatumHash.md)
- [TDatumInline](type-aliases/TDatumInline.md)
- [TDatumNone](type-aliases/TDatumNone.md)
- [TDatumResult](type-aliases/TDatumResult.md)
- [TDepositMixed](type-aliases/TDepositMixed.md)
- [TDepositSingle](type-aliases/TDepositSingle.md)
- [TDestination](type-aliases/TDestination.md)
- [TDestinationAddress](type-aliases/TDestinationAddress.md)
- [TDestinationFixed](type-aliases/TDestinationFixed.md)
- [TDestinationSelf](type-aliases/TDestinationSelf.md)
- [TFee](type-aliases/TFee.md)
- [TIdent](type-aliases/TIdent.md)
- [TOrderAddressesArgs](type-aliases/TOrderAddressesArgs.md)
- [TPubKeyHash](type-aliases/TPubKeyHash.md)
- [TSwap](type-aliases/TSwap.md)
- [TSwapType](type-aliases/TSwapType.md)
- [TUTXO](type-aliases/TUTXO.md)
- [TWithdraw](type-aliases/TWithdraw.md)

### Variables

- [ADA\_ASSET\_ID](variables/ADA_ASSET_ID.md)
- [MIN\_ASSET\_LENGTH](variables/MIN_ASSET_LENGTH.md)
- [V1\_MAX\_POOL\_IDENT\_LENGTH](variables/V1_MAX_POOL_IDENT_LENGTH.md)
- [V3\_POOL\_IDENT\_LENGTH](variables/V3_POOL_IDENT_LENGTH.md)

### Exported TxBuilders

- [TxBuilderAbstractV1](classes/TxBuilderAbstractV1.md)
- [TxBuilderAbstractV3](classes/TxBuilderAbstractV3.md)

### Extension Builders

- [QueryProvider](classes/QueryProvider.md)

### Extensions

- [QueryProviderSundaeSwap](classes/QueryProviderSundaeSwap.md)
- [QueryProviderSundaeSwapLegacy](classes/QueryProviderSundaeSwapLegacy.md)

### Utility Types

- [TSupportedNetworks](type-aliases/TSupportedNetworks.md)
