# Serialization Layer Feasibility Report

**Date:** 2026-02-26
**Analyst:** Senior SundaeSwap SDK Developer
**Status:** ✅ FEASIBLE with critical modifications required

---

## Executive Summary

The proposed `Serialization` layer is **feasible** but requires significant expansion beyond the initial proposal. The current `DatumBuilder` implementations support 5+ operation types across 2 protocol versions (V1, V3) with substantial protocol-specific fields and chaining capabilities that must be preserved.

**Key Findings:**
- ✅ Core swap/deposit/withdraw operations are well-represented
- ⚠️ Missing: Strategy operations, owner address handling, extension field
- ⚠️ Missing: Zap operation support (V1-specific chained swap+deposit)
- ✅ Datum chaining is supported via `destination.datum` field
- ⚠️ V1 and V3 have fundamentally different datum structures requiring separate interfaces

---

## 1. Current DatumBuilder API Surface

### 1.1 V1 DatumBuilder (`DatumBuilderV1`)

**File:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts`

#### Methods

```typescript
class DatumBuilderV1 {
  buildSwapDatum({
    ident: string;
    orderAddresses: TOrderAddressesArgs;
    fundedAsset: AssetAmount<IAssetAmountMetadata>;
    swap: TSwap;
    scooperFee: bigint;
  }): TDatumResult<V1Types.SwapOrder>;

  buildDepositDatum({
    ident: string;
    orderAddresses: TOrderAddressesArgs;
    deposit: TDepositMixed;
    scooperFee: bigint;
  }): TDatumResult<V1Types.DepositOrder>;

  buildWithdrawDatum({
    ident: string;
    orderAddresses: TOrderAddressesArgs;
    suppliedLPAsset: AssetAmount<IAssetAmountMetadata>;
    scooperFee: bigint;
  }): TDatumResult<V1Types.WithdrawOrder>;

  // Helper methods
  buildSwapDirection(swap: TSwap, amount: AssetAmount): TDatumResult<V1Types.SwapDirection>;
  buildOrderAddresses(addresses: TOrderAddressesArgs): TDatumResult<V1Types.OrderAddresses>;
  buildPoolIdent(ident: string): string;
}
```

#### Return Type: `TDatumResult<Schema>`

```typescript
type TDatumResult<Schema = unknown> = {
  hash: string;        // Blake2b-256 hash of the datum
  inline: string;      // CBOR-encoded datum hex string
  schema: Schema;      // Typed datum structure
};
```

#### V1-Specific Requirements

1. **Alternate Address (Canceler)**
   - V1 uses `AlternateAddress?: string` for order cancellation
   - This is a simple payment key hash, not a full address object
   - Stored in `orderAddresses.alternate` field

2. **Destination Datum Structure**
   ```typescript
   destination: {
     credentials: {
       paymentKey: PaymentStakingHash;
       stakingKey?: { value: PaymentStakingHash };
     };
     datum?: string;  // Only HASH type supported for script destinations
   }
   ```

3. **Validation**
   - Pool ident must be ≤ 10 characters (V1_MAX_POOL_IDENT_LENGTH)
   - Inline datums NOT supported for script destinations (throws error)
   - Validator script hash registration for chaining detection

---

### 1.2 V3 DatumBuilder (`DatumBuilderV3`)

**File:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts`

#### Methods

