---
"@sundaeswap/core": minor
---

`IComposedTx`, `ITxBuilderSign` and `ITxBuilderSubmit` take a `SubmitResult` type parameter: what `submit()` resolves to. It defaults to `string`, the transaction hash, so every existing builder and caller is unchanged. A builder that hands its transaction to a destination other than the wallet can declare a richer result for those builds only.
