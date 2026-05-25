import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { generatePassportSheet, addShadow, addReflection, createThumbnail } from '../services/advancedService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.post('/passport/sheet', async (req, res) => {
  try {
    const { imagePath, photoWidth, photoHeight, dpi = 300 } = req.body;
    if (!imagePath || !photoWidth || !photoHeight) {
      return res.status(400).json({ error: 'imagePath, photoWidth, photoHeight required' });
    }

    const buffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));
    const result = await generatePassportSheet(buffer, Number(photoWidth), Number(photoHeight), Number(dpi));

    const filename = `passport-sheet-${Date.now()}.jpg`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);
    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Passport sheet generation failed' });
  }
});

router.post('/product/shadow', async (req, res) => {
  try {
    const { imagePath, blur = 15, offsetX = 5, offsetY = 5 } = req.body;
    if (!imagePath) return res.status(400).json({ error: 'imagePath required' });

    const buffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));
    const result = await addShadow(buffer, '#000000', Number(blur), Number(offsetX), Number(offsetY));

    const filename = `shadow-${Date.now()}.png`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);
    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Shadow effect failed' });
  }
});

router.post('/product/reflection', async (req, res) => {
  try {
    const { imagePath, reflectionHeight = 0.3 } = req.body;
    if (!imagePath) return res.status(400).json({ error: 'imagePath required' });

    const buffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));
    const result = await addReflection(buffer, Number(reflectionHeight));

    const filename = `reflection-${Date.now()}.png`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);
    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Reflection effect failed' });
  }
});

router.post('/thumbnail/generate', async (req, res) => {
  try {
    const { imagePath, width = 1280, height = 720, overlay = {} } = req.body;
    if (!imagePath) return res.status(400).json({ error: 'imagePath required' });

    const buffer = await fs.readFile(path.join(__dirname, '..', imagePath.replace(/^\//, '')));
    const result = await createThumbnail(buffer, Number(width), Number(height), overlay);

    const filename = `thumbnail-${Date.now()}.jpg`;
    await fs.writeFile(path.join(__dirname, '..', 'uploads', filename), result);
    res.json({ id: filename, path: `/uploads/${filename}`, size: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Thumbnail generation failed' });
  }
});

export default router;
