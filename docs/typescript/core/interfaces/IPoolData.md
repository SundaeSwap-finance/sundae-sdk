# Interface: IPoolData

Pool data that is returned from [findPoolData](IProviderClass.md#findpooldata).

## Properties

### assetA

• **assetA**: [`IPoolDataAsset`](IPoolDataAsset.md)

Asset data for the pool pair, Asset A

#### Defined in

@types/provider.ts:71

___

### assetB

• **assetB**: [`IPoolDataAsset`](IPoolDataAsset.md)

Asset data for the pool pair, Asset B

#### Defined in

@types/provider.ts:73

___

### fee

• **fee**: `string`

The pool fee as a percentage.

#### Defined in

@types/provider.ts:67

___

### ident

• **ident**: `string`

The unique identifier of the pool. Also returned directly via [findPoolIdent](IProviderClass.md#findpoolident)

#### Defined in

@types/provider.ts:69
