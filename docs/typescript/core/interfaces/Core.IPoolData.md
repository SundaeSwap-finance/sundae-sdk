# Interface: IPoolData

[Core](../modules/Core.md).IPoolData

Pool data that is returned from [findPoolData](Core.IQueryProviderClass.md#findpooldata).

## Properties

### assetA

• **assetA**: [`IPoolDataAsset`](Core.IPoolDataAsset.md)

Asset data for the pool pair, Asset A

#### Defined in

[@types/queryprovider.ts:82](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L82)

___

### assetB

• **assetB**: [`IPoolDataAsset`](Core.IPoolDataAsset.md)

Asset data for the pool pair, Asset B

#### Defined in

[@types/queryprovider.ts:84](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L84)

___

### fee

• **fee**: `string`

The pool fee represented as a string. i.e. 1% === "1" and .03% === "0.03"

#### Defined in

[@types/queryprovider.ts:78](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L78)

___

### ident

• **ident**: `string`

The unique identifier of the pool. Also returned directly via [findPoolIdent](Core.IQueryProviderClass.md#findpoolident)

#### Defined in

[@types/queryprovider.ts:80](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L80)

___

### quantityA

• **quantityA**: `string`

The pool quantity of [assetA](Core.IPoolData.md#asseta)

#### Defined in

[@types/queryprovider.ts:86](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L86)

___

### quantityB

• **quantityB**: `string`

The pool quantity of [assetB](Core.IPoolData.md#assetb)

#### Defined in

[@types/queryprovider.ts:88](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/queryprovider.ts#L88)
