# Quick Start: Inscription Research Phase

## Where Everything Is

```
eternal.dog/
├── /temp/ref/                          ← ord-dogecoin source code
│   ├── src/inscription.rs              ← Chunking logic (520-byte chunks)
│   ├── src/subcommand/wallet/transaction_builder.rs ← Transaction building
│   ├── README.md                       ← Overview of Dogecoin ordinals
│   └── ...
├── INSCRIPTION_REFERENCE.md            ← Technical guide (read this first)
├── INSCRIPTION_IMPLEMENTATION.md       ← Phase breakdown and next steps
├── CAMPAIGN_TRACKING.md                ← Ad tracking setup (already done)
├── server/
│   └── src/
│       └── services/
│           ├── dogecoin.service.ts     ← To be enhanced for full images
│           └── (inscription.service.ts) ← To be created
└── .gitignore                          ← /temp/ excluded
```

## Key Code Locations in Reference

### How Inscriptions Work
**File**: `temp/ref/src/inscription.rs` (line 88-95)
```rust
for chunk in body.chunks(520) {  // 520-byte chunks
  builder = builder.push_slice(chunk);
}
```

### Transaction Building
**File**: `temp/ref/src/subcommand/wallet/transaction_builder.rs`
- Lines 1-50: Overview and error types
- Lines 98-200: TransactionBuilder struct and methods
- Key methods: `select_outgoing()`, `align_outgoing()`, `deduct_fee()`, `build()`

## Reading Order

1. **INSCRIPTION_REFERENCE.md** (10 min) - Understand the theory
2. **temp/ref/src/inscription.rs** (20 min) - See chunking in action
3. **temp/ref/src/subcommand/wallet/transaction_builder.rs** (30 min) - Understand transaction flow
4. **INSCRIPTION_IMPLEMENTATION.md** (10 min) - Plan the code

## What We Need to Build

```typescript
// 1. Script building (no blockchain needed)
export class InscriptionService {
  buildInscriptionScript(imageBuffer, contentType): Buffer
  chunkContent(buffer, chunkSize = 520): Buffer[]
}

// 2. Tatum integration (blockchain interaction)
// Enhanced dogecoin.service.ts
async inscribeFullImage(imageBuffer, text, address): {
  inscriptionId: string;
  txid: string;
}
```

## The 520-Byte Chunk Pattern

```
[512×512 PNG ~100KB image]
        ↓
[Chunk 1: 520 bytes]
[Chunk 2: 520 bytes]
[Chunk 3: 520 bytes]
...
[Chunk 195: remaining bytes]
        ↓
[Script with all chunks]
        ↓
[Transaction witness]
        ↓
[Blockchain forever]
```

## Tatum API Calls (Pseudocode)

```typescript
// 1. Build script locally (no RPC)
const script = buildInscriptionScript(imageBuffer, 'image/png');

// 2. Create transaction
const tx = await tatum.call('createrawtransaction', [inputs, outputs]);

// 3. Sign transaction
const signed = await tatum.call('signrawtransactionwithwallet', [tx]);

// 4. Send to network
const txid = await tatum.call('sendrawtransaction', [signed.hex]);
```

## Cost Per Inscription

- Network fee: ~0.001 DOGE (~$0.0001)
- Tatum API: ~$0.01
- IPFS storage: ~1 MB (already paid)
- **Total: ~$0.01**

Revenue: $14.20 → $9-10 profit after fees

## Files to Review in Reference

**Highest Priority** (read first):
- `src/inscription.rs` - Line 88-95 (chunking), Line 60-80 (structure)
- `README.md` - Lines 1-50 (overview)

**High Priority** (understand):
- `src/subcommand/wallet/transaction_builder.rs` - Lines 1-50 (overview)
- `fuzz/fuzz_targets/transaction_builder.rs` - Example usage

**Nice to Have** (reference):
- `src/chain.rs` - Network constants
- `src/media.rs` - Content type detection

## Next Actions

1. **This week**: Read reference docs and source
2. **Phase 1**: Build InscriptionService with chunking
3. **Phase 2**: Tatum API integration
4. **Phase 3**: Integration + testing on testnet
5. **Phase 4**: Mainnet launch

---

**Everything is in place. The reference code is clean and waiting. Start with INSCRIPTION_REFERENCE.md and take it step by step.**
