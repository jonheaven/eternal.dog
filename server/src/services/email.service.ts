import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

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
              <p style="word-break: break-all; font-family: monospace; background: white; padding: 10px; border-radius: 4px;">
                <strong>Address:</strong> ${walletAddress}
              </p>
              <p style="margin: 10px 0;">
                <strong>Balance:</strong> $4.20 DOGE (your refund)
              </p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #FFC107; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                💡 Keep this email safe! Your wallet address is how you access your DOGE and DOGE ID badge.
              </p>
            </div>

            <h3 style="color: #333;">Your DOGE ID Badge</h3>
            <div style="text-align: center; margin: 20px 0;">
              <img src="${badgeUrl}" alt="DOGE ID Badge" style="max-width: 200px; border-radius: 8px;" />
            </div>

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
