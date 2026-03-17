---
"@sundaeswap/core": minor
---

feat(core): Add pool fee management methods

- Add `updateProtocolFees()` for Stableswaps protocol fee updates
- Add `updatePoolFees()` for V3 LP fee updates
- Add `IUpdateProtocolFeesConfigArgs` and `IUpdatePoolFeesConfigArgs` interfaces
- Add DatumBuilder helpers: `buildUpdatedFeesDatum()`, `getAddressFromMultiSig()`
- Add `ManageRedeemer` contract types for both Stableswaps and V3
- Exclude input UTXOs from collateral selection in fee update transactions
