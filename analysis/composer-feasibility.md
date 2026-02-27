# Composer Layer Feasibility Report: Cross-Version Datum Chaining

## Executive Summary

The proposed Composer layer for cross-version datum chaining is **feasible** and aligns with existing patterns in the SundaeSwap SDK. The current implementations of `migrateLiquidityToV3()`, `orderRouteSwap()`, and `zap()` already demonstrate all the necessary mechanics for datum chaining across both same-version and cross-version operations.

**Key Finding:** Cross-version datum chaining works by building the **destination datum first** (to get its hash), then embedding that hash in the **source datum's destination address field**, and finally attaching the full destination datum CBOR to transaction metadata (label `103251n`) for V1 compatibility.

---

## 1. Current Cross-Version Patterns

### 1.1 Migration Pattern: V1 Withdraw → V3 Deposit

The `migrateLiquidityToV3()` method (lines 1039-1424 in `TxBuilder.V1.class.ts`) demonstrates the canonical cross-version chaining pattern:

```typescript
// Step 1: Build V3 deposit datum FIRST (to get its hash)
const v3DatumBuilder = new DatumBuilderV3(this.network);
const { hash: depositHash, inline: depositInline } =
  v3DatumBuilder.buildDepositDatum({
    destinationAddress: withdrawArgs.orderAddresses.DestinationAddress,
    ownerAddress: withdrawArgs.orderAddresses.AlternateAddress,
    ident: depositPool.ident,
    order: {
      assetA: new AssetAmount(coinA, depositPool.assetA),
      assetB: new AssetAmount(coinB, depositPool.assetB),
    },
    scooperFee: v3MaxScooperFee,
  });

// Step 2: Build V1 withdraw datum with V3's hash as destination
const { inline: withdrawInline, hash: withdrawHash } =
  this.datumBuilder.buildWithdrawDatum({
    ident: withdrawConfig.pool.ident,
    orderAddresses: {
      DestinationAddress: {
        address: v3OrderScriptAddress,
        datum: {
          type: EDatumType.HASH,      // V1 uses HASH
          value: depositHash,          // Reference V3 datum by hash
        },
      },
      AlternateAddress: withdrawArgs.orderAddresses.AlternateAddress,
    },
    scooperFee: this.__getParam("maxScooperFee"),
    suppliedLPAsset: withdrawArgs.suppliedLPAsset,
  });

// Step 3: Attach V3 datum to metadata (for V1 compatibility)
metadataDatums?.insert(
  Core.Metadatum.fromCore(Buffer.from(depositHash, "hex")),
  Core.Metadatum.fromCore(
    SundaeUtils.splitMetadataString(depositInline).map((v) =>
      Buffer.from(v, "hex"),
    ),
  ),
);

// Step 4: Lock V1 order with hashed datum
finalTx
  .provideDatum(Core.PlutusData.fromCbor(Core.HexBlob(withdrawInline)))
  .lockAssets(scriptAddress, withdrawPayment, Core.DatumHash(withdrawHash));

// Step 5: Attach metadata to transaction
const data = new Core.AuxiliaryData();
const map = new Map<bigint, Core.Metadatum>();
map.set(103251n, Core.Metadatum.newMap(metadataDatums));
data.setMetadata(new Core.Metadata(map));
finalTx.setAuxiliaryData(data);
```

---

## 2. Datum Type Mechanics

### 2.1 Version-Specific Datum Types

| Version | Datum Type | Method |
|---------|-----------|--------|
| **V1**  | `EDatumType.HASH` | Datum stored off-chain, referenced by hash |
| **V3**  | `EDatumType.INLINE` | Datum embedded directly in UTXO |

**Source:**
- `TxBuilderV1.getDatumType()` returns `EDatumType.HASH` (line 1448)
- `TxBuilderV3.getDatumType()` returns `EDatumType.INLINE` (line 1461)

### 2.2 Cross-Version Referencing

**Question:** How do you reference an inline datum from a hashed datum?

**Answer:** You can't directly reference an inline datum from V1. Instead:
1. V3 datums can be stored as **hashed datums** when used as V1 destinations
2. The full datum CBOR is attached to transaction metadata (label `103251n`)
3. The V1 scooper resolves the hash from metadata before forwarding to V3

This is why `orderRouteSwap()` checks the destination builder's datum type:

