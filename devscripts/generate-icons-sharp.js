// Script to generate PWA icons from icon.jpg using sharp
// Run: npm install sharp --save-dev
// Then: node generate-icons-sharp.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconPath = path.join(__dirname, '..', 'icon.png');
const iconsDir = path.join(__dirname, '..', 'client', 'public', 'icons');

if (!fs.existsSync(iconPath)) {
  console.error('❌ icon.png not found in project root!');
  process.exit(1);
}

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Required icon sizes for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512, 16, 32];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from icon.png...\n');

  try {
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(iconPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    }

    // Favicon is already created as icon-16x16.png above
    // Modern browsers support PNG favicons, no need for .ico
    console.log(`✅ Favicon ready: icon-16x16.png (used as favicon)`);
    
    // Copy source icon for reference
    const sourceIconPath = path.join(iconsDir, 'icon-source.png');
    fs.copyFileSync(iconPath, sourceIconPath);
    console.log(`✅ Copied source: icon-source.png`);
    
    console.log('\n✨ All icons generated successfully!');
    console.log(`📁 Location: ${iconsDir}`);
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n💡 Install sharp first:');
      console.error('   npm install sharp --save-dev');
    }
    process.exit(1);
  }
}

generateIcons();