```typescript
class DatumBuilderV3 {
  buildSwapDatum({
    destinationAddress: TDestinationAddress;
    ident: string;
    order: {
      minReceived: AssetAmount<IAssetAmountMetadata>;
      offered: AssetAmount<IAssetAmountMetadata>;
    };
    ownerAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<V3Types.OrderDatum>;

  buildDepositDatum({
    destinationAddress: TDestinationAddress;
    ident: string;
    order: {
      assetA: AssetAmount<IAssetAmountMetadata>;
      assetB: AssetAmount<IAssetAmountMetadata>;
    };
    ownerAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<V3Types.OrderDatum>;

  buildWithdrawDatum({
    destinationAddress: TDestinationAddress;
    ident: string;
    order: {
      lpToken: AssetAmount<IAssetAmountMetadata>;
    };
    ownerAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<V3Types.OrderDatum>;

  buildStrategyDatum({
    destination: TDestination;
    ident: string;
    order: {
      signer?: string;
      script?: string;
    };
    ownerAddress: string;  // REQUIRED for strategy
    scooperFee: bigint;
  }): TDatumResult<V3Types.OrderDatum>;

  // Pool creation methods
  buildMintPoolDatum({...}): TDatumResult<V3Types.PoolDatum>;
  buildPoolMintRedeemerDatum({...}): TDatumResult<V3Types.PoolMintRedeemer>;

  // Helper methods
  buildDestination(destination: TDestination): TDatumResult<V3Types.Destination>;
  buildDestinationAddresses(addr: TDestinationAddress): TDatumResult<V3Types.Destination>;
  buildOwnerDatum(main: string): TDatumResult<V3Types.MultisigScript>;
  buildAssetAmountDatum(asset: AssetAmount): TDatumResult<V3Types.Tuple$ByteArray_ByteArray_Int>;
  buildLexicographicalAssetsDatum(...): TDatumResult<[...]>;
  validatePoolIdent(ident: string): string;

  // Static utilities
  static computePoolId(seed: TUTXO): string;
  static getDestinationAddressesFromDatum(datum: string): { stakingKeyHash?, paymentKeyHash? };
  static getSignerKeyFromDatum(datum: string): string | undefined;
  static getMetadataAddressFromSettingsDatum(datum: string, network): string;
}
```

#### V3-Specific Requirements

1. **Owner Address (Staking Credential Inheritance)**
   - Defaults to `destinationAddress` if not provided
   - Used for authorization (signature or script)
   - Stored as `MultisigScript` (Signature or Script variant)

2. **Extension Field**
   - All V3 datums include `extension: VOID_BYTES`
   - Currently unused but required for protocol compatibility
   - Defined in constants: `Core.PlutusData.newBytes(Buffer.from(Void().toCbor(), "hex"))`

3. **Destination Types**
   ```typescript
   enum EDestinationType {
     FIXED = "FIXED",  // Standard address + optional datum
     SELF = "SELF",    // Reuse order's own address/datum
   }
   ```

4. **Datum Chaining Support**
   ```typescript
   destinationAddress: {
     address: string;
     datum: TDatum;  // Supports NONE, HASH, INLINE
   }
   ```

5. **Strategy Operations**
   - Authorization via signer (pubkey) OR script
   - Destination can be SELF (for multi-step strategies)
   - Requires `ownerAddress` (not optional)

6. **Pool Ident Validation**
   - Must be exactly 56 characters (28 bytes hex)
   - Generated via `computePoolId(seed: TUTXO)`

---

## 2. Missing Parameters in Proposed Serialization Layer

### 2.1 Critical Missing Fields

| Field | Version | Required | Purpose |
|-------|---------|----------|---------|
| `ownerAddress` | V3 | Optional (swap/deposit/withdraw), Required (strategy) | Staking credential inheritance, authorization |
| `extension` | V3 | Yes | Protocol compatibility field (VOID_BYTES) |
| `alternateAddress` | V1 | Optional | Cancellation authority |
| `order.signer` | V3 | Strategy only | Signature-based authorization |
| `order.script` | V3 | Strategy only | Script-based authorization |
| `fundedAsset` | V1 | Swap only | Required to determine swap direction |

### 2.2 Return Type Incompatibility

**Proposed:** Returns `string` (CBOR-encoded datum)

**Current:** Returns `TDatumResult<Schema>` with:
- `hash: string` - Required for datum chaining
- `inline: string` - CBOR-encoded datum
- `schema: Schema` - Typed structure for validation/testing

**Impact:** Datum chaining requires hash computation before constructing the next datum. The proposed interface doesn't expose this.

---

## 3. Datum Chaining Implementation Analysis

### 3.1 Current Chaining Pattern

**V1 Zap Operation** (Swap → Deposit chain):

