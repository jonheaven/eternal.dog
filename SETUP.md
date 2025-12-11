# Eternal Dog Setup & Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 20.x or higher
- Git
- MongoDB Atlas account (free)
- Stripe account (free)
- Pinata account (free)

### 1. Clone and Install

```bash
cd eternal-dog
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. Frontend Setup

```bash
cd client
# Install dependencies (already done above)
npm run dev
```

Frontend runs at `http://localhost:3000`

### 3. Backend Setup

In a new terminal:

```bash
cd server
npm run start
```

Backend runs at `http://localhost:5000`

### 4. Environment Variables

#### MongoDB Atlas

1. Visit https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a "Shared" cluster
4. Add your IP to Network Access (0.0.0.0/0 for development)
5. Create a database user and get connection string
6. Update `server/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/eternal-dog?retryWrites=true&w=majority
```

#### Stripe

1. Visit https://stripe.com
2. Create account and go to Dashboard
3. Copy "Publishable key" to `client/.env`:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

4. Copy "Secret key" to `server/.env`:

```env
STRIPE_SECRET_KEY=sk_test_xxxxx
```

5. Get "Webhook Signing Secret":
   - Developers → Webhooks
   - Create endpoint: `http://localhost:5000/payment/webhook`
   - Listen to: `checkout.session.completed`
   - Copy signing secret to `server/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### Pinata (IPFS)

1. Visit https://pinata.cloud
2. Create account
3. Go to API Keys → Create Key
4. Copy API Key and Secret to `server/.env`:

```env
PINATA_API_KEY=xxxxx
PINATA_SECRET_KEY=xxxxx
```

#### Email (Gmail)

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `server/.env`:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
```

### 5. Test Locally

#### Test Flow:

1. Open http://localhost:3000
2. Click "Start Now"
3. Upload a dog photo (any image)
4. Crop to 512x512
5. Enter dog name + memory (100 chars max)
6. Click "Preview"
7. Enter email
8. Click "Immortalize for $14.20"
9. Use test Stripe card: `4242 4242 4242 4242`
10. Any future date, any CVC

#### Check Results:

1. **MongoDB**: Check `TempUpload` and `Doginal` collections
2. **Email**: Check inbox for wallet email
3. **Backend logs**: Should show inscription, IPFS upload, wallet creation

---

## Deployment to Render.com

### Step 1: Prepare Git Repository

```bash
cd eternal-dog
git init
git add .
git commit -m "Initial eternal.dog commit"
git remote add origin https://github.com/your-username/eternal-dog.git
git push -u origin main
```

### Step 2: Deploy Frontend (Static Site)

1. Visit https://render.com
2. Sign up/Log in
3. Click "New +" → "Static Site"
4. Connect GitHub repo (select eternal-dog)
5. Configure:
   - **Name**: `eternal-dog-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
6. Click "Advanced" and add Environment Variables:

```env
VITE_API_URL=https://your-render-backend.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

(Update with actual backend URL after deploying)

7. Click "Create Static Site"
8. Wait for build (2-3 minutes)
9. Copy frontend URL (e.g., `https://eternal-dog-frontend.onrender.com`)

### Step 3: Deploy Backend (Web Service)

1. In Render, click "New +" → "Web Service"
2. Connect GitHub repo
3. Configure:
   - **Name**: `eternal-dog-backend`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free
4. Click "Advanced" and add Environment Variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
PINATA_API_KEY=xxxxx
PINATA_SECRET_KEY=xxxxx
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
DOGECOIN_RPC_URL=https://dogechain.info/api/v1
FRONTEND_URL=https://your-frontend-url.onrender.com
```

5. Click "Create Web Service"
6. Wait for build (3-5 minutes)
7. Copy backend URL (e.g., `https://eternal-dog-backend.onrender.com`)

### Step 4: Update Frontend with Backend URL

1. Go to frontend Static Site in Render
2. Click "Environment"
3. Edit `VITE_API_URL` to your backend URL
4. Save (auto-redeploy)

### Step 5: Update Stripe Webhook

1. In Stripe Dashboard → Developers → Webhooks
2. Edit webhook endpoint:
   - Change URL to: `https://your-render-backend.onrender.com/payment/webhook`
   - Save