```typescript
const { tx, datum, fees } = await this.swap({
  orderAddresses: {
    DestinationAddress: {
      datum: {
        type: secondBuilder.getDatumType(),  // Adapts to V1 or V3
        value:
          secondBuilder.getDatumType() === EDatumType.HASH
            ? datumHash
            : (secondSwapData.datum as string),
      },
    },
  },
});

// If destination is V1 (uses HASH), attach metadata
if (secondBuilder.getDatumType() === EDatumType.HASH) {
  const data = new Core.AuxiliaryData();
  const metadata = new Map<bigint, Core.Metadatum>();
  metadata.set(103251n, /* ... datum CBOR ... */);
  tx.setAuxiliaryData(data);
}
```

---

## 3. Fee Accumulation Across Versions

### 3.1 Scooper Fee Pattern

Fees are accumulated **additively** across chained orders:

```typescript
// V1 → V3 migration
const scooperFee = this.__getParam("maxScooperFee") + v3MaxScooperFee;

totalScooper += scooperFee;  // Accumulates across all migrations
```

Each order pays its own scooper fee:
- **V1 withdraw order:** Includes V1 scooper fee
- **V3 deposit order:** Includes V3 scooper fee (funded by V1 withdrawal output)

### 3.2 Deposit Requirements

Each order requires a separate deposit (stored in the UTXO):

```typescript
totalDeposit += ORDER_DEPOSIT_DEFAULT;  // 2 ADA per order
```

For order routes (cross-pool swaps), a higher deposit is used:

```typescript
const baseOrderDeposit = isOrderRoute
  ? ORDER_ROUTE_DEPOSIT_DEFAULT  // 5 ADA for chained operations
  : ORDER_DEPOSIT_DEFAULT;        // 2 ADA for single operations
```

---

## 4. Metadata Structure for V1 Compatibility

### 4.1 Metadata Label: `103251n`

All datum hashes and their full CBOR representations are stored under metadata label `103251n`:

```typescript
const metadata = new Map<bigint, Core.Metadatum>();
metadata.set(
  103251n,
  Core.Metadatum.fromCore(
    new Map([
      [
        Buffer.from(datumHash, "hex"),           // Key: datum hash
        SundaeUtils.splitMetadataString(datumCbor).map(v =>  // Value: chunked CBOR
          Buffer.from(v, "hex")
        ),
      ],
    ]),
  ),
);
```

### 4.2 Why Metadata Is Needed

V1 smart contracts expect datums to be **externally resolvable** (via hash). When chaining to V3 (which uses inline datums), the V1 scooper needs to:
1. Read the destination datum hash from the V1 order
2. Look up the full datum CBOR in transaction metadata
3. Construct the V3 UTXO with the inline datum

Without metadata, the V1 scooper cannot resolve the V3 datum.

---

## 5. Recommended Composer Implementation

### 5.1 Core Algorithm: `resolveDatumChain()`

```typescript
class Composer {
  constructor(
    private finalDestination: string,
    private builders: Array<BuilderV1 | BuilderV3>
  ) {}

  async build(): Promise<IComposedTx> {
    const allTasks = this.builders.flatMap(b => b.getTasks());
    const resolvedTasks = this.resolveDatumChain(allTasks);

    // Build transaction with all resolved tasks
    return this.buildTransaction(resolvedTasks);
  }

  /**
   * Resolves datum chain by building datums in REVERSE order
   * (destination first, then source)
   */
  private resolveDatumChain(tasks: ITask[]): IResolvedTask[] {
    const resolved: IResolvedTask[] = [];
    const metadata = new Map<string, string>();  // hash → cbor

    // Process tasks in REVERSE (destination first)
    for (let i = tasks.length - 1; i >= 0; i--) {
      const currentTask = tasks[i];
      const nextTask = tasks[i + 1];  // null for last task

      // Determine destination address and datum
      const destinationAddress = nextTask
        ? nextTask.getOrderScriptAddress()  // Chain to next task
        : this.finalDestination;             // Last task sends to user

      // Build datum for current task
      const datum = this.buildTaskDatum(currentTask, {
        destinationAddress,
        destinationDatum: nextTask ? this.getDatumReference(nextTask) : null,
      });

      // If next task is V1, store full datum in metadata
      if (nextTask && nextTask.builder.getDatumType() === EDatumType.HASH) {
        metadata.set(datum.hash, datum.inline);
      }

      resolved.unshift({
        task: currentTask,
        datum,
        destinationAddress,
      });
    }

    return resolved;
  }

  /**
   * Get datum reference for destination task
   */
  private getDatumReference(task: ITask): IDatumReference {
    const datumType = task.builder.getDatumType();
    const datum = this.buildTaskDatum(task, { /* ... */ });

    return {
      type: datumType,
      value: datumType === EDatumType.HASH ? datum.hash : datum.inline,
    };
  }
}
```