```typescript
// File: TxBuilder.V1.class.ts:905-917
const { hash: depositHash, inline: depositInline } =
  this.datumBuilder.buildDepositDatum({
    ident: pool.ident,
    orderAddresses,
    deposit: depositPair,
    scooperFee: this.__getParam("maxScooperFee"),
  });

const swapData = this.datumBuilder.buildSwapDatum({
  orderAddresses: {
    DestinationAddress: {
      address: scriptAddress.toBech32(),
      datum: {
        type: EDatumType.HASH,
        value: depositHash,  // ← Chain to next order
      },
    },
  },
  // ...
});
```

**V1→V3 Migration** (Withdraw V1 → Deposit V3 chain):

```typescript
// File: TxBuilder.V1.class.ts:245-280
const { hash: depositHash, inline: depositInline } =
  v3DatumBuilder.buildDepositDatum({
    destinationAddress: withdrawArgs.orderAddresses.DestinationAddress,
    ident: depositPool.ident,
    order: { assetA, assetB },
    scooperFee: v3MaxScooperFee,
  });

const { inline: withdrawInline, hash: withdrawHash } =
  this.datumBuilder.buildWithdrawDatum({
    orderAddresses: {
      DestinationAddress: {
        address: v3OrderScriptAddress,
        datum: {
          type: EDatumType.HASH,
          value: depositHash,  // ← Cross-version chaining
        },
      },
    },
    // ...
  });
```

### 3.2 Chaining Requirements

1. **Hash must be computed before constructing parent datum**
   - Current: `buildDepositDatum()` returns `{ hash, inline, schema }`
   - Proposed: Would need to call a separate `hashDatum()` method

2. **Metadata attachment for hash lookup**
   ```typescript
   // Transaction metadata includes datum CBOR by hash
   metadata.set(103251n, new Map([
     [Buffer.from(depositHash, "hex"),
      SundaeUtils.splitMetadataString(depositInline)]
   ]));
   ```

3. **Datum types supported**
   - `EDatumType.NONE` - No datum
   - `EDatumType.HASH` - Hash reference (requires metadata)
   - `EDatumType.INLINE` - Embedded in UTXO (V3 only for scripts)

---

## 4. Protocol-Specific Differences

### 4.1 Order Address Structure

**V1:**
```typescript
type TOrderAddressesArgs = {
  DestinationAddress: {
    address: string;
    datum: TDatum;  // HASH only for scripts
  };
  AlternateAddress?: string;  // Simple pubkey hash
  PoolDestinationVersion?: EContractVersion;
}
```

**V3:**
```typescript
type TDestinationAddress = {
  address: string;
  datum: TDatum;  // NONE, HASH, or INLINE
}

// No AlternateAddress concept
// Uses owner field instead
```

### 4.2 Asset Representation

**V1:** Uses metadata-aware `AssetAmount` but stores direction separately
```typescript
swap: {
  SuppliedCoin: EPoolCoin;  // A or B
  MinimumReceivable?: AssetAmount;
}
```

**V3:** Uses tuple format `[policyId, assetName, amount]`
```typescript
order: {
  offered: AssetAmount;     // Full metadata
  minReceived: AssetAmount; // Full metadata
}
// Direction inferred from pool asset ordering
```

### 4.3 Fee Structure

**V1:**
- Fixed scooper fee: `2_500_000n` lovelace
- No protocol fees in datum

**V3:**
- Variable scooper fee (stored as `maxProtocolFee`)
- Extension field for future protocol parameters

---

## 5. Operation Types Beyond Swap/Deposit/Withdraw

### 5.1 Strategy Operations (V3 Only)

**Purpose:** Multi-step automated strategies with authorization

```typescript
interface IDatumBuilderStrategyV3Args {
  destination: TDestination;  // FIXED or SELF
  ident: string;
  ownerAddress: string;       // REQUIRED
  order: {
    signer?: string;          // Pubkey hash OR
    script?: string;          // Script hash
  };
  scooperFee: bigint;
}
```

