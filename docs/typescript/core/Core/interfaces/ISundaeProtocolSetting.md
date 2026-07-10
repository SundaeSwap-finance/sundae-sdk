[**@sundaeswap/core**](../../README.md) • **Docs**

***

# Interface: ISundaeProtocolSetting

An indexed settings entry for a protocol, as served by the `protocols` query.
A single root-settings entry for v1/v3/stableswaps; several for v4 (root
settings plus the per-order-type OrderConfig and pool config entries),
distinguished by `label`. `values` is the decoded datum (fields vary by
label / version); `datum` is the raw inline CBOR.
