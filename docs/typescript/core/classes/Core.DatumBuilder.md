# Class: DatumBuilder<Data\>

[Core](../modules/Core.md).DatumBuilder

The main builder interface for constructing valid Datums
for SundaeSwap protocol transactions.

**NOTE**: Be careful when building custom representations of this,
as invalid datum constructs can brick user funds!

To accurately create a custom DatumBuilder, refer to our Jest testing helper
methods exported to easily ensure your builder is outputting the correct hex-encoded
CBOR strings.

## Type parameters

| Name | Type |
| :------ | :------ |
| `Data` | `any` |
