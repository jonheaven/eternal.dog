import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { TatumSDK, Dogecoin, Network } from '@tatumio/tatum';
import bitcore from 'bitcore-lib-doge';

const MAX_CHUNK_LEN = 240;
const MAX_PAYLOAD_LEN = 1500;
const DUST_SATS = 100000; // 0.001 DOGE
const REWARD_USD = 4.20; // $4.20 USD reward amount

// Tatum SDK instance (initialized in constructor)
let tatumInstance: Dogecoin | null = null;

export interface InscriptionTxResult {
  inscriptionId: string;
  txid: string;
  scriptSize: number;
  chunks: number;
  estimatedFee: number;
}

export interface GeneratedWallet {
  address: string;
  mnemonic: string; // Seed phrase - must be delivered to user securely
  privateKey: string; // Private key - must be delivered to user securely
}

export class DogecoinService {
  private hotWalletPrivateKey: bitcore.PrivateKey;
  private hotWalletAddress: string;

  constructor() {
    // Initialize hot wallet private key
    try {
      this.hotWalletPrivateKey = bitcore.PrivateKey.fromString(
        env.HOT_WALLET_PRIVATE_KEY
      );
    } catch (error) {
      throw new Error(
        `Invalid HOT_WALLET_PRIVATE_KEY format. Use WIF or hex: ${(error as any)?.message || error}`
      );
    }

    // Set hot wallet address from env
    this.hotWalletAddress = env.HOT_WALLET_ADDRESS;

    // Initialize Tatum SDK singleton (lazy initialization)
    if (!tatumInstance) {
      tatumInstance = TatumSDK.init<Dogecoin>({
        network: Network.DOGECOIN_MAINNET,
        apiKey: env.TATUM_API_KEY,
      });
    }
  }

  /**
   * Inscribe an image on Dogecoin blockchain using P2SH reveal-chain method
   * Based on Heimdall's proven implementation for doggy.market indexing
   */
  async inscribeFullImage(
    imageBuffer: Buffer,
    text: string,
    recipientAddress: string
  ): Promise<InscriptionTxResult> {
    logger.info(
      `[DOGECOIN] Starting inscription: ${imageBuffer.length} bytes, recipient: ${recipientAddress}`
    );

    // Validate image size
    if (imageBuffer.length > 1024 * 1024) {
      throw new Error(
        `Image too large: ${imageBuffer.length} bytes exceeds 1MB limit`
      );
    }

    // Determine content type
    const contentType = 'image/jpeg';

    // Calculate chunks
    const chunks = Math.ceil(imageBuffer.length / MAX_CHUNK_LEN);

    try {
      // Inscribe the image
      const result = await this.inscribeImage(
        imageBuffer,
        contentType,
        recipientAddress
      );

      logger.info(
        `[DOGECOIN] Inscription complete: inscriptionId=${result.inscriptionId}, txid=${result.txid}, chunks=${chunks}`
      );

      // Estimate fee (rough estimate: ~1000 sats per transaction in chain)
      const estimatedFee = result.txCount * 1000;

      return {
        inscriptionId: result.inscriptionId,
        txid: result.txid,
        scriptSize: imageBuffer.length,
        chunks,
        estimatedFee,
      };
    } catch (error) {
      logger.error(
        `[DOGECOIN] Inscription failed: ${(error as any)?.message || error}`
      );
      throw new Error(
        `Failed to inscribe image: ${(error as any)?.message || String(error)}`
      );
    }
  }

