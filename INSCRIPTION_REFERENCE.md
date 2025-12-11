# Dogecoin Inscription Implementation Reference

## Source Reference
- Repository: https://github.com/apezord/ord-dogecoin.git (Dogecoin fork of Bitcoin Ordinals)
- Location: `/temp/ref/`
- Language: Rust (will adapt patterns to TypeScript/Node.js + Tatum API)

## Key Files to Study

### 1. Inscription Structure (`src/inscription.rs` - 893 lines)
**Core Concept**: Inscriptions store content in witness data of transactions

Key Points:
```rust
pub(crate) struct Inscription {
  body: Option<Vec<u8>>,        // The actual image/content data
  content_type: Option<Vec<u8>>, // e.g., "image/png"
}

const PROTOCOL_ID: &[u8] = b"ord"; // Magic bytes for identification
```

**Content Chunking** (Line 88-95):
```rust
if let Some(body) = &self.body {
  builder = builder.push_slice(&[]);
  for chunk in body.chunks(520) {  // 520-byte chunks
    builder = builder.push_slice(chunk);
  }
}
```

**Script Structure** (append_reveal_script):
1. `OP_FALSE` / `OP_IF` (wrapper)
2. Push "ord" (PROTOCOL_ID)
3. Push `0x01` + content-type (e.g., "image/png")
4. Push empty slice
5. Push content in 520-byte chunks
6. `OP_ENDIF`

### 2. Transaction Builder (`src/subcommand/wallet/transaction_builder.rs` - 1622 lines)
**Pattern**: Two-phase transaction construction

```rust
pub fn build_transaction_with_postage(
  outgoing: SatPoint,        // Which satoshi to send
  inscriptions: BTreeMap<SatPoint, InscriptionId>, // Track inscriptions
  amounts: BTreeMap<OutPoint, Amount>, // UTXOs to spend
  recipient: Address,        // Where to send
  change: [Address; 2],      // Change addresses
  fee_rate: FeeRate,        // Sat/byte
) -> Result<Transaction>
```

**Key Constants**:
- `ADDITIONAL_INPUT_VBYTES: 58` - Witness overhead per input
- `ADDITIONAL_OUTPUT_VBYTES: 43` - Output overhead
- `SCHNORR_SIGNATURE_SIZE: 64` - Signature in witness
- `TARGET_POSTAGE: 10,000 sats` - Keep outputs at this size

**Build Process**:
1. `select_outgoing()` - Find the UTXO containing the sat to inscribe
2. `align_outgoing()` - Adjust UTXO boundaries
3. `pad_alignment_output()` - Add padding output
4. `add_value()` - Select UTXOs for fee
5. `strip_value()` - Remove excess
6. `deduct_fee()` - Calculate and subtract fee
7. `build()` - Finalize transaction

## How Inscriptions Work

### On-Chain Layout
```
Transaction Input 0 (commit):
  - Spends a normal UTXO
  - Witness contains: scriptPubKey

Transaction:
  - Input 0: Dummy input (usually for fee)
  - Input 1: The UTXO to inscribe (commit phase)
  - Output 0: Pay to recipient with inscription in witness (reveal phase)
  - Output 1: Change address
```

### Inscription Data Flow
```
[Image File]
    ↓
[Buffer] (e.g., PNG bytes)
    ↓
[Chunks of 520 bytes each]
    ↓
[Script opcodes: OP_FALSE OP_IF "ord" 0x01 content_type 0x00 chunk1 chunk2 ...]
    ↓
[Witness Data in Transaction Output]
    ↓
[Mined in Block]
    ↓
[Permanently in Blockchain]
```

## Adaptation to Tatum API

### Current Ord Approach
- Uses local Dogecoin Core RPC
- Handles UTXOs, signing locally
- Full control over transaction structure

### Tatum Adaptation Strategy

#### Phase 1: Build Inscription Script (No RPC needed)
```typescript
// Build the inscription script locally
const inscriptionScript = buildInscriptionScript({
  body: imageBuffer,           // PNG/JPEG bytes
  contentType: 'image/png',    // MIME type
});

// Chunk content into 520-byte pieces
const chunks = chunkContent(imageBuffer, 520);
const scriptBuilder = buildOpcodeScript(chunks);
```

#### Phase 2: Create Raw Transaction via Tatum
```typescript
const txData = await tatum.call({
  method: 'createrawtransaction',
  params: [
    [{ txid: utxoId, vout: 0 }],  // Inputs (UTXO containing image)
    {
      [recipientAddress]: 0.002,   // Output with inscription data
      [changeAddress]: remainingValue
    }
  ]
});
```

