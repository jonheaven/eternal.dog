# PWA Setup Guide - Eternal Dog

**Status:** ✅ PWA Infrastructure Complete

---

## ✅ What's Been Added

### 1. Web App Manifest (`public/manifest.json`)
- App name, description, theme colors
- Icons for all sizes (72px to 512px)
- Standalone display mode
- Shortcuts (quick actions)
- Categories

### 2. Service Worker (`public/sw.js`)
- Offline support
- Asset caching
- Network-first strategy for API calls
- Cache-first for static assets

### 3. Install Prompt Component
- Automatic install prompt on supported browsers
- Custom install button
- Dismissal with 7-day cooldown
- Detects if already installed

### 4. Registration Code
- Service worker registration
- Install prompt handling
- PWA detection utilities

---

## 📱 What Users Can Do

1. **Install on Mobile:**
   - Android: Chrome will show "Add to Home Screen" banner
   - iOS Safari: Share → Add to Home Screen
   - Install prompt component shows on supported browsers

2. **App-like Experience:**
   - Opens in standalone mode (no browser UI)
   - Custom icon on home screen
   - Full screen experience
   - Offline support for cached pages

3. **Quick Actions:**
   - "Immortalize Your Dog" shortcut
   - "Browse Eternal Pack" shortcut

---

## 🎨 Icons Needed

You need to create icon files in `client/public/icons/`:

Required sizes:
- 72x72.png
- 96x96.png
- 128x128.png
- 144x144.png
- 152x152.png
- 192x192.png ⭐ (Primary)
- 384x384.png
- 512x512.png ⭐ (Primary)

**Quick Solution:**
1. Use wizard-dog.svg as base
2. Convert to PNG at these sizes
3. Place in `client/public/icons/`

**Tools:**
- Online: https://realfavicongenerator.net/
- Online: https://www.pwabuilder.com/imageGenerator
- Or create a simple script using sharp/jimp

---

## 🧪 Testing PWA

### Desktop (Chrome/Edge):
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" - should show all info
4. Check "Service Workers" - should show registered
5. Click "Install" button in address bar or use install prompt

### Mobile Testing:

**Android:**
1. Open site in Chrome
2. Should see "Add to Home Screen" banner
3. Or use menu → "Install app"
4. Icon appears on home screen

**iOS:**
1. Open site in Safari
2. Tap Share button
3. Scroll to "Add to Home Screen"
4. Icon appears on home screen

### Testing Offline:
1. Install the app
2. Open Chrome DevTools → Network
3. Enable "Offline" checkbox
4. Navigate - cached pages should still work

---

## 🔧 Configuration

### Manifest Settings:
- **Theme Color:** `#ffc107` (Dogecoin yellow)
- **Background Color:** `#ffffff` (white)
- **Display Mode:** `standalone` (app-like)
- **Orientation:** `portrait-primary` (mobile-first)

### Service Worker Strategy:
- **Static Assets:** Cache-first (instant loading)
- **API Calls:** Network-first (always fresh data)
- **Navigation:** Cache with network fallback

---

## 🚀 Production Deployment

### Requirements:
1. **HTTPS Required** - Service workers only work on HTTPS (or localhost)
2. **Valid Icons** - All icon sizes must exist
3. **Valid Manifest** - Must be accessible at `/manifest.json`

### Deployment Checklist:
- [ ] All icon files created and in `public/icons/`
- [ ] Manifest.json accessible at `/manifest.json`
- [ ] Service worker accessible at `/sw.js`
- [ ] Site served over HTTPS
- [ ] Test install on Android device
- [ ] Test install on iOS device
- [ ] Test offline functionality

---

## 📝 Notes

- **Service Worker:** Automatically registered on page load
- **Install Prompt:** Shows automatically on supported browsers
- **Offline Mode:** Gallery and home page work offline (cached)
- **API Calls:** Still require network (not cached for fresh data)

---

## 🎯 Next Steps

1. **Create Icons** - Generate all icon sizes from wizard-dog.svg
2. **Test Installation** - Try installing on mobile device
3. **Test Offline** - Verify cached pages work offline
4. **Deploy** - Make sure HTTPS is enabled in production

Once icons are created, the PWA is fully functional! 🚀