### 5.2 Output Passing Across Builder Boundaries

**Question:** How does BuilderV3's first task know the output of BuilderV1's last task?

**Answer:** Output is resolved **at configuration time**, not at build time, using pool liquidity math:

```typescript
// Example: V1 swap → V3 swap
const [aReserve, bReserve] = SundaeUtils.sortSwapAssetsWithAmounts([
  new AssetAmount(args.swapA.pool.liquidity.aReserve, args.swapA.pool.assetA),
  new AssetAmount(args.swapA.pool.liquidity.bReserve, args.swapA.pool.assetB),
]);

const aOutputAsset =
  swapA.suppliedAsset.metadata.assetId === aReserve.metadata.assetId
    ? bReserve.withAmount(swapA.minReceivable.amount)  // Calculate expected output
    : aReserve.withAmount(swapA.minReceivable.amount);

// Configure second swap with calculated output
const swapB = new SwapConfig({
  suppliedAsset: aOutputAsset,  // Uses calculated output as input
  // ...
});
```

**Recommendation:** Builders should expose a `getExpectedOutput()` method:

```typescript
interface ITaskBuilder {
  /**
   * Calculate expected output based on pool liquidity and slippage
   */
  getExpectedOutput(task: ITask): AssetAmount<IAssetAmountMetadata>;
}

// Usage in Composer
const lastTask = builderV1.getTasks().at(-1);
const expectedOutput = builderV1.getExpectedOutput(lastTask);

const firstTaskV3 = builderV3.getTasks()[0];
firstTaskV3.setSuppliedAsset(expectedOutput);
```

---

## 6. Edge Cases and Considerations

### 6.1 V1 → V3 Chain

✅ **Supported:** Current implementation (`migrateLiquidityToV3`)

- V1 order uses `EDatumType.HASH`
- V3 datum stored in metadata
- V3 order uses `EDatumType.INLINE` when created

### 6.2 V3 → V1 Chain

✅ **Supported:** Current implementation (`orderRouteSwap` with version detection)

- V3 order uses `EDatumType.INLINE`
- V1 datum **cannot** be inline, so it's stored as `EDatumType.HASH`
- Full V1 datum attached to metadata

```typescript
const { tx } = await this.swap({
  orderAddresses: {
    DestinationAddress: {
      datum: {
        type: secondBuilder.getDatumType(),  // Adapts to V1 (HASH) or V3 (INLINE)
        value: secondBuilder.getDatumType() === EDatumType.HASH
          ? datumHash
          : (secondSwapData.datum as string),
      },
    },
  },
});
```

### 6.3 V1 → V3 → V1 Chain

⚠️ **Requires Special Handling:**

- First V1 → V3 transition stores V3 datum in metadata
- Second V3 → V1 transition stores V1 datum in metadata
- Both datums must coexist in the same metadata map (label `103251n`)

**Implementation:**

```typescript
const metadataDatums = new Map<Buffer, Buffer[]>();

// Add V3 datum (for first transition)
metadataDatums.set(
  Buffer.from(v3DatumHash, "hex"),
  SundaeUtils.splitMetadataString(v3DatumCbor).map(v => Buffer.from(v, "hex"))
);

// Add V1 datum (for second transition)
metadataDatums.set(
  Buffer.from(v1DatumHash, "hex"),
  SundaeUtils.splitMetadataString(v1DatumCbor).map(v => Buffer.from(v, "hex"))
);

// Attach to transaction
metadata.set(103251n, Core.Metadatum.fromCore(metadataDatums));
```

### 6.4 Fee Padding for Variable Outputs

The SDK includes a `feePadding` parameter for scenarios where output amounts may vary:

```typescript
const orderDeposit = baseOrderDeposit + (swapArgs.feePadding ?? 0n);
```

This is critical for cross-version chains where:
- Swap outputs are estimates (slippage)
- Deposit requirements may differ between versions

---

## 7. Code Examples from Current Implementation

### 7.1 Same-Version Chaining (V1 Zap)

