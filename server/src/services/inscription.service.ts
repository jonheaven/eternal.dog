import { logger } from '../utils/logger';

export interface InscriptionResult {
  valid: boolean;
  reason?: string;
  size?: number;
  chunks?: number;
}

export class InscriptionService {
  // Protocol identifier for Dogecoin ordinals (matches Bitcoin ordinals)
  private static readonly PROTOCOL_ID = Buffer.from('ord');
  private static readonly CHUNK_SIZE = 520; // Maximum safe chunk size for script pushes

  /**
   * Builds a complete inscription script with image content
   * Structure: OP_FALSE OP_IF "ord" [0x01 content_type] [0x00] [chunk1] [chunk2] ... OP_ENDIF
   *
   * This creates a witness script that can be embedded in a Dogecoin transaction
   * The content is preserved permanently on the blockchain
   */
  buildInscriptionScript(imageBuffer: Buffer, contentType: string): Buffer {
    const chunks = this.chunkContent(imageBuffer, InscriptionService.CHUNK_SIZE);
    logger.debug(
      `[INSCRIPTION] Building script with ${chunks.length} chunks, content-type: ${contentType}`,
    );

    const opcodes = {
      OP_FALSE: 0x00,
      OP_IF: 0x63,
      OP_ENDIF: 0x68,
    };

    // Start building the script
    let scriptBuffer = Buffer.alloc(0);

    // OP_FALSE OP_IF
    scriptBuffer = Buffer.concat([scriptBuffer, Buffer.from([opcodes.OP_FALSE, opcodes.OP_IF])]);

    // Push "ord" protocol ID
    scriptBuffer = Buffer.concat([scriptBuffer, this.pushData(InscriptionService.PROTOCOL_ID)]);

    // Push content-type: 0x01 + content type string
    const contentTypeBuffer = Buffer.concat([
      Buffer.from([0x01]),
      Buffer.from(contentType, 'utf-8'),
    ]);
    scriptBuffer = Buffer.concat([scriptBuffer, this.pushData(contentTypeBuffer)]);

    // Push empty slice (separator)
    scriptBuffer = Buffer.concat([scriptBuffer, this.pushData(Buffer.alloc(0))]);

    // Push all content chunks
    for (const chunk of chunks) {
      scriptBuffer = Buffer.concat([scriptBuffer, this.pushData(chunk)]);
    }

    // OP_ENDIF
    scriptBuffer = Buffer.concat([scriptBuffer, Buffer.from([opcodes.OP_ENDIF])]);

    logger.info(
      `[INSCRIPTION] Script built: ${scriptBuffer.length} bytes total, ${chunks.length} chunks`,
    );
    return scriptBuffer;
  }

