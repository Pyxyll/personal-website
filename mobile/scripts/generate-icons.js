const sharp = require('sharp');
const path = require('path');

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a0a0a"/>
  <text x="256" y="368" font-family="monospace" font-size="352" font-weight="bold" fill="#ffffff" text-anchor="middle">D</text>
  <rect x="24" y="24" width="464" height="464" fill="none" stroke="#ffffff" stroke-width="24"/>
</svg>`;

// Adaptive icon needs padding for the safe zone (center 66%)
const svgAdaptive = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432">
  <rect width="432" height="432" fill="#0a0a0a"/>
  <text x="216" y="295" font-family="monospace" font-size="260" font-weight="bold" fill="#ffffff" text-anchor="middle">D</text>
  <rect x="36" y="36" width="360" height="360" fill="none" stroke="#ffffff" stroke-width="18"/>
</svg>`;

// Splash icon (larger D, no border)
const svgSplash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#0a0a0a"/>
  <text x="100" y="145" font-family="monospace" font-size="140" font-weight="bold" fill="#da2862" text-anchor="middle">D</text>
</svg>`;

async function generateIcons() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  // Main icon (1024x1024 for best quality, Expo will resize)
  await sharp(Buffer.from(svgIcon))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('Created icon.png');

  // Adaptive icon foreground (432x432 is standard)
  await sharp(Buffer.from(svgAdaptive))
    .resize(432, 432)
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  console.log('Created adaptive-icon.png');

  // Splash icon
  await sharp(Buffer.from(svgSplash))
    .resize(200, 200)
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('Created splash-icon.png');

  // Favicon (48x48)
  await sharp(Buffer.from(svgIcon))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('Created favicon.png');

  console.log('\nAll icons generated!');
}

generateIcons().catch(console.error);