**Datum Structure:**
```typescript
{
  poolIdent: string;
  destination: V3Types.Destination;
  owner: V3Types.MultisigScript;
  maxProtocolFee: bigint;
  details: {
    Strategy: {
      auth: { Signature: { signer } } | { Script: { script } }
    }
  };
  extension: VOID_BYTES;
}
```

**Use Case:** Executed via TxBuilder.strategy() for advanced DeFi operations

### 5.2 Zap Operations (V1 Only)

**Not a separate datum type** but a compositional pattern:

1. Build deposit datum (future step)
2. Build swap datum with destination = order script address + deposit datum hash
3. Attach deposit datum to metadata

**Implementation:** `TxBuilder.V1.zap()` method

### 5.3 Pool Minting (V3 Only)

```typescript
buildMintPoolDatum({
  seedUtxo: TUTXO;
  assetA: AssetAmount;
  assetB: AssetAmount;
  fees: IFeesConfig;
  depositFee: bigint;
  marketOpen?: bigint;
  feeManager?: string;
  condition?: string;
  conditionDatumArgs?: TConditionDatumArgs;
  protocolFees?: IFeesConfig;
  linearAmplification?: bigint;
}): TDatumResult<V3Types.PoolDatum>;
```

---

## 6. Recommended Serialization Interface

### 6.1 Core Interface

```typescript
abstract class SerializationV3 {
  /**
   * Builds a swap order datum.
   *
   * @param pool - Pool data including ident and assets
   * @param offered - Asset amount being swapped
   * @param minReceived - Minimum acceptable output amount
   * @param destinationAddress - Where to send proceeds
   * @param ownerAddress - Optional authorization address (defaults to destination)
   * @param scooperFee - Maximum protocol fee to pay
   * @returns Complete datum result with hash, CBOR, and schema
   */
  abstract buildSwapDatum(args: {
    pool: IPoolData;
    offered: AssetAmount<IAssetAmountMetadata>;
    minReceived: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;
    ownerAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<unknown>;

  /**
   * Builds a deposit order datum.
   *
   * @param pool - Pool data including ident and assets
   * @param assetA - Amount of first asset to deposit
   * @param assetB - Amount of second asset to deposit
   * @param destinationAddress - Where to send LP tokens
   * @param ownerAddress - Optional authorization address
   * @param scooperFee - Maximum protocol fee to pay
   * @returns Complete datum result with hash, CBOR, and schema
   */
  abstract buildDepositDatum(args: {
    pool: IPoolData;
    assetA: AssetAmount<IAssetAmountMetadata>;
    assetB: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;
    ownerAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<unknown>;

  /**
   * Builds a withdraw order datum.
   *
   * @param pool - Pool data including ident
   * @param lpAmount - LP token amount to burn
   * @param destinationAddress - Where to send unlocked assets
   * @param ownerAddress - Optional authorization address
   * @param scooperFee - Maximum protocol fee to pay
   * @returns Complete datum result with hash, CBOR, and schema
   */
  abstract buildWithdrawDatum(args: {
    pool: IPoolData;
    lpAmount: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;
    ownerAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<unknown>;

  /**
   * Builds a strategy order datum (V3 only).
   *
   * @param pool - Pool data including ident
   * @param destination - Where to send proceeds (can be SELF)
   * @param ownerAddress - Authorization address (REQUIRED)
   * @param authorization - Signer pubkey hash OR script hash
   * @param scooperFee - Maximum protocol fee to pay
   * @returns Complete datum result with hash, CBOR, and schema
   */
  abstract buildStrategyDatum?(args: {
    pool: IPoolData;
    destination: TDestination;
    ownerAddress: string;
    authorization: { signer: string } | { script: string };
    scooperFee: bigint;
  }): TDatumResult<unknown>;
}
```

### 6.2 V1-Specific Extension

