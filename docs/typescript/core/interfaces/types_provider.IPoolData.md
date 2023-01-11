[@sundae/sdk-core](../README.md) / [Exports](../modules.md) / [@types/provider](../modules/types_provider.md) / IPoolData

# Interface: IPoolData

[@types/provider](../modules/types_provider.md).IPoolData

Pool data that is returned from [findPoolData](types_provider.IProviderClass.md#findpooldata).

## Properties

### assetA

• **assetA**: [`IPoolDataAsset`](types_provider.IPoolDataAsset.md)

Asset data for the pool pair, Asset A

#### Defined in

@types/provider.d.ts:73

___

### assetB

• **assetB**: [`IPoolDataAsset`](types_provider.IPoolDataAsset.md)

Asset data for the pool pair, Asset B

#### Defined in

@types/provider.d.ts:75

___

### fee

• **fee**: `string`

The pool fee as a percentage.

#### Defined in

@types/provider.d.ts:69

___

### ident

• **ident**: `string`

The unique identifier of the pool. Also returned directly via [findPoolIdent](types_provider.IProviderClass.md#findpoolident)

#### Defined in

@types/provider.d.ts:71
