[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: IDatumBuilderMintStablePoolArgs

Arguments interface for minting a Stableswaps pool, extending the base V3 pool minting arguments
with Stableswaps-specific parameters.

## Extends

- [`IDatumBuilderMintPoolArgs`](IDatumBuilderMintPoolArgs.md)

## Extended by

- [`IDatumBuilderMintStablePoolArgsV2`](IDatumBuilderMintStablePoolArgsV2.md)

## Properties

### linearAmplification

> **linearAmplification**: `bigint`

The linear amplification factor that determines the curve characteristics of the Stableswaps pool.
Higher values make the pool behave more like a constant sum pool (better for stable pairs),
while lower values make it behave more like a constant product pool.

#### Overrides

`IDatumBuilderMintPoolArgs.linearAmplification`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts:30](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts#L30)

***

### protocolFees

> **protocolFees**: [`IFeesConfig`](IFeesConfig.md)

Protocol fee configuration for the Stableswaps pool, including bid and ask fees.

#### Overrides

`IDatumBuilderMintPoolArgs.protocolFees`

#### Defined in

[packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts:23](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/DatumBuilders/DatumBuilder.Stableswaps.class.ts#L23)