```typescript
abstract class SerializationV1 extends SerializationV3 {
  /**
   * V1 swap datum requires funded asset for direction calculation.
   */
  abstract buildSwapDatum(args: {
    pool: IPoolData;
    offered: AssetAmount<IAssetAmountMetadata>;
    minReceived: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;
    alternateAddress?: string;  // V1 canceler
    scooperFee: bigint;
  }): TDatumResult<unknown>;

  /**
   * V1 deposit datum with alternate address support.
   */
  abstract buildDepositDatum(args: {
    pool: IPoolData;
    assetA: AssetAmount<IAssetAmountMetadata>;
    assetB: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;
    alternateAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<unknown>;

  /**
   * V1 withdraw datum with alternate address support.
   */
  abstract buildWithdrawDatum(args: {
    pool: IPoolData;
    lpAmount: AssetAmount<IAssetAmountMetadata>;
    destinationAddress: TDestinationAddress;
    alternateAddress?: string;
    scooperFee: bigint;
  }): TDatumResult<unknown>;

  // Strategy not supported in V1
  buildStrategyDatum = undefined;
}
```

---

## 7. Critical Implementation Notes

### 7.1 Return Type Must Be `TDatumResult<Schema>`

**Reason:** Datum chaining requires hash before parent construction

**Example:**
```typescript
// Step 1: Build child datum
const childDatum = serialization.buildDepositDatum({...});

// Step 2: Use child hash in parent destination
const parentDatum = serialization.buildSwapDatum({
  destinationAddress: {
    address: orderScriptAddress,
    datum: {
      type: EDatumType.HASH,
      value: childDatum.hash,  // ← REQUIRED
    },
  },
  // ...
});

// Step 3: Attach child datum to transaction metadata
metadata.set(103251n, new Map([
  [Buffer.from(childDatum.hash, "hex"),
   splitMetadataString(childDatum.inline)]
]));
```

### 7.2 Extension Field (V3)

**Must be included in all V3 datums:**

```typescript
import { VOID_BYTES } from "../constants.js";

const datum = {
  poolIdent,
  destination,
  owner,
  maxProtocolFee,
  details,
  extension: VOID_BYTES,  // ← Protocol requirement
};
```

### 7.3 Owner vs Destination

**V3 distinguishes between:**
- `destination` - Where assets go after execution
- `owner` - Who can authorize/cancel the order

**Default behavior:**
```typescript
owner: buildOwnerDatum(ownerAddress ?? destinationAddress.address)
```

**Strategy operations:**
```typescript
// Owner is REQUIRED and must match authorization
owner: buildOwnerDatum(ownerAddress)  // No fallback
```

### 7.4 Asset Direction (V1 vs V3)

**V1:** Requires explicit direction calculation
```typescript
swapDirection: {
  amount: fundedAsset.amount,
  minReceivable: swap.MinimumReceivable?.amount,
  suppliedAssetIndex: swap.SuppliedCoin === EPoolCoin.A ? "A" : "B",
}
```

**V3:** Direction inferred from offered/minReceived assets
```typescript
details: {
  Swap: {
    offer: buildAssetAmountDatum(order.offered),
    minReceived: buildAssetAmountDatum(order.minReceived),
  }
}
```

---

## 8. Testing Validation Examples

### 8.1 Swap Datum (V3)

```typescript
const result = serialization.buildSwapDatum({
  pool: {
    ident: "a1b2c3...",
    assetA: { assetId: "...", decimals: 6 },
    assetB: { assetId: "...", decimals: 0 },
  },
  offered: new AssetAmount(1000000n, adaMetadata),
  minReceived: new AssetAmount(50n, tokenMetadata),
  destinationAddress: {
    address: "addr1...",
    datum: { type: EDatumType.NONE },
  },
  scooperFee: 2_500_000n,
});

expect(result.hash).toMatch(/^[0-9a-f]{64}$/);
expect(result.inline).toMatch(/^[0-9a-f]+$/);
expect(result.schema.poolIdent).toBe("a1b2c3...");
expect(result.schema.extension).toBe(VOID_BYTES);
```

### 8.2 Chained Deposit (V1→V3 Migration)

