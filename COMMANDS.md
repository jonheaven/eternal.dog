# Eternal Dog - Command Reference

## Installation

### One-Command Install (Windows)
```powershell
quick-start.bat
```

### One-Command Install (Mac/Linux)
```bash
bash quick-start.sh
```

### Manual Install
```bash
# Root install
npm install

# Frontend install
cd client
npm install
cd ..

# Backend install
cd server
npm install
cd ..
```

---

## Development (Local)

### Terminal 1: Frontend
```bash
cd client
npm run dev
```
👉 Runs at http://localhost:3000

### Terminal 2: Backend
```bash
cd server
npm run start
```
👉 Runs at http://localhost:5000

### Terminal 3: Stripe Webhook (Optional)
```bash
stripe listen --forward-to localhost:5000/payment/webhook
```

---

## Code Quality

### Lint Frontend
```bash
cd client
npm run lint
```

### Format Frontend
```bash
cd client
npm run format
```

### Lint Backend
```bash
cd server
npm run lint
```

### Format Backend
```bash
cd server
npm run format
```

---

## Build (Production)

### Build Frontend
```bash
cd client
npm run build
# Output: dist/
```

### Build Backend
```bash
cd server
npm run build
# Output: dist/
```

---

## Testing

### Test Upload Flow
1. Open http://localhost:3000
2. Click "Start Now"
3. Upload any image (JPG/PNG)
4. Wait for crop preview
5. Type dog name + memory (100 chars max)
6. Click "Preview"
7. Review Dogecoin-framed preview
8. Enter email
9. Click "Immortalize for $14.20"
10. Use test Stripe card: `4242 4242 4242 4242`
11. Any future date, any CVC
12. Check MongoDB for TempUpload and Doginal records

### Check MongoDB
```bash
# Use MongoDB Atlas UI
# Database: eternal-dog
# Collections: tempuploads, doginals
# Check tempuploads: should auto-expire after 24hr
# Check doginals: should have inscriptionId, ipfsCid, walletAddress, email
```

### Check Backend Logs
```bash
# Terminal where server is running should show:
# [UPLOAD] Preview saved for userId: xxxxx
# [PAYMENT] Creating checkout session for userId: xxxxx
# [PAYMENT] Stripe session created: cs_test_xxxxx
# [WEBHOOK] Payment completed for userId: xxxxx
# [DOGECOIN] Inscribing image (xxxx bytes)
# [IPFS] Uploading image (xxxx bytes)...
# [EMAIL] Sending wallet email to user@email.com
# [WEBHOOK] Inscription complete: doginal_xxxxx
```

---

## Deployment (Render.com)

### Step 1: Prepare GitHub
```bash
git init
git add .
git commit -m "Initial eternal.dog commit"
git remote add origin https://github.com/your-username/eternal-dog.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Frontend (Static Site)
```
Render Dashboard → New → Static Site
├─ Connect GitHub repo (eternal-dog)
├─ Root Directory: client
├─ Build Command: npm install && npm run build
├─ Publish Directory: dist
├─ Environment Variables:
│  ├─ VITE_API_URL=https://eternal-dog-backend.onrender.com
│  └─ VITE_STRIPE_PUBLIC_KEY=pk_test_...
└─ Deploy
```

**Wait for build → Copy frontend URL (e.g., https://eternal-dog-frontend.onrender.com)**

### Step 3: Deploy Backend (Web Service)
```
Render Dashboard → New → Web Service
├─ Connect GitHub repo (eternal-dog)
├─ Root Directory: server
├─ Runtime: Node
├─ Build Command: npm install && npm run build
├─ Start Command: npm run start
├─ Environment Variables:
│  ├─ PORT=5000
│  ├─ MONGO_URI=mongodb+srv://...
│  ├─ STRIPE_SECRET_KEY=sk_test_...
│  ├─ STRIPE_WEBHOOK_SECRET=whsec_...
│  ├─ PINATA_API_KEY=...
│  ├─ PINATA_SECRET_KEY=...
│  ├─ EMAIL_USER=...@gmail.com
│  ├─ EMAIL_PASS=...
│  ├─ DOGECOIN_RPC_URL=https://dogechain.info/api/v1
│  └─ FRONTEND_URL=https://eternal-dog-frontend.onrender.com
└─ Deploy
```

**Wait for build → Copy backend URL (e.g., https://eternal-dog-backend.onrender.com)**

### Step 4: Update Stripe Webhook
```
Stripe Dashboard → Developers → Webhooks
├─ Edit endpoint URL: https://eternal-dog-backend.onrender.com/payment/webhook
└─ Save
```

### Step 5: Update Frontend with Backend URL
```
Render Dashboard → Frontend Site → Environment
├─ Edit VITE_API_URL=https://eternal-dog-backend.onrender.com
└─ Save (auto-redeploy)
```

---

## Database Setup

### MongoDB Atlas

```
1. Visit https://www.mongodb.com/cloud/atlas
2. Create account → Create free cluster
3. Add IP: 0.0.0.0/0 (for development) or your IP (production)
4. Create database user (e.g., admin)
5. Get connection string: mongodb+srv://user:pass@cluster0.xxx.mongodb.net/eternal-dog
6. Add to server/.env:
   MONGO_URI=mongodb+srv://user:pass@cluster0.xxx.mongodb.net/eternal-dog?retryWrites=true&w=majority
