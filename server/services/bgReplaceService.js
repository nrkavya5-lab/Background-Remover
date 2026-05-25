import sharp from 'sharp';

export async function replaceWithColor(foregroundBuffer, color, format = 'png') {
  const meta = await sharp(foregroundBuffer).metadata();
  const { width, height } = meta;

  const colorBuffer = await sharp({
    create: { width, height, channels: 4, background: color },
  }).raw().toBuffer();

  const bgLayer = await sharp(colorBuffer, { raw: { width, height, channels: 4 } })
    .png().toBuffer();

  return sharp(foregroundBuffer)
    .composite([{ input: bgLayer, blend: 'dest-over' }])
    .toFormat(format)
    .toBuffer();
}

export async function replaceWithGradient(foregroundBuffer, startColor, endColor, direction = 'vertical', format = 'png') {
  const meta = await sharp(foregroundBuffer).metadata();
  const { width, height } = meta;

  const channels = 4;
  const pixelCount = width * height;
  const gradientBuffer = Buffer.alloc(pixelCount * channels);

  function parseHex(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  const [sr, sg, sb] = parseHex(startColor);
  const [er, eg, eb] = parseHex(endColor);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = direction === 'vertical' ? y / (height - 1) : x / (width - 1);
      const clampedT = Math.min(1, Math.max(0, t));

      const idx = (y * width + x) * channels;
      gradientBuffer[idx] = Math.round(sr + (er - sr) * clampedT);
      gradientBuffer[idx + 1] = Math.round(sg + (eg - sg) * clampedT);
      gradientBuffer[idx + 2] = Math.round(sb + (eb - sb) * clampedT);
      gradientBuffer[idx + 3] = 255;
    }
  }

  const bgLayer = await sharp(gradientBuffer, { raw: { width, height, channels } })
    .png().toBuffer();

  return sharp(foregroundBuffer)
    .composite([{ input: bgLayer, blend: 'dest-over' }])
    .toFormat(format)
    .toBuffer();
}

export async function replaceWithImage(foregroundBuffer, backgroundBuffer, format = 'png') {
  return sharp(foregroundBuffer)
    .composite([{ input: backgroundBuffer, blend: 'dest-over' }])
    .toFormat(format)
    .toBuffer();
}
