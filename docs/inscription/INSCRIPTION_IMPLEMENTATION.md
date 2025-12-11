# Phase: Full Image Inscription Implementation

## What's Been Done

### 1. ✅ Reference Repository Set Up
- Cloned `https://github.com/apezord/ord-dogecoin.git` into `/temp/ref/`
- Added `/temp/` to `.gitignore` to prevent accidental commits
- Reference material is ~7,200 objects, ready for study

### 2. ✅ Reference Documentation Created
- **INSCRIPTION_REFERENCE.md** - Complete guide to:
  - How Dogecoin ordinals inscriptions work
  - Content chunking strategy (520-byte chunks)
  - Script structure (OP_FALSE OP_IF "ord" content_type chunks OP_ENDIF)
  - Tatum API adaptation strategy
  - Files to implement
  - Testing strategy

### 3. ✅ Campaign Tracking System Complete
- UTM parameter extraction from ad links
- Campaign attribution in Events (utmSource, utmCampaign, utmMedium, utmContent)
- Real-time Slack notifications showing which campaign converted
- `/stats` endpoint breakdown by campaign with completion rates and ROI

## Key Insights from Reference Code

### Inscription Structure (from `src/inscription.rs`)
```rust
// Chunks content into 520-byte pieces
for chunk in body.chunks(520) {
  builder = builder.push_slice(chunk);
}

// Script structure:
// OP_FALSE OP_IF "ord" [0x01 content_type] [empty slice] [chunk1] [chunk2] ... OP_ENDIF
```

### Transaction Building (from `src/subcommand/wallet/transaction_builder.rs`)
```rust
// Two-phase approach:
// 1. Build transaction locally with inscription data
// 2. Sign and submit to network
```

## Implementation Plan

### Phase 1: Script Building (This Week)
Create `server/src/services/inscription.service.ts`:
```typescript
export class InscriptionService {
  buildInscriptionScript(imageBuffer: Buffer, contentType: string): Buffer
  chunkContent(buffer: Buffer, chunkSize: number = 520): Buffer[]
  buildWitnessData(chunks: Buffer[], contentType: string): Buffer
  verifyInscriptionSize(imageBuffer: Buffer): { valid: boolean }
}
```

**Input**: PNG buffer (from IPFS)
**Output**: Bitcoin-style witness script ready for transaction

### Phase 2: Tatum Integration (Phase 2)
Enhance `server/src/services/dogecoin.service.ts`:
```typescript
async inscribeFullImage(
  imageBuffer: Buffer,
  text: string,
  recipientAddress: string
): Promise<{ inscriptionId: string; txid: string }>
```

**Flow**:
1. Call `createrawtransaction` with inscription witness
2. Call `signrawtransactionwithwallet`
3. Call `sendrawtransaction`
4. Return inscription ID + TXID

### Phase 3: Integration (Phase 3)
Update payment flow:
- Instead of: `OP_RETURN text` (80-byte limit, text only)
- Now: Full inscription script with image + text chunks

**Cost Impact**:
- Current: ~200 bytes transaction
- New: ~60 KB transaction (still cheap on Dogecoin)
- Testnet fee: ~0.01 DOGE (~$0.0001)
- Mainnet fee: Varies with network, still < $1

## Data Structure

### Current Doginal Model
```typescript
{
  inscriptionId: string,
  ipfsCid: string,              // Image on IPFS
  walletAddress: string,        // For $4.20 DOGE payout
  userEmail: string,
}
```

### Enhanced Doginal Model (No change needed)
```typescript
{
  inscriptionId: string,        // Will now be actual Dogecoin inscription ID
  ipfsCid: string,              // Still store on IPFS for fast retrieval
  walletAddress: string,        // Still send $4.20 DOGE
  userEmail: string,
  imageSize: number,            // For auditing
  chunks: number,               // How many 520-byte chunks
  txid: string,                 // Dogecoin blockchain TXID
  blockHeight?: number,         // After confirmation
}
```

## Testing Checklist

- [ ] Unit test: Chunk 512×512 PNG into 520-byte pieces
- [ ] Unit test: Build valid inscription script
- [ ] Integration test: Submit to Dogecoin testnet via Tatum
- [ ] Integration test: Verify inscription appears in block explorer
- [ ] Integration test: Retrieve inscription data and verify content
- [ ] E2E test: Upload → Payment → Inscription → Email (testnet)
- [ ] Mainnet: Live inscription with real payment

## Security Considerations

1. **Image Validation**
   - Max size: 1 MB (prevent DoS)
   - Verify file type before inscribing
   - Scan for suspicious content

2. **Transaction Confirmation**
   - Wait for block confirmation before notifying user
   - Store pending inscriptions separately
   - Retry failed inscriptions

3. **Wallet Management**
   - Never expose private keys
   - Tatum handles signing (secure)
   - Only use change addresses

## Budget Impact

**Per Inscription**:
- Dogecoin network fee: ~0.001-0.01 DOGE (varies by network congestion)
- Tatum API calls: ~$0.01 (included in plan)
- IPFS storage: ~1 MB @ Pinata (included in plan)
- **Total Cost**: ~$0.01 (essentially free)

**Revenue**:
- Stripe payment: $14.20
- Your profit: ~$9-10 after Stripe fees
- Inscription cost: ~$0.01
- **Net profit per inscription**: ~$9-10

## Next Steps

1. **Code review** of `/temp/ref/src/inscription.rs` for pattern details
2. **Implement InscriptionService** with script building
3. **Test locally** with PNG files
4. **Test on Dogecoin testnet** via Tatum
5. **Verify** inscriptions appear in explorer
6. **Deploy** to production

## References
- **INSCRIPTION_REFERENCE.md** - Full technical reference
- **CAMPAIGN_TRACKING.md** - Ad campaign performance tracking
- `/temp/ref/` - Full ord-dogecoin source code for reference

---

## Current File Status

### Updated Files:
- `.gitignore` - Added `/temp/` and `/reference/`
- Campaign tracking complete (all controllers updated)
- Event model enhanced with UTM fields
- `/stats` endpoint now shows campaign breakdown

### New Files:
- `INSCRIPTION_REFERENCE.md` - Technical reference
- `CAMPAIGN_TRACKING.md` - Ad tracking guide

### Next to Create:
- `server/src/services/inscription.service.ts` - Script building
- Enhanced `server/src/services/dogecoin.service.ts` - Full inscription
- Tests for inscription logic
