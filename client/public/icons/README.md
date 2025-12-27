# PWA Icons

This directory should contain the following icon sizes for the Progressive Web App:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Creating Icons

You can use the wizard-dog.svg from `src/assets/wizard-dog.svg` to generate these icons.

Recommended tools:
- Online: https://realfavicongenerator.net/
- Online: https://www.pwabuilder.com/imageGenerator
- CLI: `sharp` or `jimp` Node.js libraries

## Quick Generate Script

If you have Node.js and sharp installed:

```javascript
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('src/assets/wizard-dog.svg')
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
});
```

For now, you can use a placeholder image or the wizard-dog.svg converted to PNG at these sizes.

