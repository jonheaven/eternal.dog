# Eternal Dog – Full Context

## Project Snapshot
- Purpose: Upload → pay → inscribe dog images/text on Dogecoin with gallery, attribution, metrics, and notifications.
- Stack: React 19 + Vite + TS on frontend; Express + TS + MongoDB on backend; Dogecoin inscription logic implemented locally; IPFS via Pinata; payments via Stripe; notifications via Slack + email.
- Key flows: Upload preview → Stripe checkout → webhook triggers inscription + IPFS upload + wallet reward → events logged → gallery shows inscriptions → stats endpoint for campaign ROI.

## Repo Layout
- docs/overview: README, INDEX (high-level entry points)
- docs/setup: START_HERE, SETUP, COMMANDS, BUILD_SUMMARY (how to install/run/build)
- docs/inscription: INSCRIPTION_* and IMPLEMENTATION_COMPLETE (deep-dive into inscription logic, scripts, chunking)
- docs/business: CAMPAIGN_TRACKING (UTM tracking, /stats)
- docs/architecture: ARCHITECTURE (system design)
- Source: client/ (React app), server/ (Express API), temp/ for scratch

## Environments
- Backend critical vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, TATUM_API_KEY, PINATA_API_KEY, PINATA_SECRET_KEY, EMAIL_USER, EMAIL_PASS, SLACK_WEBHOOK_URL, FRONTEND_URL, Mongo URI, managed Dogecoin wallet (DOGE_MANAGED_WALLET_ADDRESS or MANAGED_WALLET_ADDRESS or DOGECOIN_WALLET_ADDRESS).
- Frontend vars: VITE_API_URL, VITE_STRIPE_PUBLIC_KEY.
- Managed wallet: address that receives inscriptions/rewards; required for webhook flow.

## Services & Features
- InscriptionService: 520-byte chunking, ord-style script builder, size validation, inscriptionId generation, tx size estimation.
- DogecoinService: inscribeFullImage (currently simulated txid), createWallet/sendDoge placeholders, managed wallet resolver with env fallbacks.
- PaymentController: Stripe webhook drives inscription, IPFS upload, wallet creation, DOGE send, email, Slack, event logging, retry/backoff around external calls.
- RetryService: exponential backoff + circuit breaker (failure threshold default 5, reset window 60s).
- Gallery: Frontend page + /doginals API returning inscriptionId/ipfsCid/txid/createdAt (privacy-safe).
- Metrics: Event model + /stats endpoint with campaign breakdown; Slack notifications on major events.
- Upload preview: 512x512 cropper, text up to 100 chars, stored as TempUpload until payment completes.

## Key Endpoints (server)
- GET /health, /ready
- POST /upload/preview
- POST /payment/create-checkout-session
- POST /payment/webhook (Stripe)
- GET /doginals (gallery feed)
- GET /stats (campaign metrics)

## Data Models
- TempUpload: userId, image (base64), text, TTL (preview cache)
- Doginal: inscriptionId, ipfsCid, txid, walletAddress, userEmail, imageSize, chunks, block/confirmation fields
- Event: type, userId, email, utmSource/utmCampaign/utmMedium/utmContent, metadata (for metrics and diagnostics)

## Frontend Routes
- / (home), /upload, /preview, /confirmation, /gallery

## Build/Run
- Backend: `cd server && npm install && npm run build && npm run dev` (ensure env vars). Webhook requires raw body; keep express.raw in app.
- Frontend: `cd client && npm install && npm run build && npm run dev` (configure VITE_API_URL, VITE_STRIPE_PUBLIC_KEY).

## Observability
- Logger middleware injects req.logger; requestId header included.
- Morgan logs with requestId/time; Winston logger utilities used across services.
- Slack notifications on checkout start, inscription complete, and errors.

## Known Placeholders / Next Steps
- Dogecoin transactions currently simulated; wire to Tatum RPC for real tx build/sign/broadcast.
- Ensure managed wallet env is set before running webhooks.
- Optional: add production-ready circuit breaker thresholds per external service.

## Contacts / Usage Notes
- Stripe: use test keys and 4242... card for local.
- IPFS: Pinata keys required; gallery pulls from gateway.pinata.cloud.
- If gallery empty, run a full upload→checkout flow to populate Doginals collection.
