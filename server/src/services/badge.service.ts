import sharp from 'sharp';
import { logger } from '../utils/logger.js';

export interface BadgeOptions {
  dogName?: string;
  issuedDate?: string;
  expiryDate?: string;
}

/**
 * Create a 420x420 DOGE ID badge from a dog image buffer.
 * - Places the image centered within a frame
 * - Adds a gold border (Dogecoin theme)
 * - Returns WebP format for optimal file size
 */
export async function generateDogeIdBadge(
  imageBuffer: Buffer,
  options: BadgeOptions = {}
): Promise<Buffer> {
  try {
    logger.info('[BADGE] Generating DOGE ID badge');

    const width = 420;
    const height = 420;
    const border = 10;
    const innerWidth = width - border * 2;
    const innerHeight = height - border * 2 - 60; // Leave space for header/footer text

    // Resize dog image to fit inside the frame
    const dogImage = await sharp(imageBuffer)
      .resize({ width: innerWidth, height: innerHeight, fit: 'cover' })
      .toBuffer();

    // Create white background
    const background = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    // Create gold border overlay (#FFD700 = gold)
    const borderOverlay = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 215, b: 0, alpha: 1 }, // Gold color
      },
    })
      .png()
      .composite([
        {
          input: await sharp({
            create: {
              width: width - border * 2,
              height: height - border * 2,
              channels: 4,
              background: { r: 255, g: 255, b: 255, alpha: 0 },
            },
          })
            .png()
            .toBuffer(),
          top: border,
          left: border,
          blend: 'dest-out',
        },
      ])
      .toBuffer();

    // Composite: background + border + dog image
    const composite = await sharp(background)
      .composite([
        { input: borderOverlay, top: 0, left: 0 },
        { input: dogImage, top: border + 30, left: border }, // Center the image with some top padding
      ])
      .webp({ quality: 90 })
      .toBuffer();

    logger.info(
      `[BADGE] Generated DOGE ID badge: ${width}x${height}, ${composite.length} bytes`
    );

    return composite;
  } catch (error) {
    logger.error(
      `[BADGE] Error generating badge: ${(error as any)?.message || error}`
    );
    throw new Error(
      `Failed to generate DOGE ID badge: ${(error as any)?.message || String(error)}`
    );
  }
}