#### Phase 3: Sign via Tatum/Wallet
```typescript
const signedTx = await tatum.call({
  method: 'signrawtransactionwithwallet',
  params: [txData]
});
```

#### Phase 4: Send to Network
```typescript
const txid = await tatum.call({
  method: 'sendrawtransaction',
  params: [signedTx.hex]
});
```

## Chunking Strategy for Images

### Problem
- Bitcoin/Dogecoin script size limits
- OP_RETURN is 80 bytes max (too small)
- Need to split large images

### Solution (520-byte chunks)
```typescript
function chunkContent(buffer: Buffer, chunkSize: number = 520): Buffer[] {
  const chunks: Buffer[] = [];
  for (let i = 0; i < buffer.length; i += chunkSize) {
    chunks.push(buffer.slice(i, Math.min(i + chunkSize, buffer.length)));
  }
  return chunks;
}
```

### Why 520?
- Witness script limit varies by implementation
- 520 is safe maximum for push operations
- Allows for 512×512 PNG (~50-200KB) in ~100-400 chunks

## Files to Implement

### 1. `server/src/services/inscription.service.ts`
```typescript
export class InscriptionService {
  // Build inscription script with content
  buildInscriptionScript(imageBuffer: Buffer, contentType: string): Buffer
  
  // Chunk content into safe sizes
  chunkContent(buffer: Buffer, chunkSize?: number): Buffer[]
  
  // Build witness data for transaction
  buildWitnessData(chunks: Buffer[], contentType: string): Buffer
  
  // Verify inscription before submitting
  verifyInscriptionSize(imageBuffer: Buffer): { valid: boolean; reason?: string }
}
```

### 2. `server/src/services/dogecoin.service.ts` (Enhanced)
```typescript
// Existing: inscribeDoginal() - placeholder using OP_RETURN
// New: inscribeFullImage()

async inscribeFullImage(
  imageBuffer: Buffer,
  text: string,
  recipientAddress: string
): Promise<{
  inscriptionId: string;
  txid: string;
  scriptSize: number;
  chunks: number;
}>
```

### 3. Flow Integration
```
uploadPreview()
  ↓
[User clicks "Pay Now"]
  ↓
createCheckoutSession()
  ↓
[Stripe payment webhook]
  ↓
inscribeFullImage()                    ← NEW
  ├─ Validate image size
  ├─ Chunk image (520 bytes each)
  ├─ Build inscription script
  ├─ Call Tatum createrawtransaction
  ├─ Call Tatum signrawtransactionwithwallet
  ├─ Call Tatum sendrawtransaction
  └─ Return inscriptionId
  ↓
[Image now on chain forever]
```

## Testing Strategy

1. **Local**: Test chunking with sample PNG files
   - 512×512 test images
   - Verify chunk boundaries
   - Verify script size

2. **Testnet**: Create test inscriptions on Dogecoin testnet
   - Use Tatum testnet endpoints
   - Check inscriptions appear in explorer
   - Verify content integrity

3. **Mainnet**: Live inscription with Stripe payment
   - Real user image
   - Real payment → real inscription
   - User receives blockchain proof

## Resource Limits

### Dogecoin Blockchain
- Block size: 4 MB (similar to Bitcoin)
- Transaction size limit: Same as block
- Witness discount: Like Bitcoin (v0.17+)
- Script size: No fixed limit, but practically limited

### Our Constraints
- Max image size: ~1 MB (safe for inscription)
- Typical 512×512 PNG: 50-200 KB
- Chunks: ~100-400 × 520 bytes
- Transaction size: ~60 KB typical (plenty of room)

## Next Steps

1. **Review ord-dogecoin source** for Rust patterns
2. **Map Rust logic to TypeScript** (script building, chunking)
3. **Build InscriptionService** with script opcodes
4. **Test with Tatum API** on dogecoin testnet
5. **Integrate into payment flow** (replace OP_RETURN with full inscription)
6. **Verify on-chain** (check Dogecoin explorer)

## References in /temp/ref/

- `src/inscription.rs` - Inscription structure and chunking
- `src/subcommand/wallet/transaction_builder.rs` - UTXO selection and fee logic
- `fuzz/fuzz_targets/transaction_builder.rs` - Example transaction building
- `src/chain.rs` - Network-specific constants
- `src/media.rs` - Content type detection (may be useful)
