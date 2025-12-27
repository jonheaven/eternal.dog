# Console Warnings Explained

## These are mostly harmless warnings:

### 1. WebSocket Connection Failed (HMR)
**Status:** ⚠️ Warning - Not Critical

This is Vite's Hot Module Replacement (HMR) trying to connect for live reloading. It doesn't break functionality - your app works fine without it. You just won't get automatic browser refresh when you save files.

**Can be ignored** - The app functions normally.

### 2. Meta Tag Deprecation
**Status:** ⚠️ Warning - Not Critical

The browser is warning that `apple-mobile-web-app-capable` is deprecated. I've added the new `mobile-web-app-capable` tag. Both are kept for backward compatibility (iOS still needs the old one).

**Can be ignored** - Both tags work, this is just a future-proofing warning.

### 3. Icon Errors
**Status:** ⚠️ Warning - Expected

The PWA icons haven't been created yet. The app works fine, you just won't see icons when installing as PWA until you add them to `client/public/icons/`.

**Expected** - Add icons later when ready.

### 4. DOGE Price API Connection Refused
**Status:** ⚠️ Warning - Expected

The backend server (port 5000) isn't running. I've updated the code to silently handle this - the DOGE price just won't display until the backend is running.

**Expected** - Start the backend server to see DOGE prices.

---

## Summary

**All of these are non-critical warnings.** Your app works fine! 

- ✅ Frontend works without backend
- ✅ App functions without HMR (just no auto-refresh)
- ✅ PWA works without icons (just no icon on home screen)
- ✅ Meta tags work (just a deprecation warning)

Start the backend server when you want to test the full flow:
```bash
cd server
npm run start
```

