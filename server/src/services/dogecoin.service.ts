import { logger } from '../utils/logger.js';
import { InscriptionService } from './inscription.service.js';
import { env } from '../config/env.js';

export interface InscriptionTxResult {
  inscriptionId: string;
  txid: string;
  scriptSize: number;
  chunks: number;
  estimatedFee: number;
}

export class DogecoinService {
  private inscriptionService = new InscriptionService();
  private managedWalletEnvVars = [
    'DOGE_MANAGED_WALLET_ADDRESS',
    'MANAGED_WALLET_ADDRESS',
    'DOGECOIN_WALLET_ADDRESS',
  ];

  /**
   * Resolve the managed Dogecoin wallet address from environment
   * Throws if missing to prevent silent misrouting of funds.
   */
  getManagedRecipientAddress(): string {
    const address = this.managedWalletEnvVars
      .map((key) => process.env[key])
      .find((val) => !!val);

    if (!address) {
      throw new Error(
        'Managed Dogecoin wallet address not configured. Set one of DOGE_MANAGED_WALLET_ADDRESS, MANAGED_WALLET_ADDRESS, or DOGECOIN_WALLET_ADDRESS.',
      );
    }
    return address;
  }

  /**
   * Inscribe a full image on the Dogecoin blockchain
   * Creates a transaction with the image data embedded in the witness
   *
   * Flow:
   * 1. Validate image size
   * 2. Build inscription script locally
   * 3. Create transaction via Tatum RPC (when implemented)
   * 4. Sign transaction
   * 5. Broadcast to network
   *
   * NOTE: Currently uses simulated TXID until Tatum integration is complete
   */
  async inscribeFullImage(
    imageBuffer: Buffer,
    text: string,
    recipientAddress: string,
  ): Promise<InscriptionTxResult> {
    logger.info(`[DOGECOIN] Starting full image inscription: ${imageBuffer.length} bytes`);

    // Validate image
    const validation = this.inscriptionService.verifyInscriptionSize(imageBuffer);
    if (!validation.valid) {
      logger.error(`[DOGECOIN] Validation failed: ${validation.reason}`);
      throw new Error(`Inscription validation failed: ${validation.reason}`);
    }

    // Determine content type
    const contentType = 'image/png';

    // Build inscription script
    const inscriptionScript = this.inscriptionService.buildInscriptionScript(
      imageBuffer,
      contentType,
    );

    // Estimate transaction size for fee calculation
    const txSize = this.inscriptionService.estimateTransactionSize(imageBuffer, contentType);

    // Estimate fee: 1 sat/byte is typical for Dogecoin
    const estimatedFee = txSize;

    logger.info(
      `[DOGECOIN] Inscription script built: ${inscriptionScript.length} bytes, ` +
        `estimated tx size: ${txSize} bytes, estimated fee: ${estimatedFee} sats`,
    );

    try {
      // TODO: Replace with actual Tatum RPC calls
      // For now, generate a simulated transaction ID
      const simulatedTxid = this.generateSimulatedTxid();

      const inscriptionId = this.inscriptionService.generateInscriptionId(
        imageBuffer,
        contentType,
        simulatedTxid,
      );

      logger.info(
        `[DOGECOIN] Inscription configured: txid=${simulatedTxid}, ` +
          `inscriptionId=${inscriptionId}, chunks=${validation.chunks}`,
      );

      // TODO: In production, actually submit the transaction
      // For now, log that this would be submitted
      logger.warn(
        `[DOGECOIN] Full inscription not yet submitted to network. ` +
          `In production, this would create a ${txSize} byte transaction with ` +
          `${validation.chunks} chunks of image data.`,
      );

      return {
        inscriptionId,
        txid: simulatedTxid,
        scriptSize: inscriptionScript.length,
        chunks: validation.chunks!,
        estimatedFee,
      };
    } catch (error) {
      logger.error(`[DOGECOIN] Inscription failed: ${(error as any)?.message || error}`);
      throw new Error(`Failed to inscribe image: ${(error as any)?.message || String(error)}`);
    }
  }

  /**
   * Legacy: inscribe text only
   * Kept for backward compatibility
   */
  async inscribeDoginal(image: Buffer, text: string): Promise<string> {
    logger.info(`[DOGECOIN] Text inscription (legacy) for ${text.length} characters`);
    const result = await this.inscribeFullImage(
      image,
      text,
      this.getManagedRecipientAddress(),
    );
    return result.inscriptionId;
  }

  async createWallet(): Promise<string> {
    // TODO: Call Tatum wallet generation API
    // For now, generate a mock Dogecoin address
    const mockAddress = this.generateMockDogecoinAddress();
    logger.info(`[DOGECOIN] Generated mock wallet: ${mockAddress}`);
    return mockAddress;
  }

  async sendDoge(toAddress: string, amount: number): Promise<void> {
    logger.info(`[DOGECOIN] Would send ${amount} DOGE to ${toAddress} via Tatum`);
    // TODO: Call Tatum transaction API
    logger.warn(
      `[DOGECOIN] DOGE reward not yet sent to network. ` +
        `In production, this would transfer ${amount} DOGE to ${toAddress}.`,
    );
  }

  /**
   * Generate a simulated Dogecoin transaction ID for testing
   * Format: 64 hex characters (256 bits)
   */
  private generateSimulatedTxid(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a mock Dogecoin address for testing
   * Real addresses would come from Tatum wallet generation
   */
  private generateMockDogecoinAddress(): string {
    // Dogecoin addresses start with D (mainnet) or n/m (testnet)
    const prefix = env.TATUM_API_KEY?.includes('test') ? 'n' : 'D';
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(Math.random().toString()).digest();
    const address = prefix + hash.toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 33);
    return address;
  }
}