```

### MongoDB Verification
```bash
# After backend starts, check logs:
# ✓ Connected to MongoDB
# ✓ Server running on port 5000
```

---

## Stripe Setup

### Create Stripe Account
```
1. Visit https://stripe.com
2. Create account → Verify email
3. Go to Developers → API Keys
4. Copy "Publishable Key" (pk_test_...)
5. Copy "Secret Key" (sk_test_...)
```

### Get Webhook Secret
```
Developers → Webhooks → Create Endpoint
├─ URL: http://localhost:5000/payment/webhook (local) or https://eternal-dog-backend.onrender.com/payment/webhook (prod)
├─ Events: checkout.session.completed
├─ Create endpoint → Copy Signing Secret (whsec_...)
```

### Set Environment Variables
```
client/.env:
VITE_STRIPE_PUBLIC_KEY=pk_test_...

server/.env:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Test Locally
```bash
# Terminal 3: Start Stripe listener
stripe listen --forward-to localhost:5000/payment/webhook

# Go through payment flow at http://localhost:3000
# Webhook should fire and show logs in Terminal 3
```

---

## Pinata (IPFS) Setup

### Create Pinata Account
```
1. Visit https://pinata.cloud
2. Create account
3. Go to API Keys → Create Key
4. Copy API Key and Secret Key
```

### Set Environment Variables
```
server/.env:
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
```

---

## Gmail Setup (Email)

### Generate App Password
```
1. Go to https://myaccount.google.com
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Select Mail → Select device → Generate
4. Copy 16-character password
```

### Set Environment Variables
```
server/.env:
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=16_char_app_password
```

---

## Troubleshooting Commands

### Check Node Version
```bash
node -v
# Should be 20.x or higher
```

### Check npm Version
```bash
npm -v
# Should be 9.x or higher
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Reinstall Dependencies
```bash
# Frontend
cd client
rm -rf node_modules package-lock.json
npm install

# Backend
cd server
rm -rf node_modules package-lock.json
npm install
```

### Kill Port (if in use)
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Check MongoDB Connection
```bash
# In server logs, should see:
# ✓ Connected to MongoDB
```

### View Backend Logs
```bash
# Server Terminal should show activity like:
# [UPLOAD] Preview saved for userId: xxxxx
# [PAYMENT] Stripe session created: cs_test_xxxxx
# [WEBHOOK] Payment completed
```

---

## Production Checklist

```bash
# Before deploying:
npm run lint        # Fix linting
npm run format      # Format code
npm run build       # Test production build
git add .
git commit -m "Final production checks"
git push origin main

# Render deploys automatically
# Check Render Dashboard for deploy status
# Logs should show same as local development
```

---

## Useful Links

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| MongoDB Atlas | https://www.mongodb.com/cloud/atlas |
| Stripe Dashboard | https://dashboard.stripe.com |
| Pinata | https://pinata.cloud |
| Render | https://render.com |
| GitHub | https://github.com |

---

## Questions?

See:
- `SETUP.md` for detailed setup
- `ARCHITECTURE.md` for technical details
- `BUILD_SUMMARY.md` for what's included

---

Eternal Dog v0.1.0 - Command Reference ✨
