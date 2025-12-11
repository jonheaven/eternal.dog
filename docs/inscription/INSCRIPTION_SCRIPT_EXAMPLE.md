# Example Inscription Script Output

This document shows what the `buildInscriptionScript()` method actually creates.

## Input Example
```
Image: 512×512 PNG = 98,456 bytes
Content-Type: image/png
```

## Chunking Process
```
98,456 bytes ÷ 520 bytes/chunk = 189 chunks + remainder

Chunk 1: 520 bytes (image data)
Chunk 2: 520 bytes (image data)
...
Chunk 189: 256 bytes (remaining)
```

## Script Output (Hex)
The `buildInscriptionScript()` creates:

```
00            ← OP_FALSE
63            ← OP_IF
03            ← Push 3 bytes
6f7264        ← "ord" (protocol ID)
01            ← Push 1 byte
09            ← Push 9 bytes
696d6167652f706e67  ← "image/png" (content-type)
00            ← Push 0 bytes (empty slice, separator)
[520 bytes]   ← Chunk 1 data pushed
[520 bytes]   ← Chunk 2 data pushed
...
[256 bytes]   ← Chunk 189 data pushed
68            ← OP_ENDIF
```

## Structure Breakdown

### Part 1: Wrapper (5 bytes)
```
OP_FALSE (0x00)     - Start witness section
OP_IF (0x63)        - Begin conditional script
Push 3 (0x03)       - Next 3 bytes are data
"ord"               - Protocol identifier
```

### Part 2: Metadata (12 bytes for image/png)
```
Push 1 (0x01)           - Next 1 byte is data
0x09                    - Length of content-type
"image/png"             - MIME type (9 bytes)
```

### Part 3: Separator (1 byte)
```
Push 0 (0x00)       - Empty push, marks content start
```

### Part 4: Image Data (98,456 bytes)
```
For each 520-byte chunk:
  [Varint length encoding] [chunk data]

Example for first chunk:
  0xfd 0x08 0x02      ← OP_PUSHDATA2 with 520 in little-endian
  [520 bytes of image]
```

### Part 5: Closing (1 byte)
```
OP_ENDIF (0x68)     - End conditional script
```

## Total Size
```
Wrapper:        5 bytes
Metadata:       12 bytes
Separator:      1 byte
Chunk headers:  189 × 3 bytes = 567 bytes  (OP_PUSHDATA2 format)
Image data:     98,456 bytes
Closing:        1 byte

Total:          ~99,000 bytes for the script alone

In a full transaction:
  - Input (36 + witness overhead): ~40 bytes
  - Output (8 + headers): ~50 bytes
  - Scripts + data: ~99,000 bytes
  
  Total transaction: ~99,100 bytes ≈ 99 KB
```

## Bitcoin Script Parsing

A Bitcoin/Dogecoin parser reading this would:

```javascript
1. Read OP_FALSE OP_IF
   → Witness mode activated

2. Pop "ord" from stack
   → Identifies as ordinals inscription

3. Pop content-type "image/png"
   → Knows how to interpret following data

4. Pop empty slice
   → Marks end of metadata, start of payload

5. Pop 189 data chunks
   → Concatenate into full image buffer

6. Read OP_ENDIF
   → Witness complete

7. Verify: 98,456 bytes reconstructed = original image ✓
```

## In Transaction Context

### Full Transaction Structure
```
Version (4 bytes)
├─ Input count (1 byte)
├─ Input (36 bytes)
├─ Output count (1 byte)
├─ Output
│  ├─ Value (8 bytes) - 0 (data inscription)
│  ├─ Script (variable)
│  │  └─ OP_1 [pubkey]  (pay-to-pubkey-hash script)
│  └─ [INSCRIPTION SCRIPT] (99,000 bytes)
├─ Witness
│  ├─ Stack item count
│  ├─ [INSCRIPTION SCRIPT] (99,000 bytes again in witness)
│  └─ Empty signature
└─ Locktime (4 bytes)

Total: ~99,100 bytes
```

## How Miners Preserve This

```
Dogecoin Node receives transaction:
  ├─ Validates signature
  ├─ Validates script execution
  ├─ Validates witness data
  └─ Includes in block

Block includes transaction:
  ├─ Full 99 KB script
  ├─ Full 99 KB witness
  └─ [Everything else in block]

Block is mined and confirmed:
  ├─ Becomes immutable
  ├─ Propagates to all nodes
  ├─ Stored in blockchain forever
  └─ Image permanently inscribed on Dogecoin ✓
```

## Verification Process

To later verify the inscription, nodes can:

```javascript
// Extract inscription from TXID
const tx = blockchain.getTransaction(txid);
const witnessData = tx.witness[0];  // Our inscription script

// Parse it
const parser = new InscriptionParser();
const parsed = parser.parse(witnessData);
// parsed = {
//   protocol: "ord",
//   contentType: "image/png",
//   body: [Buffer of 98,456 bytes]
// }

// Display the image
const imageUrl = ipfs.getUrl(parsed.body);  // Show on IPFS or blockchain
```

## Example: Small Image (1 KB)

For a 1,024-byte image:
```
Chunks: 2 (520 + 504)

Script:
  OP_FALSE OP_IF "ord" 0x01 "image/png" 0x00
  [520 bytes]
  [504 bytes]
  OP_ENDIF

Total: ~1,100 bytes

In transaction:
  Overhead: ~100 bytes
  Script: ~1,100 bytes
  Total TX: ~1,200 bytes
  Fee: ~1,200 sats (~$0.00001)
```

## Example: Large Image (100 KB)

For a 102,400-byte image:
```
Chunks: 197 (520 × 196 + 480)

Script:
  OP_FALSE OP_IF "ord" 0x01 "image/png" 0x00
  [520 bytes]
  [520 bytes]
  ...
  [520 bytes]  (196 times)
  [480 bytes]
  OP_ENDIF

Total: ~102,600 bytes

In transaction:
  Overhead: ~100 bytes
  Script: ~102,600 bytes
  Total TX: ~102,700 bytes ≈ 100 KB
  Fee: ~100,000 sats (~$0.001 = $0.10)
```

## Why 520 Bytes Per Chunk?

Bitcoin script max push:
- Single byte push: ≤ 75 bytes
- OP_PUSHDATA1: ≤ 255 bytes
- OP_PUSHDATA2: ≤ 65,535 bytes
- OP_PUSHDATA4: ≤ 4 GB

Safe size:
- 520 bytes fits comfortably in OP_PUSHDATA2
- Balances: script complexity vs TX size
- Dogecoin ordinals also use 520 (Bitcoin ordinals use 510)

## Cost-Benefit Analysis

### Benefits
- Image permanently on blockchain ✓
- Immutable (cannot be changed) ✓
- Universally accessible (no central server) ✓
- Verified by cryptography ✓
- Survives any service shutdown ✓

### Costs
- ~100 KB per image
- ~$0.0001 - $0.1 per inscription
- Network bandwidth
- Storage for full nodes (~4 GB blockchain)

### ROI
- $14.20 per inscription
- ~$0.01 cost
- ~$9-10 net profit per sale
- **Unlimited scalability** (each inscription is permanent)

---

**This is what "immortalize your dog on the blockchain" literally means: the data is embedded forever in Dogecoin's immutable ledger.** 🐕⛓️
