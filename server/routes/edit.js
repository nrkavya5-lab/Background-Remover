import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.post('/edit/crop', async (req, res) => {
  try {
    const { imagePath, x, y, width, height, format = 'png' } = req.body;
    if (!imagePath || x == null || y == null || !width || !height) {
      return res.status(400).json({ error: 'imagePath, x, y, width, height required' });
    }

    const inputBuffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));
    const meta = await sharp(inputBuffer).metadata();
    const imgW = meta.width;
    const imgH = meta.height;

    const result = await sharp(inputBuffer)
      .extract({
        left: Math.round(x * imgW / 100),
        top: Math.round(y * imgH / 100),
        width: Math.round(width * imgW / 100),
        height: Math.round(height * imgH / 100),
      })
      .toFormat(format)
      .toBuffer();

    const filename = `cropped-${Date.now()}.${format}`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);

    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length, format });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Crop failed' });
  }
});

router.post('/edit/resize', async (req, res) => {
  try {
    const { imagePath, width, height, fit = 'cover', format = 'png' } = req.body;
    if (!imagePath || !width || !height) {
      return res.status(400).json({ error: 'imagePath, width, height required' });
    }

    const inputBuffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));

    const result = await sharp(inputBuffer)
      .resize(Number(width), Number(height), { fit })
      .toFormat(format)
      .toBuffer();

    const filename = `resized-${Date.now()}.${format}`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);

    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length, format });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Resize failed' });
  }
});

router.post('/edit/rotate', async (req, res) => {
  try {
    const { imagePath, degrees, format = 'png' } = req.body;
    if (!imagePath || degrees == null) {
      return res.status(400).json({ error: 'imagePath and degrees required' });
    }

    const inputBuffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));

    const result = await sharp(inputBuffer)
      .rotate(Number(degrees), { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFormat(format)
      .toBuffer();

    const filename = `rotated-${Date.now()}.${format}`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);

    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length, format });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Rotate failed' });
  }
});

router.post('/edit/adjust', async (req, res) => {
  try {
    const { imagePath, brightness = 1, contrast = 1, blur = 0, format = 'png' } = req.body;
    if (!imagePath) return res.status(400).json({ error: 'imagePath required' });

    const inputBuffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));

    let pipeline = sharp(inputBuffer);

    if (blur > 0) pipeline = pipeline.blur(Math.round(Number(blur)));
    pipeline = pipeline.linear(Number(contrast), 0);
    pipeline = pipeline.modulate({ brightness: Number(brightness) });

    const result = await pipeline.toFormat(format).toBuffer();

    const filename = `adjusted-${Date.now()}.${format}`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);

    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length, format });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Adjust failed' });
  }
});

export default router;