```typescript
// V1 zap: swap → deposit (same version)
const { hash: depositHash, inline: depositInline } =
  this.datumBuilder.buildDepositDatum({
    ident: pool.ident,
    orderAddresses,
    deposit: depositPair,
    scooperFee: this.__getParam("maxScooperFee"),
  });

const swapData = this.datumBuilder.buildSwapDatum({
  ident: pool.ident,
  fundedAsset: halfSuppliedAmount,
  orderAddresses: {
    DestinationAddress: {
      address: scriptAddress.toBech32(),
      datum: {
        type: EDatumType.HASH,
        value: depositHash,  // Reference deposit by hash
      },
    },
    AlternateAddress: orderAddresses.DestinationAddress.address,
  },
  // ...
});

// Attach deposit datum to metadata
const metadata = new Map<bigint, Core.Metadatum>();
metadata.set(
  103251n,
  Core.Metadatum.fromCore(
    new Map([[
      Buffer.from(depositHash, "hex"),
      SundaeUtils.splitMetadataString(depositInline).map(v =>
        Buffer.from(v, "hex")
      ),
    ]]),
  ),
);
tx.setAuxiliaryData(data);
```

### 7.2 Cross-Version Chaining (Order Route Swap)

```typescript
// V3 → V1/V3 (adapts to destination version)
const secondBuilder = SundaeSDK.new({
  blazeInstance: this.blaze,
  customQueryProvider: this.queryProvider,
}).builder(args.swapB.pool.version);  // May be V1 or V3

const datumHash = Core.PlutusData.fromCbor(
  Core.HexBlob(secondSwapData.datum as string),
).hash();

const { tx, datum, fees } = await this.swap({
  orderAddresses: {
    DestinationAddress: {
      datum: {
        type: secondBuilder.getDatumType(),  // Dynamic based on version
        value:
          secondBuilder.getDatumType() === EDatumType.HASH
            ? datumHash
            : (secondSwapData.datum as string),
      },
    },
  },
});

// Only attach metadata if destination is V1
if (secondBuilder.getDatumType() === EDatumType.HASH) {
  const data = new Core.AuxiliaryData();
  const metadata = new Map<bigint, Core.Metadatum>();
  metadata.set(103251n, /* ... */);
  tx.setAuxiliaryData(data);
}
```

---

## 8. Recommended Composer API