```typescript
// Step 1: Build V3 deposit datum
const v3Deposit = v3Serialization.buildDepositDatum({
  pool: v3Pool,
  assetA: new AssetAmount(5000000n, adaMetadata),
  assetB: new AssetAmount(100n, tokenMetadata),
  destinationAddress: {
    address: userAddress,
    datum: { type: EDatumType.NONE },
  },
  scooperFee: 2_500_000n,
});

// Step 2: Build V1 withdraw datum chaining to V3 deposit
const v1Withdraw = v1Serialization.buildWithdrawDatum({
  pool: v1Pool,
  lpAmount: new AssetAmount(1000000n, lpTokenMetadata),
  destinationAddress: {
    address: v3OrderScriptAddress,
    datum: {
      type: EDatumType.HASH,
      value: v3Deposit.hash,  // ← Cross-version chain
    },
  },
  alternateAddress: userAddress,
  scooperFee: 2_500_000n,
});

expect(v1Withdraw.schema.orderAddresses.destination.datum)
  .toBe(v3Deposit.hash);
```

---

## 9. Conclusion & Recommendations

### 9.1 Feasibility Assessment

**Status:** ✅ FEASIBLE with required modifications

The proposed Serialization layer can work BUT requires:

1. **Expand interface to 4+ operation types**
   - Swap, Deposit, Withdraw (both V1 and V3)
   - Strategy (V3 only)
   - Pool minting (V3 only, potentially out of scope)

2. **Return `TDatumResult<Schema>` instead of `string`**
   - Hash required for datum chaining
   - Schema useful for testing/validation
   - Inline CBOR for transaction building

3. **Include all protocol-specific fields**
   - V3: `ownerAddress`, `extension`, `destination` types
   - V1: `alternateAddress`, `fundedAsset` (swap only)

4. **Support cross-version compatibility**
   - V1→V3 migration pattern is actively used
   - Requires consistent TDestinationAddress interface

### 9.2 Recommended Next Steps

1. **Define separate V1 and V3 serialization interfaces**
   ```typescript
   abstract class SerializationV1 { ... }
   abstract class SerializationV3 { ... }
   ```

2. **Preserve TDatumResult return type**
   - Critical for datum chaining workflows
   - Existing codebase depends on hash availability

3. **Add integration tests for chaining**
   - V1 Zap (swap→deposit)
   - V1→V3 migration (withdraw→deposit)
   - V3 orderRouteSwap (swap→swap)

4. **Document extension field requirements**
   - V3 requires VOID_BYTES
   - Future protocol versions may use this field

### 9.3 Migration Impact

**Low Risk:**
- Swap/Deposit/Withdraw operations are well-defined
- Datum chaining pattern is consistent

**Medium Risk:**
- Strategy operations are less common but critical for advanced users
- Owner vs destination distinction must be preserved

**High Risk:**
- Changing return type from `TDatumResult` to `string` would break datum chaining
- DO NOT simplify this interface

---

## Appendix A: File References

### Core Implementation Files

- **V1 DatumBuilder:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/DatumBuilders/DatumBuilder.V1.class.ts`
- **V3 DatumBuilder:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/DatumBuilders/DatumBuilder.V3.class.ts`
- **V1 TxBuilder:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/TxBuilders/TxBuilder.V1.class.ts`
- **V3 TxBuilder:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/TxBuilders/TxBuilder.V3.class.ts`
- **Type Definitions:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/@types/datumbuilder.ts`
- **Config Types:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/@types/configs.ts`
- **Constants:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/constants.ts`

### Chaining Examples

- **V1 Zap:** TxBuilder.V1.class.ts:848-994 (swap→deposit chain)
- **V1→V3 Migration:** TxBuilder.V1.class.ts:1039-1424 (withdraw→deposit cross-version chain)
- **V3 Route Swap:** Referenced in orderRouteSwap methods

### Contract Types

- **V1 Types:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/DatumBuilders/ContractTypes/Contract.v1.ts`
- **V3 Types:** `/Users/calvinkoepke/Repos/sundae-sdk/packages/core/src/DatumBuilders/ContractTypes/Contract.v3.ts`

---

**End of Report**
