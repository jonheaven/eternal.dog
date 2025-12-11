@echo off
REM Eternal Dog Quick Start Script for Windows

echo 🐶 Eternal Dog - Quick Start Setup
echo ==================================
echo.

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Install from https://nodejs.org/
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do echo ✓ Node.js %%i detected
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
cd client && call npm install && cd ..
cd server && call npm install && cd ..
echo ✓ Dependencies installed
echo.

REM Create .env files if missing
if not exist "client\.env" (
    echo ⚠️  client\.env not found. Creating template...
    (
        echo VITE_API_URL=http://localhost:5000
        echo VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
    ) > client\.env
    echo ✓ Created client\.env ^(update with your keys^)
)

if not exist "server\.env" (
    echo ⚠️  server\.env not found. Creating template...
    (
        echo PORT=5000
        echo MONGO_URI=mongodb+srv://your_mongo_uri
        echo STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
        echo STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
        echo PINATA_API_KEY=your_pinata_api_key
        echo PINATA_SECRET_KEY=your_pinata_secret_key
        echo EMAIL_USER=your_email@gmail.com
        echo EMAIL_PASS=your_email_app_password
        echo DOGECOIN_RPC_URL=https://dogechain.info/api/v1
        echo FRONTEND_URL=http://localhost:3000
    ) > server\.env
    echo ✓ Created server\.env ^(update with your keys^)
)

echo.
echo 🚀 Quick Start Complete!
echo.
echo Next steps:
echo 1. Update client\.env with Stripe public key
echo 2. Update server\.env with MongoDB, Stripe, Pinata, and Email credentials
echo 3. Run frontend: cd client ^&^& npm run dev
echo 4. Run backend: cd server ^&^& npm run start
echo.
echo See SETUP.md for detailed setup instructions.
echo.
