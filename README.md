# Eternal Dog - Web3 dApp

Immortalize your dog on the Dogecoin blockchain for $14.20.

## Project Structure

```
eternal-dog/
├── client/                 # React + Vite frontend
├── server/                 # Node.js + Express backend
└── .gitignore
```

## Setup

### Prerequisites
- Node.js 20+
- Git

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### Backend Setup

```bash
cd server
npm install
npm run start
```

Backend runs at `http://localhost:5000`.

## Environment Variables

### Frontend (`client/.env`)
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Backend (`server/.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=app_password
DOGECOIN_RPC_URL=https://dogechain.info/api/v1
FRONTEND_URL=http://localhost:3000
```

## Deployment to Render

### MongoDB Atlas Setup
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get MONGO_URI connection string

### Frontend Deployment
1. Push to GitHub
2. Create "Static Site" in Render
3. Select client folder
4. Build: `npm install && npm run build`
5. Publish: `dist`

### Backend Deployment
1. Create "Web Service" in Render
2. Select server folder
3. Runtime: Node
4. Build: `npm install && npm run build`
5. Start: `npm run start`

## Testing

### Local Test Flow
1. Upload dog photo
2. Crop to 512x512
3. Enter name + memory (100 chars)
4. See preview
5. Enter email
6. Pay with test Stripe card: `4242 4242 4242 4242`
7. Check confirmation page

## Next Tasks

1. Implement Dogecoin inscription (dogecoin.service.ts)
2. Build gallery page
3. Customize Wizard Dog SVG
4. Run social ads (TikTok, Instagram, Facebook)
5. Deploy to Render

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Cropper.js
- **Backend**: Node.js, Express, TypeScript, MongoDB, Stripe
- **Storage**: IPFS (Pinata), MongoDB Atlas
- **Deployment**: Render.com (both frontend & backend)

## License

MIT