  /**
   * Split content into safe chunks for blockchain storage
   * 520 bytes is the maximum safe size for script push operations
   */
  chunkContent(buffer: Buffer, chunkSize: number = InscriptionService.CHUNK_SIZE): Buffer[] {
    const chunks: Buffer[] = [];
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const endIndex = Math.min(i + chunkSize, buffer.length);
      chunks.push(buffer.slice(i, endIndex));
    }
    logger.debug(`[INSCRIPTION] Split ${buffer.length} bytes into ${chunks.length} chunks`);
    return chunks;
  }

  /**
   * Verify inscription doesn't exceed safe limits
   * Dogecoin blocks are 4 MB, but we want room for other transactions
   */
  verifyInscriptionSize(imageBuffer: Buffer): InscriptionResult {
    const MAX_INSCRIPTION_SIZE = 1024 * 1024; // 1 MB max
    const RECOMMENDED_MAX = 500 * 1024; // 500 KB recommended

    if (imageBuffer.length > MAX_INSCRIPTION_SIZE) {
      return {
        valid: false,
        reason: `Image too large: ${imageBuffer.length} bytes exceeds maximum ${MAX_INSCRIPTION_SIZE} bytes`,
        size: imageBuffer.length,
      };
    }

    if (imageBuffer.length > RECOMMENDED_MAX) {
      logger.warn(
        `[INSCRIPTION] Image size ${imageBuffer.length} bytes exceeds recommended ${RECOMMENDED_MAX} bytes`,
      );
    }

    const chunks = Math.ceil(imageBuffer.length / InscriptionService.CHUNK_SIZE);
    return {
      valid: true,
      size: imageBuffer.length,
      chunks,
    };
  }

  /**
   * Build witness data for a transaction
   * This combines all the inscription elements into witness format
   */
  buildWitnessData(imageBuffer: Buffer, contentType: string): Buffer[] {
    const script = this.buildInscriptionScript(imageBuffer, contentType);

    // Witness format: [script, empty element]
    // The script is what gets pushed into the witness
    return [script, Buffer.alloc(0)];
  }

  /**
   * Encode data for script pushes
   * Handles size encoding and push opcodes
   *
   * If size < 75: single byte opcode with size
   * If size 75-255: OP_PUSHDATA1 followed by size byte
   * If size 256-65535: OP_PUSHDATA2 followed by 2-byte little-endian size
   */
  private pushData(data: Buffer): Buffer {
    const length = data.length;

    if (length === 0) {
      // Empty push: OP_0
      return Buffer.from([0x00]);
    }

    if (length <= 75) {
      // Direct push: single byte indicating length
      return Buffer.concat([Buffer.from([length]), data]);
    }

    if (length <= 0xff) {
      // OP_PUSHDATA1: 0x4c <1 byte size> <data>
      return Buffer.concat([Buffer.from([0x4c, length]), data]);
    }

    if (length <= 0xffff) {
      // OP_PUSHDATA2: 0x4d <2 byte little-endian size> <data>
      const sizeBuffer = Buffer.alloc(2);
      sizeBuffer.writeUInt16LE(length, 0);
      return Buffer.concat([Buffer.from([0x4d]), sizeBuffer, data]);
    }

    throw new Error(
      `Data too large for script push: ${length} bytes (max 65535 bytes per chunk)`,
    );
  }

  /**
   * Estimate transaction size for inscription
   * Used for fee calculation
   */
  estimateTransactionSize(imageBuffer: Buffer, contentType: string): number {
    const scriptSize = this.buildInscriptionScript(imageBuffer, contentType).length;

    // Transaction overhead
    const VERSION = 4; // bytes
    const INPUT_COUNT_VARINT = 1; // bytes
    const OUTPUT_COUNT_VARINT = 1; // bytes
    const LOCKTIME = 4; // bytes

    // Input: outpoint (32 + 4) + varint script length + script + sequence (4)
    const INPUT_OUTPOINT = 36;
    const INPUT_SEQUENCE = 4;
    const INPUT_SCRIPT_VARINT = 1;
    const INPUT_SIZE = INPUT_OUTPOINT + INPUT_SCRIPT_VARINT + INPUT_SEQUENCE;

    // Output: value (8) + varint script length + script
    const OUTPUT_VALUE = 8;
    const OUTPUT_SCRIPT_VARINT = 3; // for larger scripts
    const OUTPUT_SIZE = OUTPUT_VALUE + OUTPUT_SCRIPT_VARINT + scriptSize;

    // Witness: witness count + items + witness script
    const WITNESS_STACK_ITEM_COUNT = 1;
    const WITNESS_SCRIPT_VARINT = 3;
    const WITNESS_SIZE = WITNESS_STACK_ITEM_COUNT + WITNESS_SCRIPT_VARINT + scriptSize;

    const totalSize =
      VERSION +
      INPUT_COUNT_VARINT +
      INPUT_SIZE +
      OUTPUT_COUNT_VARINT +
      OUTPUT_SIZE +
      LOCKTIME +
      WITNESS_SIZE;

    logger.debug(`[INSCRIPTION] Estimated transaction size: ${totalSize} bytes`);
    return totalSize;
  }

  /**
   * Generate inscription ID from transaction
   * In real ordinals, this is: TXID + i + OUTPUT_INDEX
   * For now, returns a deterministic ID based on content hash
   */
  generateInscriptionId(imageBuffer: Buffer, contentType: string, txid?: string): string {
    if (txid) {
      // Format: TXID:0:0 (transaction:input:satpoint)
      return `${txid}:0:0`;
    }

    // Fallback: content-based ID (used before transaction confirms)
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
    return `pending_${hash.substring(0, 32)}i0`;
  }
}