  /**
   * Get current DOGE/USD exchange rate
   * Uses CoinGecko free API (no key required)
   */
  private async getDogeUsdPrice(): Promise<number> {
    try {
      logger.info('[DOGECOIN] Fetching DOGE/USD exchange rate');
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=usd'
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch DOGE price: ${response.status}`);
      }

      const data = await response.json();
      const price = data.dogecoin?.usd;

      if (!price || price <= 0) {
        throw new Error('Invalid DOGE price returned from API');
      }

      logger.info(`[DOGECOIN] Current DOGE price: $${price} USD`);
      return price;
    } catch (error) {
      logger.error(
        `[DOGECOIN] Failed to fetch DOGE price: ${(error as any)?.message || error}. Using fallback price.`
      );
      // Fallback to a conservative estimate if API fails (prevents blocking inscriptions)
      // You may want to make this configurable or use a different fallback strategy
      const fallbackPrice = 0.08; // Conservative fallback (~$0.08 DOGE = ~52.5 DOGE for $4.20)
      logger.warn(`[DOGECOIN] Using fallback DOGE price: $${fallbackPrice} USD`);
      return fallbackPrice;
    }
  }

  /**
   * Calculate DOGE amount equivalent to $4.20 USD
   */
  private async calculateRewardDoge(): Promise<number> {
    const dogePrice = await this.getDogeUsdPrice();
    const dogeAmount = REWARD_USD / dogePrice;
    
    // Round to 8 decimal places (Dogecoin precision)
    const roundedDoge = Math.round(dogeAmount * 100000000) / 100000000;
    
    logger.info(
      `[DOGECOIN] Calculated reward: ${roundedDoge} DOGE ($${REWARD_USD} USD at $${dogePrice} USD/DOGE)`
    );
    
    return roundedDoge;
  }

  /**
   * Core inscription implementation using P2SH reveal-chain method
   */
  private async inscribeImage(
    imageBuffer: Buffer,
    contentType: string,
    recipientAddress: string
  ): Promise<{ inscriptionId: string; txid: string; txCount: number }> {
    if (!tatumInstance) {
      throw new Error('Tatum SDK not initialized');
    }

    // 1. Fetch fresh UTXOs from hot wallet
    logger.info(`[DOGECOIN] Fetching UTXOs for ${this.hotWalletAddress}`);
    const utxoResponse = await tatumInstance.blockchain.dogecoin.getUtxo(
      this.hotWalletAddress
    );

    if (!utxoResponse || utxoResponse.length === 0) {
      throw new Error('Hot wallet has no UTXOs available');
    }

    logger.info(`[DOGECOIN] Found ${utxoResponse.length} UTXOs`);

    // 2. Chunk image data
    const parts: Buffer[] = [];
    let remaining = imageBuffer;
    while (remaining.length > 0) {
      parts.push(remaining.slice(0, MAX_CHUNK_LEN));
      remaining = remaining.slice(MAX_CHUNK_LEN);
    }

    logger.info(`[DOGECOIN] Split image into ${parts.length} chunks`);

    // 3. Build inscription script (exact Heimdall envelope format)
    const inscription = new bitcore.Script();
    inscription.chunks.push(
      bitcore.Script.buildDataPush(Buffer.from('ord'))
    );
    inscription.chunks.push(bitcore.Script.buildPushInt(parts.length));
    inscription.chunks.push(
      bitcore.Script.buildDataPush(Buffer.from(contentType))
    );

    // Push chunks in reverse order (numbered reverse index)
    parts.forEach((part, n) => {
      inscription.chunks.push(
        bitcore.Script.buildPushInt(parts.length - n - 1)
      );
      inscription.chunks.push(bitcore.Script.buildDataPush(part));
    });

    logger.info(
      `[DOGECOIN] Built inscription script: ${inscription.toBuffer().length} bytes`
    );

    // 4. Build transaction chain (P2SH reveal style)
    const txs: bitcore.Transaction[] = [];
    let p2shInput: bitcore.Transaction.Input | null = null;
    let lastLock: bitcore.Script | null = null;
    let lastPartial: bitcore.Script | null = null;

    // Convert inscription chunks to array for manipulation
    const inscriptionChunks = [...inscription.chunks];

    while (inscriptionChunks.length > 0) {
      // Build partial script
      const partial = new bitcore.Script();
      if (txs.length === 0) {
        // First chunk
        if (inscriptionChunks.length > 0) {
          partial.chunks.push(inscriptionChunks.shift()!);
        }
      }

      // Add chunks until we hit MAX_PAYLOAD_LEN
      while (
        partial.toBuffer().length <= MAX_PAYLOAD_LEN &&
        inscriptionChunks.length >= 2
      ) {
        partial.chunks.push(inscriptionChunks.shift()!);
        partial.chunks.push(inscriptionChunks.shift()!);
      }

      // If we exceeded, put the last two back
      if (partial.toBuffer().length > MAX_PAYLOAD_LEN && partial.chunks.length >= 2) {
        inscriptionChunks.unshift(partial.chunks.pop()!);
        inscriptionChunks.unshift(partial.chunks.pop()!);
      }

      // Build lock script (P2SH with checksig)
      const lock = new bitcore.Script();
      lock.chunks.push(
        bitcore.Script.buildDataPush(
          this.hotWalletPrivateKey.toPublicKey().toBuffer()
        )
      );
      lock.chunks.push({
        opcodenum: bitcore.Opcode.OP_CHECKSIGVERIFY,
      });

      // OP_DROP for each chunk in partial
      partial.chunks.forEach(() => {
        lock.chunks.push({ opcodenum: bitcore.Opcode.OP_DROP });
      });

      lock.chunks.push({ opcodenum: bitcore.Opcode.OP_TRUE });

      // Hash lock script for P2SH
      const lockhash = bitcore.crypto.Hash.ripemd160(
        bitcore.crypto.Hash.sha256(lock.toBuffer())
      );

      const p2sh = new bitcore.Script();
      p2sh.chunks.push({ opcodenum: bitcore.Opcode.OP_HASH160 });
      p2sh.chunks.push(bitcore.Script.buildDataPush(lockhash));
      p2sh.chunks.push({ opcodenum: bitcore.Opcode.OP_EQUAL });

      const p2shOutput = new bitcore.Transaction.Output({
        script: p2sh,
        satoshis: DUST_SATS,
      });

      // Create transaction
      const tx = new bitcore.Transaction();

      // Add previous P2SH input if exists
      if (p2shInput) {
        tx.addInput(p2shInput);
      }

      // Add UTXO inputs (coin selection)
      let inputSats = 0;
      const utxosToUse = utxoResponse.slice(0, Math.min(10, utxoResponse.length)); // Use up to 10 UTXOs

      for (const utxo of utxosToUse) {
        try {
          // Convert txId to Buffer (bitcore expects reversed hex)
          const txIdBuffer = Buffer.from(utxo.txId, 'hex').reverse();
          tx.from({
            txId: txIdBuffer,
            outputIndex: utxo.vout,
            script: bitcore.Script.fromAddress(this.hotWalletAddress),
            satoshis: utxo.value,
          });
          inputSats += utxo.value;
          if (inputSats > 2000000) break; // Enough for fees
        } catch (error) {
          logger.warn(
            `[DOGECOIN] Failed to add UTXO ${utxo.txId}:${utxo.vout}: ${(error as any)?.message}`
          );
        }
      }

      if (tx.inputs.length === (p2shInput ? 1 : 0)) {
        throw new Error('No valid UTXOs available for transaction');
      }

      // Add P2SH output
      tx.addOutput(p2shOutput);

      // Change output (if needed)
      const outputSats = DUST_SATS;
      const feeEstimate = 10000; // Rough estimate per tx
      const totalInputSats = tx.inputs
        .slice(p2shInput ? 1 : 0)
        .reduce((sum, input) => sum + (input as any).output?.satoshis || 0, 0);

      if (totalInputSats > outputSats + feeEstimate) {
        const changeAmt = totalInputSats - outputSats - feeEstimate;
        tx.to(this.hotWalletAddress, changeAmt);
      }

      // Sign previous P2SH input if exists
      if (p2shInput && lastLock && lastPartial) {
        const sig = bitcore.Transaction.sighash.sign(
          tx,
          this.hotWalletPrivateKey,
          bitcore.crypto.Signature.SIGHASH_ALL,
          0,
          lastLock
        );
        const txsig = Buffer.concat([
          sig.toBuffer(),
          Buffer.from([bitcore.crypto.Signature.SIGHASH_ALL]),
        ]);

        const unlock = new bitcore.Script();
        unlock.chunks = [...lastPartial.chunks];
        unlock.chunks.push(bitcore.Script.buildDataPush(txsig));
        unlock.chunks.push(bitcore.Script.buildDataPush(lastLock.toBuffer()));

        tx.inputs[0].setScript(unlock);
      }

      // Sign regular UTXO inputs
      const privateKeys = [this.hotWalletPrivateKey];
      tx.sign(privateKeys);

      txs.push(tx);

      // Prepare for next iteration
      p2shInput = new bitcore.Transaction.Input({
        prevTxId: Buffer.from(tx.id, 'hex').reverse(), // bitcore uses reversed txid
        outputIndex: 0,
        output: tx.outputs[0],
        script: bitcore.Script.empty(),
      });

      lastLock = lock;
      lastPartial = partial;
    }

    // Calculate $4.20 USD worth of DOGE at current market price
    const rewardDoge = await this.calculateRewardDoge();
    const rewardSats = Math.floor(rewardDoge * 100000000); // Convert DOGE to satoshis

    logger.info(
      `[DOGECOIN] Final reveal will send ${rewardDoge} DOGE (${rewardSats} sats) to ${recipientAddress}`
    );

    // Final reveal transaction - send inscribed UTXO to recipient with $4.20 USD worth of DOGE
    const finalTx = new bitcore.Transaction();
    if (!p2shInput || !lastLock || !lastPartial) {
      throw new Error('Missing required data for final reveal transaction');
    }

    // Add the inscribed P2SH input (has DUST_SATS = 0.001 DOGE)
    finalTx.addInput(p2shInput);

    // Add additional UTXO inputs to cover the reward amount (we need reward - 0.001 DOGE more)
    const additionalNeeded = rewardSats - DUST_SATS;
    let additionalInputSats = 0;
    
    // Fetch fresh UTXOs again for the final transaction
    const finalUtxoResponse = await tatumInstance!.blockchain.dogecoin.getUtxo(
      this.hotWalletAddress
    );
    
    for (const utxo of finalUtxoResponse.slice(0, Math.min(10, finalUtxoResponse.length))) {
      try {
        const txIdBuffer = Buffer.from(utxo.txId, 'hex').reverse();
        finalTx.from({
          txId: txIdBuffer,
          outputIndex: utxo.vout,
          script: bitcore.Script.fromAddress(this.hotWalletAddress),
          satoshis: utxo.value,
        });
        additionalInputSats += utxo.value;
        if (additionalInputSats >= additionalNeeded + 50000) break; // Extra for fees
      } catch (error) {
        logger.warn(
          `[DOGECOIN] Failed to add UTXO to final tx ${utxo.txId}:${utxo.vout}: ${(error as any)?.message}`
        );
      }
    }

    if (additionalInputSats < additionalNeeded) {
      throw new Error(
        `Insufficient UTXOs for $${REWARD_USD} USD reward (${rewardDoge} DOGE): need ${additionalNeeded} sats, have ${additionalInputSats} sats`
      );
    }

    // Send total reward amount to recipient (inscribed UTXO value + additional = $4.20 USD worth)
    finalTx.to(recipientAddress, rewardSats);

    // Add change output if there's excess
    const totalInputSats = DUST_SATS + additionalInputSats;
    const feeEstimate = 10000;
    if (totalInputSats > rewardSats + feeEstimate) {
      const changeAmt = totalInputSats - rewardSats - feeEstimate;
      finalTx.to(this.hotWalletAddress, changeAmt);
    }

    // Sign the P2SH reveal input (first input)
    const sig = bitcore.Transaction.sighash.sign(
      finalTx,
      this.hotWalletPrivateKey,
      bitcore.crypto.Signature.SIGHASH_ALL,
      0,
      lastLock
    );
    const txsig = Buffer.concat([
      sig.toBuffer(),
      Buffer.from([bitcore.crypto.Signature.SIGHASH_ALL]),
    ]);

    const unlock = new bitcore.Script();
    unlock.chunks = [...lastPartial.chunks];
    unlock.chunks.push(bitcore.Script.buildDataPush(txsig));
    unlock.chunks.push(bitcore.Script.buildDataPush(lastLock.toBuffer()));

    finalTx.inputs[0].setScript(unlock);

    // Sign the additional UTXO inputs (regular P2PKH inputs)
    const privateKeys = [this.hotWalletPrivateKey];
    finalTx.sign(privateKeys);

    txs.push(finalTx);

    logger.info(`[DOGECOIN] Built transaction chain: ${txs.length} transactions`);

    // 5. Broadcast chain sequentially with delays
    let revealTxid = '';
    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      const rawHex = tx.serialize();

      logger.info(
        `[DOGECOIN] Broadcasting transaction ${i + 1}/${txs.length} (${rawHex.length} bytes)`
      );

      try {
        const broadcastRes = await tatumInstance!.blockchain.dogecoin.broadcast({
          txData: rawHex,
        });

        logger.info(`[DOGECOIN] Broadcasted tx ${i + 1}: ${broadcastRes.txid}`);

        // The reveal transaction is the last one
        if (i === txs.length - 1) {
          revealTxid = broadcastRes.txid;
        } else {
          // Wait ~10 seconds before next transaction (avoid mempool-chain errors)
          await new Promise((r) => setTimeout(r, 10000));
        }
      } catch (error) {
        logger.error(
          `[DOGECOIN] Failed to broadcast transaction ${i + 1}: ${(error as any)?.message || error}`
        );
        throw error;
      }
    }

    // Generate inscription ID (format: txid:0:0)
    const inscriptionId = `${revealTxid}i0`;

    return {
      inscriptionId,
      txid: revealTxid,
      txCount: txs.length,
    };
  }

  /**
   * Generate a new Dogecoin wallet via Tatum
   * Returns wallet credentials that MUST be delivered to the user securely
   * Server should NOT store or log the mnemonic/privateKey
   * 
   * @returns Wallet object with address, mnemonic, and privateKey
   */
  async createWallet(): Promise<GeneratedWallet> {
    if (!tatumInstance) {
      throw new Error('Tatum SDK not initialized');
    }

    logger.info('[DOGECOIN] Generating new wallet via Tatum');

    try {
      const wallet = await tatumInstance.wallet.generateWallet(
        Network.DOGECOIN_MAINNET,
        false
      );

      if (!wallet || !wallet.address) {
        throw new Error('Tatum wallet generation returned invalid response');
      }

      // Verify we have the required fields (Tatum should return mnemonic and privateKey)
      if (!wallet.mnemonic || !wallet.privateKey) {
        throw new Error(
          'Tatum wallet generation did not return mnemonic/privateKey. These are required to deliver wallet to user.'
        );
      }

      // Log only the address (NEVER log mnemonic or privateKey)
      logger.info(`[DOGECOIN] Generated wallet address: ${wallet.address}`);

      return {
        address: wallet.address,
        mnemonic: wallet.mnemonic,
        privateKey: wallet.privateKey,
      };
    } catch (error) {
      logger.error(
        `[DOGECOIN] Failed to generate wallet: ${(error as any)?.message || error}`
      );
      throw new Error(
        `Failed to generate wallet: ${(error as any)?.message || String(error)}`
      );
    }
  }

  /**
   * Send DOGE to an address via Tatum
   * Note: This is separate from the inscription reward (which is sent in the final reveal tx)
   * This can be used for additional rewards if needed
   */
  async sendDoge(toAddress: string, amount: number): Promise<string> {
    if (!tatumInstance) {
      throw new Error('Tatum SDK not initialized');
    }

    logger.info(`[DOGECOIN] Sending ${amount} DOGE to ${toAddress}`);

    try {
      // Convert DOGE to satoshis
      const satoshis = Math.floor(amount * 100000000);

      const result = await tatumInstance.blockchain.dogecoin.transfer(
        {
          fromAddress: this.hotWalletAddress,
          to: [
            {
              address: toAddress,
              value: satoshis,
            },
          ],
        },
        env.HOT_WALLET_PRIVATE_KEY
      );

      if (!result || !result.txId) {
        throw new Error('Tatum transfer returned invalid response');
      }

      logger.info(`[DOGECOIN] Sent ${amount} DOGE: ${result.txId}`);
      return result.txId;
    } catch (error) {
      logger.error(
        `[DOGECOIN] Failed to send DOGE: ${(error as any)?.message || error}`
      );
      throw new Error(
        `Failed to send DOGE: ${(error as any)?.message || String(error)}`
      );
    }
  }

  /**
   * Legacy method - kept for backward compatibility
   * Note: recipientAddress is now required, managed wallet is not used for inscriptions
   */
  async inscribeDoginal(image: Buffer, text: string): Promise<string> {
    logger.warn(
      '[DOGECOIN] inscribeDoginal() is deprecated. Use inscribeFullImage() with recipientAddress'
    );
    throw new Error(
      'inscribeDoginal() is deprecated. Use inscribeFullImage() with a recipient address'
    );
  }

  /**
   * Legacy method - kept for API compatibility
   * @deprecated Not used in new flow
   */
  getManagedRecipientAddress(): string {
    logger.warn(
      '[DOGECOIN] getManagedRecipientAddress() is deprecated. Recipient addresses are now generated per inscription'
    );
    return this.hotWalletAddress;
  }
}
