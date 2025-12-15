import FormData from 'form-data';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export class IPFSService {
  async uploadImage(image: Buffer): Promise<string> {
    const form = new FormData();
    form.append('file', image, {
      filename: 'doginal-image.png',
      contentType: 'image/png',
    });

    try {
      logger.info(`[IPFS] Uploading ${image.length} bytes to Pinata`);

      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.PINATA_SECRET_KEY}`,
          ...form.getHeaders(),
        },
        body: form as any,
      });

      if (!res.ok) {
        const text = await res.text();
        logger.error(`[IPFS] Upload failed: ${res.status} ${text}`);
        throw new Error(`Pinata upload failed: ${res.status} ${text}`);
      }

      const json = (await res.json()) as { IpfsHash: string };
      logger.info(`[IPFS] Upload successful, CID: ${json.IpfsHash}`);
      return json.IpfsHash;
    } catch (error) {
      logger.error(`[IPFS] Upload error: ${(error as any)?.message || error}`);
      throw new Error(
        `Failed to upload image to IPFS: ${(error as any)?.message || String(error)}`,
      );
    }
  }
}