```typescript
interface ITask {
  type: "swap" | "deposit" | "withdraw";
  poolIdent: string;
  suppliedAsset: AssetAmount<IAssetAmountMetadata>;
  minReceivable?: AssetAmount<IAssetAmountMetadata>;
  builder: BuilderV1 | BuilderV3;

  // Method to get order script address for this task
  getOrderScriptAddress(): string;

  // Method to calculate expected output
  getExpectedOutput(): AssetAmount<IAssetAmountMetadata>;
}

class Composer {
  constructor(
    private finalDestination: string,
    private tasks: ITask[]
  ) {}

  async build(): Promise<IComposedTx> {
    // 1. Validate task chain (ensure compatible versions)
    this.validateChain();

    // 2. Resolve outputs (connect task N's output to task N+1's input)
    this.resolveOutputs();

    // 3. Build datums in reverse order (destination first)
    const resolvedTasks = this.resolveDatumChain();

    // 4. Accumulate fees
    const totalScooperFee = this.calculateTotalScooperFee();
    const totalDeposit = this.calculateTotalDeposit();

    // 5. Build transaction
    const tx = this.blaze.newTransaction();

    for (const { task, datum, destinationAddress } of resolvedTasks) {
      const payment = this.calculatePayment(task, totalScooperFee);

      tx.provideDatum(Core.PlutusData.fromCbor(Core.HexBlob(datum.inline)))
        .lockAssets(
          Core.addressFromBech32(destinationAddress),
          payment,
          task.builder.getDatumType() === EDatumType.HASH
            ? Core.DatumHash(datum.hash)
            : Core.PlutusData.fromCbor(Core.HexBlob(datum.inline))
        );
    }

    // 6. Attach metadata (for V1 compatibility)
    const metadata = this.buildMetadata(resolvedTasks);
    if (metadata.size > 0) {
      const data = new Core.AuxiliaryData();
      data.setMetadata(new Core.Metadata(metadata));
      tx.setAuxiliaryData(data);
    }

    return this.completeTx({
      tx,
      datum: resolvedTasks[0].datum.inline,
      deposit: totalDeposit,
      scooperFee: totalScooperFee,
    });
  }

  private validateChain(): void {
    // Ensure output of task N matches input of task N+1
    for (let i = 0; i < this.tasks.length - 1; i++) {
      const output = this.tasks[i].getExpectedOutput();
      const nextInput = this.tasks[i + 1].suppliedAsset;

      if (output.metadata.assetId !== nextInput.metadata.assetId) {
        throw new Error(
          `Task ${i} output (${output.metadata.assetId}) does not match ` +
          `task ${i + 1} input (${nextInput.metadata.assetId})`
        );
      }
    }
  }

  private resolveOutputs(): void {
    // Connect outputs to inputs
    for (let i = 0; i < this.tasks.length - 1; i++) {
      const expectedOutput = this.tasks[i].getExpectedOutput();
      this.tasks[i + 1].suppliedAsset = expectedOutput;
    }
  }

  private resolveDatumChain(): IResolvedTask[] {
    const resolved: IResolvedTask[] = [];
    const metadataMap = new Map<string, string>();

    // Process in REVERSE (destination first)
    for (let i = this.tasks.length - 1; i >= 0; i--) {
      const currentTask = this.tasks[i];
      const nextTask = this.tasks[i + 1];

      const destinationAddress = nextTask
        ? nextTask.getOrderScriptAddress()
        : this.finalDestination;

      const datum = this.buildDatum(currentTask, {
        destinationAddress,
        destinationDatum: nextTask ? this.getDatumReference(nextTask) : null,
      });

      // Store in metadata if next task is V1
      if (nextTask && nextTask.builder.getDatumType() === EDatumType.HASH) {
        metadataMap.set(datum.hash, datum.inline);
      }

      resolved.unshift({ task: currentTask, datum, destinationAddress });
    }

    return resolved;
  }

  private buildMetadata(tasks: IResolvedTask[]): Map<bigint, Core.Metadatum> {
    const metadata = new Map<bigint, Core.Metadatum>();
    const datums = new Map<Buffer, Buffer[]>();

    for (let i = 0; i < tasks.length - 1; i++) {
      const nextTask = tasks[i + 1];

      if (nextTask.task.builder.getDatumType() === EDatumType.HASH) {
        datums.set(
          Buffer.from(nextTask.datum.hash, "hex"),
          SundaeUtils.splitMetadataString(nextTask.datum.inline).map(v =>
            Buffer.from(v, "hex")
          )
        );
      }
    }

    if (datums.size > 0) {
      metadata.set(103251n, Core.Metadatum.fromCore(datums));
    }

    return metadata;
  }
}
```

---

## 9. Conclusion

### Feasibility: ✅ **CONFIRMED**

The Composer layer is **fully feasible** and follows established patterns in the SundaeSwap SDK. Key takeaways:

1. **Datum chaining works by building in reverse order** (destination first, then source)
2. **Cross-version chaining requires metadata** (label `103251n`) to bridge V1's hashed datums with V3's inline datums
3. **Fee accumulation is additive** across all chained orders
4. **Output passing is resolved at configuration time** using pool liquidity calculations
5. **The pattern is proven** by existing implementations: `migrateLiquidityToV3()`, `orderRouteSwap()`, and `zap()`

### Recommended Next Steps

1. **Extract common chaining logic** into a `DatumChainResolver` utility class
2. **Implement Composer class** following the recommended API above
3. **Add builder methods:**
   - `getExpectedOutput(task: ITask): AssetAmount`
   - `getTasks(): ITask[]`
4. **Test edge cases:**
   - V1 → V3 → V1 chains (multiple metadata entries)
   - Fee padding for variable outputs
   - Slippage handling across multiple swaps
5. **Document metadata format** for integrators building custom scoopers

---

## Appendix: Key Source Locations

| Feature | File | Lines |
|---------|------|-------|
| V1 → V3 Migration | `TxBuilder.V1.class.ts` | 1039-1424 |
| Order Route Swap | `TxBuilder.V1.class.ts` | 335-462 |
| Order Route Swap (V3) | `TxBuilder.V3.class.ts` | 675-795 |
| V1 Zap (same-version chain) | `TxBuilder.V1.class.ts` | 848-994 |
| V3 Zap (same-version chain) | `TxBuilder.V3.class.ts` | 1225-1361 |
| Datum Type Detection | `TxBuilder.V1.class.ts` | 1448 |
| Datum Type Detection | `TxBuilder.V3.class.ts` | 1461 |
| Metadata Label Constant | `TxBuilder.V1.class.ts` | 439-451, 960-972 |
