#!/usr/bin/env bash
# Eternal Dog Quick Start Script

echo "🐶 Eternal Dog - Quick Start Setup"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js $(node -v) detected"
echo ""

# Install root dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
echo "✓ Dependencies installed"
echo ""

# Create .env files if missing
if [ ! -f "client/.env" ]; then
    echo "⚠️  client/.env not found. Creating template..."
    cat > client/.env << 'EOF'
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
EOF
    echo "✓ Created client/.env (update with your keys)"
fi

if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found. Creating template..."
    cat > server/.env << 'EOF'
PORT=5000
MONGO_URI=mongodb+srv://your_mongo_uri
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
DOGECOIN_RPC_URL=https://dogechain.info/api/v1
FRONTEND_URL=http://localhost:3000
EOF
    echo "✓ Created server/.env (update with your keys)"
fi

echo ""
echo "🚀 Quick Start Complete!"
echo ""
echo "Next steps:"
echo "1. Update client/.env with Stripe public key"
echo "2. Update server/.env with MongoDB, Stripe, Pinata, and Email credentials"
echo "3. Run frontend: cd client && npm run dev"
echo "4. Run backend: cd server && npm run start"
echo ""
echo "See SETUP.md for detailed setup instructions."
echo ""
