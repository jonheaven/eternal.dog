import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  MONGO_URI: process.env.MONGO_URI!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  PINATA_API_KEY: process.env.PINATA_API_KEY!,
  PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY!,
  TATUM_API_KEY: process.env.TATUM_API_KEY!,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  EMAIL_USER: process.env.EMAIL_USER!,
  EMAIL_PASS: process.env.EMAIL_PASS!,
  HOT_WALLET_PRIVATE_KEY: process.env.HOT_WALLET_PRIVATE_KEY!,
  HOT_WALLET_ADDRESS: process.env.HOT_WALLET_ADDRESS!,
};

for (const [key, value] of Object.entries(env)) {
  if (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.length === 0)
  ) {
    throw new Error(`Missing required env var: ${key}`);
  }
}