---

## Testing Production Flow

1. Visit your frontend URL (e.g., `https://eternal-dog-frontend.onrender.com`)
2. Complete upload → preview → payment flow
3. Check email for wallet
4. Verify Doginal in MongoDB (check `Doginal` collection)

---

## Troubleshooting

### MongoDB Connection Error

- **Issue**: `MongoError: connect ECONNREFUSED`
- **Fix**: Check MONGO_URI in `server/.env`
- Verify IP is whitelisted in MongoDB Atlas (Network Access)

### Stripe Webhook Not Firing

- **Issue**: Payment doesn't trigger email/inscription
- **Fix**: Check Stripe Dashboard → Webhooks for failures
- Verify webhook URL is correct (use HTTPS)
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

### Email Not Sending

- **Issue**: No wallet email received
- **Fix**: Enable "Less secure app access" in Gmail
- Or use App Password (recommended)
- Check EMAIL_USER and EMAIL_PASS in `server/.env`

### IPFS Upload Failing

- **Issue**: Image not pinned to IPFS
- **Fix**: Verify PINATA_API_KEY and PINATA_SECRET_KEY
- Check Pinata account has free tier active

### Frontend Not Connecting to Backend

- **Issue**: API calls fail (CORS or 404)
- **Fix**: Verify VITE_API_URL points to correct backend URL
- Check CORS origin in `server/src/app.ts` matches frontend URL

---

## Costs

| Service | Free Tier | Cost |
|---------|-----------|------|
| MongoDB Atlas | 500MB | $0/month |
| Render (Frontend) | 750hrs, 512MB RAM | $0-7/month |
| Render (Backend) | 750hrs, 512MB RAM | $0-7/month |
| Stripe | No fees (card network fees only) | 2.9% + $0.30/transaction |
| Pinata | 1GB | $0/month |
| Gmail | Unlimited | $0/month |
| **Total** | | **~$0-14/month** |

---

## Next Tasks

### Priority 1: Implement Dogecoin Inscription

Edit `server/src/services/dogecoin.service.ts`:

```typescript
async inscribeDoginal(image: Buffer, text: string): Promise<string> {
  // 1. Call Dogecoin RPC to create inscription
  // 2. Store image on-chain (not IPFS)
  // 3. Store text via OP_RETURN
  // 4. Return inscription ID
  
  // Resources:
  // - Dogecoin Core RPC: https://github.com/dogecoin/dogecoin
  // - Ordinals/Inscriptions: https://docs.ordinals.com
}
```

### Priority 2: Build Gallery Page

Create `client/src/pages/Gallery.tsx`:

```typescript
// Fetch Doginal records from backend
// Display IPFS images in 2-column (mobile) / 4-column (desktop) grid
// Show inscription ID, dog name, memory
```

### Priority 3: Social Media Integration

- Create TikTok video (15s): Upload → Preview → Pay
- Run $5-10/day ads on TikTok, Instagram, Facebook
- Use Meta Pixel for retargeting

### Priority 4: Polish

- Custom Wizard Dog pixel art SVG
- Mobile responsiveness testing (iPhone Safari, Android Chrome)
- Performance optimization (images, code splitting)
- Error boundary components

---

## Production Checklist

- [ ] Dogecoin inscription implemented & tested on testnet
- [ ] Email templates styled professionally
- [ ] Mobile responsiveness verified (iOS Safari, Android Chrome)
- [ ] Stripe webhook tested end-to-end
- [ ] IPFS uploads verified
- [ ] Rate-limiting tested
- [ ] Error handling & logging comprehensive
- [ ] Gallery page built & deployed
- [ ] Custom Wizard Dog art added
- [ ] Social media ads created & running
- [ ] Analytics/tracking added (Google Analytics, Meta Pixel)
- [ ] TOS/Privacy Policy added
- [ ] Domain purchased & SSL configured
- [ ] Monitoring setup (error alerts, performance)

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Stripe Docs**: https://stripe.com/docs
- **Dogecoin**: https://dogecoin.com
- **IPFS**: https://ipfs.io

---

Eternal Dog v0.1.0 - Built to break free from the matrix 🐶🚀
