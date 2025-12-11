# Project Structure

```
eternal-dog/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── assets/            # Images, SVGs
│   │   │   └── wizard-dog.svg  # Wizard Dog mascot
│   │   ├── components/        # Reusable React components
│   │   │   ├── UploadForm.tsx   # Image upload + crop
│   │   │   ├── PreviewCard.tsx  # Preview + email + pay
│   │   │   └── ShareButton.tsx  # Social share buttons
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx         # Landing page
│   │   │   ├── Upload.tsx       # Upload page
│   │   │   ├── Preview.tsx      # Preview page
│   │   │   └── Confirmation.tsx # Success page
│   │   ├── services/          # API calls
│   │   │   └── api.ts          # Backend API client
│   │   ├── types/             # TypeScript types
│   │   │   └── doginal.ts      # DoginalData interface
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Global styles (Tailwind)
│   ├── index.html             # HTML template
│   ├── vite.config.ts         # Vite config
│   ├── tsconfig.json          # TypeScript config
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── postcss.config.js      # PostCSS config
│   ├── package.json           # Dependencies
│   ├── .env                   # Environment variables
│   └── .eslintrc.json         # ESLint config
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   │   ├── upload.controller.ts    # Handle /upload/preview
│   │   │   └── payment.controller.ts   # Handle /payment
│   │   ├── services/          # Business logic
│   │   │   ├── dogecoin.service.ts    # Dogecoin inscription
│   │   │   ├── ipfs.service.ts        # IPFS/Pinata upload
│   │   │   └── email.service.ts       # Email delivery
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── TempUpload.model.ts    # Temp uploads (24hr TTL)
│   │   │   └── Doginal.model.ts       # Permanent metadata
│   │   ├── routes/            # API route definitions
│   │   │   ├── upload.routes.ts       # POST /upload/preview
│   │   │   └── payment.routes.ts      # POST /payment/*
│   │   ├── middleware/        # Express middleware
│   │   │   └── rateLimit.middleware.ts # 5 uploads/hour/IP
│   │   ├── types/             # TypeScript types
│   │   │   └── doginal.ts
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Node.js entry point
│   ├── dist/                  # Compiled JavaScript (after build)
│   ├── tsconfig.json          # TypeScript config
│   ├── package.json           # Dependencies
│   ├── .env                   # Environment variables
│   └── .eslintrc.json         # ESLint config
│
├── .gitignore                 # Git ignore
├── .prettierrc                # Prettier formatter config
├── README.md                  # Project overview
└── SETUP.md                   # Setup & deployment guide
```

## Key Components

### Frontend Workflow

1. **Home.tsx** → User sees "Immortalize Your Dog for $14.20!" with Wizard Dog
2. **UploadForm.tsx** → Upload image, crop to 512x512, enter 100-char memory
3. **PreviewCard.tsx** → See preview in Dogecoin frame, enter email, see share button
4. **Stripe Checkout** → Pay $14.20 (Apple Pay/Google Pay)
5. **Confirmation.tsx** → Success! Share on TikTok/Instagram

### Backend Workflow

1. **POST /upload/preview** → Save image + text to MongoDB (24hr TTL)
2. **POST /payment/create-checkout-session** → Create Stripe session
3. **Stripe Webhook** → Payment completed:
   - Inscribe on Dogecoin
   - Upload to IPFS (Pinata)
   - Create wallet, send $4.20 DOGE
   - Save metadata to MongoDB
   - Send email with wallet + DOGE ID badge
   - Delete temp upload

## Data Flow

```
User Upload
    ↓
Frontend: Crop to 512x512
    ↓
Backend: Save to MongoDB TempUpload (userId, image, text, expiresAt)
    ↓
User Preview: Sees image + text in Dogecoin frame
    ↓
User Pays: Enter email, click "Immortalize for $14.20"
    ↓
Stripe Checkout: Apple Pay / Google Pay / Card
    ↓
Stripe Webhook: checkout.session.completed
    ↓
Backend: 
  - Retrieve TempUpload
  - Inscribe image on Dogecoin (OP_RETURN for text)
  - Upload image to IPFS (Pinata)
  - Create wallet address
  - Send $4.20 DOGE to wallet
  - Save Doginal: inscriptionId, ipfsCid, walletAddress, email
  - Send email with wallet + DOGE ID badge
  - Delete TempUpload
    ↓
Confirmation: "Immortalized! Check your email"
    ↓
User Shares: Share on TikTok/Instagram/Facebook
    ↓
Friends Click: eternal.dog
    ↓
Loop starts again 🐶
```

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Fast, modern UI framework |
| | TypeScript | Type-safe JavaScript |
| | Tailwind CSS | Mobile-first styling |
| | Cropper.js | Image crop/resize |
| | @stripe/stripe-js | Stripe integration |
| **Backend** | Node.js 20 | JavaScript runtime |
| | Express | REST API framework |
| | TypeScript | Type-safe backend |
| | MongoDB | NoSQL database |
| | Mongoose | MongoDB ORM |
| **Blockchain** | Dogecoin | Target blockchain |
| | Pinata | IPFS pinning |
| **Payments** | Stripe | Payment processing |
| **Email** | Gmail + Nodemailer | Wallet email delivery |
| **DevOps** | Render.com | Frontend + backend hosting |
| | MongoDB Atlas | Database hosting |

## Environment Variables

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Backend (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
EMAIL_USER=...@gmail.com
EMAIL_PASS=...
DOGECOIN_RPC_URL=https://dogechain.info/api/v1
FRONTEND_URL=http://localhost:3000
```

## Development Workflow

### Local Testing

```bash
# Terminal 1: Frontend
cd client
npm run dev
# Runs at http://localhost:3000

# Terminal 2: Backend
cd server
npm run start
# Runs at http://localhost:5000

# Terminal 3: Stripe webhook (optional)
stripe listen --forward-to localhost:5000/payment/webhook
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Build (prod)
npm run build
```

### Deployment

```bash
# 1. Push to GitHub
git push origin main

# 2. Render auto-deploys
# Frontend: /client → Static Site
# Backend: /server → Web Service

# 3. Monitor logs in Render dashboard
```

## Production Checklist

- [ ] MongoDB Atlas cluster created & MONGO_URI set
- [ ] Stripe account & webhooks configured
- [ ] Pinata account & API keys set
- [ ] Gmail App Password created & set
- [ ] GitHub repo created & pushed
- [ ] Render frontend deployed
- [ ] Render backend deployed
- [ ] Stripe webhook URL updated to production
- [ ] Frontend VITE_API_URL updated to backend URL
- [ ] Dogecoin inscription implemented
- [ ] Gallery page built
- [ ] Social ads created & running
- [ ] Custom Wizard Dog art added
- [ ] Domain configured (optional)
- [ ] Monitoring & alerts set up

---

Eternal Dog - Immortalize your dog on the blockchain. Break free. 🐶🚀
