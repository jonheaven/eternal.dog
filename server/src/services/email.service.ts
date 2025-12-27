import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const FRONTEND_URL = env.FRONTEND_URL || 'http://localhost:3000';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  async sendWalletEmail(
    to: string,
    walletAddress: string,
    badgeUrl: string,
    mnemonic: string,
    privateKey: string,
    claimUuid?: string
  ): Promise<void> {
    try {
      console.log(`[EMAIL] Sending wallet email to ${to}`);

      await this.transporter.sendMail({
        from: env.EMAIL_USER,
        to,
        subject: '🐶 Your Eternal Dog Wallet - $4.20 DOGE Inside!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FFC107;">🎉 Your Dog is Immortalized!</h1>
            <p style="font-size: 16px; line-height: 1.6;">
              Congratulations! Your dog's memory is now forever etched on the Dogecoin blockchain.
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333;">Your Wallet Details</h2>
              <p style="word-break: break-all; font-family: monospace; background: white; padding: 10px; border-radius: 4px; margin: 10px 0;">
                <strong>Address:</strong> ${walletAddress}
              </p>
              <p style="margin: 10px 0;">
                <strong>Balance:</strong> ~$4.20 USD worth of DOGE (calculated at time of inscription)
              </p>
            </div>

            <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336; margin: 20px 0;">
              <h3 style="color: #c62828; margin-top: 0;">🔐 Your Wallet Credentials (SAVE THIS SECURELY)</h3>
              <p style="margin: 10px 0; font-size: 14px; color: #333;">
                <strong>Seed Phrase (Mnemonic):</strong>
              </p>
              <p style="font-family: monospace; background: white; padding: 15px; border-radius: 4px; word-break: break-all; font-size: 14px; border: 2px solid #f44336;">
                ${mnemonic}
              </p>
              <p style="margin: 10px 0; font-size: 14px; color: #333;">
                <strong>Private Key:</strong>
              </p>
              <p style="font-family: monospace; background: white; padding: 15px; border-radius: 4px; word-break: break-all; font-size: 12px; border: 2px solid #f44336;">
                ${privateKey}
              </p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #c62828; font-weight: bold;">
                ⚠️ IMPORTANT: Store these credentials securely! Anyone with access to your seed phrase or private key can control your wallet and access your DOGE. We do not store these credentials and cannot recover them if lost.
              </p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #FFC107; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                💡 Import your wallet using the seed phrase or private key in any Dogecoin wallet app (e.g., Trust Wallet, Exodus, etc.) to access your DOGE and view your inscription.
              </p>
            </div>

            <h3 style="color: #333;">Your DOGE ID Badge 🎖️</h3>
            <div style="text-align: center; margin: 20px 0;">
              <img src="${badgeUrl}" alt="DOGE ID Badge" style="max-width: 300px; border-radius: 8px; border: 2px solid #FFD700;" />
            </div>
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 10px;">
              <strong>Issued:</strong> ${new Date().toLocaleDateString()} | <strong>Expires:</strong> ♾️ ETERNAL
            </p>

            ${claimUuid ? `
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #1976d2; margin-top: 0;">🔗 Your Claim Link</h3>
              <p style="margin: 10px 0; font-size: 14px; color: #333;">
                Access your dog's claim page to view details, share, and manage your inscription:
              </p>
              <a href="${FRONTEND_URL}/claim/${claimUuid}" 
                 style="display: inline-block; background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                View Your Dog's Claim Page
              </a>
              <p style="margin-top: 10px; font-size: 12px; color: #666;">
                Bookmark this link - it's your permanent access to your dog's eternal record!
              </p>
            </div>
            ` : ''}
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Questions? Visit <strong>eternal.dog</strong> to view your dog in the Eternal Dog Pack gallery!
            </p>

            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              © 2024 Eternal Dog. Immortalize. Share. Prosper.
            </p>
          </div>
        `,
      });

      console.log(`[EMAIL] Wallet email sent successfully to ${to}`);
    } catch (error) {
      console.error('[EMAIL] Error sending email:', error);
      throw new Error('Failed to send wallet email');
    }
  }
}
