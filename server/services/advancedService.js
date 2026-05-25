import sharp from 'sharp';

export async function generatePassportSheet(foregroundBuffer, photoWidth, photoHeight, dpi = 300) {
  const margin = 0.25 * dpi;
  const sheetWidth = 6 * dpi;
  const sheetHeight = 4 * dpi;
  const cols = Math.floor((sheetWidth - margin) / (photoWidth + margin));
  const rows = Math.floor((sheetHeight - margin) / (photoHeight + margin));

  const resized = await sharp(foregroundBuffer)
    .resize(photoWidth, photoHeight, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  const compositeOps = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = Math.round(margin + c * (photoWidth + margin));
      const y = Math.round(margin + r * (photoHeight + margin));
      compositeOps.push({ input: resized, top: y, left: x });
    }
  }

  return sharp({
    create: { width: sheetWidth, height: sheetHeight, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite(compositeOps)
    .jpeg({ quality: 95 })
    .toBuffer();
}

export async function addShadow(foregroundBuffer, shadowColor = '#000000', blur = 15, offsetX = 5, offsetY = 5) {
  const meta = await sharp(foregroundBuffer).metadata();
  const shadow = await sharp(foregroundBuffer)
    .extend({ top: Math.abs(offsetY), bottom: Math.abs(offsetY), left: Math.abs(offsetX), right: Math.abs(offsetX), background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toColourspace('b-w')
    .blur(blur)
    .toBuffer();

  const shadowOverlay = await sharp(shadow)
    .linear(1, -0.5)
    .toColourspace('srgb')
    .toBuffer();

  const composite = [];
  composite.push({ input: shadowOverlay, blend: 'over' });
  composite.push({ input: foregroundBuffer, blend: 'over' });

  return sharp({
    create: { width: meta.width + Math.abs(offsetX) * 2, height: meta.height + Math.abs(offsetY) * 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composite)
    .png()
    .toBuffer();
}

export async function addReflection(foregroundBuffer, reflectionHeight = 0.3) {
  const meta = await sharp(foregroundBuffer).metadata();
  const reflH = Math.round(meta.height * reflectionHeight);

  const flipped = await sharp(foregroundBuffer)
    .extract({ left: 0, top: meta.height - reflH, width: meta.width, height: reflH })
    .flip()
    .png()
    .toBuffer();

  const gradient = Buffer.alloc(reflH * 4);
  for (let y = 0; y < reflH; y++) {
    const alpha = Math.round((1 - y / reflH) * 100);
    for (let x = 0; x < meta.width; x++) {
      const idx = (y * meta.width + x) * 4;
      gradient[idx] = 255;
      gradient[idx + 1] = 255;
      gradient[idx + 2] = 255;
      gradient[idx + 3] = alpha;
    }
  }

  const gradientPng = await sharp(gradient, { raw: { width: meta.width, height: reflH, channels: 4 } })
    .png()
    .toBuffer();

  const reflection = await sharp(flipped)
    .composite([{ input: gradientPng, blend: 'multiply' }])
    .png()
    .toBuffer();

  const totalHeight = meta.height + reflH;
  return sharp({
    create: { width: meta.width, height: totalHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: foregroundBuffer, top: 0, left: 0 },
      { input: reflection, top: meta.height, left: 0 },
    ])
    .png()
    .toBuffer();
}

export async function createThumbnail(foregroundBuffer, width, height, overlay) {
  const resized = await sharp(foregroundBuffer)
    .resize(width, height, { fit: 'cover' })
    .png()
    .toBuffer();

  let svgOverlay = '';
  if (overlay.title) {
    const fontSize = Math.round(width * 0.06);
    const subtitleSize = Math.round(width * 0.035);
    svgOverlay = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.7)"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <text x="${width * 0.05}" y="${height * 0.8}" font-family="Arial, sans-serif"
        font-size="${fontSize}" font-weight="bold" fill="white">${escapeXml(overlay.title)}</text>`;

    if (overlay.subtitle) {
      svgOverlay += `<text x="${width * 0.05}" y="${height * 0.8 + fontSize + 10}" font-family="Arial, sans-serif"
        font-size="${subtitleSize}" fill="#cccccc">${escapeXml(overlay.subtitle)}</text>`;
    }

    svgOverlay += '</svg>';
  }

  if (svgOverlay) {
    const svgBuffer = Buffer.from(svgOverlay);
    return sharp(resized)
      .composite([{ input: svgBuffer, top: 0, left: 0 }])
      .jpeg({ quality: 95 })
      .toBuffer();
  }

  return resized;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
