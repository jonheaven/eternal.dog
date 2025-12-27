# Icons Setup Guide

All icons for the PWA, favicon, and website are generated from `icon.png` in the project root.

## Generated Icons

The following icon sizes have been generated in `client/public/icons/`:

### PWA Icons
- `icon-72x72.png` - Small icon
- `icon-96x96.png` - Small icon
- `icon-128x128.png` - Medium icon
- `icon-144x144.png` - Medium icon
- `icon-152x152.png` - iOS icon
- `icon-192x192.png` - Standard PWA icon ⭐
- `icon-384x384.png` - Large icon
- `icon-512x512.png` - Large PWA icon ⭐

### Favicons
- `icon-16x16.png` - Small favicon
- `icon-32x32.png` - Standard favicon ⭐

## Regenerating Icons

If you update `icon.jpg`, regenerate all icons:

```bash
npm run generate-icons
```

Or manually:
```bash
node generate-icons-sharp.js
```

## Icon Usage

### PWA Manifest
Icons are referenced in `client/public/manifest.json` for PWA installation.

### HTML
Icons are referenced in `client/index.html` for:
- Favicon (browser tab icon)
- Apple Touch Icons (iOS home screen)
- PWA icons

### All icons are automatically:
- ✅ Generated from `icon.jpg`
- ✅ Optimized for web (PNG format)
- ✅ Properly sized for each use case
- ✅ Referenced in manifest and HTML

## Note

The original `icon.png` is copied to `client/public/icons/icon-source.png` for reference.

To update icons:
1. Replace `icon.png` in the project root
2. Run `npm run generate-icons`
3. All icons will be regenerated automatically!

